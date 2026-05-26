import type { Request, Response } from 'express';
import {
  getAlarmListService,
  createAlarmService,
  getAlarmDetailService,
  updateAlarmStatusService,
  getAlarmStatsService,
  assignAlarmTaskService,
  urgeAlarmTaskService,
  completeAlarmTaskService,
  markAlarmExceptionService,
  getAlarmUrgeCountService
} from '../services/alarmService.js';

// GET /api/alarms - 获取报警列表
export async function getAlarmListController(req: Request, res: Response) {
  try {
    const { level, page, pageSize, status } = req.query;

    const result = await getAlarmListService({
      level: level ? parseInt(level as string) : 0,
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 10,
      status: status ? parseInt(status as string) : 0
    });

    return res.json({
      code: 200,
      message: '获取报警列表成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取报警列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取报警列表失败',
      data: null
    });
  }
}

// GET /api/alarms/:id - 获取报警详情
export async function getAlarmDetailController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '报警ID不能为空',
        data: null
      });
    }

    const result = await getAlarmDetailService(parseInt(id));

    return res.json({
      code: 200,
      message: '获取报警详情成功',
      data: result
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取报警详情失败',
      data: null
    });
  }
}

// POST /api/alarms - 创建报警记录
export async function createAlarmController(req: Request, res: Response) {
  try {
    const { station_id, pile_id, title, detail, level } = req.body;

    // 参数验证
    if (!station_id || !title || !detail || !level) {
      return res.status(400).json({
        code: 400,
        message: '充电站ID、标题、详情和级别不能为空',
        data: null
      });
    }

    if (![1, 2, 3, 4].includes(level)) {
      return res.status(400).json({
        code: 400,
        message: '报警级别必须为1-4之间的数字',
        data: null
      });
    }

    const result = await createAlarmService({
      station_id: parseInt(station_id),
      pile_id: pile_id ? parseInt(pile_id) : 0,
      title,
      detail,
      level: parseInt(level)
    });

    return res.status(201).json({
      code: 201,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '创建报警记录失败',
      data: null
    });
  }
}

// PUT /api/alarms/:id/status - 更新报警处理状态
export async function updateAlarmStatusController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, handler, handle_note } = req.body;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '报警ID不能为空',
        data: null
      });
    }

    if (!status) {
      return res.status(400).json({
        code: 400,
        message: '处理状态不能为空',
        data: null
      });
    }

    const result = await updateAlarmStatusService({
      id: parseInt(id),
      status: parseInt(status),
      handler,
      handle_time: new Date(),
      handle_note
    });

    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '更新报警状态失败',
      data: null
    });
  }
}

// GET /api/alarms/stats - 获取报警统计数据
export async function getAlarmStatsController(req: Request, res: Response) {
  try {
    const result = await getAlarmStatsService();

    return res.json({
      code: 200,
      message: '获取报警统计成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取报警统计失败',
      data: null
    });
  }
}

// POST /api/alarms/:id/assign - 指派报警任务（三步表单）
export async function assignAlarmTaskController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { basicInfo, approvalInfo, responsibleInfo } = req.body;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '报警ID不能为空',
        data: null
      });
    }

    // 验证必填字段
    if (!basicInfo?.name || !basicInfo?.tel || !basicInfo?.no || !responsibleInfo?.person || !responsibleInfo?.tel) {
      return res.status(400).json({
        code: 400,
        message: '基本信息和负责人信息不能为空',
        data: null
      });
    }

    const result = await assignAlarmTaskService({
      alarmId: parseInt(id),
      basicInfo,
      approvalInfo: approvalInfo || { approvalDept: '', ccDept: '' },
      responsibleInfo
    });

    return res.json({
      code: 200,
      message: result.message,
      data: result.assignInfo
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 
                     error.message.includes('不允许') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '指派报警任务失败',
      data: null
    });
  }
}

// POST /api/alarms/:id/urge - 催办报警任务
export async function urgeAlarmTaskController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { urgeNote } = req.body || {};

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '报警ID不能为空',
        data: null
      });
    }

    const result = await urgeAlarmTaskService({
      alarmId: parseInt(id),
      urgeNote
    });

    return res.json({
      code: 200,
      message: result.message,
      data: { 
        urgeTime: result.urgeTime,
        urgeCount: result.urgeCount
      }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 
                     error.message.includes('不允许') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '催办报警任务失败',
      data: null
    });
  }
}

// POST /api/alarms/:id/exception - 标记报警任务为处理异常
export async function markAlarmExceptionController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { exceptionNote } = req.body || {};

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '报警ID不能为空',
        data: null
      });
    }

    const result = await markAlarmExceptionService(parseInt(id), exceptionNote);

    return res.json({
      code: 200,
      message: result.message,
      data: { exceptionTime: result.exceptionTime }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 
                     error.message.includes('不允许') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '标记报警异常失败',
      data: null
    });
  }
}

// POST /api/alarms/:id/complete - 完成报警任务
export async function completeAlarmTaskController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { completionNote } = req.body || {};

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '报警ID不能为空',
        data: null
      });
    }

    const result = await completeAlarmTaskService(parseInt(id), completionNote);

    return res.json({
      code: 200,
      message: result.message,
      data: { completionTime: result.completionTime }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 
                     error.message.includes('不允许') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '完成报警任务失败',
      data: null
    });
  }
}

// GET /api/alarms/:id/urge-count - 获取报警催办次数
export async function getAlarmUrgeCountController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '报警ID不能为空',
        data: null
      });
    }

    const result = await getAlarmUrgeCountService(parseInt(id));

    return res.json({
      code: 200,
      message: '获取催办信息成功',
      data: result
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取催办信息失败',
      data: null
    });
  }
}
