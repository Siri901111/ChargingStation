import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class BillingTemplate extends Model {}

BillingTemplate.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes.BIGINT, allowNull: false }, // 关联充电站
    name: { type: DataTypes.STRING(100), allowNull: false }, // 模板名称
    service_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // 服务费
    parking_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // 停车费
    remarks: { type: DataTypes.TEXT }, // 备注
    time_slots: { type: DataTypes.JSON }, // 时间段配置：[{date1: "08:00:00", date2: "18:00:00", electricity: "1.5"}]
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'BillingTemplate',
    tableName: 'billing_template',
    timestamps: false,
  }
);

export default BillingTemplate;

