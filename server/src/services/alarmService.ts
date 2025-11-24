import { Op } from 'sequelize';
import Alarm from '../models/Alarm.js';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';

export interface AlarmListParams {
  level?: number;  // 报警级别：1严重，2紧急，3重要，4一般
  page?: number;
  pageSize?: number;
  status?: number; // 处理状态：1待指派，2处理中，3已处理，4处理异常
}

export interface CreateAlarmParams {
  station_id: number;
  pile_id?: number; // 0表示站点级别报警
  title: string;
  detail: string;
  level: number;
}

export interface UpdateAlarmStatusParams {
  id: number;
  status: number;
  handler?: string;
  handle_time?: Date;
  handle_note?: string;
}

export interface AssignAlarmParams {
  alarmId: number;
  basicInfo: {
    name: string;
    email: string;
    tel: string;
    no: string;
    urgent: boolean;
    other: string[];
    remarks?: string;
  };
  approvalInfo: {
    approvalDept: string;
    ccDept: string;
  };
  responsibleInfo: {
    person: string;
    tel: string;
  };
}

export interface UrgeAlarmParams {
  alarmId: number;
  urgeNote?: string;
}

// 获取报警列表
export async function getAlarmListService(params: AlarmListParams) {
  const { level, page = 1, pageSize = 10, status } = params;

  // 构建查询条件
  const where: any = {};
  if (level && level !== 0) { // 0表示全部
    where.level = level;
  }
  if (status && status !== 0) { // 0表示全部
    where.status = status;
  }

  try {
    // 查询报警记录，关联充电站和充电桩信息
    const { rows: alarms, count: total } = await Alarm.findAndCountAll({
      where,
      include: [
        {
          model: Station,
          as: 'station',
          attributes: ['id', 'name', 'city', 'person', 'tel'],
          required: true // 必须有关联的充电站
        },
        {
          model: Pile,
          as: 'pile',
          attributes: ['id', 'type', 'status'],
          required: false // 左连接，因为可能是站点级别的报警
        }
      ],
      order: [['fault_time', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    // 格式化返回数据
    const list = alarms.map((alarm: any) => {
      const station = alarm.station;
      const pile = alarm.pile;
      
      return {
        id: alarm.id,
        description: alarm.detail || alarm.title,
        address: `${station?.city || ''}${station?.name || ''}`,
        equNo: pile ? `${pile.id}` : `S${station?.id || ''}`,
        level: alarm.level,
        time: alarm.fault_time ? new Date(alarm.fault_time).toLocaleString('zh-CN', { hour12: false }) : '',
        code: Math.floor(Math.random() * 9000) + 1000, // 模拟故障代码
        status: (alarm as any).status || 1, // 使用真实的status字段
        stationId: station?.id,
        pileId: pile?.id,
        title: alarm.title,
        detail: alarm.detail,
        handler: (alarm as any).handler,
        handle_time: (alarm as any).handle_time,
        handle_note: (alarm as any).handle_note
      };
    });

    return {
      list,
      total
    };
  } catch (error) {
    console.error('获取报警列表失败:', error);
    throw new Error('获取报警列表失败');
  }
}


// 创建报警记录
export async function createAlarmService(params: CreateAlarmParams) {
  const { station_id, pile_id, title, detail, level } = params;

  // 验证充电站是否存在
  const station = await Station.findByPk(station_id);
  if (!station) {
    throw new Error('充电站不存在');
  }

  // 如果指定了充电桩，验证充电桩是否存在且属于该充电站
  if (pile_id && pile_id > 0) {
    const pile = await Pile.findOne({
      where: {
        id: pile_id,
        station_id: station_id
      }
    });
    if (!pile) {
      throw new Error('充电桩不存在或不属于指定充电站');
    }
  }

  // 创建报警记录
  const alarm =     await Alarm.create({
      station_id,
      pile_id: (pile_id && pile_id > 0) ? pile_id : null,
      title,
      detail,
      level,
      fault_time: new Date()
    });

  return {
    id: (alarm as any).id,
    message: '报警记录创建成功'
  };
}

// 获取报警详情
export async function getAlarmDetailService(id: number) {
  const alarm = await Alarm.findByPk(id, {
    include: [
      {
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'city', 'person', 'tel']
      },
      {
        model: Pile,
        as: 'pile',
        attributes: ['id', 'type', 'status'],
        required: false
      }
    ]
  });

  if (!alarm) {
    throw new Error('报警记录不存在');
  }

  const station = (alarm as any).station;
  const pile = (alarm as any).pile;

  return {
    id: (alarm as any).id,
    title: (alarm as any).title,
    detail: (alarm as any).detail,
    level: (alarm as any).level,
    fault_time: (alarm as any).fault_time,
    station: {
      id: station?.id,
      name: station?.name,
      city: station?.city,
      person: station?.person,
      tel: station?.tel
    },
    pile: pile ? {
      id: pile.id,
      type: pile.type,
      status: pile.status
    } : null
  };
}

// 更新报警处理状态
export async function updateAlarmStatusService(params: UpdateAlarmStatusParams) {
  const { id, status, handler, handle_time, handle_note } = params;

  const alarm = await Alarm.findByPk(id);
  if (!alarm) {
    throw new Error('报警记录不存在');
  }

  // 验证状态值
  if (![1, 2, 3, 4].includes(status)) {
    throw new Error('无效的处理状态，必须为1-4之间的数字');
  }

  try {
    const currentStatus = (alarm as any).status;
    const updateData: any = {
      status: status,
      handler: handler || null,
      handle_time: handle_time || new Date(),
      handle_note: handle_note || null
    };

    // 状态流转逻辑处理
    // 1. 如果状态变为待指派(1)，清零催办次数（可能重新开始处理）
    if (status === 1 && currentStatus !== 1) {
      updateData.urge_count = 0;
      updateData.last_urge_time = null;
    }
    // 2. 如果状态变为已处理(3)或处理异常(4)，保留催办次数作为历史记录（不修改urge_count和last_urge_time）
    // 3. 如果状态变为处理中(2)，且之前不是处理中，清零催办次数（新的处理周期）
    //    注意：如果是从处理中(2)更新为处理中(2)（只更新其他字段），不清零催办次数
    if (status === 2 && currentStatus !== 2) {
      updateData.urge_count = 0;
      updateData.last_urge_time = null;
    }
    // 4. 如果状态从已处理(3)或处理异常(4)变为处理中(2)，这是重新开始处理，应该清零
    //    这个逻辑已经在上面处理了（status === 2 && currentStatus !== 2）

    // 更新报警处理状态
    await (alarm as any).update(updateData);

    return {
      message: '报警状态更新成功'
    };
  } catch (error) {
    console.error('更新报警状态失败:', error);
    throw new Error('更新报警状态失败');
  }
}

// 获取报警统计数据
export async function getAlarmStatsService() {
  // 统计各级别报警数量
  const levelStats = await Alarm.findAll({
    attributes: [
      'level',
      [(Alarm as any).sequelize.fn('COUNT', (Alarm as any).sequelize.col('id')), 'count']
    ],
    where: {
      fault_time: {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
      }
    },
    group: ['level']
  });

  const stats = {
    severe: 0,    // 严重
    urgent: 0,    // 紧急
    important: 0, // 重要
    general: 0    // 一般
  };

  levelStats.forEach((stat: any) => {
    const level = stat.dataValues.level;
    const count = Number(stat.dataValues.count);
    
    switch (level) {
      case 1: stats.severe = count; break;
      case 2: stats.urgent = count; break;
      case 3: stats.important = count; break;
      case 4: stats.general = count; break;
    }
  });

  return stats;
}

// 指派报警任务（三步表单）
export async function assignAlarmTaskService(params: AssignAlarmParams) {
  const { alarmId, basicInfo, approvalInfo, responsibleInfo } = params;

  const alarm = await Alarm.findByPk(alarmId);
  if (!alarm) {
    throw new Error('报警记录不存在');
  }

  // 检查报警状态是否可以指派
  const currentStatus = (alarm as any).status;
  // 允许从"待指派"或"处理异常"状态进行指派
  if (currentStatus !== 1 && currentStatus !== 4) {
    throw new Error('该报警任务当前状态不允许指派，只能从"待指派"或"处理异常"状态进行指派');
  }

  try {
    // 构建处理备注
    const handleNote = `
指派信息：
- 处理人员：${basicInfo.name} (工号：${basicInfo.no})
- 联系方式：${basicInfo.tel} / ${basicInfo.email}
- 是否加急：${basicInfo.urgent ? '是' : '否'}
- 处理要求：${basicInfo.other.join(', ')}
- 备注：${basicInfo.remarks || '无'}

审批信息：
- 审批部门：${getDeptName(approvalInfo.approvalDept)}
- 抄送部门：${getDeptName(approvalInfo.ccDept)}

负责人信息：
- 负责人：${responsibleInfo.person}
- 联系电话：${responsibleInfo.tel}
    `.trim();

    // 更新报警状态为处理中
    // 指派时清零催办次数，因为这是新的处理周期
    await (alarm as any).update({
      status: 2, // 处理中
      handler: basicInfo.name,
      handle_time: new Date(),
      handle_note: handleNote,
      urge_count: 0, // 清零催办次数，新的处理周期
      last_urge_time: null // 清空最后催办时间
    });

    return {
      message: '报警任务指派成功',
      assignInfo: {
        handler: basicInfo.name,
        urgent: basicInfo.urgent,
        responsible: responsibleInfo.person
      }
    };
  } catch (error) {
    console.error('指派报警任务失败:', error);
    throw new Error('指派报警任务失败');
  }
}

// 催办报警任务
export async function urgeAlarmTaskService(params: UrgeAlarmParams) {
  const { alarmId, urgeNote } = params;

  const alarm = await Alarm.findByPk(alarmId);
  if (!alarm) {
    throw new Error('报警记录不存在');
  }

  // 检查报警状态是否可以催办
  const currentStatus = (alarm as any).status;
  if (currentStatus !== 2) { // 只有处理中状态才能催办
    throw new Error('该报警任务当前状态不允许催办');
  }

  try {
    // 获取当前催办次数
    const currentUrgeCount = (alarm as any).urge_count || 0;
    const newUrgeCount = currentUrgeCount + 1;
    const urgeTime = new Date();
    
    // 获取当前处理备注
    const currentNote = (alarm as any).handle_note || '';
    
    // 添加催办记录到备注
    const urgeRecord = `\n\n[催办记录 ${newUrgeCount} - ${urgeTime.toLocaleString('zh-CN', { hour12: false })}]\n${urgeNote || '请加快处理进度'}`;
    const updatedNote = currentNote + urgeRecord;

    // 更新催办次数、最后催办时间和处理备注
    await (alarm as any).update({
      urge_count: newUrgeCount,
      last_urge_time: urgeTime,
      handle_note: updatedNote
    });

    return {
      message: `催办成功，已通知处理人员（第${newUrgeCount}次催办）`,
      urgeTime: urgeTime.toLocaleString('zh-CN', { hour12: false }),
      urgeCount: newUrgeCount
    };
  } catch (error) {
    console.error('催办报警任务失败:', error);
    throw new Error('催办报警任务失败');
  }
}

// 标记报警任务为处理异常
export async function markAlarmExceptionService(alarmId: number, exceptionNote?: string) {
  const alarm = await Alarm.findByPk(alarmId);
  if (!alarm) {
    throw new Error('报警记录不存在');
  }

  // 检查报警状态
  const currentStatus = (alarm as any).status;
  if (currentStatus !== 2) { // 只有处理中状态才能标记为异常
    throw new Error('该报警任务当前状态不允许标记为异常，只能从"处理中"状态标记');
  }

  try {
    // 获取当前处理备注
    const currentNote = (alarm as any).handle_note || '';
    
    // 添加异常记录
    const exceptionRecord = `\n\n[标记异常 - ${new Date().toLocaleString('zh-CN', { hour12: false })}]\n${exceptionNote || '处理过程中遇到异常，需要协调或重新指派'}`;
    const updatedNote = currentNote + exceptionRecord;

    // 更新状态为处理异常
    // 保留催办次数作为历史记录，不清零
    await (alarm as any).update({
      status: 4, // 处理异常
      handle_note: updatedNote
      // 注意：不修改 urge_count 和 last_urge_time，保留历史记录
    });

    return {
      message: '报警任务已标记为处理异常',
      exceptionTime: new Date().toLocaleString('zh-CN', { hour12: false })
    };
  } catch (error) {
    console.error('标记报警异常失败:', error);
    throw new Error('标记报警异常失败');
  }
}

// 完成报警任务处理
export async function completeAlarmTaskService(alarmId: number, completionNote?: string) {
  const alarm = await Alarm.findByPk(alarmId);
  if (!alarm) {
    throw new Error('报警记录不存在');
  }

  // 检查报警状态
  const currentStatus = (alarm as any).status;
  if (currentStatus !== 2) { // 只有处理中状态才能完成
    throw new Error('该报警任务当前状态不允许完成');
  }

  try {
    // 获取当前处理备注
    const currentNote = (alarm as any).handle_note || '';
    
    // 添加完成记录
    const completionRecord = `\n\n[任务完成 - ${new Date().toLocaleString('zh-CN', { hour12: false })}]\n${completionNote || '任务已完成处理'}`;
    const updatedNote = currentNote + completionRecord;

    // 更新状态为已处理
    // 完成时保留催办次数作为历史记录，不清零
    await (alarm as any).update({
      status: 3, // 已处理
      handle_note: updatedNote
      // 注意：不修改 urge_count 和 last_urge_time，保留历史记录
    });

    return {
      message: '报警任务处理完成',
      completionTime: new Date().toLocaleString('zh-CN', { hour12: false })
    };
  } catch (error) {
    console.error('完成报警任务失败:', error);
    throw new Error('完成报警任务失败');
  }
}

// 获取报警任务的催办次数
export async function getAlarmUrgeCountService(alarmId: number) {
  const alarm = await Alarm.findByPk(alarmId);
  if (!alarm) {
    throw new Error('报警记录不存在');
  }

  const urgeCount = (alarm as any).urge_count || 0;
  const lastUrgeTime = (alarm as any).last_urge_time;

  return {
    alarmId,
    urgeCount,
    canUrge: (alarm as any).status === 2, // 只有处理中状态才能催办
    lastUrgeTime: lastUrgeTime ? new Date(lastUrgeTime).toLocaleString('zh-CN', { hour12: false }) : null
  };
}

// 辅助函数：获取部门名称
function getDeptName(deptId: string): string {
  const deptMap: { [key: string]: string } = {
    '1': '总裁办',
    '2': '运营部',
    '3': '维修部',
    '4': '市场部',
    '5': '财务部'
  };
  return deptMap[deptId] || '未知部门';
}

