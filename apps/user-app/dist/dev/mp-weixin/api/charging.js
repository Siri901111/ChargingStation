"use strict";
const utils_http = require("../utils/http.js");
const chargingApi = {
  /**
   * 扫码获取充电桩信息
   */
  scanPile(qrCode) {
    return utils_http.http.post("/charging/scan", { qrCode });
  },
  /**
   * 开始充电
   */
  startCharging(params) {
    return utils_http.http.post("/charging/start", params);
  },
  /**
   * 停止充电
   */
  stopCharging(params) {
    return utils_http.http.post("/charging/stop", params);
  },
  /**
   * 获取当前充电状态
   */
  getChargingStatus() {
    return utils_http.http.get("/charging/status");
  },
  /**
   * 获取充电记录
   */
  getChargingHistory(params) {
    return utils_http.http.get("/charging/history", params);
  },
  /**
   * 预约充电
   */
  reserveCharging(params) {
    return utils_http.http.post("/charging/reserve", params);
  },
  /**
   * 取消预约
   */
  cancelReserve(reserveId) {
    return utils_http.http.post("/charging/reserve/cancel", { reserveId });
  }
};
exports.chargingApi = chargingApi;
