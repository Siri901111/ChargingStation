import { Op } from 'sequelize';
import ChargingUser from '../models/ChargingUser.js';
import Order from '../models/Order.js';

export interface MemberCardListParams {
  page?: number;
  pageSize?: number;
  no?: string; // 会员卡号
  tel?: string; // 手机号
  name?: string; // 姓名
}

// 获取会员卡列表
export async function getMemberCardListService(params: MemberCardListParams) {
  const { page = 1, pageSize = 10, no, tel, name } = params;

  // 构建查询条件
  const where: any = {};
  if (no && typeof no === 'string' && no.trim()) {
    where.member_card_no = { [Op.like]: `%${no.trim()}%` };
  }
  if (tel && typeof tel === 'string' && tel.trim()) {
    where.phone = { [Op.like]: `%${tel.trim()}%` };
  }
  if (name && typeof name === 'string' && name.trim()) {
    where.name = { [Op.like]: `%${name.trim()}%` };
  }

  try {
    // 查询会员卡列表
    const { rows: users, count: total } = await ChargingUser.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['created_at', 'DESC']],
    });

    // 格式化返回数据
    const list = await Promise.all(
      users.map(async (user: any) => {
        // 获取该用户的消费记录（最近5条）
        const orders = await Order.findAll({
          where: {
            user_id: user.id,
            status: 3, // 只统计已完成的订单
          },
          order: [['date', 'DESC']],
          limit: 5,
          attributes: ['date', 'money', 'pay'],
        });

        // 格式化消费记录
        const transactionRecords = orders.map((order: any) => {
          // 根据支付方式判断消费类型
          let transactionType = '其他';
          if (order.pay === '会员卡') {
            transactionType = '充电扣款';
          } else if (order.pay?.includes('服务费')) {
            transactionType = '服务费扣款';
          } else if (order.pay?.includes('停车')) {
            transactionType = '停车费扣款';
          }

          return {
            transactionDate: order.date
              ? new Date(order.date).toLocaleDateString('zh-CN')
              : '',
            transactionAmount: Number(order.money || 0).toFixed(2),
            transactionType: transactionType,
          };
        });

        return {
          memberCardNumber: user.member_card_no || '',
          cardType: user.card_type || '普通卡',
          issueDate: user.issue_date
            ? new Date(user.issue_date).toLocaleDateString('zh-CN')
            : user.created_at
            ? new Date(user.created_at).toLocaleDateString('zh-CN')
            : '',
          holderName: user.name || '',
          holderPhone: user.phone || '',
          cardBalance: Number(user.balance || 0).toFixed(2),
          transactionRecords: transactionRecords,
          validUntil: user.valid_until
            ? new Date(user.valid_until).toLocaleDateString('zh-CN')
            : '',
        };
      })
    );

    return {
      list,
      total,
    };
  } catch (error) {
    console.error('获取会员卡列表失败:', error);
    throw new Error('获取会员卡列表失败');
  }
}

// 获取会员卡详情
export async function getMemberCardDetailService(memberCardNo: string) {
  const user = await ChargingUser.findOne({
    where: { member_card_no: memberCardNo },
  });

  if (!user) {
    throw new Error('会员卡不存在');
  }

  // 获取所有消费记录
  const orders = await Order.findAll({
    where: {
      user_id: (user as any).id,
      status: 3, // 只统计已完成的订单
    },
    order: [['date', 'DESC']],
    attributes: ['order_no', 'date', 'money', 'pay', 'station_id'],
  });

  // 格式化消费记录
  const transactionRecords = orders.map((order: any) => {
    let transactionType = '其他';
    if (order.pay === '会员卡') {
      transactionType = '充电扣款';
    } else if (order.pay?.includes('服务费')) {
      transactionType = '服务费扣款';
    } else if (order.pay?.includes('停车')) {
      transactionType = '停车费扣款';
    }

    return {
      transactionDate: order.date
        ? new Date(order.date).toLocaleDateString('zh-CN')
        : '',
      transactionAmount: Number(order.money || 0).toFixed(2),
      transactionType: transactionType,
      orderNo: order.order_no,
    };
  });

  return {
    memberCardNumber: (user as any).member_card_no || '',
    cardType: (user as any).card_type || '普通卡',
    issueDate: (user as any).issue_date
      ? new Date((user as any).issue_date).toLocaleDateString('zh-CN')
      : (user as any).created_at
      ? new Date((user as any).created_at).toLocaleDateString('zh-CN')
      : '',
    holderName: (user as any).name || '',
    holderPhone: (user as any).phone || '',
    cardBalance: Number((user as any).balance || 0).toFixed(2),
    transactionRecords: transactionRecords,
    validUntil: (user as any).valid_until
      ? new Date((user as any).valid_until).toLocaleDateString('zh-CN')
      : '',
    idNo: (user as any).id_no || '',
    status: (user as any).status,
  };
}

