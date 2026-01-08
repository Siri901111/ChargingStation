/**
 * 移动端充电服务
 * 处理扫码、开始充电、停止充电、充电状态等
 */
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import Pile from '../models/Pile.js';
import Station from '../models/Station.js';
import ChargingUser from '../models/ChargingUser.js';
import { deductBalance } from './mobileUserService.js';

export interface ChargingStatus {
  orderId: string;
  pileId: number;
  stationId: number;
  stationName: string;
  pileName: string;
  startTime: string;
  duration: number;
  power: number;
  voltage: number;
  current: number;
  electricity: number;
  amount: number;
  percent: number;
  status: number;
}

export interface ChargingResult {
  orderId: string;
  pileId: number;
  stationId: number;
  stationName: string;
  pileName: string;
  startTime: string;
  status: number;
}

export interface ChargingCompleteResult {
  orderId: string;
  startTime: string;
  endTime: string;
  duration: number;
  electricity: number;
  amount: number;
  payStatus: number;
}

/**
 * 生成订单号
 */
function generateOrderNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

/**
 * 扫码获取充电桩信息
 */
export async function scanPile(qrCode: string) {
  // 解析二维码，支持多种格式
  let pileId: number;

  // 格式1: PILE_123
  if (qrCode.startsWith('PILE_')) {
    pileId = parseInt(qrCode.replace('PILE_', ''));
  }
  // 格式2: 纯数字
  else if (/^\d+$/.test(qrCode)) {
    pileId = parseInt(qrCode);
  }
  // 格式3: JSON 格式
  else {
    try {
      const data = JSON.parse(qrCode);
      pileId = data.pileId || data.id;
    } catch {
      throw new Error('无效的二维码格式');
    }
  }

  if (!pileId || isNaN(pileId)) {
    throw new Error('无效的充电桩编号');
  }

  // 查询充电桩
  const pile = await Pile.findByPk(pileId, {
    include: [{ model: Station, as: 'station' }],
  });

  if (!pile) {
    throw new Error('充电桩不存在');
  }

  const pileData = pile as any;
  const station = pileData.station;

  return {
    pileId: pileData.id,
    stationId: station?.id || pileData.station_id,
    stationName: station?.name || '未知站点',
    pileName: pileData.name || `${pileData.id}号桩`,
    type: pileData.type === '快充' || pileData.type === 'fast' ? 'fast' : 'slow',
    power: parseFloat(pileData.power) || (pileData.type === '快充' ? 120 : 7),
    price: parseFloat(pileData.price) || 1.2,
    status: pileData.status,
  };
}

/**
 * 开始充电
 */
export async function startCharging(userId: number, pileId: number): Promise<ChargingResult> {
  // 检查用户是否有进行中的订单
  const existingOrder = await Order.findOne({
    where: {
      user_id: userId,
      status: 2, // 充电中
    },
  });

  if (existingOrder) {
    throw new Error('您已有进行中的充电订单');
  }

  // 查询充电桩
  const pile = await Pile.findByPk(pileId, {
    include: [{ model: Station, as: 'station' }],
  });

  if (!pile) {
    throw new Error('充电桩不存在');
  }

  const pileData = pile as any;

  // 检查充电桩状态
  if (pileData.status !== 1) {
    throw new Error('充电桩当前不可用');
  }

  // 检查用户余额
  const user = await ChargingUser.findByPk(userId);
  if (!user || parseFloat((user as any).balance) < 10) {
    throw new Error('余额不足，请先充值');
  }

  const station = pileData.station;
  const orderNo = generateOrderNo();
  const now = new Date();

  // 创建订单
  await Order.create({
    order_no: orderNo,
    user_id: userId,
    station_id: station?.id || pileData.station_id,
    pile_id: pileId,
    equipment_no: `PILE${pileId}`,
    date: now,
    start_time: now,
    status: 2, // 充电中
    money: 0,
    pay: 'balance',
  });

  // 更新充电桩状态为充电中
  await Pile.update(
    { status: 2 },
    { where: { id: pileId } }
  );

  return {
    orderId: orderNo,
    pileId: pileData.id,
    stationId: station?.id || pileData.station_id,
    stationName: station?.name || '未知站点',
    pileName: pileData.name || `${pileData.id}号桩`,
    startTime: now.toISOString(),
    status: 2,
  };
}

/**
 * 停止充电
 */
export async function stopCharging(userId: number, orderId: string): Promise<ChargingCompleteResult> {
  // 查询订单
  const order = await Order.findOne({
    where: {
      order_no: orderId,
      user_id: userId,
      status: 2, // 充电中
    },
  });

  if (!order) {
    throw new Error('未找到进行中的充电订单');
  }

  const orderData = order as any;
  const endTime = new Date();
  const startTime = new Date(orderData.start_time);
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // 秒

  // 计算充电量和费用（模拟）
  // 假设平均功率 30kW，价格 1.2元/度
  const hours = duration / 3600;
  const avgPower = 30; // kW
  const electricity = hours * avgPower; // kWh
  const pricePerKwh = 1.2;
  const electricityFee = electricity * pricePerKwh;
  const serviceFee = electricityFee * 0.1; // 服务费10%
  const totalAmount = electricityFee + serviceFee;

  // 更新订单
  await Order.update(
    {
      end_time: endTime,
      status: 3, // 已完成
      money: totalAmount.toFixed(2),
    },
    { where: { order_no: orderId } }
  );

  // 更新充电桩状态为空闲
  await Pile.update(
    { status: 1 },
    { where: { id: orderData.pile_id } }
  );

  // 扣款
  try {
    await deductBalance(userId, parseFloat(totalAmount.toFixed(2)));
  } catch (error) {
    console.error('扣款失败:', error);
    // 扣款失败时将订单标记为待支付
    await Order.update(
      { status: 0 },
      { where: { order_no: orderId } }
    );
  }

  return {
    orderId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
    electricity: parseFloat(electricity.toFixed(2)),
    amount: parseFloat(totalAmount.toFixed(2)),
    payStatus: 1, // 已支付
  };
}

/**
 * 获取当前充电状态
 */
export async function getChargingStatus(userId: number): Promise<ChargingStatus | null> {
  // 查询进行中的订单
  const order = await Order.findOne({
    where: {
      user_id: userId,
      status: 2, // 充电中
    },
    include: [
      { model: Station, as: 'station' },
    ],
  });

  if (!order) {
    return null;
  }

  const orderData = order as any;
  const station = orderData.station;
  const startTime = new Date(orderData.start_time);
  const now = new Date();
  const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000); // 秒

  // 模拟实时数据
  const hours = duration / 3600;
  const avgPower = 25 + Math.random() * 10; // 25-35kW
  const electricity = hours * avgPower;
  const pricePerKwh = 1.2;
  const amount = electricity * pricePerKwh * 1.1; // 含服务费

  // 查询充电桩
  const pile = await Pile.findByPk(orderData.pile_id);
  const pileData = pile as any;

  return {
    orderId: orderData.order_no,
    pileId: orderData.pile_id,
    stationId: station?.id || orderData.station_id,
    stationName: station?.name || '未知站点',
    pileName: pileData?.name || `${orderData.pile_id}号桩`,
    startTime: startTime.toISOString(),
    duration,
    power: parseFloat(avgPower.toFixed(1)),
    voltage: 380 + Math.random() * 20,
    current: (avgPower * 1000) / 380,
    electricity: parseFloat(electricity.toFixed(2)),
    amount: parseFloat(amount.toFixed(2)),
    percent: Math.min(95, Math.floor(duration / 60)), // 模拟电量百分比
    status: 1, // 充电中
  };
}

/**
 * 获取充电历史
 */
export async function getChargingHistory(userId: number, page: number = 1, pageSize: number = 10) {
  const { rows, count } = await Order.findAndCountAll({
    where: {
      user_id: userId,
      status: 3, // 已完成
    },
    include: [
      { model: Station, as: 'station', attributes: ['id', 'name'] },
    ],
    order: [['date', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const list = rows.map((order: any) => {
    const startTime = new Date(order.start_time);
    const endTime = order.end_time ? new Date(order.end_time) : new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const hours = duration / 3600;
    const electricity = hours * 30; // 假设平均30kW

    return {
      orderId: order.order_no,
      startTime: order.start_time,
      endTime: order.end_time,
      duration,
      electricity: parseFloat(electricity.toFixed(2)),
      amount: parseFloat(order.money) || 0,
      payStatus: 1,
    };
  });

  return {
    list,
    total: count,
  };
}
