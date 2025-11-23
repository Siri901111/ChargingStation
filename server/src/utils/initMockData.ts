import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import Order from '../models/Order.js';
import Revenue from '../models/Revenue.js';
import Alarm from '../models/Alarm.js';
import Notice from '../models/Notice.js';

// 初始化所有Mock数据
export async function initMockData() {
  try {
    console.log('📦 开始初始化Mock数据...');

    // 1. 创建用户数据
    await initUsers();
    
    // 2. 创建充电站数据
    const stations = await initStations();
    
    // 3. 创建充电桩数据
    await initPiles(stations);
    
    // 4. 创建订单数据
    await initOrders(stations);
    
    // 5. 创建营收数据
    await initRevenue(stations);
    
    // 6. 创建报警数据
    await initAlarms(stations);
    
    // 7. 创建公告数据
    await initNotices();

    console.log('✅ Mock数据初始化完成！');
  } catch (error) {
    console.error('❌ Mock数据初始化失败:', error);
  }
}

// 初始化用户数据
async function initUsers() {
  const users = [
    {
      account: 'admin',
      password: await bcrypt.hash('admin123', 10),
      name: '系统管理员',
      phone: '13800138000',
      id_no: '110101199001011234',
      position: '系统管理员',
      department: '总裁办',
      status: 1,
      page_authority: 'admin',
      btn_authority: 'all,add,edit,delete',
      role_id: 1,
    },
    {
      account: 'manager1',
      password: await bcrypt.hash('123456', 10),
      name: '张运营',
      phone: '13800138001',
      id_no: '110101199002021234',
      position: '运营经理',
      department: '运营部',
      status: 1,
      page_authority: 'manager',
      btn_authority: 'add,edit',
      role_id: 2,
    },
    {
      account: 'manager2',
      password: await bcrypt.hash('123456', 10),
      name: '李运营',
      phone: '13800138002',
      id_no: '110101199003031234',
      position: '运营专员',
      department: '运营部',
      status: 1,
      page_authority: 'manager',
      btn_authority: 'add,edit',
      role_id: 2,
    },
    {
      account: 'user1',
      password: await bcrypt.hash('123456', 10),
      name: '王用户',
      phone: '13800138003',
      id_no: '110101199004041234',
      position: '普通用户',
      department: '客服部',
      status: 1,
      page_authority: 'user',
      btn_authority: 'add',
      role_id: 3,
    },
    {
      account: 'user2',
      password: await bcrypt.hash('123456', 10),
      name: '赵用户',
      phone: '13800138004',
      id_no: '110101199005051234',
      position: '普通用户',
      department: '客服部',
      status: 1,
      page_authority: 'user',
      btn_authority: 'add',
      role_id: 3,
    },
  ];

  for (const userData of users) {
    const existing = await User.findOne({ where: { account: userData.account } });
    if (!existing) {
      await User.create(userData);
    }
  }
  console.log('✅ 用户数据初始化完成');
}

// 初始化充电站数据
async function initStations() {
  const stationsData = [
    {
      name: '北京朝阳充电站',
      city: '北京市',
      fast: 12,
      slow: 8,
      status: 2, // 使用中
      now: 8,
      fault: 1,
      person: '张站长',
      tel: '13800138010',
      longitude: 116.4074,
      latitude: 39.9042,
    },
    {
      name: '上海浦东充电站',
      city: '上海市',
      fast: 15,
      slow: 10,
      status: 2,
      now: 12,
      fault: 0,
      person: '李站长',
      tel: '13800138011',
      longitude: 121.4737,
      latitude: 31.2304,
    },
    {
      name: '广州天河充电站',
      city: '广州市',
      fast: 10,
      slow: 6,
      status: 3, // 空闲中
      now: 2,
      fault: 0,
      person: '王站长',
      tel: '13800138012',
      longitude: 113.2644,
      latitude: 23.1291,
    },
    {
      name: '深圳南山充电站',
      city: '深圳市',
      fast: 20,
      slow: 15,
      status: 2,
      now: 18,
      fault: 2,
      person: '赵站长',
      tel: '13800138013',
      longitude: 113.9308,
      latitude: 22.5330,
    },
    {
      name: '杭州西湖充电站',
      city: '杭州市',
      fast: 8,
      slow: 5,
      status: 4, // 维护中
      now: 0,
      fault: 1,
      person: '孙站长',
      tel: '13800138014',
      longitude: 120.1551,
      latitude: 30.2741,
    },
    {
      name: '成都锦江充电站',
      city: '成都市',
      fast: 12,
      slow: 8,
      status: 2,
      now: 9,
      fault: 0,
      person: '周站长',
      tel: '13800138015',
      longitude: 104.0668,
      latitude: 30.5728,
    },
  ];

  const stations = [];
  for (const stationData of stationsData) {
    const existing = await Station.findOne({ where: { name: stationData.name } });
    if (!existing) {
      const station = await Station.create(stationData);
      stations.push(station);
    } else {
      stations.push(existing);
    }
  }
  console.log('✅ 充电站数据初始化完成');
  return stations;
}

// 初始化充电桩数据
async function initPiles(stations: any[]) {
  const pileStatuses = [1, 2, 2, 3, 1, 2, 6, 1, 2, 2]; // 不同状态
  
  for (const station of stations) {
    const totalPiles = station.fast + station.slow;
    
    for (let i = 1; i <= totalPiles; i++) {
      const isFast = i <= station.fast;
      const status = pileStatuses[i % pileStatuses.length];
      
      await Pile.create({
        station_id: station.id,
        type: isFast ? '快充' : '慢充',
        status: status,
        percent: status === 2 ? Math.floor(Math.random() * 80) + 10 : 0,
        voltage: status === 2 || status === 3 ? 380 + Math.random() * 20 : 0,
        current: status === 2 || status === 3 ? 50 + Math.random() * 30 : 0,
        power: status === 2 || status === 3 ? 30 + Math.random() * 20 : 0,
        temperature: 25 + Math.random() * 15,
        install_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      });
    }
  }
  console.log('✅ 充电桩数据初始化完成');
}

// 初始化订单数据
async function initOrders(stations: any[]) {
  const payMethods = ['微信支付', '支付宝', '银行卡', '会员卡'];
  const statuses = [2, 3, 3, 3, 4]; // 进行中、已完成、已完成、已完成、异常
  
  const users = await User.findAll();
  
  for (let i = 0; i < 50; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30));
    startTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 1);
    
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const money = (hours * 30 + Math.random() * 20).toFixed(2);
    
    await Order.create({
      order_no: `ORD${Date.now()}${i}`,
      user_id: user.id,
      equipment_no: `PILE${station.id}-${Math.floor(Math.random() * 20) + 1}`,
      station_id: station.id,
      date: startTime,
      start_time: startTime,
      end_time: status === 2 ? null : endTime,
      money: parseFloat(money),
      pay: payMethods[Math.floor(Math.random() * payMethods.length)],
      status: status,
    });
  }
  console.log('✅ 订单数据初始化完成');
}

// 初始化营收数据
async function initRevenue(stations: any[]) {
  const today = new Date();
  
  for (const station of stations) {
    // 今日营收
    const dayRevenue = {
      station_id: station.id,
      day_date: today,
      day: 5000 + Math.random() * 10000,
      month: 150000 + Math.random() * 50000,
      electricity: 2000 + Math.random() * 3000,
      parking_fee: 500 + Math.random() * 1000,
      service_fee: 1000 + Math.random() * 2000,
      member: 1500 + Math.random() * 2000,
      percent: (Math.random() * 40 - 20).toFixed(2), // -20% 到 +20%
      mpercent: (Math.random() * 30 - 15).toFixed(2),
    };
    
    await Revenue.create(dayRevenue);
    
    // 生成过去7天的数据
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await Revenue.create({
        station_id: station.id,
        day_date: date,
        day: 3000 + Math.random() * 8000,
        month: 140000 + Math.random() * 60000,
        electricity: 1500 + Math.random() * 4000,
        parking_fee: 300 + Math.random() * 1200,
        service_fee: 800 + Math.random() * 2500,
        member: 1000 + Math.random() * 3000,
        percent: (Math.random() * 40 - 20).toFixed(2),
        mpercent: (Math.random() * 30 - 15).toFixed(2),
      });
    }
  }
  console.log('✅ 营收数据初始化完成');
}

// 初始化报警数据
async function initAlarms(stations: any[]) {
  const alarmTitles = [
    '充电桩通讯中断',
    '充电桩过载保护',
    '充电桩温度异常',
    '充电桩电压异常',
    '充电桩电流异常',
    '充电站网络中断',
    '充电站设备故障',
  ];
  
  const levels = [1, 2, 3]; // 1-低, 2-中, 3-高
  
  for (let i = 0; i < 20; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const title = alarmTitles[Math.floor(Math.random() * alarmTitles.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    const faultTime = new Date();
    faultTime.setDate(faultTime.getDate() - Math.floor(Math.random() * 30));
    faultTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    await Alarm.create({
      station_id: station.id,
      pile_id: Math.floor(Math.random() * 20) + 1,
      title: title,
      detail: `${station.name}的${title}，请及时处理`,
      fault_time: faultTime,
      level: level,
    });
  }
  console.log('✅ 报警数据初始化完成');
}

// 初始化公告数据
async function initNotices() {
  const notices = [
    {
      title: '系统维护通知',
      content: '系统将于2024年12月1日 00:00-06:00 进行维护升级，期间可能无法正常使用，请提前做好准备。',
      publish_time: new Date(2024, 10, 25),
      type: '系统通知',
      status: 1,
    },
    {
      title: '充电站优惠活动',
      content: '即日起至12月31日，所有充电站享受8折优惠，欢迎使用！',
      publish_time: new Date(2024, 11, 1),
      type: '活动通知',
      status: 1,
    },
    {
      title: '新站点上线通知',
      content: '北京朝阳充电站、上海浦东充电站已正式上线运营，欢迎使用！',
      publish_time: new Date(2024, 10, 15),
      type: '运营通知',
      status: 1,
    },
  ];

  for (const noticeData of notices) {
    const existing = await Notice.findOne({ where: { title: noticeData.title } });
    if (!existing) {
      await Notice.create(noticeData);
    }
  }
  console.log('✅ 公告数据初始化完成');
}

