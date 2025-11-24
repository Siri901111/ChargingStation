import { Router } from 'express';
import {
  getElectricityStatsController,
  getRevenueRatioController,
  getDeviceOverviewController,
  getDeviceStatusController
} from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取电量统计数据（折线图）
router.get('/electricity-stats', authMiddleware, getElectricityStatsController);

// 获取营收占比数据（饼图）
router.get('/revenue-ratio', authMiddleware, getRevenueRatioController);

// 获取设备总览数据（雷达图）
router.get('/device-overview', authMiddleware, getDeviceOverviewController);

// 获取设备运行状态统计
router.get('/device-status', authMiddleware, getDeviceStatusController);

export default router;
