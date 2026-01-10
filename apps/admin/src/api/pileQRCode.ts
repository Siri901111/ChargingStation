/**
 * 充电桩二维码API
 * 由于原文件较大，将二维码相关API单独提取
 */
import { get } from "@/utils/http";
import axios from "@/utils/axios";

// 二维码相关接口参数
export interface GetPileQRCodeParams {
  format?: 'PILE_ID' | 'number' | 'json';
  size?: number;
  includeInfo?: boolean;
}

export interface PileQRCodeData {
  qrCode: string;
  qrCodeImage: string;
  pileId: number;
  stationId: number;
  stationName: string;
  pileName: string;
  downloadUrl: string;
}

// 获取充电桩二维码数据
export function getPileQRCodeApi(id: number | string, params?: GetPileQRCodeParams) {
  return get<PileQRCodeData>(`/api/piles/${id}/qrcode`, params);
}

// 下载充电桩二维码（返回Blob）
export async function downloadPileQRCodeApi(id: number | string, size?: number, format?: string): Promise<Blob> {
  const params: any = {};
  if (size) params.size = size;
  if (format) params.format = format;
  
  const response = await axios.get(`/api/piles/${id}/qrcode/download`, {
    params,
    responseType: 'blob',
  });
  
  return response.data as Blob;
}
