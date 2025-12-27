import { get, post, del } from "@/utils/http";

// 订单列表查询参数
interface OrderListParams {
  page: number;
  pageSize: number;
  orderNo?: string;
  stationId?: number;
  userId?: number;
  status?: number;
  startTime?: string;
  endTime?: string;
}

// 批量删除订单参数
interface BatchDeleteOrdersParams {
  order: string[];
}

// 获取订单列表
export function getOrderListApi(data: OrderListParams) {
  return post("/api/orderList", data);
}

// 获取订单详情
export function getOrderDetailApi(orderNo: string) {
  return get(`/api/orders/${orderNo}`);
}

// 批量删除订单
export function batchDeleteOrdersApi(data: BatchDeleteOrdersParams) {
  return post("/api/batchDelete", data);
}

// 获取城市列表（树形结构）
export function getCityListApi() {
  return get("/api/cityList");
}

// 获取站点的计费模板
export function getBillingTemplateApi(stationId: number | string) {
  return get(`/api/billing-template/${stationId}`);
}

// 获取所有计费模板列表
export function getBillingTemplateListApi() {
  return get("/api/billing-template/list");
}

// 创建或更新计费模板
export function saveBillingTemplateApi(data: any) {
  return post("/api/billing-template", data);
}

// 删除计费模板
export function deleteBillingTemplateApi(stationId: number | string) {
  return del(`/api/billing-template/${stationId}`);
}

// 兼容旧接口名称
export const batchDeleteApi = batchDeleteOrdersApi;
export const cityListApi = getCityListApi;
