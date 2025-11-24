import type { Request, Response } from 'express';
import {
  getMemberCardListService,
  getMemberCardDetailService,
} from '../services/memberCardService.js';

// POST /api/member - 获取会员卡列表
export async function getMemberCardListController(req: Request, res: Response) {
  try {
    const { page, pageSize, no, tel, name } = req.body;

    const params: any = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10,
    };
    
    if (no && typeof no === 'string' && no.trim()) {
      params.no = no.trim();
    }
    if (tel && typeof tel === 'string' && tel.trim()) {
      params.tel = tel.trim();
    }
    if (name && typeof name === 'string' && name.trim()) {
      params.name = name.trim();
    }

    const result = await getMemberCardListService(params);

    return res.json({
      code: 200,
      message: '获取会员卡列表成功',
      data: result,
    });
  } catch (error: any) {
    console.error('获取会员卡列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取会员卡列表失败',
      data: null,
    });
  }
}

// GET /api/member/:cardNo - 获取会员卡详情
export async function getMemberCardDetailController(
  req: Request,
  res: Response
) {
  try {
    const { cardNo } = req.params;

    if (!cardNo) {
      return res.status(400).json({
        code: 400,
        message: '会员卡号不能为空',
        data: null,
      });
    }

    const result = await getMemberCardDetailService(cardNo);

    return res.json({
      code: 200,
      message: '获取会员卡详情成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取会员卡详情失败',
      data: null,
    });
  }
}

