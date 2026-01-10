import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * 充值记录模型
 */
class RechargeRecord extends Model {}

RechargeRecord.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false, comment: '用户ID（充电用户）' },
    order_no: { type: DataTypes.STRING(64), allowNull: false, unique: true, comment: '充值订单号' },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, comment: '充值金额（支付金额）' },
    actual_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, comment: '实际到账金额' },
    gift_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, comment: '赠送金额' },
    member_discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, comment: '会员折扣金额' },
    package_id: { type: DataTypes.INTEGER, comment: '充值套餐ID' },
    pay_type: { type: DataTypes.STRING(20), comment: '支付方式：wechat/alipay/test' },
    status: { type: DataTypes.TINYINT, defaultValue: 1, comment: '状态：1成功 0失败' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, comment: '创建时间' },
  },
  {
    sequelize,
    modelName: 'RechargeRecord',
    tableName: 'recharge_record',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_user_id',
      },
      {
        fields: ['order_no'],
        name: 'idx_order_no',
      },
      {
        fields: ['created_at'],
        name: 'idx_created_at',
      },
    ],
  }
);

export default RechargeRecord;
