import { Router } from 'express';
import {
  getStationListController,
  getStationByIdController,
  createStationController,
  updateStationController,
  deleteStationController
} from '../controllers/stationController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// RESTful 风格的充电站接口
// 注意：精确匹配的路由要放在参数路由之前

// GET /api/stations - 获取充电站列表
router.get('/', authMiddleware, getStationListController);

// POST /api/stations - 创建充电站
router.post('/', authMiddleware, createStationController);

// GET /api/stations/:id - 获取单个充电站详情
router.get('/:id', authMiddleware, getStationByIdController);

// PUT /api/stations/:id - 更新充电站
router.put('/:id', authMiddleware, updateStationController);

// DELETE /api/stations/:id - 删除充电站
router.delete('/:id', authMiddleware, deleteStationController);

export default router;

