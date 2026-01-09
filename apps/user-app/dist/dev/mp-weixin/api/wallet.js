"use strict";
const utils_http = require("../utils/http.js");
const walletApi = {
  /**
   * 获取余额
   */
  getBalance() {
    return utils_http.http.get("/wallet/balance");
  },
  /**
   * 获取充值套餐
   */
  getRechargePackages() {
    return utils_http.http.get("/wallet/packages");
  },
  /**
   * 充值
   */
  recharge(params) {
    return utils_http.http.post("/wallet/recharge", params);
  },
  /**
   * 获取充值记录
   */
  getRechargeRecords(params) {
    return utils_http.http.get("/wallet/records", params);
  },
  /**
   * 获取消费记录
   */
  getConsumeRecords(params) {
    return utils_http.http.get("/wallet/consume", params);
  }
};
exports.walletApi = walletApi;
