import { Router } from 'express';
import {
  getPileListController,
  getPileDetailController,
  createPileController,
  updatePileController,
  deletePileController,
  updatePileStatusController,
  getPileUsageRecordsController,
  getPileMaintenanceController,
  createPileMaintenanceController,
  updatePileMaintenanceController,
} from '../controllers/pileController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取充电桩列表
router.get('/piles', authMiddleware, getPileListController);

// 获取充电桩详情
router.get('/piles/:id', authMiddleware, getPileDetailController);

// 创建充电桩
router.post('/piles', authMiddleware, createPileController);

// 更新充电桩
router.put('/piles/:id', authMiddleware, updatePileController);

// 删除充电桩
router.delete('/piles/:id', authMiddleware, deletePileController);

// 更新充电桩状态
router.put('/piles/:id/status', authMiddleware, updatePileStatusController);

// 获取充电桩使用记录
router.get('/piles/:id/usage-records', authMiddleware, getPileUsageRecordsController);

// 获取充电桩维保记录
router.get('/piles/:id/maintenance', authMiddleware, getPileMaintenanceController);

// 创建维保记录
router.post('/piles/:id/maintenance', authMiddleware, createPileMaintenanceController);

// 更新维保记录
router.put('/piles/:id/maintenance/:maintenanceId', authMiddleware, updatePileMaintenanceController);

export default router;

