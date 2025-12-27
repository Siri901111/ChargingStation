import { Router } from 'express';
import {
  getOrderListController,
  batchDeleteOrdersController,
  getOrderDetailController,
} from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取订单列表（兼容前端POST请求）
router.post('/orderList', authMiddleware, getOrderListController);

// 批量删除订单
router.post('/batchDelete', authMiddleware, batchDeleteOrdersController);

// 获取订单详情
router.get('/orders/:orderNo', authMiddleware, getOrderDetailController);

export default router;

