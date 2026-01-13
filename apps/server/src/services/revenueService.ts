import { Op } from 'sequelize';
import Revenue from '../models/Revenue.js';
import Station from '../models/Station.js';

export interface RevenueListParams {
  page?: number;
  pageSize?: number;
  name?: string;
}

// 获取营收统计图表数据
export async function getRevenueChartService() {
  // 获取最近7个月的数据
  const now = new Date();
  const months: string[] = [];
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  
  // 生成最近7个月的月份名称
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthNames[date.getMonth()]);
  }

  // 统计每个月的总销售额和访问量
  const salesData: number[] = [];
  const visitData: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    // 计算该月的总销售额（所有站点的月收入总和）
    const monthRevenue = await Revenue.sum('month', {
      where: {
        day_date: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;

    // 计算该月的访问量（订单数量，这里简化处理，用营收记录数代替）
    const visitCount = await Revenue.count({
      where: {
        day_date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    salesData.push(Number(monthRevenue) / 10000); // 转换为万元
    visitData.push(visitCount * 100); // 模拟访问量数据
  }

  return {
    list: [
      {
        name: '销售',
        data: salesData
      },
      {
        name: '访问量',
        data: visitData
      }
    ]
  };
}

// 获取营收列表
export async function getRevenueListService(params: RevenueListParams) {
  const { page = 1, pageSize = 10, name } = params;

  // 构建查询条件
  const where: any = {};
  if (name) {
    where.name = {
      [Op.like]: `%${name}%`
    };
  }

  // 获取所有充电站
  const stations = await Station.findAll({
    where: name ? { name: { [Op.like]: `%${name}%` } } : {},
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: [['id', 'DESC']]
  });

  const total = await Station.count({
    where: name ? { name: { [Op.like]: `%${name}%` } } : {}
  });

  // 获取每个站点的最新营收数据
  const list = await Promise.all(
    stations.map(async (station: any) => {
      // 获取该站点最新的营收记录（今天的或最近的一条）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let revenue = await Revenue.findOne({
        where: {
          station_id: station.id,
          day_date: {
            [Op.gte]: today
          }
        },
        order: [['day_date', 'DESC']]
      });

      // 如果没有今天的，获取最近的一条
      if (!revenue) {
        revenue = await Revenue.findOne({
          where: {
            station_id: station.id
          },
          order: [['day_date', 'DESC']]
        });
      }

      const revenueData = revenue as any;
      const stationData = station as any;

      // 计算单日总收入
      const day = revenueData 
        ? Number(revenueData.electricity || 0) + 
          Number(revenueData.parking_fee || 0) + 
          Number(revenueData.service_fee || 0) + 
          Number(revenueData.member || 0)
        : 0;

      // 月度总收入（万元）
      const month = revenueData ? Number(revenueData.month || 0) / 10000 : 0;

      return {
        name: stationData.name,
        id: String(stationData.id),
        city: stationData.city || '',
        count: (stationData.fast || 0) + (stationData.slow || 0), // 充电桩总量
        day: Math.round(day * 100) / 100, // 单日总收入，保留2位小数
        month: Math.round(month * 100) / 100, // 月度总收入（万元），保留2位小数
        electricity: revenueData ? Number(revenueData.electricity || 0) : 0,
        parkingFee: revenueData ? Number(revenueData.parking_fee || 0) : 0,
        serviceFee: revenueData ? Number(revenueData.service_fee || 0) : 0,
        member: revenueData ? Number(revenueData.member || 0) : 0,
        percent: revenueData ? Number(revenueData.percent || 0) : 0, // 日增长百分比
        mpercent: revenueData ? Number(revenueData.mpercent || 0) : 0 // 月增长百分比
      };
    })
  );

  return {
    list,
    total
  };
}

