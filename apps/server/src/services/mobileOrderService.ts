/**
 * 移动端订单服务
 * 处理订单查询、支付、取消等
 */
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import { deductBalance } from './mobileUserService.js';

export interface OrderInfo {
  orderNo: string;
  userId: number;
  stationId: number;
  stationName: string;
  pileId: number;
  pileName: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  electricity?: number;
  electricityFee?: number;
  serviceFee?: number;
  parkingFee?: number;
  totalAmount: number;
  payType?: string;
  payTime?: string;
  status: number;
  createTime: string;
}

export interface OrderListParams {
  userId: number;
  status?: number;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * 格式化订单
 */
async function formatOrder(order: any): Promise<OrderInfo> {
  const startTime = order.start_time ? new Date(order.start_time) : null;
  const endTime = order.end_time ? new Date(order.end_time) : null;
  let duration = 0;
  let electricity = 0;

  if (startTime && endTime) {
    duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    // 假设平均功率30kW
    const hours = duration / 3600;
    electricity = hours * 30;
  }

  const totalAmount = parseFloat(order.money) || 0;
  const electricityFee = totalAmount * 0.85;
  const serviceFee = totalAmount * 0.1;
  const parkingFee = totalAmount * 0.05;

  // 获取站点和充电桩名称
  let stationName = '未知站点';
  let pileName = '未知充电桩';

  if (order.station) {
    stationName = order.station.name;
  } else if (order.station_id) {
    const station = await Station.findByPk(order.station_id);
    if (station) stationName = (station as any).name;
  }

  if (order.pile_id) {
    const pile = await Pile.findByPk(order.pile_id);
    if (pile) pileName = (pile as any).name || `${order.pile_id}号桩`;
  }

  return {
    orderNo: order.order_no,
    userId: order.user_id,
    stationId: order.station_id,
    stationName,
    pileId: order.pile_id,
    pileName,
    startTime: startTime?.toISOString() || '',
    endTime: endTime?.toISOString(),
    duration,
    electricity: parseFloat(electricity.toFixed(2)),
    electricityFee: parseFloat(electricityFee.toFixed(2)),
    serviceFee: parseFloat(serviceFee.toFixed(2)),
    parkingFee: parseFloat(parkingFee.toFixed(2)),
    totalAmount,
    payType: order.pay,
    payTime: order.pay_time,
    status: order.status,
    createTime: order.date?.toISOString() || order.created_at?.toISOString() || '',
  };
}

/**
 * 获取订单列表
 */
export async function getOrderList(params: OrderListParams) {
  const { userId, status, page = 1, pageSize = 10, startDate, endDate } = params;

  const where: any = { user_id: userId };

  // 状态筛选
  if (status !== undefined && status !== -1) {
    where.status = status;
  }

  // 日期筛选
  if (startDate && endDate) {
    where.date = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: Station, as: 'station', attributes: ['id', 'name'] },
    ],
    order: [['date', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const list: OrderInfo[] = [];
  for (const order of rows) {
    const formattedOrder = await formatOrder(order);
    list.push(formattedOrder);
  }

  return {
    list,
    total: count,
  };
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(orderNo: string, userId: number): Promise<OrderInfo> {
  const order = await Order.findOne({
    where: { order_no: orderNo, user_id: userId },
    include: [
      { model: Station, as: 'station', attributes: ['id', 'name', 'city', 'person', 'tel'] },
    ],
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  return formatOrder(order);
}

/**
 * 支付订单
 */
export async function payOrder(orderNo: string, userId: number, payType: 'wechat' | 'alipay' | 'balance') {
  const order = await Order.findOne({
    where: { order_no: orderNo, user_id: userId, status: 0 }, // 待支付
  });

  if (!order) {
    throw new Error('订单不存在或状态异常');
  }

  const orderData = order as any;
  const amount = parseFloat(orderData.money) || 0;

  if (payType === 'balance') {
    // 余额支付
    await deductBalance(userId, amount);

    // 更新订单状态
    await Order.update(
      {
        status: 3, // 已完成
        pay: 'balance',
        pay_time: new Date(),
      },
      { where: { order_no: orderNo } }
    );

    return { success: true };
  }

  // 微信/支付宝支付需要返回支付参数
  // 实际生产环境需要调用支付接口
  throw new Error('暂不支持该支付方式');
}

/**
 * 取消订单
 */
export async function cancelOrder(orderNo: string, userId: number) {
  const order = await Order.findOne({
    where: { order_no: orderNo, user_id: userId, status: 0 }, // 待支付
  });

  if (!order) {
    throw new Error('订单不存在或无法取消');
  }

  await Order.update(
    { status: 4 }, // 已取消
    { where: { order_no: orderNo } }
  );

  return { success: true };
}

/**
 * 申请退款
 */
export async function refundOrder(orderNo: string, userId: number, reason: string) {
  const order = await Order.findOne({
    where: { order_no: orderNo, user_id: userId, status: 3 }, // 已完成
  });

  if (!order) {
    throw new Error('订单不存在或无法退款');
  }

  // 实际生产环境需要审核流程
  // 这里直接退款
  await Order.update(
    { status: 5 }, // 已退款
    { where: { order_no: orderNo } }
  );

  return { success: true };
}

/**
 * 获取订单统计
 */
export async function getOrderStatistics(userId: number) {
  // 总订单
  const totalOrders = await Order.findAll({
    where: { user_id: userId, status: 3 }, // 已完成
  });

  let totalCount = totalOrders.length;
  let totalAmount = 0;
  let totalElectricity = 0;

  for (const order of totalOrders) {
    const orderData = order as any;
    totalAmount += parseFloat(orderData.money) || 0;

    // 计算充电量
    if (orderData.start_time && orderData.end_time) {
      const startTime = new Date(orderData.start_time);
      const endTime = new Date(orderData.end_time);
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;
      const hours = duration / 3600;
      totalElectricity += hours * 30; // 假设平均30kW
    }
  }

  // 本月订单
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const thisMonthOrders = await Order.findAll({
    where: {
      user_id: userId,
      status: 3,
      date: { [Op.gte]: thisMonthStart },
    },
  });

  let thisMonthCount = thisMonthOrders.length;
  let thisMonthAmount = 0;

  for (const order of thisMonthOrders) {
    thisMonthAmount += parseFloat((order as any).money) || 0;
  }

  return {
    totalCount,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalElectricity: parseFloat(totalElectricity.toFixed(2)),
    thisMonthCount,
    thisMonthAmount: parseFloat(thisMonthAmount.toFixed(2)),
  };
}
