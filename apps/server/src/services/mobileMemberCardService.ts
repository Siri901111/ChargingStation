/**
 * 移动端会员卡服务
 * 为用户提供查看自己会员卡信息的功能
 */
import ChargingUser from '../models/ChargingUser.js';
import Order from '../models/Order.js';

export interface MemberCardDetail {
  memberCardNumber: string;
  cardType: string;
  issueDate: string;
  holderName: string;
  holderPhone: string;
  cardBalance: string;
  transactionRecords: TransactionRecord[];
  validUntil: string;
  idNo?: string;
  status: number;
}

export interface TransactionRecord {
  transactionDate: string;
  transactionAmount: string;
  transactionType: string;
  orderNo?: string;
}

/**
 * 获取用户自己的会员卡详情
 */
export async function getMyMemberCardService(userId: number): Promise<MemberCardDetail> {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  const userData = user as any;

  // 获取所有消费记录
  const orders = await Order.findAll({
    where: {
      user_id: userId,
      status: 3, // 只统计已完成的订单
    },
    order: [['date', 'DESC']],
    attributes: ['order_no', 'date', 'money', 'pay', 'station_id'],
  });

  // 格式化消费记录
  const transactionRecords: TransactionRecord[] = orders.map((order: any) => {
    let transactionType = '其他';
    if (order.pay === '会员卡' || order.pay === '余额') {
      transactionType = '充电扣款';
    } else if (order.pay?.includes('服务费')) {
      transactionType = '服务费扣款';
    } else if (order.pay?.includes('停车')) {
      transactionType = '停车费扣款';
    }

    return {
      transactionDate: order.date
        ? formatTransactionDate(order.date)
        : '',
      transactionAmount: Number(order.money || 0).toFixed(2),
      transactionType: transactionType,
      orderNo: order.order_no,
    };
  });

  // 格式化日期为 YYYY/MM/DD（用于交易记录）
  function formatTransactionDate(date: Date | string | null): string {
    if (!date) return '';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch {
      return '';
    }
  }

  // 格式化日期为 YYYY/MM/DD（用于卡信息）
  function formatDate(date: Date | string | null): string {
    if (!date) return '';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch {
      return '';
    }
  }

  return {
    memberCardNumber: userData.member_card_no || '',
    cardType: userData.card_type || '普通卡',
    issueDate: formatDate(userData.issue_date) || formatDate(userData.created_at) || '',
    holderName: userData.name || '',
    holderPhone: userData.phone || '',
    cardBalance: Number(userData.balance || 0).toFixed(2),
    transactionRecords: transactionRecords,
    validUntil: formatDate(userData.valid_until) || '',
    idNo: userData.id_no || undefined,
    status: userData.status,
  };
}

/**
 * 购买充值会员（年卡）
 * 价格：198元
 * 有效期：1年
 * 权益：充值享受95折
 */
export async function purchaseRechargeMemberService(userId: number) {
  const user = await ChargingUser.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  const userData = user as any;
  const currentCardType = userData.card_type || '普通卡';

  // 检查是否已经是充值会员且未过期
  if (currentCardType === '充值会员') {
    const validUntil = userData.valid_until ? new Date(userData.valid_until) : null;
    const now = new Date();
    if (validUntil && validUntil > now) {
      throw new Error('您已经是充值会员，有效期至 ' + formatDate(validUntil));
    }
  }

  // 购买价格
  const price = 198;

  // 更新会员卡类型和有效期
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setFullYear(validUntil.getFullYear() + 1); // 1年后

  await ChargingUser.update(
    {
      card_type: '充值会员',
      issue_date: now,
      valid_until: validUntil,
    },
    { where: { id: userId } }
  );

  return {
    success: true,
    message: '购买成功！充值会员年卡已激活，有效期至 ' + formatDate(validUntil),
    cardType: '充值会员',
    validUntil: formatDate(validUntil),
    discount: 0.95, // 95折
  };

  function formatDate(date: Date | string | null): string {
    if (!date) return '';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch {
      return '';
    }
  }
}
