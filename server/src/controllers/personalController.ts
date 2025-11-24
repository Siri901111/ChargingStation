import type { Request, Response } from 'express';
import {
  getPersonalInfoService,
  updatePersonalInfoService,
  getPersonalStatsService,
  getPersonalNoticesService,
  changePasswordService,
} from '../services/personalService.js';

// GET /api/personal/info - 获取个人信息
export async function getPersonalInfoController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null,
      });
    }

    const result = await getPersonalInfoService(userId);

    return res.json({
      code: 200,
      message: '获取个人信息成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取个人信息失败',
      data: null,
    });
  }
}

// PUT /api/personal/info - 更新个人信息
export async function updatePersonalInfoController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null,
      });
    }

    const { name, phone, address, workStatus, tags } = req.body;

    const result = await updatePersonalInfoService(userId, {
      name,
      phone,
      address,
      workStatus,
      tags,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') ||
      error.message.includes('格式') ||
      error.message.includes('无效')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '更新个人信息失败',
      data: null,
    });
  }
}

// GET /api/personal/stats - 获取个人统计数据
export async function getPersonalStatsController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null,
      });
    }

    const result = await getPersonalStatsService(userId);

    return res.json({
      code: 200,
      message: '获取统计数据成功',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取统计数据失败',
      data: null,
    });
  }
}

// GET /api/personal/notices - 获取通知列表
export async function getPersonalNoticesController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null,
      });
    }

    const { page, pageSize } = req.query;

    const result = await getPersonalNoticesService(
      userId,
      page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    );

    return res.json({
      code: 200,
      message: '获取通知列表成功',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取通知列表失败',
      data: null,
    });
  }
}

// POST /api/personal/change-password - 修改密码
export async function changePasswordController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null,
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '旧密码和新密码不能为空',
        data: null,
      });
    }

    const result = await changePasswordService(userId, {
      oldPassword,
      newPassword,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不正确') ||
      error.message.includes('不能为空') ||
      error.message.includes('长度')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '修改密码失败',
      data: null,
    });
  }
}

