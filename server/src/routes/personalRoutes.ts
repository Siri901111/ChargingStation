import { Router } from 'express';
import {
  getPersonalInfoController,
  updatePersonalInfoController,
  getPersonalStatsController,
  getPersonalNoticesController,
  changePasswordController,
} from '../controllers/personalController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取个人信息
router.get('/personal/info', authMiddleware, getPersonalInfoController);

// 更新个人信息
router.put('/personal/info', authMiddleware, updatePersonalInfoController);

// 获取个人统计数据
router.get('/personal/stats', authMiddleware, getPersonalStatsController);

// 获取通知列表
router.get('/personal/notices', authMiddleware, getPersonalNoticesController);

// 修改密码
router.post('/personal/change-password', authMiddleware, changePasswordController);

export default router;

