import { Router } from 'express';
import {
  getMemberCardListController,
  getMemberCardDetailController,
} from '../controllers/memberCardController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取会员卡列表（兼容前端POST请求）
router.post('/', authMiddleware, getMemberCardListController);

// 获取会员卡详情
router.get('/:cardNo', authMiddleware, getMemberCardDetailController);

export default router;

