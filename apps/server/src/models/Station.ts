import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Station extends Model {}

Station.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    city: { type: DataTypes.STRING(30) },
    fast: { type: DataTypes.INTEGER },
    slow: { type: DataTypes.INTEGER },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    now: { type: DataTypes.INTEGER },
    fault: { type: DataTypes.INTEGER },
    person: { type: DataTypes.STRING(50) },
    tel: { type: DataTypes.STRING(16) },
    longitude: { type: DataTypes.FLOAT },
    latitude: { type: DataTypes.FLOAT },
  },
  {
    sequelize,
    modelName: 'Station',
    tableName: 'station',
    timestamps: false,
  }
);

export default Station;
