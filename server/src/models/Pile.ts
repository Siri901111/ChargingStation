import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Pile extends Model {}

Pile.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes.BIGINT, allowNull: false },
    type: { type: DataTypes.STRING(16) },
    status: { type: DataTypes.TINYINT },
    percent: { type: DataTypes.INTEGER },
    voltage: { type: DataTypes.FLOAT },
    current: { type: DataTypes.FLOAT },
    power: { type: DataTypes.FLOAT },
    temperature: { type: DataTypes.FLOAT },
    install_date: { type: DataTypes.DATE },
  },
  {
    sequelize,
    modelName: 'Pile',
    tableName: 'pile',
    timestamps: false,
  }
);

export default Pile;
