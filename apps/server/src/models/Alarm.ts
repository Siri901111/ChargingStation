import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Alarm extends Model {}

Alarm.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes.BIGINT },
    pile_id: { type: DataTypes.BIGINT },
    title: { type: DataTypes.STRING(120) },
    detail: { type: DataTypes.STRING(255) },
    fault_time: { type: DataTypes.DATE },
    level: { type: DataTypes.TINYINT },
    status: { type: DataTypes.TINYINT, defaultValue: 1 }, // 处理状态：1待指派，2处理中，3已处理，4处理异常
    handler: { type: DataTypes.STRING(50), allowNull: true }, // 处理人员
    handle_time: { type: DataTypes.DATE, allowNull: true }, // 处理时间
    handle_note: { type: DataTypes.TEXT, allowNull: true }, // 处理备注
    urge_count: { type: DataTypes.INTEGER, defaultValue: 0 }, // 催办次数
    last_urge_time: { type: DataTypes.DATE, allowNull: true }, // 最后催办时间
  },
  {
    sequelize,
    modelName: 'Alarm',
    tableName: 'alarm',
    timestamps: false,
  }
);

export default Alarm;
