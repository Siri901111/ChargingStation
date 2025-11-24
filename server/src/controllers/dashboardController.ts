import type { Request, Response } from 'express';
import {
  getElectricityStatsService,
  getRevenueRatioService,
  getDeviceOverviewService,
  getDeviceStatusService
} from '../services/dashboardService.js';

// GET /api/dashboard/electricity-stats - 获取电量统计数据（折线图）
export async function getElectricityStatsController(req: Request, res: Response) {
  try {
    const result = await getElectricityStatsService();
    
    return res.json({
      code: 200,
      message: '获取电量统计数据成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取电量统计数据失败',
      data: null
    });
  }
}

// GET /api/dashboard/revenue-ratio - 获取营收占比数据（饼图）
export async function getRevenueRatioController(req: Request, res: Response) {
  try {
    const result = await getRevenueRatioService();
    
    return res.json({
      code: 200,
      message: '获取营收占比数据成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取营收占比数据失败',
      data: null
    });
  }
}

// GET /api/dashboard/device-overview - 获取设备总览数据（雷达图）
export async function getDeviceOverviewController(req: Request, res: Response) {
  try {
    const result = await getDeviceOverviewService();
    
    return res.json({
      code: 200,
      message: '获取设备总览数据成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取设备总览数据失败',
      data: null
    });
  }
}

// GET /api/dashboard/device-status - 获取设备运行状态统计
export async function getDeviceStatusController(req: Request, res: Response) {
  try {
    const result = await getDeviceStatusService();
    
    return res.json({
      code: 200,
      message: '获取设备状态统计成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取设备状态统计失败',
      data: null
    });
  }
}
