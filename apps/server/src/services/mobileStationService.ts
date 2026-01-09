/**
 * 移动端充电站服务
 * 处理站点查询、充电桩查询等
 */
import { Op, Sequelize } from 'sequelize';
import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import UserFavorite from '../models/UserFavorite.js';

export interface StationListParams {
  latitude?: number;
  longitude?: number;
  radius?: number;       // 搜索半径（米）
  type?: 'fast' | 'slow';
  keyword?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}

export interface StationInfo {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  fast: number;
  slow: number;
  fastFree: number;
  slowFree: number;
  status: number;
  person: string;
  tel: string;
  distance?: number;
  rating?: number;
  price?: number;
  tags?: string[];
  images?: string[];
}

export interface PileInfo {
  id: number;
  stationId: number;
  name: string;
  type: 'fast' | 'slow';
  status: number;
  power: number;
  price: number;
  voltage?: number;
  current?: number;
}

/**
 * 计算两点间距离（米）
 * 使用 Haversine 公式
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 计算站点的空闲桩数量
 */
async function calculatePileStats(stationId: number) {
  const piles = await Pile.findAll({
    where: { station_id: stationId },
  });

  let fastTotal = 0;
  let slowTotal = 0;
  let fastFree = 0;
  let slowFree = 0;

  for (const pile of piles) {
    const pileData = pile as any;
    if (pileData.type === '快充' || pileData.type === 'fast') {
      fastTotal++;
      if (pileData.status === 1) fastFree++; // 1 = 空闲
    } else {
      slowTotal++;
      if (pileData.status === 1) slowFree++;
    }
  }

  return { fastTotal, slowTotal, fastFree, slowFree };
}

/**
 * 获取站点最低价格
 */
async function getStationMinPrice(stationId: number): Promise<number> {
  const pile = await Pile.findOne({
    where: { station_id: stationId },
    order: [['price', 'ASC']],
  });

  if (pile) {
    return parseFloat((pile as any).price) || 1.2;
  }
  return 1.2; // 默认价格
}

/**
 * 格式化站点数据
 */
async function formatStation(station: any, userLat?: number, userLon?: number): Promise<StationInfo> {
  const stats = await calculatePileStats(station.id);
  const price = await getStationMinPrice(station.id);

  const stationInfo: StationInfo = {
    id: station.id,
    name: station.name,
    city: station.city || '',
    address: station.address || station.city || '',
    latitude: parseFloat(station.latitude) || 39.9,
    longitude: parseFloat(station.longitude) || 116.4,
    fast: stats.fastTotal || parseInt(station.fast) || 0,
    slow: stats.slowTotal || parseInt(station.slow) || 0,
    fastFree: stats.fastFree,
    slowFree: stats.slowFree,
    status: station.status,
    person: station.person || '',
    tel: station.tel || '',
    price: price,
    rating: 4.5 + Math.random() * 0.5, // 模拟评分
    tags: ['停车免费', '24小时'],
  };

  // 计算距离
  if (userLat && userLon && station.latitude && station.longitude) {
    stationInfo.distance = calculateDistance(
      userLat,
      userLon,
      parseFloat(station.latitude),
      parseFloat(station.longitude)
    );
  }

  return stationInfo;
}

/**
 * 获取附近站点
 */
export async function getNearbyStations(params: StationListParams) {
  const {
    latitude,
    longitude,
    radius = 5000,
    type,
    page = 1,
    pageSize = 10,
  } = params;

  // 获取所有正常状态的站点
  const stations = await Station.findAll({
    where: { status: { [Op.ne]: 0 } }, // 非关闭状态
  });

  // 格式化并计算距离
  const formattedStations: StationInfo[] = [];

  for (const station of stations) {
    const stationInfo = await formatStation(station, latitude, longitude);

    // 按距离筛选
    if (stationInfo.distance && stationInfo.distance <= radius) {
      // 按类型筛选
      if (type === 'fast' && stationInfo.fastFree === 0) continue;
      if (type === 'slow' && stationInfo.slowFree === 0) continue;

      formattedStations.push(stationInfo);
    } else if (!latitude || !longitude) {
      // 没有位置信息时返回所有
      formattedStations.push(stationInfo);
    }
  }

  // 按距离排序
  formattedStations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  // 分页
  const startIndex = (page - 1) * pageSize;
  const paginatedList = formattedStations.slice(startIndex, startIndex + pageSize);

  return {
    list: paginatedList,
    total: formattedStations.length,
  };
}

/**
 * 搜索站点
 */
export async function searchStations(params: StationListParams) {
  const { keyword, city, page = 1, pageSize = 10, latitude, longitude } = params;

  const where: any = { status: { [Op.ne]: 0 } };

  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` };
  }

  if (city) {
    where.city = { [Op.like]: `%${city}%` };
  }

  const { rows, count } = await Station.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const formattedStations: StationInfo[] = [];
  for (const station of rows) {
    const stationInfo = await formatStation(station, latitude, longitude);
    formattedStations.push(stationInfo);
  }

  return {
    list: formattedStations,
    total: count,
  };
}

/**
 * 获取站点详情
 */
export async function getStationDetail(stationId: number, userLat?: number, userLon?: number, userId?: number) {
  const station = await Station.findByPk(stationId);

  if (!station) {
    throw new Error('站点不存在');
  }

  const stationInfo = await formatStation(station, userLat, userLon);
  
  // 如果提供了userId，检查是否收藏
  if (userId) {
    const isFavorite = await checkIsFavorite(userId, stationId);
    (stationInfo as any).isFavorite = isFavorite;
  }
  
  return stationInfo;
}

/**
 * 获取站点充电桩列表
 */
export async function getStationPiles(stationId: number): Promise<PileInfo[]> {
  const piles = await Pile.findAll({
    where: { station_id: stationId },
    order: [['id', 'ASC']],
  });

  return piles.map((pile: any) => ({
    id: pile.id,
    stationId: pile.station_id,
    name: pile.name || `${pile.id}号桩`,
    type: pile.type === '快充' || pile.type === 'fast' ? 'fast' : 'slow',
    status: pile.status,
    power: parseFloat(pile.power) || (pile.type === '快充' ? 120 : 7),
    price: parseFloat(pile.price) || 1.2,
    voltage: parseFloat(pile.voltage) || null,
    current: parseFloat(pile.current) || null,
  }));
}

/**
 * 获取充电桩详情
 */
export async function getPileDetail(pileId: number): Promise<PileInfo> {
  const pile = await Pile.findByPk(pileId);

  if (!pile) {
    throw new Error('充电桩不存在');
  }

  const pileData = pile as any;

  return {
    id: pileData.id,
    stationId: pileData.station_id,
    name: pileData.name || `${pileData.id}号桩`,
    type: pileData.type === '快充' || pileData.type === 'fast' ? 'fast' : 'slow',
    status: pileData.status,
    power: parseFloat(pileData.power) || (pileData.type === '快充' ? 120 : 7),
    price: parseFloat(pileData.price) || 1.2,
    voltage: parseFloat(pileData.voltage) || null,
    current: parseFloat(pileData.current) || null,
  };
}

/**
 * 获取热门站点
 */
export async function getHotStations(city?: string, limit: number = 5) {
  const where: any = { status: { [Op.ne]: 0 } };

  if (city) {
    where.city = { [Op.like]: `%${city}%` };
  }

  const stations = await Station.findAll({
    where,
    limit,
    order: [['id', 'DESC']], // 可以根据实际热度排序
  });

  const formattedStations: StationInfo[] = [];
  for (const station of stations) {
    const stationInfo = await formatStation(station);
    formattedStations.push(stationInfo);
  }

  return formattedStations;
}

/**
 * 收藏站点
 */
export async function favoriteStation(userId: number, stationId: number) {
  // 检查是否已收藏
  const existing = await UserFavorite.findOne({
    where: {
      user_id: userId,
      station_id: stationId,
    },
  });

  if (existing) {
    throw new Error('该站点已收藏');
  }

  // 检查站点是否存在
  const station = await Station.findByPk(stationId);
  if (!station) {
    throw new Error('站点不存在');
  }

  await UserFavorite.create({
    user_id: userId,
    station_id: stationId,
  });

  return { success: true };
}

/**
 * 取消收藏
 */
export async function unfavoriteStation(userId: number, stationId: number) {
  const result = await UserFavorite.destroy({
    where: {
      user_id: userId,
      station_id: stationId,
    },
  });

  if (result === 0) {
    throw new Error('该站点未收藏');
  }

  return { success: true };
}

/**
 * 获取收藏列表
 */
export async function getFavoriteStations(userId: number) {
  const favorites = await UserFavorite.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Station,
        as: 'station',
        where: { status: { [Op.ne]: 0 } },
        required: true,
      },
    ],
    order: [['created_at', 'DESC']],
  });

  const formattedStations: StationInfo[] = [];
  for (const favorite of favorites) {
    const station = (favorite as any).station;
    if (station) {
      const stationInfo = await formatStation(station);
      formattedStations.push(stationInfo);
    }
  }

  return formattedStations;
}

/**
 * 检查站点是否已收藏
 */
export async function checkIsFavorite(userId: number, stationId: number): Promise<boolean> {
  const favorite = await UserFavorite.findOne({
    where: {
      user_id: userId,
      station_id: stationId,
    },
  });

  return !!favorite;
}
