import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Notice extends Model {}

Notice.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(128), allowNull: false },
    content: { type: DataTypes.TEXT },
    publish_time: { type: DataTypes.DATE },
    type: { type: DataTypes.STRING(32) },
    status: { type: DataTypes.TINYINT, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'Notice',
    tableName: 'notice',
    timestamps: false,
  }
);

export default Notice;
