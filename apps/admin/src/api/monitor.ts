import http from '@/utils/http';

const BASE_URL = '/api/monitor';

// 数据类型
export interface MonitorDataItem {
  id: number;
  report_id: string;
  app_id: string;
  user_id?: string;
  user_name?: string;  // 用户名称（优先级：user_display_name > user.name > user_id > 匿名）
  user_display_name?: string;  // 用户显示名称（从extra等提取）
  type: string;
  category: string;
  timestamp: number;
  page_url?: string;
  page_path?: string;  // 页面路径（规范化后的路径）
  page_title?: string;
  platform?: string;  // 平台类型（web、uniapp等）
  env?: string;  // 环境标识（h5、mp-weixin等）
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
  platform?: string;  // 平台筛选（web、uniapp等）
  env?: string;  // 环境筛选（h5、mp-weixin等）
  pagePath?: string;  // 页面路径筛选
  userName?: string;  // 用户名筛选
  keyword?: string;  // 关键词搜索
  startTime?: number;
  endTime?: number;
  sortBy?: string;  // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方向
}

// 获取监控数据列表
export function getMonitorDataList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/list`, params);
}

// 获取错误列表
export function getErrorList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/errors`, params);
}

// 获取性能数据列表
export function getPerformanceList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/performance`, params);
}

// 获取行为数据列表
export function getBehaviorList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/behaviors`, params);
}

// 获取网络请求列表
export function getNetworkList(params: QueryParams) {
  return http.get<PageResult<MonitorDataItem>>(`${BASE_URL}/networks`, params);
}

// 获取统计概览
export function getOverview(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<OverviewStats>(`${BASE_URL}/overview`, params);
}

// 获取趋势数据
export function getTrend(params: {
  startTime: number;
  endTime: number;
  groupBy?: 'hour' | 'day';
  category?: string;
  appId?: string;
}) {
  return http.get<TrendItem[]>(`${BASE_URL}/trend`,params)
}

// 获取性能指标统计
export function getPerformanceMetrics(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<PerformanceMetrics>(`${BASE_URL}/performance-metrics`, params);
}

// 获取错误统计
export function getErrorStats(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<ErrorStats>(`${BASE_URL}/error-stats`, params);
}

// 获取用户行为统计
export function getBehaviorStats(params?: { startTime?: number; endTime?: number; appId?: string }) {
  return http.get<BehaviorStats>(`${BASE_URL}/behavior-stats`, params);
}

// 用户追踪相关类型
export interface UserTrackingStats {
  totalBehaviors: number;
  firstVisit: number | null;
  lastVisit: number | null;
  behaviorTypes: Array<{ type: string; count: number }>;
  topPages: Array<{ page: string; count: number }>;
}

export interface UserTrackingResult {
  list: MonitorDataItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  userInfo: {
    id: number;
    name: string;
    account: string;
  } | null;
  stats: UserTrackingStats | null;
}

export interface ActiveUser {
  userId: number;
  userName: string;
  account: string;
  behaviorCount: number;
}

// 根据用户名追踪用户行为
export function getUserTracking(params: {
  userName: string;
  page?: number;
  pageSize?: number;
  startTime?: number;
  endTime?: number;
  category?: string;
}) {
  return http.get<UserTrackingResult>(`${BASE_URL}/user-tracking`, params);
}

// 获取活跃用户列表
export function getActiveUsers(params?: { startTime?: number; endTime?: number }) {
  return http.get<ActiveUser[]>(`${BASE_URL}/active-users`, params);
}

// 错误行为上下文类型
export interface ErrorBehaviorContext {
  error: MonitorDataItem | null;
  behaviors: MonitorDataItem[];
  userInfo: {
    id: number;
    name: string;
    account: string;
  } | null;
  timeRange: {
    start: number;
    end: number;
    seconds: number;
  };
}

// 获取错误发生前的用户行为轨迹（用于错误回放）
export function getErrorBehaviorContext(params: { errorId: number; seconds?: number }) {
  return http.get<ErrorBehaviorContext>(`${BASE_URL}/error-context`, params);
}

// 删除监控数据
export function deleteMonitorData(ids: number[]) {
  return http.delete(`${BASE_URL}/delete`, { data: { ids } });
}

// 清理过期数据
export function cleanOldData(days: number = 30) {
  return http.post(`${BASE_URL}/clean`, { days });
}
