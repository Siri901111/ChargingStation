import { Request, Response } from 'express';
import * as monitorDataService from '../services/monitorDataService.js';

/**
 * 接收SDK上报的监控数据
 */
export async function reportData(req: Request, res: Response) {
  try {
    const data = req.body;

    // 支持单条和批量上报
    const dataList = Array.isArray(data) ? data : [data];

    if (dataList.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '上报数据不能为空'
      });
    }

    // 获取客户端信息
    const clientInfo = {
      ip: req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    await monitorDataService.saveMonitorData(dataList, clientInfo);

    res.status(200).json({
      code: 200,
      message: '上报成功',
      count: dataList.length
    });
  } catch (error: any) {
    console.error('监控数据上报失败:', error);
    res.status(500).json({
      code: 500,
      message: '上报失败',
      error: error.message
    });
  }
}

/**
 * 获取监控数据列表
 */
export async function getDataList(req: Request, res: Response) {
  try {
    const { page, pageSize, category, type, appId, startTime, endTime } = req.query;

    const result = await monitorDataService.getMonitorDataList({
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      category: category as string,
      type: type as string,
      appId: appId as string,
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取监控数据列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取错误列表
 */
export async function getErrors(req: Request, res: Response) {
  try {
    const { page, pageSize, type, startTime, endTime } = req.query;

    const result = await monitorDataService.getErrorList({
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      type: type as string,
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取错误列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取性能数据列表
 */
export async function getPerformance(req: Request, res: Response) {
  try {
    const { page, pageSize, type, startTime, endTime } = req.query;

    const result = await monitorDataService.getPerformanceList({
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      type: type as string,
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取性能数据列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取行为数据列表
 */
export async function getBehaviors(req: Request, res: Response) {
  try {
    const { page, pageSize, type, startTime, endTime } = req.query;

    const result = await monitorDataService.getBehaviorList({
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      type: type as string,
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取行为数据列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取网络请求列表
 */
export async function getNetworks(req: Request, res: Response) {
  try {
    const { page, pageSize, startTime, endTime } = req.query;

    const result = await monitorDataService.getNetworkList({
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取网络请求列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取统计概览
 */
export async function getOverview(req: Request, res: Response) {
  try {
    const { startTime, endTime, appId } = req.query;

    const result = await monitorDataService.getOverviewStats({
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
      appId: appId as string,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取统计概览失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取趋势数据
 */
export async function getTrend(req: Request, res: Response) {
  try {
    const { startTime, endTime, groupBy, category, appId } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        code: 400,
        message: 'startTime和endTime为必填参数'
      });
    }

    const result = await monitorDataService.getTrendData({
      startTime: parseInt(startTime as string),
      endTime: parseInt(endTime as string),
      groupBy: (groupBy as 'hour' | 'day') || 'hour',
      category: category as string,
      appId: appId as string,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取性能指标统计
 */
export async function getPerformanceMetrics(req: Request, res: Response) {
  try {
    const { startTime, endTime, appId } = req.query;

    const result = await monitorDataService.getPerformanceMetrics({
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
      appId: appId as string,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取性能指标统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取错误统计
 */
export async function getErrorStats(req: Request, res: Response) {
  try {
    const { startTime, endTime, appId } = req.query;

    const result = await monitorDataService.getErrorStats({
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
      appId: appId as string,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取错误统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 获取用户行为统计
 */
export async function getBehaviorStats(req: Request, res: Response) {
  try {
    const { startTime, endTime, appId } = req.query;

    const result = await monitorDataService.getBehaviorStats({
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
      appId: appId as string,
    });

    res.json({
      code: 200,
      data: result
    });
  } catch (error: any) {
    console.error('获取用户行为统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据失败',
      error: error.message
    });
  }
}

/**
 * 删除监控数据
 */
export async function deleteData(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的数据ID列表'
      });
    }

    const count = await monitorDataService.deleteMonitorData(ids);

    res.json({
      code: 200,
      message: '删除成功',
      deletedCount: count
    });
  } catch (error: any) {
    console.error('删除监控数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败',
      error: error.message
    });
  }
}

/**
 * 清理过期数据
 */
export async function cleanOldData(req: Request, res: Response) {
  try {
    const { days } = req.body;
    const daysToKeep = days ? parseInt(days) : 30;

    const count = await monitorDataService.cleanOldData(daysToKeep);

    res.json({
      code: 200,
      message: `已清理${daysToKeep}天前的数据`,
      deletedCount: count
    });
  } catch (error: any) {
    console.error('清理过期数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '清理失败',
      error: error.message
    });
  }
}
