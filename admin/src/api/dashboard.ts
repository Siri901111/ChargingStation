import { get } from "@/utils/http";

// 获取电量统计数据（折线图）
export function getElectricityStatsApi() {
  return get("/api/dashboard/electricity-stats");
}

// 获取营收占比数据（饼图）
export function getRevenueRatioApi() {
  return get("/api/dashboard/revenue-ratio");
}

// 获取设备总览数据（雷达图）
export function getDeviceOverviewApi() {
  return get("/api/dashboard/device-overview");
}

// 获取设备运行状态统计
export function getDeviceStatusApi() {
  return get("/api/dashboard/device-status");
}

// 兼容旧接口名称
export const chartDataApi = getElectricityStatsApi;
export const chartDataApi2 = getRevenueRatioApi;
export const chartDataApi3 = getDeviceOverviewApi;
