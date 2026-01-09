/**
 * 移动端用户服务
 * 处理C端用户的认证、信息管理等
 */
import { Op } from 'sequelize';
import ChargingUser from '../models/ChargingUser.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'charging-station-mobile-secret';
const JWT_EXPIRES_IN = '7d';

// 验证码存储（实际生产环境应使用 Redis）
const verificationCodes: Map<string, { code: string; expireAt: number }> = new Map();

export interface MobileLoginParams {
  phone: string;
  code: string;
}

export interface MobileUserInfo {
  id: number;
  phone: string;
  name?: string;
  avatar?: string;
  gender?: number;  // 0未知 1男 2女
  birthday?: string;
  memberCardNo?: string;
  cardType?: string;
  balance: number;
}

/**
 * 生成验证码
 */
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * 生成会员卡号
 */
function generateMemberCardNo(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `M${timestamp}${random}`;
}

/**
 * 生成 Token
 */
function generateToken(userId: number, phone: string): string {
  return jwt.sign(
    { userId, phone, type: 'mobile' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * 验证 Token
 */
export function verifyToken(token: string): { userId: number; phone: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; phone: string; type: string };
    if (decoded.type !== 'mobile') return null;
    return { userId: decoded.userId, phone: decoded.phone };
  } catch {
    return null;
  }
}

/**
 * 发送验证码
 */
export async function sendVerificationCode(phone: string, type: 'login' | 'bindPhone' = 'login') {
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('手机号格式不正确');
  }

  // 检查是否频繁请求（60秒内只能请求一次）
  const existing = verificationCodes.get(phone);
  if (existing && existing.expireAt > Date.now() - 240000) {
    throw new Error('验证码已发送，请稍后再试');
  }

  // 生成验证码
  const code = generateCode();

  // 存储验证码（5分钟有效）
  verificationCodes.set(phone, {
    code,
    expireAt: Date.now() + 300000,
  });

  // 实际生产环境应调用短信服务发送验证码
  console.log(`[SMS] 发送验证码到 ${phone}: ${code}`);

  return { success: true, message: '验证码已发送' };
}

/**
 * 验证验证码
 */
function validateCode(phone: string, code: string): boolean {
  const stored = verificationCodes.get(phone);

  // 开发环境：允许使用 123456 作为万能验证码
  if (process.env.NODE_ENV === 'development' && code === '123456') {
    return true;
  }

  if (!stored) return false;
  if (stored.expireAt < Date.now()) {
    verificationCodes.delete(phone);
    return false;
  }
  if (stored.code !== code) return false;

  // 验证成功后删除验证码
  verificationCodes.delete(phone);
  return true;
}

/**
 * 手机号登录/注册
 */
export async function loginByPhone(params: MobileLoginParams) {
  const { phone, code } = params;

  // 验证验证码
  if (!validateCode(phone, code)) {
    throw new Error('验证码错误或已过期');
  }

  // 查找或创建用户
  let user = await ChargingUser.findOne({ where: { phone } });
  let isNewUser = false;

  if (!user) {
    // 新用户注册
    isNewUser = true;
    user = await ChargingUser.create({
      phone,
      member_card_no: generateMemberCardNo(),
      card_type: '普通卡',
      balance: 0,
      issue_date: new Date(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 一年后
      status: 1,
    });
  }

  // 检查用户状态
  if ((user as any).status !== 1) {
    throw new Error('账号已被禁用');
  }

  // 生成 Token
  const token = generateToken((user as any).id, phone);

  // 返回用户信息
  const userInfo: MobileUserInfo = {
    id: (user as any).id,
    phone: (user as any).phone,
    name: (user as any).name,
    avatar: (user as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
    memberCardNo: (user as any).member_card_no,
    cardType: (user as any).card_type,
    balance: parseFloat((user as any).balance) || 0,
  };

  return {
    token,
    userInfo,
    isNewUser,
  };
}

/**
 * 微信登录
 */
export async function loginByWechat(wxCode: string) {
  // 实际生产环境应调用微信 API 获取 openid 和手机号
  // 这里模拟返回
  throw new Error('微信登录需要配置微信开放平台');
}

/**
 * 获取用户信息
 */
export async function getUserInfo(userId: number): Promise<MobileUserInfo> {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  return {
    id: (user as any).id,
    phone: (user as any).phone,
    name: (user as any).name,
    avatar: (user as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any).phone}`,
    gender: (user as any).gender || 0,
    birthday: (user as any).birthday || null,
    memberCardNo: (user as any).member_card_no,
    cardType: (user as any).card_type,
    balance: parseFloat((user as any).balance) || 0,
  };
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(userId: number, data: Partial<MobileUserInfo>) {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.birthday !== undefined) updateData.birthday = data.birthday;
  updateData.updated_at = new Date();

  await ChargingUser.update(updateData, { where: { id: userId } });

  return getUserInfo(userId);
}

/**
 * 获取用户余额
 */
export async function getUserBalance(userId: number) {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  return {
    balance: parseFloat((user as any).balance) || 0,
  };
}

/**
 * 充值
 */
export async function recharge(userId: number, amount: number) {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  if (amount <= 0) {
    throw new Error('充值金额必须大于0');
  }

  const currentBalance = parseFloat((user as any).balance) || 0;
  const newBalance = currentBalance + amount;

  await ChargingUser.update(
    { balance: newBalance },
    { where: { id: userId } }
  );

  return {
    balance: newBalance,
    message: '充值成功',
  };
}

/**
 * 扣款
 */
export async function deductBalance(userId: number, amount: number) {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  const currentBalance = parseFloat((user as any).balance) || 0;

  if (currentBalance < amount) {
    throw new Error('余额不足');
  }

  const newBalance = currentBalance - amount;

  await ChargingUser.update(
    { balance: newBalance },
    { where: { id: userId } }
  );

  return {
    balance: newBalance,
  };
}
