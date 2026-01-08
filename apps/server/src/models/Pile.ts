import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Pile extends Model {}

Pile.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes.BIGINT, allowNull: false },
    name: { type: DataTypes.STRING(50) }, // 充电桩名称
    type: { type: DataTypes.STRING(16) }, // 快充/慢充
    status: { type: DataTypes.TINYINT }, // 1空闲 2充电中 3故障 0离线
    percent: { type: DataTypes.INTEGER },
    voltage: { type: DataTypes.FLOAT },
    current: { type: DataTypes.FLOAT },
    power: { type: DataTypes.FLOAT }, // 功率 kW
    price: { type: DataTypes.DECIMAL(10, 2) }, // 价格 元/度
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
