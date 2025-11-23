import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Revenue extends Model {}

Revenue.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes.BIGINT, allowNull: false },
    day_date: { type: DataTypes.DATE },
    day: { type: DataTypes.DECIMAL(10,2) },
    month: { type: DataTypes.DECIMAL(10,2) },
    electricity: { type: DataTypes.DECIMAL(10,2) },
    parking_fee: { type: DataTypes.DECIMAL(10,2) },
    service_fee: { type: DataTypes.DECIMAL(10,2) },
    member: { type: DataTypes.DECIMAL(10,2) },
    mpercent: { type: DataTypes.DECIMAL(5,2) },
    percent: { type: DataTypes.DECIMAL(5,2) }
  },
  {
    sequelize,
    modelName: 'Revenue',
    tableName: 'revenue',
    timestamps: false,
  }
);

export default Revenue;
