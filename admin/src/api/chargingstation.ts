import { get, post, put, del } from "@/utils/http";
import { RowType } from "@/types/station";

// 充电站列表查询参数
interface StationListParams {
  page: number;
  pageSize: number;
  name?: string;
  id?: string;
  status?: number;
}

// 营收列表查询参数
interface RevenueListParams {
  page: number;
  pageSize: number;
  name?: string;
}

// 获取充电站列表
export function getStationListApi(data: StationListParams) {
  return post("/api/stations", data);
}

// 获取充电站详情
export function getStationDetailApi(id: number | string) {
  return get(`/api/stations/${id}`);
}

// 创建充电站
export function createStationApi(data: RowType) {
  return post("/api/stations", data);
}

// 更新充电站
export function updateStationApi(id: number | string, data: RowType) {
  return put(`/api/stations/${id}`, data);
}

// 删除充电站
export function deleteStationApi(id: number | string) {
  return del(`/api/stations/${id}`);
}

// 获取营收统计图表
export function getRevenueChartApi() {
  return get("/api/revenueChart");
}

// 获取营收列表
export function getRevenueListApi(data: RevenueListParams) {
  return post("/api/revenueList", data);
}

// 获取实时充电桩监控列表
export function getCurrentListApi() {
  return post("/api/currentList");
}
