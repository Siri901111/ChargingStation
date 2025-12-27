import type { Request, Response } from 'express';
import {
  getPileListService,
  getPileDetailService,
  createPileService,
  updatePileService,
  deletePileService,
  updatePileStatusService,
  getPileUsageRecordsService,
  getPileMaintenanceService,
  createPileMaintenanceService,
  updatePileMaintenanceService,
} from '../services/pileService.js';

// GET /api/piles - 获取充电桩列表
export async function getPileListController(req: Request, res: Response) {
  try {
    const {
      page,
      pageSize,
      stationId,
      status,
      type,
      keyword,
    } = req.query;

    const params: any = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10,
    };

    if (stationId && !isNaN(Number(stationId))) {
      params.stationId = Number(stationId);
    }
    if (status && !isNaN(Number(status))) {
      params.status = Number(status);
    }
    if (type && typeof type === 'string') {
      params.type = type;
    }
    if (keyword && typeof keyword === 'string') {
      params.keyword = keyword;
    }

    const result = await getPileListService(params);

    return res.json({
      code: 200,
      message: '获取充电桩列表成功',
      data: result,
    });
  } catch (error: any) {
    console.error('获取充电桩列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取充电桩列表失败',
      data: null,
    });
  }
}

// GET /api/piles/:id - 获取充电桩详情
export async function getPileDetailController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    const result = await getPileDetailService(Number(id));

    return res.json({
      code: 200,
      message: '获取充电桩详情成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取充电桩详情失败',
      data: null,
    });
  }
}

// POST /api/piles - 创建充电桩
export async function createPileController(req: Request, res: Response) {
  try {
    const {
      station_id,
      type,
      status,
      voltage,
      current,
      power,
      temperature,
      install_date,
    } = req.body;

    if (!station_id || !type) {
      return res.status(400).json({
        code: 400,
        message: '充电站ID和充电桩类型不能为空',
        data: null,
      });
    }

    const result = await createPileService({
      station_id: parseInt(station_id),
      type,
      status,
      voltage,
      current,
      power,
      temperature,
      install_date,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') ||
      error.message.includes('必须为')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '创建充电桩失败',
      data: null,
    });
  }
}

// PUT /api/piles/:id - 更新充电桩
export async function updatePileController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { type, status, voltage, current, power, temperature, percent, install_date } =
      req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    const result = await updatePileService(Number(id), {
      type,
      status,
      voltage,
      current,
      power,
      temperature,
      percent,
      install_date,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') || error.message.includes('必须为')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '更新充电桩失败',
      data: null,
    });
  }
}

// DELETE /api/piles/:id - 删除充电桩
export async function deletePileController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    const result = await deletePileService(Number(id));

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') || error.message.includes('关联订单')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '删除充电桩失败',
      data: null,
    });
  }
}

// PUT /api/piles/:id/status - 更新充电桩状态
export async function updatePileStatusController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    if (status === undefined || isNaN(Number(status))) {
      return res.status(400).json({
        code: 400,
        message: '状态值不能为空',
        data: null,
      });
    }

    const result = await updatePileStatusService(Number(id), Number(status));

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') || error.message.includes('无效')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '更新充电桩状态失败',
      data: null,
    });
  }
}

// GET /api/piles/:id/usage-records - 获取充电桩使用记录
export async function getPileUsageRecordsController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { page, pageSize } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    const result = await getPileUsageRecordsService(
      Number(id),
      page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    );

    return res.json({
      code: 200,
      message: '获取使用记录成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取使用记录失败',
      data: null,
    });
  }
}

// GET /api/piles/:id/maintenance - 获取充电桩维保记录
export async function getPileMaintenanceController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { page, pageSize } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    const result = await getPileMaintenanceService(
      Number(id),
      page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    );

    return res.json({
      code: 200,
      message: '获取维保记录成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取维保记录失败',
      data: null,
    });
  }
}

// POST /api/piles/:id/maintenance - 创建维保记录
export async function createPileMaintenanceController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status,
    } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    if (!maintenance_type || !maintenance_person || !maintenance_time) {
      return res.status(400).json({
        code: 400,
        message: '维保类型、维保人员和维保时间不能为空',
        data: null,
      });
    }

    const result = await createPileMaintenanceService(Number(id), {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') ||
      error.message.includes('不能为空')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '创建维保记录失败',
      data: null,
    });
  }
}

// PUT /api/piles/:id/maintenance/:maintenanceId - 更新维保记录
export async function updatePileMaintenanceController(
  req: Request,
  res: Response
) {
  try {
    const { id, maintenanceId } = req.params;
    const {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status,
    } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    if (!maintenanceId || isNaN(Number(maintenanceId))) {
      return res.status(400).json({
        code: 400,
        message: '维保记录ID无效',
        data: null,
      });
    }

    const result = await updatePileMaintenanceService(Number(maintenanceId), {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '更新维保记录失败',
      data: null,
    });
  }
}

