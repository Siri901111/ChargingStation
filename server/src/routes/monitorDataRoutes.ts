import { Router } from 'express';
import * as monitorDataController from '../controllers/monitorDataController.js';

const router = Router();

// ==================== 数据上报接口（无需认证） ====================
// SDK上报接口
router.post('/report', monitorDataController.reportData);

// ==================== 数据查询接口 ====================
// 获取监控数据列表
router.get('/list', monitorDataController.getDataList);

// 获取错误列表
router.get('/errors', monitorDataController.getErrors);

// 获取性能数据列表
router.get('/performance', monitorDataController.getPerformance);

// 获取行为数据列表
router.get('/behaviors', monitorDataController.getBehaviors);

// 获取网络请求列表
router.get('/networks', monitorDataController.getNetworks);

// ==================== 统计接口 ====================
// 获取统计概览
router.get('/overview', monitorDataController.getOverview);

// 获取趋势数据
router.get('/trend', monitorDataController.getTrend);

// 获取性能指标统计
router.get('/performance-metrics', monitorDataController.getPerformanceMetrics);

// 获取错误统计
router.get('/error-stats', monitorDataController.getErrorStats);

// 获取用户行为统计
router.get('/behavior-stats', monitorDataController.getBehaviorStats);

// 用户追踪 - 根据用户名获取用户所有行为数据
router.get('/user-tracking', monitorDataController.getUserTracking);

// 获取活跃用户列表
router.get('/active-users', monitorDataController.getActiveUsers);

// ==================== 管理接口 ====================
// 删除监控数据
router.delete('/delete', monitorDataController.deleteData);

// 清理过期数据
router.post('/clean', monitorDataController.cleanOldData);

export default router;
