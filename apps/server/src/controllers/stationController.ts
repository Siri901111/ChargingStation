import type { Request, Response } from 'express';
import {
  getStationListService,
  getStationByIdService,
  createStationService,
  updateStationService,
  deleteStationService
} from '../services/stationService.js';

// 获取充电站列表
export async function getStationListController(req: Request, res: Response) {
  try {
    const { page, pageSize, name, id, status } = req.query;

    const params: any = {
      page: page ? parseInt(String(page)) : 1,
      pageSize: pageSize ? parseInt(String(pageSize)) : 10
    };
    
    if (name) params.name = name as string;
    if (id) params.id = id as string;
    if (status) params.status = parseInt(String(status));

    const result = await getStationListService(params);

    return res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取充电站列表失败',
      data: null
    });
  }
}

// 获取单个充电站详情
export async function getStationByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // 处理末尾斜杠的情况
    const cleanId = id?.replace(/\/$/, '');
    
    if (!cleanId) {
      return res.status(400).json({
        code: 400,
        message: '站点ID不能为空',
        data: null
      });
    }

    const stationId = parseInt(cleanId);

    if (isNaN(stationId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的站点ID',
        data: null
      });
    }

    const result = await getStationByIdService(stationId);

    return res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取充电站详情失败',
      data: null
    });
  }
}

// 创建充电站
export async function createStationController(req: Request, res: Response) {
  try {
    const { name, city, address, fast, slow, status, person, tel, longitude, latitude } = req.body;

    const result = await createStationService({
      name,
      city,
      address,
      fast,
      slow,
      status,
      person,
      tel,
      longitude: longitude != null ? Number(longitude) : undefined,
      latitude: latitude != null ? Number(latitude) : undefined,
    });

    return res.status(201).json({
      code: 201,
      message: result.message,
      data: result
    });
  } catch (error: any) {
    const statusCode = error.message.includes('已存在') || error.message.includes('不能为空') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '创建充电站失败',
      data: null
    });
  }
}

// 更新充电站
export async function updateStationController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // 处理末尾斜杠的情况
    const cleanId = id?.replace(/\/$/, '');
    
    if (!cleanId) {
      return res.status(400).json({
        code: 400,
        message: '站点ID不能为空',
        data: null
      });
    }

    const stationId = parseInt(cleanId);

    if (isNaN(stationId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的站点ID',
        data: null
      });
    }

    const { name, city, address, fast, slow, status, person, tel, longitude, latitude } = req.body;

    const result = await updateStationService(stationId, {
      name,
      city,
      address,
      fast,
      slow,
      status,
      person,
      tel,
      longitude: longitude != null ? Number(longitude) : undefined,
      latitude: latitude != null ? Number(latitude) : undefined,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 :
                       error.message.includes('已存在') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '更新充电站失败',
      data: null
    });
  }
}

// 删除充电站
export async function deleteStationController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // 处理末尾斜杠的情况
    const cleanId = id?.replace(/\/$/, '');
    
    if (!cleanId) {
      return res.status(400).json({
        code: 400,
        message: '站点ID不能为空',
        data: null
      });
    }

    const stationId = parseInt(cleanId);

    if (isNaN(stationId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的站点ID',
        data: null
      });
    }

    const result = await deleteStationService(stationId);

    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 :
                       error.message.includes('无法删除') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '删除充电站失败',
      data: null
    });
  }
}

