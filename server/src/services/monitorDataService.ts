import { MonitorData, User } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/db.js';

// 设置 MonitorData 与 User 的关联关系
MonitorData.belongsTo(User, {
  foreignKey: 'user_id',
  targetKey: 'id',
  as: 'user'
});

/**
 * 监控数据类别映射
 */
const TYPE_CATEGORY_MAP: Record<string, string> = {
  // 错误类型
  'js_error': 'error',
  'promise_error': 'error',
  'resource_error': 'error',
  'http_error': 'error',
  'vue_error': 'error',
  'console_error': 'error',
  // 性能类型
  'performance': 'performance',
  'resource_timing': 'performance',
  'long_task': 'performance',
  'first_paint': 'performance',
  'first_contentful_paint': 'performance',
  'largest_contentful_paint': 'performance',
  'first_input_delay': 'performance',
  'cumulative_layout_shift': 'performance',
  'time_to_first_byte': 'performance',
  'interaction_to_next_paint': 'performance',
  // 行为类型
  'page_view': 'behavior',
  'page_leave': 'behavior',
  'click': 'behavior',
  'route_change': 'behavior',
  'custom_event': 'behavior',
  'behavior_stack': 'behavior',
  // 网络类型
  'http_request': 'network',
  // 会话类型
  'session_start': 'session',
  'session_end': 'session',
};

/**
 * 获取类型对应的类别
 */
function getCategory(type: string): string {
  return TYPE_CATEGORY_MAP[type] || 'behavior';
}

/**
 * 批量保存监控数据
 */
export async function saveMonitorData(dataList: any[], clientInfo: { ip?: string; userAgent?: string }) {
  const records = dataList.map(item => ({
    report_id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    app_id: item.appId || 'unknown',
    user_id: item.userId || null,
    type: item.type,
    category: getCategory(item.type),
    timestamp: item.timestamp || Date.now(),
    page_url: item.pageUrl || null,
    page_title: item.pageTitle || null,
    device_info: item.deviceInfo || null,
    environment_info: item.environmentInfo || null,
    session_info: item.sessionInfo || null,
    data: extractCoreData(item),
    extra: item.extra || null,
    ip_address: clientInfo.ip || null,
    user_agent: clientInfo.userAgent || null,
  }));

  return MonitorData.bulkCreate(records);
}

/**
 * 提取核心数据（去除公共字段）
 */
function extractCoreData(item: any): any {
  const { id, appId, userId, timestamp, pageUrl, pageTitle, deviceInfo, environmentInfo, sessionInfo, extra, ...coreData } = item;
  return coreData;
}

/**
 * 查询监控数据列表
 */
export async function getMonitorDataList(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  type?: string;
  appId?: string;
  startTime?: number;
  endTime?: number;
}) {
  const { page = 1, pageSize = 20, category, type, appId, startTime, endTime } = params;

  const where: any = {};

  if (category) {
    where.category = category;
  }
  if (type) {
    where.type = type;
  }
  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op.between]: [startTime, endTime]
    };
  } else if (startTime) {
    where.timestamp = {
      [Op.gte]: startTime
    };
  } else if (endTime) {
    where.timestamp = {
      [Op.lte]: endTime
    };
  }

  const { count, rows } = await MonitorData.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'account'],
      required: false
    }]
  });

  // 处理返回数据，添加 user_name 字段
  const list = rows.map((row: any) => {
    const item = row.toJSON();
    item.user_name = item.user?.name || null;
    delete item.user;
    return item;
  });

  return {
    list,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}

/**
 * 获取错误列表
 */
export async function getErrorList(params: {
  page?: number;
  pageSize?: number;
  type?: string;
  startTime?: number;
  endTime?: number;
}) {
  return getMonitorDataList({
    ...params,
    category: 'error'
  });
}

/**
 * 获取性能数据列表
 */
export async function getPerformanceList(params: {
  page?: number;
  pageSize?: number;
  type?: string;
  startTime?: number;
  endTime?: number;
}) {
  return getMonitorDataList({
    ...params,
    category: 'performance'
  });
}

/**
 * 获取行为数据列表
 */
export async function getBehaviorList(params: {
  page?: number;
  pageSize?: number;
  type?: string;
  startTime?: number;
  endTime?: number;
}) {
  return getMonitorDataList({
    ...params,
    category: 'behavior'
  });
}

/**
 * 获取网络请求列表
 */
export async function getNetworkList(params: {
  page?: number;
  pageSize?: number;
  startTime?: number;
  endTime?: number;
}) {
  return getMonitorDataList({
    ...params,
    category: 'network'
  });
}

/**
 * 获取统计概览数据
 */
export async function getOverviewStats(params: {
  startTime?: number;
  endTime?: number;
  appId?: string;
}) {
  const { startTime, endTime, appId } = params;

  const where: any = {};
  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op.between]: [startTime, endTime]
    };
  }

  // 按类别统计数量
  const categoryStats = await MonitorData.findAll({
    where,
    attributes: [
      'category',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['category'],
    raw: true
  }) as any[];

  // 按类型统计数量
  const typeStats = await MonitorData.findAll({
    where,
    attributes: [
      'type',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['type'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
    raw: true
  }) as any[];

  // 总数
  const total = await MonitorData.count({ where });

  // 错误数
  const errorCount = await MonitorData.count({
    where: { ...where, category: 'error' }
  });

  // 今日数据量
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await MonitorData.count({
    where: {
      ...where,
      created_at: {
        [Op.gte]: today
      }
    }
  });

  // UV（独立访客数）
  const uvResult = await MonitorData.findAll({
    where,
    attributes: [[fn('COUNT', fn('DISTINCT', col('user_id'))), 'uv']],
    raw: true
  }) as any[];
  const uv = uvResult[0]?.uv || 0;

  // PV（页面访问数）
  const pv = await MonitorData.count({
    where: { ...where, type: 'page_view' }
  });

  return {
    total,
    errorCount,
    todayCount,
    uv,
    pv,
    categoryStats: categoryStats.reduce((acc: any, item: any) => {
      acc[item.category] = parseInt(item.count);
      return acc;
    }, {}),
    typeStats: typeStats.map((item: any) => ({
      type: item.type,
      count: parseInt(item.count)
    }))
  };
}

/**
 * 获取趋势数据（按小时/天分组）
 */
export async function getTrendData(params: {
  startTime: number;
  endTime: number;
  groupBy?: 'hour' | 'day';
  category?: string;
  appId?: string;
}) {
  const { startTime, endTime, groupBy = 'hour', category, appId } = params;

  const where: any = {
    timestamp: {
      [Op.between]: [startTime, endTime]
    }
  };

  if (category) {
    where.category = category;
  }
  if (appId) {
    where.app_id = appId;
  }

  const dateFormat = groupBy === 'hour'
    ? '%Y-%m-%d %H:00:00'
    : '%Y-%m-%d';

  const result = await MonitorData.findAll({
    where,
    attributes: [
      [fn('DATE_FORMAT', fn('FROM_UNIXTIME', literal('timestamp / 1000')), dateFormat), 'time'],
      [fn('COUNT', col('id')), 'count']
    ],
    group: [literal('time')],
    order: [[literal('time'), 'ASC']],
    raw: true
  }) as any[];

  return result.map((item: any) => ({
    time: item.time,
    count: parseInt(item.count)
  }));
}

/**
 * 获取性能指标统计
 */
export async function getPerformanceMetrics(params: {
  startTime?: number;
  endTime?: number;
  appId?: string;
}) {
  const { startTime, endTime, appId } = params;

  const where: any = {
    type: 'performance'
  };

  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op.between]: [startTime, endTime]
    };
  }

  const performanceData = await MonitorData.findAll({
    where,
    attributes: ['data'],
    order: [['created_at', 'DESC']],
    limit: 100,
    raw: true
  }) as any[];

  if (performanceData.length === 0) {
    return {
      avgFCP: 0,
      avgLCP: 0,
      avgTTFB: 0,
      avgFID: 0,
      avgCLS: 0,
      avgLoadComplete: 0,
      sampleCount: 0
    };
  }

  // 计算平均值
  let fcpSum = 0, lcpSum = 0, ttfbSum = 0, fidSum = 0, clsSum = 0, loadSum = 0;
  let fcpCount = 0, lcpCount = 0, ttfbCount = 0, fidCount = 0, clsCount = 0, loadCount = 0;

  performanceData.forEach((item: any) => {
    const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    if (data.firstContentfulPaint) { fcpSum += data.firstContentfulPaint; fcpCount++; }
    if (data.largestContentfulPaint) { lcpSum += data.largestContentfulPaint; lcpCount++; }
    if (data.timeToFirstByte) { ttfbSum += data.timeToFirstByte; ttfbCount++; }
    if (data.firstInputDelay) { fidSum += data.firstInputDelay; fidCount++; }
    if (data.cumulativeLayoutShift) { clsSum += data.cumulativeLayoutShift; clsCount++; }
    if (data.loadComplete) { loadSum += data.loadComplete; loadCount++; }
  });

  return {
    avgFCP: fcpCount > 0 ? Math.round(fcpSum / fcpCount) : 0,
    avgLCP: lcpCount > 0 ? Math.round(lcpSum / lcpCount) : 0,
    avgTTFB: ttfbCount > 0 ? Math.round(ttfbSum / ttfbCount) : 0,
    avgFID: fidCount > 0 ? Math.round(fidSum / fidCount) : 0,
    avgCLS: clsCount > 0 ? (clsSum / clsCount).toFixed(3) : 0,
    avgLoadComplete: loadCount > 0 ? Math.round(loadSum / loadCount) : 0,
    sampleCount: performanceData.length
  };
}

/**
 * 获取错误统计
 */
export async function getErrorStats(params: {
  startTime?: number;
  endTime?: number;
  appId?: string;
}) {
  const { startTime, endTime, appId } = params;

  const where: any = {
    category: 'error'
  };

  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op.between]: [startTime, endTime]
    };
  }

  // 按错误类型分组统计
  const typeStats = await MonitorData.findAll({
    where,
    attributes: [
      'type',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['type'],
    order: [[literal('count'), 'DESC']],
    raw: true
  }) as any[];

  // 按页面分组统计
  const pageStats = await MonitorData.findAll({
    where,
    attributes: [
      'page_url',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['page_url'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
    raw: true
  }) as any[];

  const total = await MonitorData.count({ where });

  return {
    total,
    byType: typeStats.map((item: any) => ({
      type: item.type,
      count: parseInt(item.count)
    })),
    byPage: pageStats.map((item: any) => ({
      page: item.page_url,
      count: parseInt(item.count)
    }))
  };
}

/**
 * 获取用户行为统计
 */
export async function getBehaviorStats(params: {
  startTime?: number;
  endTime?: number;
  appId?: string;
}) {
  const { startTime, endTime, appId } = params;

  const where: any = {
    category: 'behavior'
  };

  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op.between]: [startTime, endTime]
    };
  }

  // 页面访问排行
  const pageViewStats = await MonitorData.findAll({
    where: { ...where, type: 'page_view' },
    attributes: [
      'page_url',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['page_url'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
    raw: true
  }) as any[];

  // 总PV
  const pv = await MonitorData.count({
    where: { ...where, type: 'page_view' }
  });

  // 总UV
  const uvResult = await MonitorData.findAll({
    where,
    attributes: [[fn('COUNT', fn('DISTINCT', col('user_id'))), 'uv']],
    raw: true
  }) as any[];
  const uv = uvResult[0]?.uv || 0;

  // 点击事件数
  const clickCount = await MonitorData.count({
    where: { ...where, type: 'click' }
  });

  // 路由切换数
  const routeChangeCount = await MonitorData.count({
    where: { ...where, type: 'route_change' }
  });

  return {
    pv,
    uv,
    clickCount,
    routeChangeCount,
    topPages: pageViewStats.map((item: any) => ({
      page: item.page_url,
      count: parseInt(item.count)
    }))
  };
}

/**
 * 删除监控数据
 */
export async function deleteMonitorData(ids: number[]) {
  return MonitorData.destroy({
    where: {
      id: {
        [Op.in]: ids
      }
    }
  });
}

/**
 * 清理过期数据
 */
export async function cleanOldData(daysToKeep: number = 30) {
  const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

  return MonitorData.destroy({
    where: {
      timestamp: {
        [Op.lt]: cutoffTime
      }
    }
  });
}

/**
 * 根据用户名追踪用户行为
 */
export async function getUserTrackingData(params: {
  userName: string;
  page?: number;
  pageSize?: number;
  startTime?: number;
  endTime?: number;
  category?: string;
}) {
  const { userName, page = 1, pageSize = 20, startTime, endTime, category } = params;

  // 先根据用户名查找用户ID
  const user = await User.findOne({
    where: {
      name: userName
    }
  });

  if (!user) {
    return {
      list: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
      userInfo: null,
      stats: null
    };
  }

  const userId = (user as any).id;
  // user_id 在 MonitorData 表中是字符串类型，需要转换
  const userIdStr = String(userId);

  const where: any = {
    user_id: userIdStr
  };

  if (startTime && endTime) {
    where.timestamp = {
      [Op.between]: [startTime, endTime]
    };
  } else if (startTime) {
    where.timestamp = { [Op.gte]: startTime };
  } else if (endTime) {
    where.timestamp = { [Op.lte]: endTime };
  }

  if (category) {
    where.category = category;
  }

  // 获取用户行为列表
  const { count, rows } = await MonitorData.findAndCountAll({
    where,
    order: [['timestamp', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize
  });

  const list = rows.map((row: any) => {
    const item = row.toJSON();
    item.user_name = (user as any).name;
    return item;
  });

  // 获取用户行为统计
  const behaviorStats = await MonitorData.findAll({
    where: { user_id: userIdStr },
    attributes: [
      'type',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['type'],
    raw: true
  }) as any[];

  // 获取用户访问的页面统计
  const pageStats = await MonitorData.findAll({
    where: { user_id: userIdStr, type: 'page_view' },
    attributes: [
      'page_url',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['page_url'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
    raw: true
  }) as any[];

  // 获取用户首次访问和最后访问时间
  const timeRange = await MonitorData.findOne({
    where: { user_id: userIdStr },
    attributes: [
      [fn('MIN', col('timestamp')), 'firstVisit'],
      [fn('MAX', col('timestamp')), 'lastVisit']
    ],
    raw: true
  }) as any;

  // 总行为数
  const totalBehaviors = await MonitorData.count({ where: { user_id: userIdStr } });

  return {
    list,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
    userInfo: {
      id: userId,
      name: (user as any).name,
      account: (user as any).account
    },
    stats: {
      totalBehaviors,
      firstVisit: timeRange?.firstVisit || null,
      lastVisit: timeRange?.lastVisit || null,
      behaviorTypes: behaviorStats.map((item: any) => ({
        type: item.type,
        count: parseInt(item.count)
      })),
      topPages: pageStats.map((item: any) => ({
        page: item.page_url,
        count: parseInt(item.count)
      }))
    }
  };
}

/**
 * 获取所有有行为记录的用户列表
 */
export async function getActiveUsers(params: {
  startTime?: number;
  endTime?: number;
}) {
  const { startTime, endTime } = params;

  const where: any = {};

  if (startTime && endTime) {
    where.timestamp = {
      [Op.between]: [startTime, endTime]
    };
  }

  // 获取有监控数据的用户ID列表
  const userIds = await MonitorData.findAll({
    where: {
      ...where,
      user_id: {
        [Op.ne]: null
      }
    },
    attributes: [
      'user_id',
      [fn('COUNT', col('id')), 'behaviorCount']
    ],
    group: ['user_id'],
    order: [[literal('behaviorCount'), 'DESC']],
    raw: true
  }) as any[];

  if (userIds.length === 0) {
    return [];
  }

  // 获取用户信息
  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: userIds.map((item: any) => item.user_id)
      }
    },
    attributes: ['id', 'name', 'account'],
    raw: true
  }) as any[];

  // 合并用户信息和行为统计
  return userIds.map((item: any) => {
    const user = users.find((u: any) => u.id === item.user_id);
    return {
      userId: item.user_id,
      userName: user?.name || '未知用户',
      account: user?.account || '',
      behaviorCount: parseInt(item.behaviorCount)
    };
  });
}
