"use strict";
const utils_http = require("../utils/http.js");
const userApi = {
  /**
   * 发送验证码
   */
  sendCode(params) {
    return utils_http.http.post("/user/sendCode", params);
  },
  /**
   * 手机号登录
   */
  loginByPhone(params) {
    return utils_http.http.post("/user/loginByPhone", params);
  },
  /**
   * 微信登录
   */
  loginByWechat(params) {
    return utils_http.http.post("/user/loginByWechat", params);
  },
  /**
   * 绑定手机号
   */
  bindPhone(params) {
    return utils_http.http.post("/user/bindPhone", params);
  },
  /**
   * 获取用户信息
   */
  getUserInfo() {
    return utils_http.http.get("/user/info");
  },
  /**
   * 更新用户信息
   */
  updateUserInfo(params) {
    return utils_http.http.put("/user/info", params);
  },
  /**
   * 获取余额
   */
  getBalance() {
    return utils_http.http.get("/user/balance");
  }
};
exports.userApi = userApi;
