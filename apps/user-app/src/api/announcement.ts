/**
 * 公告相关 API
 */
import http from '@/utils/http'

// 公告项类型
export interface AnnouncementItem {
  id: number
  type: string
  important: string
  publish: string
  title: string
  content: string
  status: number
  authorName: string
  createdAt: string
  updatedAt: string
}

// 公告列表响应
export interface AnnouncementListResponse {
  list: AnnouncementItem[]
  total: number
}

// 公告详情响应
export interface AnnouncementDetailResponse extends AnnouncementItem {
  authorId: number
  authorAccount: string
}

export const announcementApi = {
  /**
   * 获取公告列表（已发布的公告类文章）
   * @param params 查询参数
   */
  getList(params?: {
    page?: number
    pageSize?: number
  }) {
    const queryParams = new URLSearchParams()
    
    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString ? `/announcement/list?${queryString}` : '/announcement/list'
    return http.get<AnnouncementListResponse>(url)
  },

  /**
   * 获取公告详情
   * @param id 公告ID
   */
  getDetail(id: number) {
    return http.get<AnnouncementDetailResponse>(`/announcement/${id}`)
  }
}
