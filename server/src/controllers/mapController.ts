import type { Request, Response } from 'express';
import {
  getMapStationListService,
  getMapStatsService,
  createStationFromMapService,
} from '../services/mapService.js';

// POST /api/mapList - 获取地图上的充电站列表
export async function getMapStationListController(
  req: Request,
  res: Response
) {
  try {
    const result = await getMapStationListService();

    return res.json({
      code: 200,
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('获取地图充电站列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: error.message || '获取地图充电站列表失败',
      data: null,
    });
  }
}

// GET /api/map/stats - 获取地图统计信息
export async function getMapStatsController(req: Request, res: Response) {
  try {
    const result = await getMapStatsService();

    return res.json({
      code: 200,
      message: '获取地图统计信息成功',
      data: result,
    });
  } catch (error: any) {
    console.error('获取地图统计信息控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取地图统计信息失败',
      data: null,
    });
  }
}

// POST /api/map/station - 通过地图创建充电站
export async function createStationFromMapController(
  req: Request,
  res: Response
) {
  try {
    const { name, region, location1, location2, now, remarks } = req.body;

    if (!name || !region || !location1 || !location2) {
      return res.status(400).json({
        code: 400,
        message: '站点名称、地址、经度、纬度不能为空',
        data: null,
      });
    }

    const result = await createStationFromMapService({
      name,
      region,
      location1,
      location2,
      now: now === true || now === 'true' || now === 1,
      remarks,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不能为空') ||
      error.message.includes('格式') ||
      error.message.includes('范围')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '创建充电站失败',
      data: null,
    });
  }
}

