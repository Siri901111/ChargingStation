import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Document extends Model {}

Document.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.STRING(50), allowNull: false }, // 文章类型：招商类、广告类、公告类等
    important: { type: DataTypes.STRING(20), allowNull: false }, // 重要程度：一级、二级、三级、四级
    publish: { type: DataTypes.STRING(50), allowNull: false }, // 发布渠道：站内信、公众号、小程序等
    content: { type: DataTypes.TEXT, allowNull: false }, // 富文本内容
    title: { type: DataTypes.STRING(200) }, // 文章标题（可选）
    author_id: { type: DataTypes.BIGINT }, // 作者ID（关联后台用户）
    status: { type: DataTypes.TINYINT, defaultValue: 1 }, // 状态：1草稿，2已发布，3已删除
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Document',
    tableName: 'document',
    timestamps: false,
  }
);

export default Document;

