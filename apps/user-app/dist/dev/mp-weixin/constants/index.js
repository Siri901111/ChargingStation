"use strict";
const STORAGE_KEYS = {
  TOKEN: "user_token",
  USER_INFO: "user_info",
  SEARCH_HISTORY: "search_history",
  LOCATION: "last_location"
};
const ORDER_STATUS = {
  PENDING: 0,
  // 待支付
  CHARGING: 1,
  // 充电中
  COMPLETED: 2,
  // 已完成
  CANCELLED: 3,
  // 已取消
  REFUNDED: 4
  // 已退款
};
const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: "待支付",
  [ORDER_STATUS.CHARGING]: "充电中",
  [ORDER_STATUS.COMPLETED]: "已完成",
  [ORDER_STATUS.CANCELLED]: "已取消",
  [ORDER_STATUS.REFUNDED]: "已退款"
};
const PILE_STATUS = {
  OFFLINE: 0,
  // 离线
  FREE: 1,
  // 空闲
  CHARGING: 2,
  // 充电中
  FAULT: 3
  // 故障
};
const PILE_STATUS_TEXT = {
  [PILE_STATUS.OFFLINE]: "离线",
  [PILE_STATUS.FREE]: "空闲",
  [PILE_STATUS.CHARGING]: "使用中",
  [PILE_STATUS.FAULT]: "故障"
};
const PAGE_PATH = {
  INDEX: "/pages/index/index",
  MAP: "/pages/map/index",
  SCAN: "/pages/scan/index",
  ORDER: "/pages/order/index",
  ORDER_DETAIL: "/pages/order/detail",
  MINE: "/pages/mine/index",
  STATION_DETAIL: "/pages/station/detail",
  CHARGING: "/pages/charging/index",
  WALLET: "/pages/wallet/index",
  RECHARGE: "/pages/wallet/recharge",
  LOGIN: "/pages-sub/auth/login",
  SETTINGS: "/pages-sub/settings/index"
};
exports.ORDER_STATUS = ORDER_STATUS;
exports.ORDER_STATUS_TEXT = ORDER_STATUS_TEXT;
exports.PAGE_PATH = PAGE_PATH;
exports.PILE_STATUS = PILE_STATUS;
exports.PILE_STATUS_TEXT = PILE_STATUS_TEXT;
exports.STORAGE_KEYS = STORAGE_KEYS;
