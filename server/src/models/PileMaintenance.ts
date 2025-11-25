import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class PileMaintenance extends Model {}

PileMaintenance.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    pile_id: { type: DataTypes.BIGINT, allowNull: false }, // 充电桩ID
    maintenance_type: { type: DataTypes.STRING(50) }, // 维保类型：日常维护、故障维修、定期检查
    maintenance_person: { type: DataTypes.STRING(50) }, // 维保人员
    maintenance_time: { type: DataTypes.DATE }, // 维保时间
    maintenance_content: { type: DataTypes.TEXT }, // 维保内容
    maintenance_cost: { type: DataTypes.DECIMAL(10, 2) }, // 维保费用
    next_maintenance_time: { type: DataTypes.DATE }, // 下次维保时间
    status: { type: DataTypes.TINYINT, defaultValue: 1 }, // 状态：1已完成，2进行中，3已计划
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'PileMaintenance',
    tableName: 'pile_maintenance',
    timestamps: false,
  }
);

export default PileMaintenance;

