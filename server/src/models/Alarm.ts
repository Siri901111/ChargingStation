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
  },
  {
    sequelize,
    modelName: 'Alarm',
    tableName: 'alarm',
    timestamps: false,
  }
);

export default Alarm;
