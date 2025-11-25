import { get, post, put, del } from "@/utils/http";

// 文章列表查询参数
interface DocumentListParams {
  page: number;
  pageSize: number;
  type?: string;
  importance?: number;
  status?: number;
  keyword?: string;
}

// 创建文章参数
interface CreateDocumentParams {
  title: string;
  content: string;
  type: string;
  importance?: number;
  publish_channels?: string[];
}

// 更新文章参数
interface UpdateDocumentParams {
  title?: string;
  content?: string;
  type?: string;
  importance?: number;
  publish_channels?: string[];
}

// 发布文章参数
interface PublishDocumentParams {
  publish_channels: string[];
}

// 获取文章类型列表
export function getDocumentTypeListApi() {
  return get("/api/document");
}

// 获取文章列表
export function getDocumentListApi(data: DocumentListParams) {
  return post("/api/document/list", data);
}

// 获取文章详情
export function getDocumentDetailApi(id: number | string) {
  return get(`/api/document/${id}`);
}

// 创建文章
export function createDocumentApi(data: CreateDocumentParams) {
  return post("/api/document", data);
}

// 更新文章
export function updateDocumentApi(id: number | string, data: UpdateDocumentParams) {
  return put(`/api/document/${id}`, data);
}

// 删除文章
export function deleteDocumentApi(id: number | string) {
  return del(`/api/document/${id}`);
}

// 发布文章
export function publishDocumentApi(id: number | string, data: PublishDocumentParams) {
  return put(`/api/document/${id}/publish`, data);
}

// 兼容旧接口名称
export const typeListApi = getDocumentTypeListApi;
