import { Router } from 'express';
import {
  getDocumentTypeListController,
  createDocumentController,
  getDocumentListController,
  getDocumentDetailController,
  updateDocumentController,
  deleteDocumentController,
  publishDocumentController,
} from '../controllers/documentController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 获取文章类型列表（兼容前端GET请求）
router.get('/document', authMiddleware, getDocumentTypeListController);

// 创建文章
router.post('/document', authMiddleware, createDocumentController);

// 获取文章列表（小程序端可选认证，管理员端需要认证）
router.get('/document/list', getDocumentListController);

// 获取文章详情（小程序端可选认证，管理员端需要认证）
router.get('/document/:id', getDocumentDetailController);

// 更新文章
router.put('/document/:id', authMiddleware, updateDocumentController);

// 删除文章
router.delete('/document/:id', authMiddleware, deleteDocumentController);

// 发布文章
router.post('/document/:id/publish', authMiddleware, publishDocumentController);

export default router;

