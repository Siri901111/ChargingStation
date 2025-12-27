import { Op } from 'sequelize';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import Order from '../models/Order.js';

export interface StationListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  id?: string;
  status?: number;
}

export interface StationCreateParams {
  name: string;
  city: string;
  fast: number;
  slow: number;
  status: number;
  person: string;
  tel: string;
  longitude?: number;
  latitude?: number;
}

export interface StationUpdateParams {
  name?: string;
  city?: string;
  fast?: number;
  slow?: number;
  status?: number;
  person?: string;
  tel?: string;
  longitude?: number;
  latitude?: number;
}

// 计算站点的实时数据
async function calculateStationStats(stationId: number) {
  // 计算正在充电数（状态为2的充电桩数量）
  const nowCount = await Pile.count({
    where: {
      station_id: stationId,
      status: 2 // 充电中
    }
  });

  // 计算故障数（状态为6的充电桩数量）
  const faultCount = await Pile.count({
    where: {
      station_id: stationId,
      status: 6 // 故障/离线
    }
  });

  return {
    now: nowCount,
    fault: faultCount
  };
}

// 格式化站点数据（转换为前端需要的格式）
function formatStationData(station: any, stats?: { now: number; fault: number }) {
  return {
    id: String(station.id),
    name: station.name,
    city: station.city,
    fast: String(station.fast || 0),
    slow: String(station.slow || 0),
    status: station.status,
    now: String(stats?.now || 0),
    fault: String(stats?.fault || 0),
    person: station.person || '',
    tel: station.tel || ''
  };
}

// 获取充电站列表
export async function getStationListService(params: StationListParams) {
  const { page = 1, pageSize = 10, name, id, status } = params;

  const where: any = {};

  // 名称模糊搜索
  if (name) {
    where.name = {
      [Op.like]: `%${name}%`
    };
  }

  // ID精确搜索
  if (id) {
    where.id = parseInt(id);
  }

  // 状态筛选（status=1表示全部，不筛选）
  if (status && status !== 1) {
    where.status = status;
  }

  const { count, rows } = await Station.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: [['id', 'DESC']]
  });

  // 为每个站点计算实时数据
  const list = await Promise.all(
    rows.map(async (station: any) => {
      const stats = await calculateStationStats(station.id);
      return formatStationData(station, stats);
    })
  );

  return {
    list,
    total: count
  };
}

// 获取单个充电站详情
export async function getStationByIdService(stationId: number) {
  const station = await Station.findByPk(stationId);

  if (!station) {
    throw new Error('充电站不存在');
  }

  const stats = await calculateStationStats(stationId);
  return formatStationData(station, stats);
}

// 创建充电站
export async function createStationService(params: StationCreateParams) {
  const { name, city, fast, slow, status, person, tel, longitude, latitude } = params;

  // 验证必填字段
  if (!name || !city || fast === undefined || slow === undefined || !status || !person || !tel) {
    throw new Error('必填字段不能为空');
  }

  // 检查站点名称是否已存在
  const existing = await Station.findOne({
    where: { name }
  });

  if (existing) {
    throw new Error('站点名称已存在');
  }

  // 创建充电站
  const station = await Station.create({
    name,
    city,
    fast: parseInt(String(fast)),
    slow: parseInt(String(slow)),
    status,
    person,
    tel,
    longitude: longitude || null,
    latitude: latitude || null,
    now: 0, // 初始值，实际会实时计算
    fault: 0 // 初始值，实际会实时计算
  });

  return {
    id: String(station.id),
    message: '充电站创建成功'
  };
}

// 更新充电站
export async function updateStationService(stationId: number, params: StationUpdateParams) {
  const station = await Station.findByPk(stationId);

  if (!station) {
    throw new Error('充电站不存在');
  }

  // 如果更新名称，检查名称是否已被其他站点使用
  if (params.name && params.name !== (station as any).name) {
    const existing = await Station.findOne({
      where: {
        name: params.name,
        id: { [Op.ne]: stationId }
      }
    });

    if (existing) {
      throw new Error('站点名称已存在');
    }
  }

  // 构建更新数据
  const updateData: any = {};
  if (params.name !== undefined) updateData.name = params.name;
  if (params.city !== undefined) updateData.city = params.city;
  if (params.fast !== undefined) updateData.fast = parseInt(String(params.fast));
  if (params.slow !== undefined) updateData.slow = parseInt(String(params.slow));
  if (params.status !== undefined) updateData.status = params.status;
  if (params.person !== undefined) updateData.person = params.person;
  if (params.tel !== undefined) updateData.tel = params.tel;
  if (params.longitude !== undefined) updateData.longitude = params.longitude;
  if (params.latitude !== undefined) updateData.latitude = params.latitude;

  await Station.update(updateData, {
    where: { id: stationId }
  });

  return {
    message: '充电站更新成功'
  };
}

// 删除充电站
export async function deleteStationService(stationId: number) {
  const station = await Station.findByPk(stationId);

  if (!station) {
    throw new Error('充电站不存在');
  }

  // 检查是否有关联的充电桩
  const pileCount = await Pile.count({
    where: { station_id: stationId }
  });

  if (pileCount > 0) {
    throw new Error(`该充电站下还有 ${pileCount} 个充电桩，无法删除`);
  }

  // 检查是否有关联的订单
  const orderCount = await Order.count({
    where: { station_id: stationId }
  });

  if (orderCount > 0) {
    throw new Error(`该充电站下还有 ${orderCount} 个订单，无法删除`);
  }

  await Station.destroy({
    where: { id: stationId }
  });

  return {
    message: '充电站删除成功'
  };
}

