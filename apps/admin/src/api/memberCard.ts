import { get, post } from "@/utils/http";

// 会员卡列表查询参数
interface MemberCardListParams {
  page: number;
  pageSize: number;
  no?: string;
  tel?: string;
  name?: string;
}

// 获取会员卡列表
export function getMemberCardListApi(data: MemberCardListParams) {
  return post("/api/member", data);
}

// 获取会员卡详情
export function getMemberCardDetailApi(cardNo: string) {
  return get(`/api/member/${cardNo}`);
}

