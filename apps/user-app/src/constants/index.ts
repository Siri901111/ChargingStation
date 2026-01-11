/**
 * 常量定义
 */

/** 存储 Key */
export const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USER_INFO: 'user_info',
  SEARCH_HISTORY: 'search_history',
  LOCATION: 'last_location',
} as const

/** 订单状态 - 与后端保持一致 */
export const ORDER_STATUS = {
  PENDING: 0,    // 待支付
  CHARGING: 2,   // 充电中 (后端使用2)
  COMPLETED: 3,  // 已完成 (后端使用3)
  CANCELLED: 4,  // 已取消 (后端使用4)
  REFUNDED: 5,   // 已退款 (后端使用5)
} as const

export const ORDER_STATUS_TEXT: Record<number, string> = {
  [ORDER_STATUS.PENDING]: '待支付',
  [ORDER_STATUS.CHARGING]: '充电中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款',
}

/** 充电桩状态 */
export const PILE_STATUS = {
  OFFLINE: 0,    // 离线
  FREE: 1,       // 空闲
  CHARGING: 2,   // 充电中
  FAULT: 3,      // 故障
} as const

export const PILE_STATUS_TEXT: Record<number, string> = {
  [PILE_STATUS.OFFLINE]: '离线',
  [PILE_STATUS.FREE]: '空闲',
  [PILE_STATUS.CHARGING]: '使用中',
  [PILE_STATUS.FAULT]: '故障',
}

/** 充电桩类型 */
export const PILE_TYPE = {
  FAST: 'fast',  // 快充
  SLOW: 'slow',  // 慢充
} as const

/** 支付方式 */
export const PAY_TYPE = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay',
  BALANCE: 'balance',
} as const

/** 页面路径 */
export const PAGE_PATH = {
  INDEX: '/pages/index/index',
  MAP: '/pages/map/index',
  SCAN: '/pages/scan/index',
  ORDER: '/pages/order/index',
  ORDER_DETAIL: '/pages/order/detail',
  MINE: '/pages/mine/index',
  STATION_DETAIL: '/pages/station/detail',
  CHARGING: '/pages/charging/index',
  WALLET: '/pages/wallet/index',
  RECHARGE: '/pages/wallet/recharge',
  FAVORITE: '/pages/favorite/index',
  MEMBER_CARD: '/pages/member-card/index',
  LOGIN: '/pages-sub/auth/login',
  SETTINGS: '/pages-sub/settings/index',
  PROFILE: '/pages-sub/settings/profile',
} as const
