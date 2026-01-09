"use strict";
const utils_http = require("../utils/http.js");
const orderApi = {
  /**
   * 获取订单列表
   */
  getOrderList(params) {
    return utils_http.http.get("/order/list", params);
  },
  /**
   * 获取订单详情
   */
  getOrderDetail(orderNo) {
    return utils_http.http.get(`/order/${orderNo}`);
  },
  /**
   * 支付订单
   */
  payOrder(params) {
    return utils_http.http.post("/order/pay", params);
  },
  /**
   * 取消订单
   */
  cancelOrder(orderNo) {
    return utils_http.http.post(`/order/${orderNo}/cancel`);
  },
  /**
   * 申请退款
   */
  refundOrder(orderNo, reason) {
    return utils_http.http.post(`/order/${orderNo}/refund`, { reason });
  },
  /**
   * 获取订单统计
   */
  getOrderStatistics() {
    return utils_http.http.get("/order/statistics");
  },
  /**
   * 开具发票
   */
  createInvoice(params) {
    return utils_http.http.post("/order/invoice", params);
  }
};
exports.orderApi = orderApi;
