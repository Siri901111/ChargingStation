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

// ==================== 站点相关 ====================

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
 * 获取站点详情
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
 * 获取站点充电桩列表
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

/**
 * 获取热门站点
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
    const params = {
      userId,
      status: req.query.status !== undefined ? parseInt(req.query.status as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const result = await getOrderList(params);
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

/**
 * 获取订单统计
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

export default router;
