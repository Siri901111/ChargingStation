import { post } from "@/utils/http";

// 获取用户权限参数
interface GetUserAuthParams {
  pageAuthority: string;
}

// 设置用户权限参数
interface SetUserAuthParams {
  account: string;
  btnList: string[];
  pageList: string[];
}

// 获取用户权限（菜单和按钮权限）
export function getUserAuthApi(data: GetUserAuthParams) {
  return post("/api/userAuth", data);
}

// 设置用户权限
export function setUserAuthApi(data: SetUserAuthParams) {
  return post("/api/setAuth", data);
}

// 兼容旧接口名称
export const getAuthApi = getUserAuthApi;
export const setAuthApi = setUserAuthApi;
