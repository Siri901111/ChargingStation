/**
 * 用户相关类型定义
 */

/** 用户信息 */
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/** 用户角色 */
export type UserRole = 'admin' | 'operator' | 'user';

/** 用户状态 */
export type UserStatus = 'active' | 'inactive' | 'banned';

/** 菜单项 */
export interface MenuItem {
  name: string;
  icon: string;
  url: string;
  children?: MenuItem[];
}
