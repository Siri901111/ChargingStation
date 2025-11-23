import type { Request, Response } from 'express';
import { getRevenueChartService, getRevenueListService } from '../services/revenueService.js';

// 获取营收统计图表数据
export async function getRevenueChartController(req: Request, res: Response) {
  try {
    const result = await getRevenueChartService();

    return res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取营收图表数据失败',
      data: null
    });
  }
}

// 获取营收列表
export async function getRevenueListController(req: Request, res: Response) {
  try {
    const { page, pageSize, name } = req.body;

    const result = await getRevenueListService({
      page: page || 1,
      pageSize: pageSize || 10,
      name: name || ''
    });

    return res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取营收列表失败',
      data: null
    });
  }
}

