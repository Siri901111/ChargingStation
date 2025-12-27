import http from '@/utils/http';

const BASE_URL = '/api/monitor';

// 数据类型
export interface MonitorDataItem {
  id: number;
  report_id: string;
  app_id: string;
  user_id?: string;
  user_name?: string;  // 用户名称（关联查询）
  type: string;
  category: string;
  timestamp: number;
  page_url?: string;
  page_title?: string;
  device_info?: any;
  environment_info?: any;
  session_info?: any;
  data: any;
  extra?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OverviewStats {
  total: number;
  errorCount: number;
  todayCount: number;
  uv: number;
  pv: number;
  categoryStats: Record<string, number>;
  typeStats: Array<{ type: string; count: number }>;
}

export interface TrendItem {
  time: string;
  count: number;
}

export interface PerformanceMetrics {
  avgFCP: number;
  avgLCP: number;
  avgTTFB: number;
  avgFID: number;
  avgCLS: number | string;
  avgLoadComplete: number;
  sampleCount: number;
}

export interface ErrorStats {
  total: number;
  byType: Array<{ type: string; count: number }>;
  byPage: Array<{ page: string; count: number }>;
}

export interface BehaviorStats {
  pv: number;
  uv: number;
  clickCount: number;
  routeChangeCount: number;
  topPages: Array<{ page: string; count: number }>;
}

// 查询参数
export interface QueryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  type?: string;
  appId?: string;
  startTime?: number;
  endTime?: number;
}

// 获取监控数据列表
export function getMonitorDataList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/list`, { params });
}

// 获取错误列表
export function getErrorList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/errors`, { params });
}

// 获取性能数据列表
export function getPerformanceList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/performance`, { params });
}

// 获取行为数据列表
export function getBehaviorList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/behaviors`, { params });
}

// 获取网络请求列表
export function getNetworkList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/networks`, { params });
}

// 获取统计概览
export function getOverview(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<OverviewStats>(`${BASE_URL}/overview`, { params });
}

// 获取趋势数据
export function getTrend(params: {
  startTime: number;
  endTime: number;
  groupBy?: 'hour' | 'day';
  category?: string;
  appId?: string;
}) {
  return http.get<TrendItem[]>(`${BASE_URL}/trend`, { params });
}

// 获取性能指标统计
export function getPerformanceMetrics(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<PerformanceMetrics>(`${BASE_URL}/performance-metrics`, { params });
}

// 获取错误统计
export function getErrorStats(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<ErrorStats>(`${BASE_URL}/error-stats`, { params });
}

// 获取用户行为统计
export function getBehaviorStats(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<BehaviorStats>(`${BASE_URL}/behavior-stats`, { params });
}

// 删除监控数据
export function deleteMonitorData(ids: number[]) {
  return http.delete(`${BASE_URL}/delete`, { data: { ids } });
}

// 清理过期数据
export function cleanOldData(days: number = 30) {
  return http.post(`${BASE_URL}/clean`, { days });
}
