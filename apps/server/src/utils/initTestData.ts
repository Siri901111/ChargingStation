/**
 * 初始化测试数据
 * - 长沙市和天津市的充电站
 * - 测试用户的订单数据
 */
import { Op } from 'sequelize';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import Order from '../models/Order.js';
import ChargingUser from '../models/ChargingUser.js';

// 长沙市充电站数据（真实坐标）
const changshStations = [
  {
    name: '岳麓区智能充电站',
    city: '长沙市岳麓区',
    address: '长沙市岳麓区麓山南路301号',
    latitude: 28.1758,
    longitude: 112.9452,
    person: '李站长',
    tel: '0731-88888001',
  },
  {
    name: '天心区新能源充电站',
    city: '长沙市天心区',
    address: '长沙市天心区芙蓉南路388号',
    latitude: 28.1127,
    longitude: 112.9896,
    person: '王经理',
    tel: '0731-88888002',
  },
  {
    name: '开福区万达充电站',
    city: '长沙市开福区',
    address: '长沙市开福区芙蓉北路88号万达广场',
    latitude: 28.2282,
    longitude: 112.9849,
    person: '张站长',
    tel: '0731-88888003',
  },
  {
    name: '雨花区红星充电站',
    city: '长沙市雨花区',
    address: '长沙市雨花区万家丽路568号',
    latitude: 28.1352,
    longitude: 113.0367,
    person: '刘经理',
    tel: '0731-88888004',
  },
  {
    name: '芙蓉区五一广场充电站',
    city: '长沙市芙蓉区',
    address: '长沙市芙蓉区五一大道389号',
    latitude: 28.1963,
    longitude: 112.9822,
    person: '陈站长',
    tel: '0731-88888005',
  },
  {
    name: '望城区高铁西站充电站',
    city: '长沙市望城区',
    address: '长沙市望城区金星北路高铁西站P1停车场',
    latitude: 28.2516,
    longitude: 112.8356,
    person: '赵经理',
    tel: '0731-88888006',
  },
  {
    name: '长沙县星沙充电站',
    city: '长沙市长沙县',
    address: '长沙县星沙大道199号',
    latitude: 28.2453,
    longitude: 113.0815,
    person: '孙站长',
    tel: '0731-88888007',
  },
  {
    name: '岳麓区橘子洲充电站',
    city: '长沙市岳麓区',
    address: '长沙市岳麓区潇湘中路橘子洲景区入口',
    latitude: 28.1892,
    longitude: 112.9612,
    person: '周经理',
    tel: '0731-88888008',
  },
];

// 天津市充电站数据（真实坐标）
const tianjinStations = [
  {
    name: '和平区滨江道充电站',
    city: '天津市和平区',
    address: '天津市和平区滨江道128号',
    latitude: 39.1256,
    longitude: 117.1945,
    person: '马站长',
    tel: '022-88888001',
  },
  {
    name: '南开区天塔充电站',
    city: '天津市南开区',
    address: '天津市南开区卫津南路天塔景区',
    latitude: 39.0832,
    longitude: 117.1541,
    person: '冯经理',
    tel: '022-88888002',
  },
  {
    name: '河西区友谊路充电站',
    city: '天津市河西区',
    address: '天津市河西区友谊路50号',
    latitude: 39.0865,
    longitude: 117.2235,
    person: '郑站长',
    tel: '022-88888003',
  },
  {
    name: '河东区万达广场充电站',
    city: '天津市河东区',
    address: '天津市河东区津滨大道55号万达广场',
    latitude: 39.1323,
    longitude: 117.2516,
    person: '吴经理',
    tel: '022-88888004',
  },
  {
    name: '河北区意式风情街充电站',
    city: '天津市河北区',
    address: '天津市河北区胜利路意式风情街',
    latitude: 39.1452,
    longitude: 117.2012,
    person: '钱站长',
    tel: '022-88888005',
  },
  {
    name: '红桥区西站充电站',
    city: '天津市红桥区',
    address: '天津市红桥区西青道天津西站',
    latitude: 39.1612,
    longitude: 117.1325,
    person: '徐经理',
    tel: '022-88888006',
  },
  {
    name: '滨海新区于家堡充电站',
    city: '天津市滨海新区',
    address: '天津市滨海新区于家堡金融区',
    latitude: 39.0125,
    longitude: 117.7125,
    person: '何站长',
    tel: '022-88888007',
  },
  {
    name: '武清区佛罗伦萨充电站',
    city: '天津市武清区',
    address: '天津市武清区前进道佛罗伦萨小镇',
    latitude: 39.3856,
    longitude: 117.0456,
    person: '朱经理',
    tel: '022-88888008',
  },
];

/**
 * 生成订单号
 */
function generateOrderNo(date: Date): string {
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
 * 初始化长沙和天津充电站数据
 */
export async function initCityStations() {
  // console.log('📍 开始初始化长沙和天津充电站数据...');

  const allStations = [...changshStations, ...tianjinStations];
  const createdStations: any[] = [];

  for (const stationData of allStations) {
    // 检查是否已存在
    const existing = await Station.findOne({
      where: { name: stationData.name },
    });

    if (existing) {
      // console.log(`   - 站点 ${stationData.name} 已存在，跳过`);
      createdStations.push(existing);
      continue;
    }

    // 随机生成快充和慢充数量
    const fastCount = Math.floor(Math.random() * 6) + 4; // 4-9个快充
    const slowCount = Math.floor(Math.random() * 8) + 4; // 4-11个慢充

    const station = await Station.create({
      ...stationData,
      fast: fastCount,
      slow: slowCount,
      status: 1,
      now: Math.floor(Math.random() * (fastCount + slowCount)),
      fault: Math.floor(Math.random() * 2),
    });

    createdStations.push(station);

    // 为每个站点创建充电桩
    await createPilesForStation((station as any).id, fastCount, slowCount);

    // console.log(`   ✅ 创建站点: ${stationData.name} (快充${fastCount} 慢充${slowCount})`);
  }

  // console.log(`📍 充电站数据初始化完成，共 ${createdStations.length} 个站点`);
  return createdStations;
}

/**
 * 为站点创建充电桩
 */
async function createPilesForStation(stationId: number, fastCount: number, slowCount: number) {
  let pileIndex = 1;

  // 创建快充桩
  for (let i = 0; i < fastCount; i++) {
    await Pile.create({
      station_id: stationId,
      name: `${pileIndex}号快充桩`,
      type: '快充',
      status: Math.random() > 0.15 ? 1 : (Math.random() > 0.5 ? 2 : 3), // 85%空闲，7.5%充电中，7.5%故障
      power: 120 + Math.floor(Math.random() * 40), // 120-160kW
      price: 1.2 + Math.random() * 0.4, // 1.2-1.6元/度
      voltage: 380 + Math.random() * 20,
      current: 300 + Math.random() * 100,
      temperature: 25 + Math.random() * 15,
      install_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    });
    pileIndex++;
  }

  // 创建慢充桩
  for (let i = 0; i < slowCount; i++) {
    await Pile.create({
      station_id: stationId,
      name: `${pileIndex}号慢充桩`,
      type: '慢充',
      status: Math.random() > 0.1 ? 1 : (Math.random() > 0.5 ? 2 : 3), // 90%空闲
      power: 7 + Math.floor(Math.random() * 8), // 7-14kW
      price: 0.8 + Math.random() * 0.3, // 0.8-1.1元/度
      voltage: 220 + Math.random() * 10,
      current: 32 + Math.random() * 16,
      temperature: 20 + Math.random() * 10,
      install_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    });
    pileIndex++;
  }
}

/**
 * 为测试用户创建订单数据
 */
export async function initTestUserOrders(phone: string = '19282249442') {
  console.log(`为用户 ${phone} 创建测试订单...`);

  // 查找或创建测试用户
  let user = await ChargingUser.findOne({ where: { phone } });

  if (!user) {
    // 创建测试用户
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    user = await ChargingUser.create({
      phone,
      name: '测试用户',
      member_card_no: `M${timestamp}${random}`,
      card_type: 'VIP卡',
      balance: 500.00,
      issue_date: new Date(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 1,
    });
    // console.log(`   ✅ 创建测试用户: ${phone}, 余额: 500元`);
  } else {
    console.log(`   - 测试用户 ${phone} 已存在, 余额: ${(user as any).balance}元`);
  }

  const userId = (user as any).id;

  // 获取长沙的站点
  const changshaStas = await Station.findAll({
    where: { city: { [Op.like]: '%长沙%' } },
  });

  if (changshaStas.length === 0) {
    // 如果没有长沙站点，先初始化
    await initCityStations();
  }

  // 重新获取长沙站点
  const stations = await Station.findAll();
  const changshStationsData = stations.filter((s: any) => s.city?.includes('长沙'));

  if (changshStationsData.length === 0) {
    console.log('   ⚠️ 没有找到长沙充电站，请先初始化充电站数据');
    return;
  }

  // 检查是否已有订单
  const existingOrders = await Order.findAll({ where: { user_id: userId } });
  if (existingOrders.length > 0) {
    console.log(`   - 用户已有 ${existingOrders.length} 条订单，跳过创建`);
    return;
  }

  // 为用户创建历史订单（最近30天内）
  const orderCount = 15; // 创建15条订单

  for (let i = 0; i < orderCount; i++) {
    // 随机选择一个长沙站点
    const station = changshStationsData[Math.floor(Math.random() * changshStationsData.length)] as any;

    // 获取该站点的充电桩
    const piles = await Pile.findAll({ where: { station_id: station.id } });
    if (piles.length === 0) continue;

    const pile = piles[Math.floor(Math.random() * piles.length)] as any;

    // 随机日期（最近30天）
    const daysAgo = Math.floor(Math.random() * 30);
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // 随机开始时间
    const startHour = 6 + Math.floor(Math.random() * 16); // 6点到22点
    orderDate.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);

    const startTime = new Date(orderDate);

    // 充电时长（30分钟到3小时）
    const chargingMinutes = 30 + Math.floor(Math.random() * 150);
    const endTime = new Date(startTime.getTime() + chargingMinutes * 60 * 1000);

    // 计算费用
    const hours = chargingMinutes / 60;
    const avgPower = pile.type === '快充' ? 60 : 7; // kW
    const electricity = hours * avgPower; // kWh
    const pricePerKwh = parseFloat(pile.price) || 1.2;
    const totalMoney = electricity * pricePerKwh * 1.1; // 含服务费

    const orderNo = generateOrderNo(startTime);

    await Order.create({
      order_no: orderNo,
      user_id: userId,
      station_id: station.id,
      pile_id: pile.id,
      equipment_no: `PILE${pile.id}`,
      date: orderDate,
      start_time: startTime,
      end_time: endTime,
      money: parseFloat(totalMoney.toFixed(2)),
      pay: 'balance',
      pay_time: endTime,
      status: 3, // 已完成
    });
  }

  console.log(`   ✅ 为用户 ${phone} 创建了 ${orderCount} 条历史订单`);
}

/**
 * 测试充值 - 给用户增加余额
 */
export async function testRecharge(userId: number, amount: number, giftAmount: number = 0) {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  const userData = user as any;
  const currentBalance = parseFloat(userData.balance) || 0;
  
  // 检查是否是充值会员且未过期，享受95折（支付95元到账100元，即实际到账 = 支付金额 / 0.95）
  let actualAmount = amount;
  let memberDiscount = 0;
  let isRechargeMember = false;

  if (userData.card_type === '充值会员' && userData.valid_until) {
    const validUntil = new Date(userData.valid_until);
    const now = new Date();
    if (validUntil > now) {
      // 充值会员享受95折：实际到账金额 = 支付金额 / 0.95
      actualAmount = Math.round((amount / 0.95) * 100) / 100; // 保留2位小数
      memberDiscount = actualAmount - amount;
      isRechargeMember = true;
    }
  }

  const totalAdd = actualAmount + giftAmount;
  const newBalance = currentBalance + totalAdd;

  await ChargingUser.update(
    { balance: newBalance },
    { where: { id: userId } }
  );

  console.log(`💰 充值成功: 用户${userId} 支付${amount}元 ${isRechargeMember ? `(充值会员95折，实际到账${actualAmount}元)` : ''} 赠送${giftAmount}元 新余额${newBalance}元`);

  return {
    success: true,
    message: '充值成功',
    amount: actualAmount, // 实际到账金额
    payAmount: amount, // 支付金额
    giftAmount,
    memberDiscount: isRechargeMember ? memberDiscount : 0,
    isRechargeMember,
    totalAdd,
    newBalance,
  };
}

/**
 * 初始化所有测试数据
 */
export async function initAllTestData() {
  // console.log('🚀 开始初始化所有测试数据...\n');

  // 1. 初始化长沙和天津充电站
  await initCityStations();

  // 2. 为测试用户创建订单
  await initTestUserOrders('19282249442');

  // console.log('\n✅ 所有测试数据初始化完成！');
}
