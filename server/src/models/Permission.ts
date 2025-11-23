import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Permission extends Model {}

Permission.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(64), allowNull: false },
    type: { type: DataTypes.STRING(16) }, // menu/button
  },
  {
    sequelize,
    modelName: 'Permission',
    tableName: 'permission',
    timestamps: false,
  }
);

export default Permission;
