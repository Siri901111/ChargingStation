/**
 * 二维码生成工具
 * 用于生成充电桩二维码
 */
import QRCode from 'qrcode';

export interface QRCodeOptions {
  format?: 'PILE_ID' | 'number' | 'json'; // 二维码格式
  size?: number; // 二维码尺寸（像素）
  includeInfo?: boolean; // 是否包含扩展信息
}

export interface QRCodeData {
  qrCode: string; // 二维码文本内容
  qrCodeImage: string; // 二维码图片（Base64）
  pileId: number;
  stationId?: number;
  stationName?: string;
  pileName?: string;
}

/**
 * 生成充电桩二维码内容
 */
export function generateQRCodeContent(
  pileId: number,
  options: QRCodeOptions = {}
): string {
  const { format = 'PILE_ID', includeInfo = false, stationId, stationName, pileName } = options as any;

  switch (format) {
    case 'PILE_ID':
      return `PILE_${pileId}`;

    case 'number':
      return `${pileId}`;

    case 'json':
      const jsonData: any = { pileId };
      if (includeInfo && stationId) {
        jsonData.stationId = stationId;
      }
      if (includeInfo && stationName) {
        jsonData.stationName = stationName;
      }
      if (includeInfo && pileName) {
        jsonData.pileName = pileName;
      }
      return JSON.stringify(jsonData);

    default:
      return `PILE_${pileId}`;
  }
}

/**
 * 生成二维码图片（Base64）
 */
export async function generateQRCodeImage(
  content: string,
  size: number = 300
): Promise<string> {
  try {
    const options = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000', // 二维码前景色
        light: '#FFFFFF', // 二维码背景色
      },
      errorCorrectionLevel: 'M' as const, // 错误纠正级别：L(7%) M(15%) Q(25%) H(30%)
    };

    const dataUrl = await QRCode.toDataURL(content, options);
    return dataUrl;
  } catch (error) {
    console.error('生成二维码图片失败:', error);
    throw new Error('生成二维码图片失败');
  }
}

/**
 * 生成二维码Buffer（用于文件下载）
 */
export async function generateQRCodeBuffer(
  content: string,
  size: number = 300
): Promise<Buffer> {
  try {
    const options = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M' as const,
    };

    const buffer = await QRCode.toBuffer(content, options);
    return buffer;
  } catch (error) {
    console.error('生成二维码Buffer失败:', error);
    throw new Error('生成二维码Buffer失败');
  }
}

/**
 * 生成完整的二维码数据（包含内容和图片）
 */
export async function generateQRCodeData(
  pileId: number,
  stationId?: number,
  stationName?: string,
  pileName?: string,
  options: QRCodeOptions = {}
): Promise<QRCodeData> {
  const { format = 'PILE_ID', size = 300, includeInfo = false } = options;

  // 生成二维码内容
  const qrCode = generateQRCodeContent(pileId, {
    format,
    includeInfo: includeInfo || false,
    stationId,
    stationName,
    pileName,
  } as any);

  // 生成二维码图片
  const qrCodeImage = await generateQRCodeImage(qrCode, size);

  return {
    qrCode,
    qrCodeImage,
    pileId,
    stationId,
    stationName,
    pileName,
  };
}
