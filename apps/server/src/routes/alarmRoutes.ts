import { Router } from 'express';
import {
  getAlarmListController,
  getAlarmDetailController,
  createAlarmController,
  updateAlarmStatusController,
  getAlarmStatsController,
  assignAlarmTaskController,
  urgeAlarmTaskController,
  completeAlarmTaskController,
  markAlarmExceptionController,
  getAlarmUrgeCountController
} from '../controllers/alarmController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取报警列表
router.get('/', authMiddleware, getAlarmListController);
router.get('/alarmList', authMiddleware, getAlarmListController);

// 获取报警统计数据
router.get('/stats', authMiddleware, getAlarmStatsController);

// 获取报警催办次数
router.get('/:id/urge-count', authMiddleware, getAlarmUrgeCountController);

// 获取报警详情
router.get('/:id', authMiddleware, getAlarmDetailController);

// 创建报警记录
router.post('/', authMiddleware, createAlarmController);

// 指派报警任务（三步表单）
router.post('/:id/assign', authMiddleware, assignAlarmTaskController);

// 催办报警任务
router.post('/:id/urge', authMiddleware, urgeAlarmTaskController);

// 标记报警任务为处理异常
router.post('/:id/exception', authMiddleware, markAlarmExceptionController);

// 完成报警任务
router.post('/:id/complete', authMiddleware, completeAlarmTaskController);

// 更新报警处理状态
router.put('/:id/status', authMiddleware, updateAlarmStatusController);

export default router;
