import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Order extends Model {}

Order.init(
  {
    order_no: { type: DataTypes.STRING(64), primaryKey: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    equipment_no: { type: DataTypes.STRING(64) },
    station_id: { type: DataTypes.BIGINT },
    date: { type: DataTypes.DATE },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    money: { type: DataTypes.DECIMAL(10, 2) },
    pay: { type: DataTypes.STRING(20) },
    status: { type: DataTypes.TINYINT },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'order',
    timestamps: false,
  }
);

export default Order;
