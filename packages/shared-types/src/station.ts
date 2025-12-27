/**
 * 充电站相关类型定义
 */

/** 充电站信息 */
export interface Station {
  id: string;
  name: string;
  city: string;
  fastChargers: number;
  slowChargers: number;
  status: StationStatus;
  currentPower: string;
  faultCount: number;
  manager: string;
  phone: string;
}

/** 充电站状态 */
export type StationStatus = 0 | 1 | 2; // 0: 离线, 1: 正常, 2: 故障

/** 充电桩信息 */
export interface Charger {
  id: string;
  stationId: string;
  type: 'fast' | 'slow';
  status: ChargerStatus;
  power: number;
  voltage: number;
  current: number;
}

/** 充电桩状态 */
export type ChargerStatus = 'idle' | 'charging' | 'fault' | 'offline';
