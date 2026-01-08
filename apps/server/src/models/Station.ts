import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Station extends Model {}

Station.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    city: { type: DataTypes.STRING(30) },
    address: { type: DataTypes.STRING(200) }, // 详细地址
    fast: { type: DataTypes.INTEGER }, // 快充桩数量
    slow: { type: DataTypes.INTEGER }, // 慢充桩数量
    status: { type: DataTypes.TINYINT, defaultValue: 1 }, // 1正常 0关闭
    now: { type: DataTypes.INTEGER }, // 当前使用中的桩数
    fault: { type: DataTypes.INTEGER }, // 故障桩数
    person: { type: DataTypes.STRING(50) }, // 负责人
    tel: { type: DataTypes.STRING(16) }, // 联系电话
    longitude: { type: DataTypes.FLOAT }, // 经度
    latitude: { type: DataTypes.FLOAT }, // 纬度
  },
  {
    sequelize,
    modelName: 'Station',
    tableName: 'station',
    timestamps: false,
  }
);

export default Station;
