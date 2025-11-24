import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

// 充电用户模型（区别于后台管理用户）
class ChargingUser extends Model {}

ChargingUser.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    phone: { type: DataTypes.STRING(16), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(32) },
    id_no: { type: DataTypes.STRING(24) },
    member_card_no: { type: DataTypes.STRING(32) }, // 会员卡号
    balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // 余额
    status: { type: DataTypes.TINYINT, defaultValue: 1 }, // 1正常 2禁用
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'ChargingUser',
    tableName: 'charging_user',
    timestamps: false,
  }
);

export default ChargingUser;
