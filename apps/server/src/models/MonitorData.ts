import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * 监控数据模型 - 存储前端上报的所有监控数据
 */
class MonitorData extends Model {}

MonitorData.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    // 上报数据的唯一ID
    report_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '上报数据唯一ID'
    },
    // 应用ID
    app_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '应用ID'
    },
    // 用户ID
    user_id: {
      type: DataTypes.STRING(64),
      comment: '用户ID'
    },
    // 上报类型
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '上报类型：js_error, promise_error, resource_error, http_error, vue_error, performance, page_view, click, route_change, http_request, session_start, session_end等'
    },
    // 上报类别（用于分类查询）
    category: {
      type: DataTypes.ENUM('error', 'performance', 'behavior', 'network', 'session'),
      allowNull: false,
      comment: '数据类别'
    },
    // 时间戳
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '上报时间戳'
    },
    // 页面URL
    page_url: {
      type: DataTypes.STRING(1000),
      comment: '页面URL'
    },
    // 页面路径（规范化后的路径，用于展示）
    page_path: {
      type: DataTypes.STRING(500),
      comment: '页面路径（规范化后的路径）'
    },
    // 页面标题
    page_title: {
      type: DataTypes.STRING(200),
      comment: '页面标题'
    },
    // 用户显示名称（从extra、session_info等提取）
    user_display_name: {
      type: DataTypes.STRING(100),
      comment: '用户显示名称（从extra等提取）'
    },
    // 平台类型（web、uniapp等）
    platform: {
      type: DataTypes.STRING(20),
      comment: '平台类型（web、uniapp等）'
    },
    // 环境标识（h5、mp-weixin等）
    env: {
      type: DataTypes.STRING(20),
      comment: '环境标识（h5、mp-weixin等）'
    },
    // 设备信息 (JSON)
    device_info: {
      type: DataTypes.JSON,
      comment: '设备信息：浏览器、操作系统、设备类型等'
    },
    // 环境信息 (JSON)
    environment_info: {
      type: DataTypes.JSON,
      comment: '环境信息：屏幕、网络、语言等'
    },
    // 会话信息 (JSON)
    session_info: {
      type: DataTypes.JSON,
      comment: '会话信息：会话ID、访客ID等'
    },
    // 核心数据 (JSON) - 存储不同类型的具体数据
    data: {
      type: DataTypes.JSON,
      comment: '核心上报数据，根据type不同存储不同结构'
    },
    // 额外数据 (JSON)
    extra: {
      type: DataTypes.JSON,
      comment: '额外自定义数据'
    },
    // IP地址
    ip_address: {
      type: DataTypes.STRING(45),
      comment: '客户端IP地址'
    },
    // User Agent
    user_agent: {
      type: DataTypes.STRING(500),
      comment: 'User Agent'
    },
    // 创建时间
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  },
  {
    sequelize,
    modelName: 'MonitorData',
    tableName: 'monitor_data',
    timestamps: false,
    indexes: [
      { fields: ['app_id'] },
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['timestamp'] },
      { fields: ['created_at'] },
      { fields: ['user_id'] },
      { fields: ['page_path'] },
      { fields: ['platform'] },
      { fields: ['user_display_name'] },
    ]
  }
);

export default MonitorData;
