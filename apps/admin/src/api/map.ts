import { get, post } from "@/utils/http";

// 创建充电站参数（从地图）
export interface CreateStationFromMapParams {
  name: string;
  region: string;
  longitude: number;
  latitude: number;
  now: boolean;
  remarks?: string;
}

// 获取地图上的充电站列表
export function getMapStationListApi() {
  return post("/api/mapList");
}

// 获取地图统计信息
export function getMapStatsApi() {
  return get("/api/map/stats");
}

// 通过地图创建充电站
export function createStationFromMapApi(data: CreateStationFromMapParams) {
  // 后端接口期望的参数名是 location1 和 location2
  return post("/api/map/station", {
    name: data.name,
    region: data.region,
    location1: data.longitude.toString(),
    location2: data.latitude.toString(),
    now: data.now,
    remarks: data.remarks
  });
}

// 兼容旧接口名称
export const mapListApi = getMapStationListApi;
