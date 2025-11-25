import User from './User.js';
import ChargingUser from './ChargingUser.js';
import Station from './Station.js';
import Pile from './Pile.js';
import Order from './Order.js';
import Revenue from './Revenue.js';
import Alarm from './Alarm.js';
import Notice from './Notice.js';
import Role from './Role.js';
import Permission from './Permission.js';
import BillingTemplate from './BillingTemplate.js';
import Document from './Document.js';
import PileMaintenance from './PileMaintenance.js';

// ==================== 模型关联关系设置 ====================

// Station (充电站) 关联关系
// 一个充电站有多个充电桩
Station.hasMany(Pile, {
  foreignKey: 'station_id',
  as: 'piles'
});
Pile.belongsTo(Station, {
  foreignKey: 'station_id',
  as: 'station'
});

// 一个充电站有多个订单
Station.hasMany(Order, {
  foreignKey: 'station_id',
  as: 'orders'
});
Order.belongsTo(Station, {
  foreignKey: 'station_id',
  as: 'station'
});

// 一个充电站有多条营收记录
Station.hasMany(Revenue, {
  foreignKey: 'station_id',
  as: 'revenues'
});
Revenue.belongsTo(Station, {
  foreignKey: 'station_id',
  as: 'station'
});

// 一个充电站有多个报警
Station.hasMany(Alarm, {
  foreignKey: 'station_id',
  as: 'alarms'
});
Alarm.belongsTo(Station, {
  foreignKey: 'station_id',
  as: 'station'
});

// 一个充电站有一个计费模板
Station.hasOne(BillingTemplate, {
  foreignKey: 'station_id',
  as: 'billingTemplate'
});
BillingTemplate.belongsTo(Station, {
  foreignKey: 'station_id',
  as: 'station'
});

// Pile (充电桩) 关联关系
// 一个充电桩有多个报警
Pile.hasMany(Alarm, {
  foreignKey: 'pile_id',
  as: 'alarms'
});
Alarm.belongsTo(Pile, {
  foreignKey: 'pile_id',
  as: 'pile'
});

// 一个充电桩有多个维保记录
Pile.hasMany(PileMaintenance, {
  foreignKey: 'pile_id',
  as: 'maintenances'
});
PileMaintenance.belongsTo(Pile, {
  foreignKey: 'pile_id',
  as: 'pile'
});

// ChargingUser (充电用户) 关联关系
// 一个充电用户有多个订单
ChargingUser.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders'
});
Order.belongsTo(ChargingUser, {
  foreignKey: 'user_id',
  as: 'chargingUser'
});

// User (后台管理用户) 关联关系
// 后台管理用户与角色的关联

// 用户和角色的关联
User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});
Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users'
});

// User (后台管理用户) 与 Document (招商文章) 关联关系
// 一个用户可以创建多篇文章
User.hasMany(Document, {
  foreignKey: 'author_id',
  as: 'documents'
});
Document.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author'
});

// ==================== 导出模型 ====================
export {
  User,
  ChargingUser,
  Station,
  Pile,
  Order,
  Revenue,
  Alarm,
  Notice,
  Role,
  Permission,
  BillingTemplate,
  Document,
  PileMaintenance
};
