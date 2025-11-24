import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    account: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(256), allowNull: false },
    name: { type: DataTypes.STRING(32), allowNull: false },
    phone: { type: DataTypes.STRING(16) },
    id_no: { type: DataTypes.STRING(24) },
    position: { type: DataTypes.STRING(32) },
    department: { type: DataTypes.STRING(32) },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    page_authority: { type: DataTypes.STRING(512) },
    btn_authority: { type: DataTypes.STRING(512) },
    role_id: { type: DataTypes.BIGINT },
    address: { type: DataTypes.STRING(200) }, // 地址
    tags: { type: DataTypes.JSON }, // 个人标签（数组）
    work_status: { type: DataTypes.TINYINT, defaultValue: 1 }, // 在职状态：1工作中，2请假中，3出差中，4年假中
    avatar: { type: DataTypes.STRING(500) }, // 头像URL
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false,
  }
);

export default User;
