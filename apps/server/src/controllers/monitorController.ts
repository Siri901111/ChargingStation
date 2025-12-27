import type { Request, Response } from 'express';
import { getCurrentListService } from '../services/monitorService.js';

// 获取充电桩实时监控列表
export async function getCurrentListController(req: Request, res: Response) {
  try {
    const result = await getCurrentListService();

    return res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取充电桩监控列表失败',
      data: null
    });
  }
}

