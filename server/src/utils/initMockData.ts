import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ChargingUser from '../models/ChargingUser.js';
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
    
    // 2. 创建充电用户数据（会员卡）
    const chargingUsers = await initChargingUsers();
    
    // 3. 创建充电站数据
    const stations = await initStations();
    
    // 4. 创建充电桩数据
    await initPiles(stations);
    
    // 5. 创建订单数据
    await initOrders(stations, chargingUsers);
    
    // 6. 创建营收数据
    await initRevenue(stations);
    
    // 7. 创建报警数据
    await initAlarms(stations);
    
    // 8. 创建公告数据
    await initNotices();

    console.log('✅ Mock数据初始化完成！');
  } catch (error) {
    console.error('❌ Mock数据初始化失败:', error);
  }
}

// 初始化用户数据
async function initUsers() {
  // 标签库
  const tagOptions = [
    ['认真', '工作狂', '与人和善', '代码洁癖'],
    ['负责', '高效', '团队合作', '学习能力强'],
    ['细心', '专业', '沟通能力强', '执行力强'],
    ['创新', '积极', '乐观', '抗压能力强'],
    ['严谨', '专注', '有责任心', '技术过硬'],
  ];

  // 地址库
  const addresses = [
    '北京市朝阳区建国路88号',
    '北京市海淀区中关村大街1号',
    '北京市西城区西单北大街176号',
    '上海市浦东新区陆家嘴环路1000号',
    '上海市黄浦区南京东路100号',
    '广州市天河区天河路123号',
    '深圳市南山区科技园南路2号',
    '杭州市西湖区文三路259号',
  ];

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
      address: addresses[0],
      tags: tagOptions[0],
      work_status: 1,
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=admin',
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
      address: addresses[1],
      tags: tagOptions[1],
      work_status: 1,
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=manager1',
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
      address: addresses[2],
      tags: tagOptions[2],
      work_status: 2, // 请假中
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=manager2',
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
      address: addresses[3],
      tags: tagOptions[3],
      work_status: 1,
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=user1',
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
      address: addresses[4],
      tags: tagOptions[4],
      work_status: 3, // 出差中
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=user2',
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

// 初始化充电用户数据（会员卡）
export async function initChargingUsers() {
  const cardTypes = ['普通卡', 'VIP卡', '季卡'];
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const phones = [
    '13800138001', '13800138002', '13800138003', '13800138004',
    '13800138005', '13800138006', '13800138007', '13800138008',
    '13900139001', '13900139002', '13900139003', '13900139004',
    '15000150001', '15000150002', '15000150003', '15000150004',
    '15100151001', '15100151002', '15100151003', '15100151004',
  ];

  const chargingUsers = [];

  for (let i = 0; i < 30; i++) {
    const phone = phones[i % phones.length];
    const name = names[i % names.length];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    
    // 生成会员卡号
    const memberCardNo = `MC${String(i + 1).padStart(6, '0')}`;
    
    // 生成开卡日期（随机过去1-12个月）
    const issueDate = new Date();
    issueDate.setMonth(issueDate.getMonth() - Math.floor(Math.random() * 12) - 1);
    
    // 根据卡类型设置有效期
    let validUntil: Date | null = null;
    if (cardType === '季卡') {
      validUntil = new Date(issueDate);
      validUntil.setMonth(validUntil.getMonth() + 3); // 3个月有效期
    } else if (cardType === 'VIP卡') {
      validUntil = new Date(issueDate);
      validUntil.setFullYear(validUntil.getFullYear() + 1); // 1年有效期
    } else {
      validUntil = new Date(issueDate);
      validUntil.setFullYear(validUntil.getFullYear() + 2); // 普通卡2年有效期
    }
    
    // 生成余额（根据卡类型不同范围）
    let balance = 0;
    if (cardType === 'VIP卡') {
      balance = Math.floor(Math.random() * 5000) + 2000; // 2000-7000
    } else if (cardType === '季卡') {
      balance = Math.floor(Math.random() * 3000) + 1000; // 1000-4000
    } else {
      balance = Math.floor(Math.random() * 2000) + 500; // 500-2500
    }
    
    // 生成身份证号（模拟）
    const idNo = `110101199${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;

    try {
      const existing = await ChargingUser.findOne({ where: { phone } });
      if (!existing) {
        const user = await ChargingUser.create({
          phone,
          name: `${name}${i > 7 ? i : ''}`,
          id_no: idNo,
          member_card_no: memberCardNo,
          card_type: cardType,
          balance: balance,
          issue_date: issueDate,
          valid_until: validUntil,
          status: Math.random() > 0.1 ? 1 : 0, // 90%正常，10%禁用
          created_at: issueDate,
        });
        chargingUsers.push(user);
      } else {
        chargingUsers.push(existing);
      }
    } catch (error) {
      console.error(`创建充电用户失败 (${phone}):`, error);
    }
  }

  console.log('✅ 充电用户数据初始化完成');
  return chargingUsers;
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
async function initOrders(stations: any[], chargingUsers: any[]) {
  const payMethods = ['微信支付', '支付宝', '银行卡', '会员卡'];
  const statuses = [2, 3, 3, 3, 4]; // 进行中、已完成、已完成、已完成、异常
  
  // 如果没有充电用户，创建一些
  if (!chargingUsers || chargingUsers.length === 0) {
    chargingUsers = await ChargingUser.findAll();
  }
  
  if (chargingUsers.length === 0) {
    console.log('⚠️  没有充电用户，跳过订单数据初始化');
    return;
  }
  
  for (let i = 0; i < 50; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const user = chargingUsers[Math.floor(Math.random() * chargingUsers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30));
    startTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 1);
    
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const money = (hours * 30 + Math.random() * 20).toFixed(2);
    
    await Order.create({
      order_no: `ORD${Date.now()}${i}${Math.floor(Math.random() * 1000)}`,
      user_id: (user as any).id,
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
  
  const levels = [1, 2, 3, 4]; // 1-严重, 2-紧急, 3-重要, 4-一般
  
  // 获取所有充电桩
  const piles = await Pile.findAll();
  
  for (let i = 0; i < 20; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const title = alarmTitles[Math.floor(Math.random() * alarmTitles.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    // 随机选择是否关联充电桩（有些报警可能是站点级别的）
    const shouldHavePile = Math.random() > 0.3; // 70%概率关联充电桩
    let pileId = null;
    
    if (shouldHavePile && piles.length > 0) {
      // 从该站点的充电桩中随机选择一个
      const stationPiles = piles.filter((pile: any) => pile.station_id === station.id);
      if (stationPiles.length > 0) {
        const randomPile = stationPiles[Math.floor(Math.random() * stationPiles.length)];
        pileId = randomPile.id;
      }
    }
    
    const faultTime = new Date();
    faultTime.setDate(faultTime.getDate() - Math.floor(Math.random() * 30));
    faultTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    // 根据级别设置初始状态
    let initialStatus = 1; // 默认待指派
    if (level === 2) initialStatus = 2; // 紧急的设为处理中
    if (level === 4) initialStatus = Math.random() > 0.5 ? 3 : 1; // 一般的有50%概率已处理
    
    await Alarm.create({
      station_id: station.id,
      pile_id: pileId,
      title: title,
      detail: `${station.name}的${title}，请及时处理`,
      fault_time: faultTime,
      level: level,
      status: initialStatus,
      handler: initialStatus > 1 ? ['张工程师', '李维修员', '王技术员'][Math.floor(Math.random() * 3)] : null,
      handle_time: initialStatus > 1 ? new Date(faultTime.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
      handle_note: initialStatus === 3 ? '问题已解决，设备恢复正常' : (initialStatus === 2 ? '正在现场处理中' : null)
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

