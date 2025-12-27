/**
 * 验证工具函数
 */

/** 手机号正则 */
const PHONE_REG = /^1[3-9]\d{9}$/;

/** 邮箱正则 */
const EMAIL_REG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 验证手机号
 */
export function isValidPhone(phone: string): boolean {
  return PHONE_REG.test(phone);
}

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REG.test(email);
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 是否符合要求（至少8位，包含字母和数字）
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  return /[a-zA-Z]/.test(password) && /\d/.test(password);
}

/**
 * 验证身份证号
 */
export function isValidIdCard(idCard: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
}
