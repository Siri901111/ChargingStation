import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Role extends Model {}

Role.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(32), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'role',
    timestamps: false,
  }
);

export default Role;
