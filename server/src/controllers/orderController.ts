import type { Request, Response } from 'express';
import {
  getOrderListService,
  batchDeleteOrdersService,
  getOrderDetailService,
} from '../services/orderService.js';

// POST /api/orderList - 获取订单列表
export async function getOrderListController(req: Request, res: Response) {
  try {
    const {
      page,
      pageSize,
      orderNo,
      status,
      no,
      name,
      startDate,
      endDate,
    } = req.body;

    const params: any = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10,
    };

    if (orderNo && typeof orderNo === 'string' && orderNo.trim()) {
      params.orderNo = orderNo.trim();
    }
    if (status && !isNaN(Number(status))) {
      params.status = Number(status);
    }
    if (no && typeof no === 'string' && no.trim()) {
      params.equipmentNo = no.trim();
    }
    if (name && typeof name === 'string' && name.trim()) {
      params.stationName = name.trim();
    }
    if (startDate && typeof startDate === 'string' && startDate.trim()) {
      params.startDate = startDate.trim();
    }
    if (endDate && typeof endDate === 'string' && endDate.trim()) {
      params.endDate = endDate.trim();
    }

    const result = await getOrderListService(params);

    return res.json({
      code: 200,
      message: '获取订单列表成功',
      data: result,
    });
  } catch (error: any) {
    console.error('获取订单列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取订单列表失败',
      data: null,
    });
  }
}

// POST /api/batchDelete - 批量删除订单
export async function batchDeleteOrdersController(
  req: Request,
  res: Response
) {
  try {
    const { order } = req.body;

    if (!order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '订单号列表不能为空',
        data: null,
      });
    }

    const result = await batchDeleteOrdersService(order);

    return res.json({
      code: 200,
      message: result.message,
      data: result.message,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('没有找到') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '批量删除订单失败',
      data: null,
    });
  }
}

// GET /api/orders/:orderNo - 获取订单详情
export async function getOrderDetailController(req: Request, res: Response) {
  try {
    const { orderNo } = req.params;

    if (!orderNo) {
      return res.status(400).json({
        code: 400,
        message: '订单号不能为空',
        data: null,
      });
    }

    const result = await getOrderDetailService(orderNo);

    return res.json({
      code: 200,
      message: '获取订单详情成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取订单详情失败',
      data: null,
    });
  }
}

