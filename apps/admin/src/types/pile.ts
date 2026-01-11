// 充电桩类型定义
export interface PileType {
  id: number;
  stationId: number;
  stationName?: string;
  city?: string;
  type: string; // 快充、慢充
  status: number; // 1空闲，2充电中，3连接中，4排队中，5已预约，6故障/离线
  percent?: number;
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  installDate?: string;
}

// 充电桩列表查询参数
export interface PileListParams {
  page?: number;
  pageSize?: number;
  stationId?: number;
  status?: number;
  type?: string;
  keyword?: string;
}
