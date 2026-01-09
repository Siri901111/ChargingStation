import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

// 充电用户模型（区别于后台管理用户）
class ChargingUser extends Model {}

ChargingUser.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    phone: { type: DataTypes.STRING(16), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(32) },
    avatar: { type: DataTypes.STRING(255) },  // 头像URL
    gender: { type: DataTypes.TINYINT, defaultValue: 0 },  // 性别：0未知 1男 2女
    birthday: { type: DataTypes.DATEONLY },  // 生日
    id_no: { type: DataTypes.STRING(24) },
    member_card_no: { type: DataTypes.STRING(32) }, // 会员卡号（业务层保证唯一性）
    card_type: { type: DataTypes.STRING(20), defaultValue: '普通卡' }, // 卡类型：普通卡、VIP卡、季卡
    balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // 余额
    issue_date: { type: DataTypes.DATE }, // 开卡日期
    valid_until: { type: DataTypes.DATE }, // 有效期至
    status: { type: DataTypes.TINYINT, defaultValue: 1 }, // 1正常 0禁用
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'ChargingUser',
    tableName: 'charging_user',
    timestamps: false,
  }
);

export default ChargingUser;
