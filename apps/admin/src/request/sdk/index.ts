/**
 * SDK 模块统一导出
 */

export { HttpClient, http, get, post, put, del, patch, upload, download } from './client'
export {
  createGetApi,
  createPostApi,
  createPutApi,
  createDeleteApi,
  createPatchApi,
  createPaginatedApi,
  createResourceApi,
  defineApi,
  apiConfig
} from './define'
export type { ApiEndpoint, PaginatedApiEndpoint, ApiModule } from './define'
