/**
 * 充电站相关 API
 */
import http from '@/utils/http'

export interface Station {
  id: number
  name: string
  city: string
  address: string
  latitude: number
  longitude: number
  fast: number       // 快充桩数量
  slow: number       // 慢充桩数量
  fastFree: number   // 快充空闲数量
  slowFree: number   // 慢充空闲数量
  status: number     // 1:正常 0:暂停服务
  person: string     // 负责人
  tel: string        // 联系电话
  distance?: number  // 距离（米）
  rating?: number    // 评分
  price?: number     // 起始电价
  tags?: string[]    // 标签
  images?: string[]  // 站点图片
}

export interface Pile {
  id: number
  stationId: number
  name: string
  type: 'fast' | 'slow'
  status: number     // 0:离线 1:空闲 2:充电中 3:故障
  power: number      // 额定功率（kW）
  price: number      // 当前电价
  voltage?: number   // 当前电压
  current?: number   // 当前电流
}

interface NearbyParams {
  latitude: number
  longitude: number
  radius?: number     // 搜索半径（米）
  type?: 'all' | 'fast' | 'slow'
  page?: number
  pageSize?: number
}

interface SearchParams {
  keyword: string
  city?: string
  page?: number
  pageSize?: number
}

export const stationApi = {
  /**
   * 获取附近站点
   */
  getNearbyStations(params: NearbyParams) {
    return http.get<{ list: Station[]; total: number }>('/station/nearby', params)
  },

  /**
   * 搜索站点
   */
  searchStations(params: SearchParams) {
    return http.get<{ list: Station[]; total: number }>('/station/search', params)
  },

  /**
   * 获取站点详情
   */
  getStationDetail(id: number) {
    return http.get<Station>(`/station/${id}`)
  },

  /**
   * 获取站点充电桩列表
   */
  getStationPiles(stationId: number) {
    return http.get<Pile[]>(`/station/${stationId}/piles`)
  },

  /**
   * 获取充电桩详情
   */
  getPileDetail(pileId: number) {
    return http.get<Pile>(`/pile/${pileId}`)
  },

  /**
   * 获取热门站点
   */
  getHotStations(params?: { city?: string; limit?: number }) {
    return http.get<Station[]>('/station/hot', params)
  },

  /**
   * 收藏站点
   */
  favoriteStation(stationId: number) {
    return http.post<{ success: boolean }>('/station/favorite', { stationId })
  },

  /**
   * 取消收藏
   */
  unfavoriteStation(stationId: number) {
    return http.delete<{ success: boolean }>(`/station/favorite/${stationId}`)
  },

  /**
   * 获取收藏列表
   */
  getFavoriteStations() {
    return http.get<Station[]>('/station/favorites')
  },
}
