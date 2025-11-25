import { post } from "@/utils/http";

// 用户登录参数
interface LoginParams {
  username: string;
  password: string;
}

// 用户注册参数
interface RegisterParams {
  account: string;
  password: string;
  name: string;
  phone: string;
  idNo?: string;
  position?: string;
  department?: string;
}

// 获取用户列表参数
interface UserListParams {
  page: number;
  pageSize: number;
  name?: string;
  department?: string;
}

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

// 删除用户参数
interface DeleteUserParams {
  account: string;
}

// 禁用/启用用户参数
interface ToggleUserStatusParams {
  account: string;
  status: number;
}

// 用户登录
export function loginApi(data: LoginParams) {
  return post("/api/login", data);
}

// 用户注册
export function registerApi(data: RegisterParams) {
  return post("/api/register", data);
}

// 获取用户列表（权限列表）
export function getUserListApi(data: UserListParams) {
  return post("/api/permissionList", data);
}

// 获取用户权限（菜单和按钮权限）
export function getUserAuthApi(data: GetUserAuthParams) {
  return post("/api/userAuth", data);
}

// 设置用户权限
export function setUserAuthApi(data: SetUserAuthParams) {
  return post("/api/setAuth", data);
}

// 删除用户
export function deleteUserApi(data: DeleteUserParams) {
  return post("/api/deleteUser", data);
}

// 禁用/启用用户
export function toggleUserStatusApi(data: ToggleUserStatusParams) {
  return post("/api/toggleUserStatus", data);
}
