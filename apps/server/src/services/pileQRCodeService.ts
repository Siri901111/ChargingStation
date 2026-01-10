/**
 * 充电桩二维码服务
 * 由于原文件较大，将二维码相关服务单独提取
 */
import Pile from '../models/Pile.js';
import Station from '../models/Station.js';
import { generateQRCodeData, generateQRCodeBuffer } from '../utils/qrcodeGenerator.js';

/**
 * 获取充电桩二维码数据（包含内容和图片）
 */
export interface GetPileQRCodeParams {
  format?: 'PILE_ID' | 'number' | 'json'; // 二维码格式，默认 'PILE_ID'
  size?: number; // 二维码尺寸（像素），默认 300
  includeInfo?: boolean; // 是否包含扩展信息，默认 false
}

export async function getPileQRCodeService(
  pileId: number,
  params: GetPileQRCodeParams = {}
): Promise<{
  qrCode: string;
  qrCodeImage: string;
  pileId: number;
  stationId: number;
  stationName: string;
  pileName: string;
  downloadUrl: string;
}> {
  // 验证充电桩是否存在
  const pile = await Pile.findByPk(pileId, {
    include: [
      {
        model: Station,
        as: 'station',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!pile) {
    throw new Error('充电桩不存在');
  }

  const pileData = pile as any;
  const station = pileData.station;

  try {
    const { format = 'PILE_ID', size = 300, includeInfo = false } = params;

    // 使用二维码生成工具生成完整数据
    const qrCodeData = await generateQRCodeData(
      pileId,
      station?.id,
      station?.name || '',
      pileData.name || `${pileId}号桩`,
      {
        format,
        size,
        includeInfo,
      }
    );

    return {
      ...qrCodeData,
      stationId: station?.id || pileData.station_id,
      stationName: station?.name || '未知站点',
      pileName: pileData.name || `${pileId}号桩`,
      downloadUrl: `/api/piles/${pileId}/qrcode/download?size=${size}`,
    };
  } catch (error: any) {
    console.error('获取充电桩二维码失败:', error);
    throw new Error(error.message || '获取充电桩二维码失败');
  }
}

/**
 * 生成充电桩二维码Buffer（用于文件下载）
 * 二维码内容格式：PILE_{pileId}
 */
export async function generatePileQRCodeService(
  pileId: number,
  size: number = 300
): Promise<Buffer> {
  // 验证充电桩是否存在
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }

  try {
    // 生成二维码内容：PILE_{pileId}
    const qrCodeContent = `PILE_${pileId}`;
    
    // 使用二维码生成工具生成Buffer
    const qrCodeBuffer = await generateQRCodeBuffer(qrCodeContent, size);
    
    return qrCodeBuffer;
  } catch (error) {
    console.error('生成二维码Buffer失败:', error);
    throw new Error('生成二维码Buffer失败');
  }
}
