/**
 * API 相关类型定义
 */

/** 通用 API 响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 分页响应数据 */
export interface PaginationData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 分页 API 响应 */
export type PaginatedResponse<T> = ApiResponse<PaginationData<T>>;
