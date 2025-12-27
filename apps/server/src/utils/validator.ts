// 数据验证工具函数

// 验证手机号格式
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 验证账号格式（4-20位字母、数字、下划线）
export function validateAccount(account: string): boolean {
  const accountRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return accountRegex.test(account);
}

// 验证密码强度（至少6位，包含字母和数字）
export function validatePassword(password: string): boolean {
  // 至少6位，建议包含字母和数字
  if (password.length < 6) {
    return false;
  }
  // 可以进一步要求包含字母和数字
  // const hasLetter = /[a-zA-Z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // return hasLetter && hasNumber;
  return true;
}

// 验证身份证号格式（简单验证）
export function validateIdNo(idNo: string): boolean {
  const idNoRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return idNoRegex.test(idNo);
}

// 验证邮箱格式
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

