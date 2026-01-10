/**
 * 充电桩二维码控制器
 * 由于原文件较大，将二维码相关控制器单独提取
 */
import type { Request, Response } from 'express';
import {
  getPileQRCodeService,
  generatePileQRCodeService,
} from '../services/pileQRCodeService.js';

// GET /api/piles/:id/qrcode - 获取充电桩二维码数据
export async function getPileQRCodeController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { format, size, includeInfo } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    const params: any = {};
    if (format && ['PILE_ID', 'number', 'json'].includes(format as string)) {
      params.format = format as 'PILE_ID' | 'number' | 'json';
    }
    if (size && !isNaN(Number(size))) {
      params.size = Number(size);
    }
    if (includeInfo === 'true') {
      params.includeInfo = true;
    }

    const result = await getPileQRCodeService(Number(id), params);

    return res.json({
      code: 200,
      message: '获取二维码成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取二维码失败',
      data: null,
    });
  }
}

// GET /api/piles/:id/qrcode/download - 下载充电桩二维码
export async function downloadPileQRCodeController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { size, format } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '充电桩ID无效',
        data: null,
      });
    }

    const qrCodeSize = size && !isNaN(Number(size)) ? Number(size) : 300;
    const fileFormat = (format as string) || 'png';

    const qrCodeBuffer = await generatePileQRCodeService(Number(id), qrCodeSize);

    // 设置响应头
    res.setHeader('Content-Type', `image/${fileFormat}`);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pile_${id}_qrcode.${fileFormat}"`
    );

    // 发送文件
    return res.send(qrCodeBuffer);
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '下载二维码失败',
      data: null,
    });
  }
}
