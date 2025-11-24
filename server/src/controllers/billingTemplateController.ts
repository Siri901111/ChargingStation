import type { Request, Response } from 'express';
import {
  getCityListService,
  getBillingTemplateByStationService,
  saveBillingTemplateService,
  deleteBillingTemplateService,
  getBillingTemplateListService,
} from '../services/billingTemplateService.js';

// GET /api/cityList - 获取城市列表（树形结构）
export async function getCityListController(req: Request, res: Response) {
  try {
    const result = await getCityListService();
    return res.json({
      code: 200,
      message: '获取城市列表成功',
      data: result,
    });
  } catch (error: any) {
    console.error('获取城市列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取城市列表失败',
      data: null,
    });
  }
}

// GET /api/billing-template/:stationId - 获取站点的计费模板
export async function getBillingTemplateController(req: Request, res: Response) {
  try {
    const { stationId } = req.params;

    if (!stationId) {
      return res.status(400).json({
        code: 400,
        message: '站点ID不能为空',
        data: null,
      });
    }

    const result = await getBillingTemplateByStationService(
      parseInt(stationId)
    );

    return res.json({
      code: 200,
      message: '获取计费模板成功',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取计费模板失败',
      data: null,
    });
  }
}

// POST /api/billing-template - 创建或更新计费模板
export async function saveBillingTemplateController(
  req: Request,
  res: Response
) {
  try {
    const { station_id, name, service, parking, remarks, date } = req.body;

    // 参数验证
    if (!station_id) {
      return res.status(400).json({
        code: 400,
        message: '站点ID不能为空',
        data: null,
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        code: 400,
        message: '模板名称不能为空',
        data: null,
      });
    }

    if (!service || isNaN(Number(service))) {
      return res.status(400).json({
        code: 400,
        message: '服务费必须为有效数字',
        data: null,
      });
    }

    if (!parking || isNaN(Number(parking))) {
      return res.status(400).json({
        code: 400,
        message: '停车费必须为有效数字',
        data: null,
      });
    }

    if (!date || !Array.isArray(date) || date.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '至少需要配置一个时间段',
        data: null,
      });
    }

    const result = await saveBillingTemplateService({
      station_id: parseInt(station_id),
      name: name.trim(),
      service,
      parking,
      remarks: remarks || '',
      date,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') ||
      error.message.includes('不完整') ||
      error.message.includes('格式') ||
      error.message.includes('必须')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '保存计费模板失败',
      data: null,
    });
  }
}

// DELETE /api/billing-template/:stationId - 删除计费模板
export async function deleteBillingTemplateController(
  req: Request,
  res: Response
) {
  try {
    const { stationId } = req.params;

    if (!stationId) {
      return res.status(400).json({
        code: 400,
        message: '站点ID不能为空',
        data: null,
      });
    }

    const result = await deleteBillingTemplateService(parseInt(stationId));

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '删除计费模板失败',
      data: null,
    });
  }
}

// GET /api/billing-template/list - 获取所有计费模板列表
export async function getBillingTemplateListController(
  req: Request,
  res: Response
) {
  try {
    const result = await getBillingTemplateListService();
    return res.json({
      code: 200,
      message: '获取计费模板列表成功',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取计费模板列表失败',
      data: null,
    });
  }
}

