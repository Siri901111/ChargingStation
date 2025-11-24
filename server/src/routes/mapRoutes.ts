import { Router } from 'express';
import {
  getMapStationListController,
  getMapStatsController,
  createStationFromMapController,
} from '../controllers/mapController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取地图上的充电站列表（兼容前端POST请求）
router.post('/mapList', authMiddleware, getMapStationListController);

// 获取地图统计信息
router.get('/map/stats', authMiddleware, getMapStatsController);

// 通过地图创建充电站
router.post('/map/station', authMiddleware, createStationFromMapController);

export default router;

