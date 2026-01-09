/**
 * 移动端 API 路由
 * 提供 C 端用户使用的接口
 */
import express from 'express';
import {
  sendVerificationCode,
  loginByPhone,
  loginByWechat,
  getUserInfo,
  updateUserInfo,
  getUserBalance,
  recharge,
  verifyToken,
} from '../services/mobileUserService.js';
import {
  getNearbyStations,
  searchStations,
  getStationDetail,
  getStationPiles,
  getPileDetail,
  getHotStations,
} from '../services/mobileStationService.js';
import {
  scanPile,
  startCharging,
  stopCharging,
  getChargingStatus,
  getChargingHistory,
} from '../services/mobileChargingService.js';
import {
  getOrderList,
  getOrderDetail,
  payOrder,
  cancelOrder,
  refundOrder,
  getOrderStatistics,
} from '../services/mobileOrderService.js';
import {
  initCityStations,
  initTestUserOrders,
  testRecharge,
  initAllTestData,
} from '../utils/initTestData.js';

const router = express.Router();

// ==================== 中间件 ====================

/**
 * 验证 Token 中间件
 */
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或登录已过期' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }

  (req as any).userId = decoded.userId;
  (req as any).phone = decoded.phone;
  next();
}

/**
 * 可选认证中间件（有 token 则解析，无 token 也放行）
 */
function optionalAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded) {
      (req as any).userId = decoded.userId;
      (req as any).phone = decoded.phone;
    }
  }

  next();
}

/**
 * 统一响应格式
 */
function success(data: any) {
  return { code: 200, data, message: 'success' };
}

function error(message: string, code: number = 400) {
  return { code, message, data: null };
}

// ==================== 用户相关 ====================

/**
 * 发送验证码
 */
router.post('/user/sendCode', async (req, res) => {
  try {
    const { phone, type } = req.body;
    const result = await sendVerificationCode(phone, type);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 手机号登录
 */
router.post('/user/loginByPhone', async (req, res) => {
  try {
    const { phone, code } = req.body;
    const result = await loginByPhone({ phone, code });
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 微信登录
 */
router.post('/user/loginByWechat', async (req, res) => {
  try {
    const { code } = req.body;
    const result = await loginByWechat(code);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取用户信息
 */
router.get('/user/info', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await getUserInfo(userId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 更新用户信息
 */
router.put('/user/info', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await updateUserInfo(userId, req.body);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取余额
 */
router.get('/user/balance', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await getUserBalance(userId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 充值
 */
router.post('/user/recharge', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { amount } = req.body;
    const result = await recharge(userId, amount);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

// ==================== 钱包相关 ====================

/**
 * 获取余额
 */
router.get('/wallet/balance', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await getUserBalance(userId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取充值套餐
 */
router.get('/wallet/packages', async (req, res) => {
  try {
    // 返回充值套餐列表
    const packages = [
      { id: 1, amount: 50, giftAmount: 0, description: '基础充值' },
      { id: 2, amount: 100, giftAmount: 5, description: '充100送5' },
      { id: 3, amount: 200, giftAmount: 15, description: '充200送15' },
      { id: 4, amount: 500, giftAmount: 50, description: '充500送50' },
      { id: 5, amount: 1000, giftAmount: 150, description: '充1000送150' },
    ];
    res.json(success(packages));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取消费记录（从订单中获取）
 */
router.get('/wallet/consume', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

    // 从订单表获取消费记录
    const result = await getOrderList({
      userId,
      status: 3, // 已完成的订单
      page,
      pageSize,
    });

    // 转换为消费记录格式
    const list = result.list.map((order: any) => ({
      id: order.id,
      orderNo: order.orderNo,
      amount: order.money || 0,
      type: '充电消费',
      createTime: order.endTime || order.startTime || order.date,
    }));

    res.json(success({ list, total: result.total }));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取充值记录
 */
router.get('/wallet/records', authMiddleware, async (req, res) => {
  try {
    // 暂时返回空列表，后续可以添加充值记录表
    res.json(success({ list: [], total: 0 }));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 充值（正式）
 */
router.post('/wallet/recharge', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { amount, packageId, payType } = req.body;

    // 开发环境直接充值成功
    if (process.env.NODE_ENV === 'development') {
      // 查找套餐获取赠送金额
      const packages = [
        { id: 1, amount: 50, giftAmount: 0 },
        { id: 2, amount: 100, giftAmount: 5 },
        { id: 3, amount: 200, giftAmount: 15 },
        { id: 4, amount: 500, giftAmount: 50 },
        { id: 5, amount: 1000, giftAmount: 150 },
      ];
      const pkg = packages.find(p => p.id === packageId);
      const giftAmount = pkg?.giftAmount || 0;

      const result = await testRecharge(userId, amount, giftAmount);
      res.json(success({
        orderId: `R${Date.now()}`,
        payInfo: null,
        ...result,
      }));
      return;
    }

    // 生产环境返回支付信息（需要对接实际支付接口）
    res.json(success({
      orderId: `R${Date.now()}`,
      payInfo: {
        // 微信/支付宝支付参数
      },
    }));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

// ==================== 站点相关 ====================
// 注意：特定路由必须在参数化路由之前定义

/**
 * 获取附近站点
 */
router.get('/station/nearby', optionalAuth, async (req, res) => {
  try {
    const params = {
      latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
      longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
      radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
      type: req.query.type as 'fast' | 'slow' | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
    };
    const result = await getNearbyStations(params);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 搜索站点
 */
router.get('/station/search', async (req, res) => {
  try {
    const params = {
      keyword: req.query.keyword as string,
      city: req.query.city as string,
      latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
      longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
    };
    const result = await searchStations(params);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取热门站点（必须在 /station/:id 之前定义）
 */
router.get('/station/hot', async (req, res) => {
  try {
    const city = req.query.city as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const result = await getHotStations(city, limit);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取站点充电桩列表（必须在 /station/:id 之前定义）
 */
router.get('/station/:id/piles', async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);
    const result = await getStationPiles(stationId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取站点详情（参数化路由放在最后）
 */
router.get('/station/:id', async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);
    const latitude = req.query.latitude ? parseFloat(req.query.latitude as string) : undefined;
    const longitude = req.query.longitude ? parseFloat(req.query.longitude as string) : undefined;
    const result = await getStationDetail(stationId, latitude, longitude);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取充电桩详情
 */
router.get('/pile/:id', async (req, res) => {
  try {
    const pileId = parseInt(req.params.id);
    const result = await getPileDetail(pileId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

// ==================== 充电相关 ====================

/**
 * 扫码获取充电桩信息
 */
router.post('/charging/scan', authMiddleware, async (req, res) => {
  try {
    const { qrCode } = req.body;
    const result = await scanPile(qrCode);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 开始充电
 */
router.post('/charging/start', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { pileId } = req.body;
    const result = await startCharging(userId, pileId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 停止充电
 */
router.post('/charging/stop', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { orderId } = req.body;
    const result = await stopCharging(userId, orderId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取当前充电状态
 */
router.get('/charging/status', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await getChargingStatus(userId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取充电历史
 */
router.get('/charging/history', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
    const result = await getChargingHistory(userId, page, pageSize);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

// ==================== 订单相关 ====================

/**
 * 获取订单列表
 */
router.get('/order/list', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const statusStr = req.query.status as string;
    const params = {
      userId,
      status: statusStr !== undefined && statusStr !== '' && statusStr !== 'undefined' ? parseInt(statusStr) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    // 如果解析后是 NaN，设为 undefined
    if (params.status !== undefined && isNaN(params.status)) {
      params.status = undefined;
    }
    const result = await getOrderList(params);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取订单统计（必须在 /order/:orderNo 之前定义）
 */
router.get('/order/statistics', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await getOrderStatistics(userId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 获取订单详情
 */
router.get('/order/:orderNo', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { orderNo } = req.params;
    const result = await getOrderDetail(orderNo, userId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 支付订单
 */
router.post('/order/pay', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { orderNo, payType } = req.body;
    const result = await payOrder(orderNo, userId, payType);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 取消订单
 */
router.post('/order/:orderNo/cancel', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { orderNo } = req.params;
    const result = await cancelOrder(orderNo, userId);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 申请退款
 */
router.post('/order/:orderNo/refund', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { orderNo } = req.params;
    const { reason } = req.body;
    const result = await refundOrder(orderNo, userId, reason);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

// ==================== 测试/开发接口 ====================

/**
 * 测试充值（仅开发环境）
 * 模拟充值，直接增加余额
 */
router.post('/test/recharge', authMiddleware, async (req, res) => {
  try {
    // 检查是否为开发环境
    if (process.env.NODE_ENV !== 'development') {
      return res.json(error('此接口仅在开发环境可用'));
    }

    const userId = (req as any).userId;
    const { amount, giftAmount = 0 } = req.body;

    if (!amount || amount <= 0) {
      return res.json(error('充值金额必须大于0'));
    }

    const result = await testRecharge(userId, amount, giftAmount);
    res.json(success(result));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 初始化测试数据（仅开发环境）
 * 初始化长沙和天津的充电站数据
 */
router.post('/test/init-stations', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.json(error('此接口仅在开发环境可用'));
    }

    await initCityStations();
    res.json(success({ message: '长沙和天津充电站数据初始化完成' }));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 为测试用户创建订单（仅开发环境）
 */
router.post('/test/init-orders', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.json(error('此接口仅在开发环境可用'));
    }

    const { phone = '19282249442' } = req.body;
    await initTestUserOrders(phone);
    res.json(success({ message: `用户 ${phone} 订单数据初始化完成` }));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

/**
 * 初始化所有测试数据（仅开发环境）
 */
router.post('/test/init-all', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.json(error('此接口仅在开发环境可用'));
    }

    await initAllTestData();
    res.json(success({ message: '所有测试数据初始化完成' }));
  } catch (err: any) {
    res.json(error(err.message));
  }
});

export default router;
