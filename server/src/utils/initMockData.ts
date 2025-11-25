import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ChargingUser from '../models/ChargingUser.js';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import Order from '../models/Order.js';
import Revenue from '../models/Revenue.js';
import Alarm from '../models/Alarm.js';
import Notice from '../models/Notice.js';
import PileMaintenance from '../models/PileMaintenance.js';
import BillingTemplate from '../models/BillingTemplate.js';
import Document from '../models/Document.js';

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
    
    // 9. 创建维保记录数据
    await initPileMaintenance();
    
    // 10. 创建计费模板数据
    await initBillingTemplates(stations);
    
    // 11. 创建文档数据
    await initDocuments();

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
  
  // 获取所有充电桩，用于生成真实的equipment_no
  const piles = await Pile.findAll();
  
  // 生成更多订单数据（200条）
  for (let i = 0; i < 200; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const user = chargingUsers[Math.floor(Math.random() * chargingUsers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // 生成过去90天内的订单
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 90));
    startTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 1);
    endTime.setMinutes(Math.floor(Math.random() * 60));
    
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const money = (hours * 30 + Math.random() * 20).toFixed(2);
    
    // 从该站点的充电桩中随机选择一个
    const stationPiles = piles.filter((pile: any) => pile.station_id === station.id);
    const equipmentNo = stationPiles.length > 0 
      ? String((stationPiles[Math.floor(Math.random() * stationPiles.length)] as any).id)
      : `PILE${station.id}-${Math.floor(Math.random() * 20) + 1}`;
    
    await Order.create({
      order_no: `ORD${Date.now()}${i}${Math.floor(Math.random() * 10000)}`,
      user_id: (user as any).id,
      equipment_no: equipmentNo,
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
  today.setHours(0, 0, 0, 0);
  
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
    
    // 生成过去30天的数据（更丰富的历史数据）
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 周末数据稍微少一些
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dayMultiplier = isWeekend ? 0.7 : 1.0;
      
      await Revenue.create({
        station_id: station.id,
        day_date: date,
        day: (3000 + Math.random() * 8000) * dayMultiplier,
        month: 140000 + Math.random() * 60000,
        electricity: (1500 + Math.random() * 4000) * dayMultiplier,
        parking_fee: (300 + Math.random() * 1200) * dayMultiplier,
        service_fee: (800 + Math.random() * 2500) * dayMultiplier,
        member: (1000 + Math.random() * 3000) * dayMultiplier,
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
    '充电桩接地故障',
    '充电桩绝缘故障',
    '充电桩急停按钮触发',
    '充电桩门锁异常',
    '充电桩显示屏故障',
  ];
  
  const levels = [1, 2, 3, 4]; // 1-严重, 2-紧急, 3-重要, 4-一般
  
  // 获取所有充电桩
  const piles = await Pile.findAll();
  
  // 生成更多报警数据（50条）
  for (let i = 0; i < 50; i++) {
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
        pileId = (randomPile as any).id;
      }
    }
    
    // 生成过去60天内的报警
    const faultTime = new Date();
    faultTime.setDate(faultTime.getDate() - Math.floor(Math.random() * 60));
    faultTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    // 根据级别设置初始状态
    let initialStatus = 1; // 默认待指派
    let urgeCount = 0;
    if (level === 2) {
      initialStatus = 2; // 紧急的设为处理中
      urgeCount = Math.floor(Math.random() * 2); // 可能被催办过
    }
    if (level === 4) {
      initialStatus = Math.random() > 0.5 ? 3 : 1; // 一般的有50%概率已处理
    }
    if (level === 1) {
      initialStatus = Math.random() > 0.3 ? 2 : 1; // 严重的30%概率已处理中
      urgeCount = Math.floor(Math.random() * 3); // 可能被催办多次
    }
    
    const handlers = ['张工程师', '李维修员', '王技术员', '赵技师', '钱维修', '孙技术'];
    const handleNotes = [
      '问题已解决，设备恢复正常',
      '正在现场处理中',
      '已更换故障部件，测试正常',
      '设备重启后恢复正常',
      '已联系厂家技术支持',
      '等待备件到货',
    ];
    
    await Alarm.create({
      station_id: station.id,
      pile_id: pileId,
      title: title,
      detail: `${station.name}的${title}，请及时处理。故障详情：${['设备运行异常', '通讯模块故障', '电源模块异常', '控制板故障', '传感器故障'][Math.floor(Math.random() * 5)]}`,
      fault_time: faultTime,
      level: level,
      status: initialStatus,
      handler: initialStatus > 1 ? handlers[Math.floor(Math.random() * handlers.length)] : null,
      handle_time: initialStatus > 1 ? new Date(faultTime.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
      handle_note: initialStatus === 3 ? handleNotes[Math.floor(Math.random() * handleNotes.length)] : (initialStatus === 2 ? '正在现场处理中' : null),
      urge_count: urgeCount,
      last_urge_time: urgeCount > 0 ? new Date(faultTime.getTime() + Math.random() * 12 * 60 * 60 * 1000) : null,
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
    {
      title: '春节期间服务时间调整',
      content: '春节期间（2月10日-2月17日）所有充电站正常运营，24小时服务，祝大家春节快乐！',
      publish_time: new Date(2024, 1, 5),
      type: '运营通知',
      status: 1,
    },
    {
      title: '会员卡充值优惠',
      content: '即日起充值会员卡满500元送50元，满1000元送120元，多充多送！',
      publish_time: new Date(2024, 11, 5),
      type: '活动通知',
      status: 1,
    },
    {
      title: '充电站APP更新',
      content: '充电站管理APP已更新至v2.0版本，新增实时监控、故障预警等功能，请及时更新。',
      publish_time: new Date(2024, 10, 20),
      type: '系统通知',
      status: 1,
    },
    {
      title: '新增快充桩通知',
      content: '深圳南山充电站新增10个快充桩，充电功率提升至120KW，欢迎体验！',
      publish_time: new Date(2024, 10, 10),
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

// 初始化维保记录数据
async function initPileMaintenance() {
  const piles = await Pile.findAll();
  if (piles.length === 0) {
    console.log('⚠️  没有充电桩，跳过维保记录数据初始化');
    return;
  }
  
  const maintenanceTypes = ['日常维护', '故障维修', '定期检查', '预防性维护', '升级改造'];
  const maintenancePersons = ['张工程师', '李维修员', '王技术员', '赵技师', '钱维修', '孙技术'];
  const maintenanceContents = [
    '清洁充电桩外壳，检查连接线路',
    '更换故障模块，测试充电功能',
    '检查充电枪接口，清洁接触点',
    '更新系统软件，优化充电效率',
    '检查安全保护装置，确保正常运行',
    '更换老化线缆，提升安全性',
    '检查显示屏和按键功能',
    '校准电压电流传感器',
  ];
  
  // 为每个充电桩生成1-3条维保记录
  for (const pile of piles) {
    const recordCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < recordCount; i++) {
      const maintenanceTime = new Date();
      maintenanceTime.setDate(maintenanceTime.getDate() - Math.floor(Math.random() * 180)); // 过去180天内
      maintenanceTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      const maintenanceType = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
      const maintenancePerson = maintenancePersons[Math.floor(Math.random() * maintenancePersons.length)];
      const maintenanceContent = maintenanceContents[Math.floor(Math.random() * maintenanceContents.length)];
      const maintenanceCost = Math.floor(Math.random() * 2000) + 200; // 200-2200元
      
      // 下次维保时间（根据类型决定）
      let nextMaintenanceTime: Date | null = null;
      if (maintenanceType === '定期检查' || maintenanceType === '预防性维护') {
        nextMaintenanceTime = new Date(maintenanceTime);
        nextMaintenanceTime.setMonth(nextMaintenanceTime.getMonth() + 3); // 3个月后
      }
      
      const status = Math.random() > 0.2 ? 1 : 2; // 80%已完成，20%进行中
      
      await PileMaintenance.create({
        pile_id: (pile as any).id,
        maintenance_type: maintenanceType,
        maintenance_person: maintenancePerson,
        maintenance_time: maintenanceTime,
        maintenance_content: maintenanceContent,
        maintenance_cost: maintenanceCost,
        next_maintenance_time: nextMaintenanceTime,
        status: status,
      });
    }
  }
  console.log('✅ 维保记录数据初始化完成');
}

// 初始化计费模板数据
async function initBillingTemplates(stations: any[]) {
  const timeSlotsTemplates = [
    [
      { date1: '00:00:00', date2: '08:00:00', electricity: '0.8' },
      { date1: '08:00:00', date2: '18:00:00', electricity: '1.2' },
      { date1: '18:00:00', date2: '22:00:00', electricity: '1.5' },
      { date1: '22:00:00', date2: '24:00:00', electricity: '0.8' },
    ],
    [
      { date1: '00:00:00', date2: '06:00:00', electricity: '0.7' },
      { date1: '06:00:00', date2: '22:00:00', electricity: '1.3' },
      { date1: '22:00:00', date2: '24:00:00', electricity: '0.7' },
    ],
    [
      { date1: '00:00:00', date2: '10:00:00', electricity: '0.9' },
      { date1: '10:00:00', date2: '20:00:00', electricity: '1.4' },
      { date1: '20:00:00', date2: '24:00:00', electricity: '0.9' },
    ],
  ];
  
  const templateNames = ['标准计费模板', '高峰计费模板', '优惠计费模板', 'VIP计费模板'];
  const remarksList = [
    '适用于工作日正常时段',
    '适用于节假日和高峰期',
    '适用于会员用户',
    '适用于夜间充电优惠',
  ];
  
  // 为每个充电站创建1-2个计费模板
  for (const station of stations) {
    const templateCount = Math.floor(Math.random() * 2) + 1; // 1-2个
    
    for (let i = 0; i < templateCount; i++) {
      const timeSlots = timeSlotsTemplates[Math.floor(Math.random() * timeSlotsTemplates.length)];
      const serviceFee = 0.5 + Math.random() * 0.5; // 0.5-1.0元
      const parkingFee = 2 + Math.random() * 3; // 2-5元
      
      await BillingTemplate.create({
        station_id: station.id,
        name: `${station.name}-${templateNames[Math.floor(Math.random() * templateNames.length)]}`,
        service_fee: Math.round(serviceFee * 100) / 100,
        parking_fee: Math.round(parkingFee * 100) / 100,
        time_slots: timeSlots,
        remarks: remarksList[Math.floor(Math.random() * remarksList.length)],
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }
  console.log('✅ 计费模板数据初始化完成');
}

// 初始化文档数据
async function initDocuments() {
  const users = await User.findAll();
  if (users.length === 0) {
    console.log('⚠️  没有用户，跳过文档数据初始化');
    return;
  }
  
  const documentTypes = ['招商类', '广告类', '公告类', '新闻类', '活动类'];
  const importants = ['一级', '二级', '三级', '四级'];
  const publishChannels = ['站内信', '公众号', '小程序', '官网', 'APP'];
  const statuses = [1, 2, 2, 2]; // 大部分已发布，少部分草稿
  
  const titles = [
    '新能源汽车充电站招商合作',
    '充电站加盟优惠政策',
    '充电站运营管理规范',
    '充电站安全使用指南',
    '充电站会员权益说明',
    '充电站优惠活动通知',
    '充电站设备升级公告',
    '充电站服务时间调整',
    '充电站新功能上线',
    '充电站用户协议',
    '充电站隐私政策',
    '充电站常见问题解答',
  ];
  
  const contents = [
    '<p>欢迎加入我们的充电站网络！我们提供完善的运营支持和技术服务。</p><p>合作优势：</p><ul><li>品牌支持</li><li>技术支持</li><li>运营指导</li></ul>',
    '<p>即日起，新加盟的充电站享受以下优惠政策：</p><ol><li>免加盟费</li><li>设备补贴</li><li>运营培训</li></ol>',
    '<p>为了确保充电站的安全运营，请遵守以下管理规范：</p><p>1. 定期检查设备</p><p>2. 保持环境整洁</p><p>3. 及时处理故障</p>',
    '<p>使用充电站时请注意：</p><p>1. 检查充电枪是否完好</p><p>2. 确认车辆充电接口匹配</p><p>3. 充电过程中不要离开</p>',
    '<p>会员用户享受以下权益：</p><ul><li>充电折扣</li><li>优先充电</li><li>专属客服</li></ul>',
  ];
  
  // 生成20-30篇文档
  const docCount = 20 + Math.floor(Math.random() * 11);
  
  for (let i = 0; i < docCount; i++) {
    const type = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    const important = importants[Math.floor(Math.random() * importants.length)];
    const publish = publishChannels[Math.floor(Math.random() * publishChannels.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const author = users[Math.floor(Math.random() * users.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const content = contents[Math.floor(Math.random() * contents.length)];
    
    const publishTime = new Date();
    publishTime.setDate(publishTime.getDate() - Math.floor(Math.random() * 90)); // 过去90天
    publishTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    await Document.create({
      type: type,
      important: important,
      publish: publish,
      content: content,
      title: title,
      author_id: (author as any).id,
      status: status,
      created_at: publishTime,
      updated_at: publishTime,
    });
  }
  console.log('✅ 文档数据初始化完成');
}

