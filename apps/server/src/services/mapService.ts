import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

// 获取地图上的充电站列表
export async function getMapStationListService() {
  try {
    const stations = await Station.findAll({
      attributes: ['id', 'name', 'longitude', 'latitude', 'status', 'city'],
      where: {
        longitude: { [Op.not]: null },
        latitude: { [Op.not]: null },
      },
    });

    // 获取每个充电站的充电桩数量
    const stationsWithCount = await Promise.all(
      stations.map(async (station: any) => {
        const pileCount = await Pile.count({
          where: { station_id: station.id },
        });

        return {
          position: [station.longitude, station.latitude], // [经度, 纬度]
          title: station.name,
          status: station.status || 1,
          count: pileCount,
          id: station.id,
          city: station.city || '',
        };
      })
    );

    return stationsWithCount;
  } catch (error) {
    console.error('获取地图充电站列表失败:', error);
    throw new Error('获取地图充电站列表失败');
  }
}

// 获取地图统计信息
export async function getMapStatsService() {
  try {
    // 1. 累计充电站数量
    const totalStations = await Station.count();

    // 2. 按省份统计充电站数量
    const provinceStats = await Station.findAll({
      attributes: [
        'city',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['city'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true,
    });

    // 找出单省份最多充电站
    const maxProvince = provinceStats.length > 0 ? provinceStats[0] : null;
    const maxProvinceName = maxProvince ? maxProvince.city || '未知' : '未知';
    const maxProvinceCount = maxProvince
      ? Number(maxProvince.count)
      : 0;

    // 3. 充电站遍及省份数量
    const provinceCount = provinceStats.length;

    // 4. 暂无充电站省份（中国共34个省级行政区，简化处理）
    const totalProvinces = 34;
    const noStationProvinces = totalProvinces - provinceCount;

    // 5. 累计充电站（按省份汇总，这里返回最多充电站的省份）
    const accumulatedStation = `${maxProvinceName}(${maxProvinceCount}个)`;

    // 6. 单日营收最高和最低的充电站
    const [revenueResults]: any = await sequelize.query(`
      SELECT 
        station_id,
        MAX(day) as maxDay,
        MIN(day) as minDay
      FROM revenue
      GROUP BY station_id
    `);

    let maxRevenueStation = null;
    let minRevenueStation = null;
    let maxRevenue = 0;
    let minRevenue = Infinity;

    for (const stat of revenueResults) {
      const stationId = stat.station_id;
      const station = await Station.findByPk(stationId);
      
      if (station) {
        const maxDay = Number(stat.maxDay || 0);
        const minDay = Number(stat.minDay || 0);

        if (maxDay > maxRevenue) {
          maxRevenue = maxDay;
          maxRevenueStation = (station as any).name;
        }
        if (minDay < minRevenue && minDay > 0) {
          minRevenue = minDay;
          minRevenueStation = (station as any).name;
        }
      }
    }

    // 7. 故障率最高的充电站
    const [alarmResults]: any = await sequelize.query(`
      SELECT 
        station_id,
        COUNT(id) as alarmCount
      FROM alarm
      GROUP BY station_id
      ORDER BY alarmCount DESC
      LIMIT 1
    `);

    let maxFaultStation = null;

    if (alarmResults.length > 0) {
      const stationId = alarmResults[0].station_id;
      const station = await Station.findByPk(stationId);
      if (station) {
        maxFaultStation = (station as any).name;
      }
    }

    return {
      totalStations, // 累计充电站数量
      maxProvinceName, // 单省份最多充电站省份名
      maxProvinceCount, // 单省份最多充电站数量
      provinceCount, // 充电站遍及省份数量
      noStationProvinces, // 暂无充电站省份数量
      accumulatedStation, // 累计充电站（格式：省份名(数量个)）
      maxRevenueStation: maxRevenueStation || '暂无数据', // 单日营收最高
      minRevenueStation: minRevenueStation || '暂无数据', // 单日营收最低
      maxFaultStation: maxFaultStation || '暂无数据', // 故障率最高
    };
  } catch (error) {
    console.error('获取地图统计信息失败:', error);
    throw new Error('获取地图统计信息失败');
  }
}

// 通过地图创建充电站
export interface CreateStationFromMapParams {
  name: string;
  region: string; // 站点地址
  location1: string; // 经度
  location2: string; // 纬度
  now: boolean; // 立即使用
  remarks?: string; // 备注
}

export async function createStationFromMapService(
  params: CreateStationFromMapParams
) {
  const { name, region, location1, location2, now, remarks } = params;

  // 验证必填字段
  if (!name || !region || !location1 || !location2) {
    throw new Error('站点名称、地址、经度、纬度不能为空');
  }

  // 验证经纬度格式
  const longitude = parseFloat(location1);
  const latitude = parseFloat(location2);

  if (isNaN(longitude) || isNaN(latitude)) {
    throw new Error('经纬度格式不正确');
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('经度范围应在-180到180之间');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('纬度范围应在-90到90之间');
  }

  try {
    // 从地址中提取城市（简化处理，实际应该使用地理编码API）
    const cityMatch = region.match(/([^省市区]+[省市区])/);
    const city = cityMatch ? cityMatch[1] : '未知';

    const station = await Station.create({
      name: name.trim(),
      city: city,
      longitude: longitude,
      latitude: latitude,
      status: now ? 1 : 0, // 立即使用则状态为1，否则为0
      fast: 0,
      slow: 0,
      now: 0,
      fault: 0,
      // 备注可以存储在扩展字段中，这里简化处理
    });

    return {
      id: (station as any).id,
      message: '充电站创建成功',
    };
  } catch (error) {
    console.error('创建充电站失败:', error);
    throw new Error('创建充电站失败');
  }
}

