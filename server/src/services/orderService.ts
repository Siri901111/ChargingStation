import { Op } from 'sequelize';
import Order from '../models/Order.js';
import Station from '../models/Station.js';
import ChargingUser from '../models/ChargingUser.js';
import Pile from '../models/Pile.js';

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  orderNo?: string;
  status?: number; // 1全部，2进行中，3已完成，4异常
  equipmentNo?: string; // 设备编号
  stationName?: string; // 站点名称
  startDate?: string;
  endDate?: string;
}

// 获取订单列表
export async function getOrderListService(params: OrderListParams) {
  const {
    page = 1,
    pageSize = 10,
    orderNo,
    status,
    equipmentNo,
    stationName,
    startDate,
    endDate,
  } = params;

  // 构建查询条件
  const where: any = {};

  if (orderNo && typeof orderNo === 'string' && orderNo.trim()) {
    where.order_no = { [Op.like]: `%${orderNo.trim()}%` };
  }

  if (status && status !== 1) {
    // 1表示全部，不添加状态条件
    where.status = status;
  }

  if (equipmentNo && typeof equipmentNo === 'string' && equipmentNo.trim()) {
    where.equipment_no = { [Op.like]: `%${equipmentNo.trim()}%` };
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.date = {
      [Op.between]: [start, end],
    };
  }

  // 构建关联查询
  const include: any[] = [];

  if (stationName && typeof stationName === 'string' && stationName.trim()) {
    include.push({
      model: Station,
      as: 'station',
      attributes: ['id', 'name', 'city'],
      where: {
        name: { [Op.like]: `%${stationName.trim()}%` },
      },
      required: true, // 内连接，必须有关联的充电站
    });
  } else {
    include.push({
      model: Station,
      as: 'station',
      attributes: ['id', 'name', 'city', 'person', 'tel'],
      required: false,
    });
  }

  try {
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where,
      include,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['date', 'DESC']],
    });

    // 格式化返回数据
    const list = orders.map((order: any) => {
      const station = order.station;

      return {
        orderNo: order.order_no,
        equipmentNo: order.equipment_no || '',
        date: order.date
          ? new Date(order.date).toLocaleDateString('zh-CN')
          : '',
        startTime: order.start_time
          ? new Date(order.start_time).toLocaleTimeString('zh-CN', {
              hour12: false,
            })
          : '',
        endTime: order.end_time
          ? new Date(order.end_time).toLocaleTimeString('zh-CN', {
              hour12: false,
            })
          : '',
        money: Number(order.money || 0).toFixed(2),
        pay: order.pay || '',
        status: order.status,
        stationName: station?.name || '',
      };
    });

    return {
      list,
      total,
    };
  } catch (error) {
    console.error('获取订单列表失败:', error);
    throw new Error('获取订单列表失败');
  }
}

// 批量删除订单
export async function batchDeleteOrdersService(orderNos: string[]) {
  if (!orderNos || orderNos.length === 0) {
    throw new Error('订单号列表不能为空');
  }

  try {
    const result = await Order.destroy({
      where: {
        order_no: {
          [Op.in]: orderNos,
        },
      },
    });

    if (result === 0) {
      throw new Error('没有找到要删除的订单');
    }

    return {
      message: `成功删除 ${result} 条订单`,
      deletedCount: result,
    };
  } catch (error) {
    console.error('批量删除订单失败:', error);
    throw new Error('批量删除订单失败');
  }
}

// 获取订单详情
export async function getOrderDetailService(orderNo: string) {
  const order = await Order.findOne({
    where: { order_no: orderNo },
    include: [
      {
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'city', 'person', 'tel'],
        required: false,
      },
      {
        model: ChargingUser,
        as: 'chargingUser',
        attributes: ['id', 'name', 'phone'],
        required: false,
      },
    ],
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  const station = (order as any).station;
  const user = (order as any).chargingUser;

  // 计算充电时长（小时）
  let chargeDuration = 0;
  if (order.start_time && order.end_time) {
    const start = new Date(order.start_time);
    const end = new Date(order.end_time);
    chargeDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  // 计算充电量（度）- 根据金额和时长估算
  // 假设平均电价0.8元/度，服务费10%，停车费5%
  const totalMoney = Number(order.money || 0);
  const electricityFee = totalMoney * 0.85; // 电费占85%
  const serviceFee = totalMoney * 0.1; // 服务费10%
  const parkingFee = totalMoney * 0.05; // 停车费5%
  const chargeAmount = (electricityFee / 0.8).toFixed(2); // 假设0.8元/度

  // 获取充电桩类型（如果有设备编号）
  let chargeDevice = '充电桩(快充)';
  if (order.equipment_no) {
    try {
      // 尝试从设备编号中提取充电桩ID
      const pileMatch = order.equipment_no.match(/PILE(\d+)/);
      if (pileMatch) {
        const pileId = parseInt(pileMatch[1]);
        const pile = await Pile.findByPk(pileId);
        if (pile) {
          chargeDevice = `充电桩(${(pile as any).type || '快充'})`;
        }
      }
    } catch (error) {
      console.error('获取充电桩信息失败:', error);
    }
  }

  // 模拟维保人员信息（实际应该从数据库获取）
  const maintenancePerson = {
    name: '刘来',
    tel: '17777777777',
  };

  return {
    orderNo: order.order_no,
    equipmentNo: order.equipment_no || '',
    date: order.date
      ? new Date(order.date).toLocaleDateString('zh-CN')
      : '',
    startTime: order.start_time
      ? new Date(order.start_time).toLocaleTimeString('zh-CN', {
          hour12: false,
        })
      : '',
    endTime: order.end_time
      ? new Date(order.end_time).toLocaleTimeString('zh-CN', {
          hour12: false,
        })
      : '',
    money: totalMoney.toFixed(2),
    pay: order.pay || '',
    status: order.status,
    stationName: station?.name || '',
    city: station?.city || '',
    chargeAmount: chargeAmount, // 充电量（度）
    chargeDevice: chargeDevice, // 充电设备
    chargeDuration: chargeDuration.toFixed(2), // 充电总时长（小时）
    person: station?.person || '', // 负责人姓名
    tel: station?.tel || '', // 负责人电话
    maintenancePersonName: maintenancePerson.name, // 维保人员姓名
    maintenancePersonTel: maintenancePerson.tel, // 维保人员电话
    serviceFee: serviceFee.toFixed(2), // 服务费
    parkingFee: parkingFee.toFixed(2), // 停车费
    electricityFee: electricityFee.toFixed(2), // 电费
    feeInfo:
      '电费+服务费+停车费，高峰时段费用为2.3元/度，停车费2元/小时，服务费5元/次',
    remark: '暂无',
  };
}

