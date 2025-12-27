import { get, put, post } from "@/utils/http";

// 更新个人信息参数
interface UpdatePersonalInfoParams {
  name?: string;
  phone?: string;
  position?: string;
  department?: string;
  address?: string;
  tags?: string[];
  workStatus?: number; // 后端期望的是 workStatus
  avatar?: string;
}

// 修改密码参数
interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

// 获取个人信息
export function getPersonalInfoApi() {
  return get("/api/personal/info");
}

// 更新个人信息
export function updatePersonalInfoApi(data: UpdatePersonalInfoParams) {
  return put("/api/personal/info", data);
}

// 获取个人统计数据
export function getPersonalStatsApi() {
  return get("/api/personal/stats");
}

// 获取通知列表
export function getPersonalNoticesApi() {
  return get("/api/personal/notices");
}

// 修改密码
export function changePasswordApi(data: ChangePasswordParams) {
  return post("/api/personal/change-password", data);
}

