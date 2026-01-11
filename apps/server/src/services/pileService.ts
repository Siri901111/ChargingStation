import { Op } from 'sequelize';
import Pile from '../models/Pile.js';
import Station from '../models/Station.js';
import Order from '../models/Order.js';
import PileMaintenance from '../models/PileMaintenance.js';

export interface PileListParams {
  page?: number;
  pageSize?: number;
  stationId?: number;
  status?: number;
  type?: string;
  keyword?: string; // 搜索关键词（充电桩ID或类型）
}

// 获取充电桩列表
export async function getPileListService(params: PileListParams) {
  const {
    page = 1,
    pageSize = 10,
    stationId,
    status,
    type,
    keyword,
  } = params;

  const where: any = {};

  if (stationId) {
    where.station_id = stationId;
  }

  if (status !== undefined) {
    where.status = status;
  }

  if (type) {
    where.type = { [Op.like]: `%${type}%` };
  }

  if (keyword) {
    where[Op.or] = [
      { id: { [Op.like]: `%${keyword}%` } },
      { type: { [Op.like]: `%${keyword}%` } },
    ];
  }

  try {
    const { rows: piles, count: total } = await Pile.findAndCountAll({
      where,
      include: [
        {
          model: Station,
          as: 'station',
          attributes: ['id', 'name', 'city'],
        },
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['id', 'ASC']],
    });

    const list = piles.map((pile: any) => ({
      id: pile.id,
      stationId: pile.station_id,
      stationName: pile.station?.name || '',
      city: pile.station?.city || '',
      type: pile.type || '',
      status: pile.status || 1,
      percent: pile.percent || 0,
      voltage: pile.voltage || 0,
      current: pile.current || 0,
      power: pile.power || 0,
      temperature: pile.temperature || 0,
      installDate: pile.install_date
        ? new Date(pile.install_date).toLocaleDateString('zh-CN')
        : '',
    }));

    return {
      list,
      total,
    };
  } catch (error) {
    console.error('获取充电桩列表失败:', error);
    throw new Error('获取充电桩列表失败');
  }
}

// 获取充电桩详情
export async function getPileDetailService(pileId: number) {
  const pile = await Pile.findOne({
    where: { id: pileId },
    include: [
      {
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'city'],
      },
    ],
  });

  if (!pile) {
    throw new Error('充电桩不存在');
  }

  return {
    id: (pile as any).id,
    stationId: (pile as any).station_id,
    stationName: (pile as any).station?.name || '',
    city: (pile as any).station?.city || '',
    type: (pile as any).type || '',
    status: (pile as any).status || 1,
    percent: (pile as any).percent || 0,
    voltage: (pile as any).voltage || 0,
    current: (pile as any).current || 0,
    power: (pile as any).power || 0,
    temperature: (pile as any).temperature || 0,
    installDate: (pile as any).install_date
      ? new Date((pile as any).install_date).toLocaleDateString('zh-CN')
      : '',
  };
}

export interface CreatePileParams {
  station_id: number;
  type: string; // 快充、慢充
  status?: number;
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  install_date?: string;
}

// 创建充电桩
export async function createPileService(params: CreatePileParams) {
  const {
    station_id,
    type,
    status = 1,
    voltage,
    current,
    power,
    temperature,
    install_date,
  } = params;

  // 验证充电站是否存在
  const station = await Station.findByPk(station_id);
  if (!station) {
    throw new Error('充电站不存在');
  }

  // 验证类型
  if (!type || !['快充', '慢充'].includes(type)) {
    throw new Error('充电桩类型必须为"快充"或"慢充"');
  }

  try {
    const pile = await Pile.create({
      station_id,
      type,
      status,
      voltage: voltage || null,
      current: current || null,
      power: power || null,
      temperature: temperature || null,
      install_date: install_date ? new Date(install_date) : null,
      percent: 0,
    });

    // 更新充电站的快充/慢充数量
    if (type === '快充') {
      await (station as any).increment('fast');
    } else {
      await (station as any).increment('slow');
    }

    return {
      id: (pile as any).id,
      message: '充电桩创建成功',
    };
  } catch (error) {
    console.error('创建充电桩失败:', error);
    throw new Error('创建充电桩失败');
  }
}

export interface UpdatePileParams {
  type?: string;
  status?: number;
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  percent?: number;
  install_date?: string;
}

// 更新充电桩
export async function updatePileService(
  pileId: number,
  params: UpdatePileParams
) {
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }

  const updateData: any = {};

  if (params.type !== undefined) {
    if (!['快充', '慢充'].includes(params.type)) {
      throw new Error('充电桩类型必须为"快充"或"慢充"');
    }
    // 如果类型改变，需要更新充电站的快充/慢充数量
    const oldType = (pile as any).type;
    if (oldType !== params.type) {
      const station = await Station.findByPk((pile as any).station_id);
      if (station) {
        if (oldType === '快充') {
          await (station as any).decrement('fast');
        } else if (oldType === '慢充') {
          await (station as any).decrement('slow');
        }
        if (params.type === '快充') {
          await (station as any).increment('fast');
        } else {
          await (station as any).increment('slow');
        }
      }
    }
    updateData.type = params.type;
  }

  if (params.status !== undefined) {
    updateData.status = params.status;
  }
  if (params.voltage !== undefined) {
    updateData.voltage = params.voltage;
  }
  if (params.current !== undefined) {
    updateData.current = params.current;
  }
  if (params.power !== undefined) {
    updateData.power = params.power;
  }
  if (params.temperature !== undefined) {
    updateData.temperature = params.temperature;
  }
  if (params.percent !== undefined) {
    updateData.percent = params.percent;
  }
  if (params.install_date !== undefined) {
    updateData.install_date = params.install_date
      ? new Date(params.install_date)
      : null;
  }

  try {
    await (pile as any).update(updateData);
    return {
      message: '充电桩更新成功',
    };
  } catch (error) {
    console.error('更新充电桩失败:', error);
    throw new Error('更新充电桩失败');
  }
}

// 删除充电桩
export async function deletePileService(pileId: number) {
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }

  // 检查是否有关联的订单
  const orderCount = await Order.count({
    where: { equipment_no: String(pileId) },
  });

  if (orderCount > 0) {
    throw new Error('该充电桩存在关联订单，无法删除');
  }

  try {
    const station = await Station.findByPk((pile as any).station_id);
    const pileType = (pile as any).type;

    // 删除充电桩
    await (pile as any).destroy();

    // 更新充电站的快充/慢充数量
    if (station) {
      if (pileType === '快充') {
        await (station as any).decrement('fast');
      } else if (pileType === '慢充') {
        await (station as any).decrement('slow');
      }
    }

    return {
      message: '充电桩删除成功',
    };
  } catch (error) {
    console.error('删除充电桩失败:', error);
    throw new Error('删除充电桩失败');
  }
}

// 更新充电桩状态
export async function updatePileStatusService(
  pileId: number,
  status: number
) {
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }

  // 验证状态值（1-6）
  if (![1, 2, 3, 4, 5, 6].includes(status)) {
    throw new Error('无效的充电桩状态，必须为1-6之间的数字');
  }

  try {
    await (pile as any).update({
      status,
      // 如果状态不是充电中，清空进度
      percent: status === 2 ? (pile as any).percent : 0,
    });

    return {
      message: '充电桩状态更新成功',
    };
  } catch (error) {
    console.error('更新充电桩状态失败:', error);
    throw new Error('更新充电桩状态失败');
  }
}

// 获取充电桩使用记录
export async function getPileUsageRecordsService(
  pileId: number,
  page: number = 1,
  pageSize: number = 10
) {
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }

  try {
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: {
        [Op.or]: [
          { equipment_no: String(pileId) },
          { equipment_no: `PILE${pileId}` },
        ],
        // 只查询已完成的订单（已支付且有支付时间）
        // status: 3, // 已完成
        // pay_time: { [Op.ne]: null }, // 必须有支付时间
      },
      include: [
        {
          model: Station,
          as: 'station',
          attributes: ['id', 'name'],
        },
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['date', 'DESC']],
    });

    const list = orders.map((order: any) => ({
      id: order.order_no,
      orderNo: order.order_no,
      stationName: order.station?.name || '',
      startTime: order.start_time
        ? new Date(order.start_time).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
      endTime: order.end_time
        ? new Date(order.end_time).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
      money: Number(order.money || 0).toFixed(2),
      pay: order.pay || '',
      status: order.status,
      date: order.date
        ? new Date(order.date).toLocaleDateString('zh-CN')
        : '',
    }));

    return {
      list,
      total,
    };
  } catch (error) {
    console.error('获取充电桩使用记录失败:', error);
    throw new Error('获取充电桩使用记录失败');
  }
}

// 获取充电桩维保记录
export async function getPileMaintenanceService(
  pileId: number,
  page: number = 1,
  pageSize: number = 10
) {
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }

  try {
    const { rows: maintenances, count: total } =
      await PileMaintenance.findAndCountAll({
        where: { pile_id: pileId },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['maintenance_time', 'DESC']],
      });

    const list = maintenances.map((maintenance: any) => ({
      id: maintenance.id,
      maintenanceType: maintenance.maintenance_type || '',
      maintenancePerson: maintenance.maintenance_person || '',
      maintenanceTime: maintenance.maintenance_time
        ? new Date(maintenance.maintenance_time).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
      maintenanceContent: maintenance.maintenance_content || '',
      maintenanceCost: Number(maintenance.maintenance_cost || 0).toFixed(2),
      nextMaintenanceTime: maintenance.next_maintenance_time
        ? new Date(maintenance.next_maintenance_time).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
      status: maintenance.status || 1,
      createdAt: maintenance.created_at
        ? new Date(maintenance.created_at).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
    }));

    return {
      list,
      total,
    };
  } catch (error) {
    console.error('获取充电桩维保记录失败:', error);
    throw new Error('获取充电桩维保记录失败');
  }
}

export interface CreateMaintenanceParams {
  maintenance_type: string;
  maintenance_person: string;
  maintenance_time: string;
  maintenance_content: string;
  maintenance_cost?: number;
  next_maintenance_time?: string;
  status?: number;
}

// 创建维保记录
export async function createPileMaintenanceService(
  pileId: number,
  params: CreateMaintenanceParams
) {
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }

  const {
    maintenance_type,
    maintenance_person,
    maintenance_time,
    maintenance_content,
    maintenance_cost,
    next_maintenance_time,
    status = 1,
  } = params;

  if (!maintenance_type || !maintenance_person || !maintenance_time) {
    throw new Error('维保类型、维保人员和维保时间不能为空');
  }

  try {
    const maintenance = await PileMaintenance.create({
      pile_id: pileId,
      maintenance_type,
      maintenance_person,
      maintenance_time: new Date(maintenance_time),
      maintenance_content: maintenance_content || '',
      maintenance_cost: maintenance_cost || 0,
      next_maintenance_time: next_maintenance_time
        ? new Date(next_maintenance_time)
        : null,
      status,
      created_at: new Date(),
    });

    return {
      id: (maintenance as any).id,
      message: '维保记录创建成功',
    };
  } catch (error) {
    console.error('创建维保记录失败:', error);
    throw new Error('创建维保记录失败');
  }
}

export interface UpdateMaintenanceParams {
  maintenance_type?: string;
  maintenance_person?: string;
  maintenance_time?: string;
  maintenance_content?: string;
  maintenance_cost?: number;
  next_maintenance_time?: string;
  status?: number;
}

// 更新维保记录
export async function updatePileMaintenanceService(
  maintenanceId: number,
  params: UpdateMaintenanceParams
) {
  const maintenance = await PileMaintenance.findByPk(maintenanceId);
  if (!maintenance) {
    throw new Error('维保记录不存在');
  }

  const updateData: any = {};

  if (params.maintenance_type !== undefined) {
    updateData.maintenance_type = params.maintenance_type;
  }
  if (params.maintenance_person !== undefined) {
    updateData.maintenance_person = params.maintenance_person;
  }
  if (params.maintenance_time !== undefined) {
    updateData.maintenance_time = new Date(params.maintenance_time);
  }
  if (params.maintenance_content !== undefined) {
    updateData.maintenance_content = params.maintenance_content;
  }
  if (params.maintenance_cost !== undefined) {
    updateData.maintenance_cost = params.maintenance_cost;
  }
  if (params.next_maintenance_time !== undefined) {
    updateData.next_maintenance_time = params.next_maintenance_time
      ? new Date(params.next_maintenance_time)
      : null;
  }
  if (params.status !== undefined) {
    updateData.status = params.status;
  }

  try {
    await (maintenance as any).update(updateData);
    return {
      message: '维保记录更新成功',
    };
  } catch (error) {
    console.error('更新维保记录失败:', error);
    throw new Error('更新维保记录失败');
  }
}

