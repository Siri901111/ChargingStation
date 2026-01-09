import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * 用户收藏站点模型
 */
class UserFavorite extends Model {}

UserFavorite.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false, comment: '用户ID（充电用户）' },
    station_id: { type: DataTypes.BIGINT, allowNull: false, comment: '站点ID' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, comment: '收藏时间' },
  },
  {
    sequelize,
    modelName: 'UserFavorite',
    tableName: 'user_favorite',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'station_id'],
        name: 'uk_user_station',
      },
      {
        fields: ['user_id'],
        name: 'idx_user_id',
      },
      {
        fields: ['station_id'],
        name: 'idx_station_id',
      },
    ],
  }
);

export default UserFavorite;
