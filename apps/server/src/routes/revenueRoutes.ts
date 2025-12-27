import { Router } from 'express';
import { getRevenueChartController, getRevenueListController } from '../controllers/revenueController.js';
import { getCurrentListController } from '../controllers/monitorController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取营收统计图表数据
router.get('/revenueChart', authMiddleware, getRevenueChartController);

// 获取营收列表（分页、搜索）
router.post('/revenueList', authMiddleware, getRevenueListController);

// 获取充电桩实时监控列表
router.post('/currentList', authMiddleware, getCurrentListController);

export default router;

