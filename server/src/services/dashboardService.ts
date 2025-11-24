import { Op } from 'sequelize';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import Order from '../models/Order.js';
import Revenue from '../models/Revenue.js';
import Alarm from '../models/Alarm.js';

// 获取电量统计图表数据（折线图）
export async function getElectricityStatsService() {
  // 获取最近9小时的电量数据（模拟数据，实际应该从订单或设备数据计算）
  const now = new Date();
  const hours = [];
  const electricityData = [];
  const chargingData = [];
  
  // 生成最近9小时的时间点
  for (let i = 8; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    hours.push(hour.getHours() + ':00');
    
    // 模拟电量数据（实际应该从数据库统计）
    electricityData.push(Math.floor(Math.random() * 50) + 100); // 100-150kw
    chargingData.push(Math.floor(Math.random() * 30) + 80);     // 80-110kw
  }

  return {
    xAxis: hours,
    series: [
      {
        name: '总电量',
        type: 'line',
        smooth: true,
        data: electricityData
      },
      {
        name: '充电量',
        type: 'line',
        smooth: true,
        data: chargingData
      }
    ]
  };
}

// 获取营收占比数据（饼图）
export async function getRevenueRatioService() {
  // 获取最近一个月的营收数据
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // 统计各类营收
  const revenueStats = await Revenue.findAll({
    where: {
      day_date: {
        [Op.gte]: oneMonthAgo
      }
    },
    attributes: [
      [Revenue.sequelize?.fn('SUM', Revenue.sequelize?.col('electricity')), 'totalElectricity'],
      [Revenue.sequelize?.fn('SUM', Revenue.sequelize?.col('parking_fee')), 'totalParkingFee'],
      [Revenue.sequelize?.fn('SUM', Revenue.sequelize?.col('service_fee')), 'totalServiceFee'],
      [Revenue.sequelize?.fn('SUM', Revenue.sequelize?.col('member')), 'totalMember']
    ]
  });

  const stats = revenueStats[0] as any;
  
  // 如果没有数据，返回模拟数据
  const electricityRevenue = Number(stats?.dataValues?.totalElectricity || 0) || 45000;
  const parkingRevenue = Number(stats?.dataValues?.totalParkingFee || 0) || 12000;
  const serviceRevenue = Number(stats?.dataValues?.totalServiceFee || 0) || 8000;
  const memberRevenue = Number(stats?.dataValues?.totalMember || 0) || 15000;

  return {
    list: [
      { name: '电费收入', value: electricityRevenue },
      { name: '停车费收入', value: parkingRevenue },
      { name: '服务费收入', value: serviceRevenue },
      { name: '会员储值', value: memberRevenue }
    ]
  };
}

// 获取设备总览数据（雷达图）
export async function getDeviceOverviewService() {
  // 统计各种状态的充电桩数量
  const deviceStats = await Pile.findAll({
    attributes: [
      'status',
      [Pile.sequelize?.fn('COUNT', Pile.sequelize?.col('id')), 'count']
    ],
    group: ['status']
  });

  // 初始化各状态数量
  let idleCount = 0;      // 闲置数（空闲中）
  let usingCount = 0;     // 使用数（充电中）
  let faultCount = 0;     // 故障数（故障/离线）
  let repairCount = 0;    // 维修数（维护中）
  let replaceCount = 0;   // 更换数（待维修）
  let scrapCount = 0;     // 报废数（从报警表统计严重故障）

  // 统计各状态数量
  deviceStats.forEach((stat: any) => {
    const status = stat.dataValues.status;
    const count = Number(stat.dataValues.count);
    
    switch (status) {
      case 1: // 空闲中
        idleCount = count;
        break;
      case 2: // 充电中
        usingCount = count;
        break;
      case 3: // 连接中（算作使用中）
        usingCount += count;
        break;
      case 4: // 维护中
        repairCount = count;
        break;
      case 5: // 待维修
        replaceCount = count;
        break;
      case 6: // 故障/离线
        faultCount = count;
        break;
    }
  });

  // 统计严重报警作为报废数
  const scrapAlarms = await Alarm.count({
    where: {
      level: 1, // 严重级别
      fault_time: {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
      }
    }
  });
  scrapCount = scrapAlarms;

  return {
    list: [idleCount, usingCount, faultCount, repairCount, replaceCount, scrapCount]
  };
}

// 获取设备运行状态统计
export async function getDeviceStatusService() {
  // 获取充电桩总数和使用数
  const totalPiles = await Pile.count();
  const usingPiles = await Pile.count({
    where: {
      status: {
        [Op.in]: [2, 3] // 充电中或连接中
      }
    }
  });

  // 获取异常设备数
  const faultPiles = await Pile.count({
    where: {
      status: 6 // 故障/离线
    }
  });

  // 获取今日营收（从营收表获取今天的数据）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayRevenue = await Revenue.sum('day', {
    where: {
      day_date: {
        [Op.gte]: today
      }
    }
  }) || 0;

  return {
    totalPiles,
    usingPiles,
    faultPiles,
    todayRevenue: Number(todayRevenue)
  };
}
