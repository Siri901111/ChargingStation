import { Router } from 'express';
import {
  getCityListController,
  getBillingTemplateController,
  saveBillingTemplateController,
  deleteBillingTemplateController,
  getBillingTemplateListController,
} from '../controllers/billingTemplateController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取城市列表（树形结构）
router.get('/cityList', authMiddleware, getCityListController);

// 获取所有计费模板列表
router.get('/billing-template/list', authMiddleware, getBillingTemplateListController);

// 获取站点的计费模板
router.get('/billing-template/:stationId', authMiddleware, getBillingTemplateController);

// 创建或更新计费模板
router.post('/billing-template', authMiddleware, saveBillingTemplateController);

// 删除计费模板
router.delete('/billing-template/:stationId', authMiddleware, deleteBillingTemplateController);

export default router;

