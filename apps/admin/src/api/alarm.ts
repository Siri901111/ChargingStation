import { get, post, put } from "@/utils/http";

// 报警列表查询参数
interface AlarmListParams {
  page?: number;
  pageSize?: number;
  stationId?: number;
  pileId?: number;
  level?: number;
  status?: number;
  startTime?: string;
  endTime?: string;
}

// 创建报警参数
interface CreateAlarmParams {
  station_id: number;
  pile_id?: number;
  level: number;
  content: string;
}

// 指派报警任务参数
interface AssignAlarmParams {
  basicInfo: {
    name: string;
    email: string;
    tel: string;
    no: string;
    urgent: boolean;
    other: string[];
    remarks?: string;
  };
  approvalInfo: {
    approvalDept: string;
    ccDept: string;
  };
  responsibleInfo: {
    person: string;
    tel: string;
  };
}

// 更新报警状态参数
interface UpdateAlarmStatusParams {
  status: number;
  handle_note?: string;
}

// 获取报警列表
export function getAlarmListApi(params?: AlarmListParams) {
  return get("/api/alarms", params);
}

// 获取报警详情
export function getAlarmDetailApi(id: number | string) {
  return get(`/api/alarms/${id}`);
}

// 创建报警记录
export function createAlarmApi(data: CreateAlarmParams) {
  return post("/api/alarms", data);
}

// 获取报警统计数据
export function getAlarmStatsApi() {
  return get("/api/alarms/stats");
}

// 指派报警任务
export function assignAlarmTaskApi(id: number | string, data: AssignAlarmParams) {
  return post(`/api/alarms/${id}/assign`, data);
}

// 催办报警任务
export function urgeAlarmTaskApi(id: number | string) {
  return post(`/api/alarms/${id}/urge`);
}

// 标记报警任务为处理异常
export function markAlarmExceptionApi(id: number | string, data: { handle_note?: string }) {
  return post(`/api/alarms/${id}/exception`, data);
}

// 完成报警任务
export function completeAlarmTaskApi(id: number | string, data: { handle_note?: string }) {
  return post(`/api/alarms/${id}/complete`, data);
}

// 更新报警处理状态
export function updateAlarmStatusApi(id: number | string, data: UpdateAlarmStatusParams) {
  return put(`/api/alarms/${id}/status`, data);
}

// 获取报警催办次数
export function getAlarmUrgeCountApi(id: number | string) {
  return get(`/api/alarms/${id}/urge-count`);
}

// 兼容旧接口名称
export const alarmListApi = getAlarmListApi;
