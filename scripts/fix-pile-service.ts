// 这是一个临时脚本，用于修复pileService.ts文件
// 由于文件较大，这里只是记录需要添加的代码片段

// 需要在第5行后添加：
import { generateQRCodeData, generateQRCodeBuffer } from '../utils/qrcodeGenerator.js';

// 需要替换第578-609行的generatePileQRCodeService函数为：
/**
 * 生成充电桩二维码Buffer（用于文件下载）
 * 二维码内容格式：PILE_{pileId}
 */
export async function generatePileQRCodeService(
  pileId: number,
  size: number = 300
): Promise<Buffer> {
  const pile = await Pile.findByPk(pileId);
  if (!pile) {
    throw new Error('充电桩不存在');
  }
  try {
    const qrCodeContent = `PILE_${pileId}`;
    const qrCodeBuffer = await generateQRCodeBuffer(qrCodeContent, size);
    return qrCodeBuffer;
  } catch (error) {
    console.error('生成二维码Buffer失败:', error);
    throw new Error('生成二维码Buffer失败');
  }
}

// 需要在文件末尾（第609行后）添加：
/**
 * 获取充电桩二维码数据（包含内容和图片）
 */
export interface GetPileQRCodeParams {
  format?: 'PILE_ID' | 'number' | 'json';
  size?: number;
  includeInfo?: boolean;
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
  const pile = await Pile.findByPk(pileId, {
    include: [{ model: Station, as: 'station', attributes: ['id', 'name'] }],
  });
  if (!pile) {
    throw new Error('充电桩不存在');
  }
  const pileData = pile as any;
  const station = pileData.station;
  try {
    const { format = 'PILE_ID', size = 300, includeInfo = false } = params;
    const qrCodeData = await generateQRCodeData(
      pileId,
      station?.id,
      station?.name || '',
      pileData.name || `${pileId}号桩`,
      { format, size, includeInfo }
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
