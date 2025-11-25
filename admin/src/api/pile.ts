import { get, post, put, del } from "@/utils/http";

// 充电桩列表查询参数
interface PileListParams {
  page?: number;
  pageSize?: number;
  stationId?: number;
  status?: number;
  type?: string;
  keyword?: string;
}

// 创建充电桩参数
interface CreatePileParams {
  station_id: number;
  type: string; // 快充、慢充
  status?: number;
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  install_date?: string;
}

// 更新充电桩参数
interface UpdatePileParams {
  type?: string;
  status?: number;
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  percent?: number;
  install_date?: string;
}

// 更新充电桩状态参数
interface UpdatePileStatusParams {
  status: number;
}

// 创建维保记录参数
interface CreateMaintenanceParams {
  maintenance_type: string;
  maintenance_person: string;
  maintenance_time: string;
  maintenance_content?: string;
  maintenance_cost?: number;
  next_maintenance_time?: string;
  status?: number;
}

// 更新维保记录参数
interface UpdateMaintenanceParams {
  maintenance_type?: string;
  maintenance_person?: string;
  maintenance_time?: string;
  maintenance_content?: string;
  maintenance_cost?: number;
  next_maintenance_time?: string;
  status?: number;
}

// 获取充电桩列表
export function getPileListApi(params?: PileListParams) {
  return get("/api/piles", params);
}

// 获取充电桩详情
export function getPileDetailApi(id: number | string) {
  return get(`/api/piles/${id}`);
}

// 创建充电桩
export function createPileApi(data: CreatePileParams) {
  return post("/api/piles", data);
}

// 更新充电桩
export function updatePileApi(id: number | string, data: UpdatePileParams) {
  return put(`/api/piles/${id}`, data);
}

// 删除充电桩
export function deletePileApi(id: number | string) {
  return del(`/api/piles/${id}`);
}

// 更新充电桩状态
export function updatePileStatusApi(id: number | string, data: UpdatePileStatusParams) {
  return put(`/api/piles/${id}/status`, data);
}

// 获取充电桩使用记录
export function getPileUsageRecordsApi(id: number | string, page?: number, pageSize?: number) {
  return get(`/api/piles/${id}/usage-records`, { page, pageSize });
}

// 获取充电桩维保记录
export function getPileMaintenanceApi(id: number | string, page?: number, pageSize?: number) {
  return get(`/api/piles/${id}/maintenance`, { page, pageSize });
}

// 创建维保记录
export function createPileMaintenanceApi(id: number | string, data: CreateMaintenanceParams) {
  return post(`/api/piles/${id}/maintenance`, data);
}

// 更新维保记录
export function updatePileMaintenanceApi(
  id: number | string,
  maintenanceId: number | string,
  data: UpdateMaintenanceParams
) {
  return put(`/api/piles/${id}/maintenance/${maintenanceId}`, data);
}

