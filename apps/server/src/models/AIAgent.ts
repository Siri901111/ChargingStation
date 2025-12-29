import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

// AI智能体主表
class AIAgent extends Model {}

AIAgent.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, comment: '智能体名称' },
    description: { type: DataTypes.TEXT, comment: '智能体描述' },
    type: {
      type: DataTypes.ENUM('chat', 'workflow', 'multi-agent'),
      defaultValue: 'chat',
      comment: '智能体类型：对话型、工作流型、多Agent'
    },
    avatar: { type: DataTypes.STRING(500), comment: '头像URL' },
    system_prompt: { type: DataTypes.TEXT, comment: '系统提示词' },
    welcome_message: { type: DataTypes.STRING(500), comment: '欢迎语' },
    suggested_questions: { type: DataTypes.JSON, comment: '推荐问题列表' },

    // 模型配置
    model_config: {
      type: DataTypes.JSON,
      comment: '模型配置：model, temperature, topP, maxTokens, contextLength'
    },

    // MCP配置
    mcp_enabled: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'MCP是否启用' },
    mcp_servers: { type: DataTypes.JSON, comment: 'MCP服务配置列表' },

    // RAG配置
    rag_enabled: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'RAG是否启用' },
    rag_config: {
      type: DataTypes.JSON,
      comment: 'RAG配置：knowledgeBaseIds, retrievalMode, topK, scoreThreshold, rerankEnabled'
    },

    // 工作流配置
    workflow_enabled: { type: DataTypes.BOOLEAN, defaultValue: false, comment: '工作流是否启用' },
    workflow_config: { type: DataTypes.JSON, comment: '工作流配置：nodes, edges' },

    // 插件配置
    plugins: { type: DataTypes.JSON, comment: '启用的插件ID列表' },

    // 统计数据
    chat_count: { type: DataTypes.INTEGER, defaultValue: 0, comment: '对话次数' },

    // 状态
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态：-1已停用，0草稿，1已发布'
    },

    // 创建者
    creator_id: { type: DataTypes.BIGINT, comment: '创建者ID' },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'AIAgent',
    tableName: 'ai_agent',
    timestamps: false,
  }
);

// 知识库表
class KnowledgeBase extends Model {}

KnowledgeBase.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, comment: '知识库名称' },
    description: { type: DataTypes.TEXT, comment: '知识库描述' },
    embedding_model: {
      type: DataTypes.STRING(50),
      defaultValue: 'text-embedding-3-small',
      comment: 'Embedding模型'
    },
    doc_count: { type: DataTypes.INTEGER, defaultValue: 0, comment: '文档数量' },
    chunk_count: { type: DataTypes.INTEGER, defaultValue: 0, comment: '分块数量' },
    status: { type: DataTypes.TINYINT, defaultValue: 1, comment: '状态：0禁用，1启用' },
    creator_id: { type: DataTypes.BIGINT, comment: '创建者ID' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'KnowledgeBase',
    tableName: 'knowledge_base',
    timestamps: false,
  }
);

// 知识库文档表
class KnowledgeDocument extends Model {}

KnowledgeDocument.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    knowledge_base_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '所属知识库ID'
    },
    name: { type: DataTypes.STRING(200), allowNull: false, comment: '文档名称' },
    type: { type: DataTypes.STRING(50), comment: '文档类型：pdf, docx, txt, md等' },
    size: { type: DataTypes.BIGINT, comment: '文件大小(字节)' },
    file_path: { type: DataTypes.STRING(500), comment: '文件存储路径' },
    chunk_count: { type: DataTypes.INTEGER, defaultValue: 0, comment: '分块数量' },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态：0处理中，1处理完成，2处理失败'
    },
    error_message: { type: DataTypes.TEXT, comment: '错误信息' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'KnowledgeDocument',
    tableName: 'knowledge_document',
    timestamps: false,
  }
);

// 对话会话表
class ChatSession extends Model {}

ChatSession.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    agent_id: { type: DataTypes.BIGINT, allowNull: false, comment: '智能体ID' },
    user_id: { type: DataTypes.BIGINT, comment: '用户ID' },
    title: { type: DataTypes.STRING(200), comment: '会话标题' },
    message_count: { type: DataTypes.INTEGER, defaultValue: 0, comment: '消息数量' },
    total_tokens: { type: DataTypes.INTEGER, defaultValue: 0, comment: '总Token数' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'ChatSession',
    tableName: 'chat_session',
    timestamps: false,
  }
);

// 对话消息表
class ChatMessage extends Model {}

ChatMessage.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    session_id: { type: DataTypes.BIGINT, allowNull: false, comment: '会话ID' },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
      comment: '角色'
    },
    content: { type: DataTypes.TEXT, allowNull: false, comment: '消息内容' },
    tokens: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Token数量' },
    metadata: { type: DataTypes.JSON, comment: '元数据：引用的知识、工具调用等' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_message',
    timestamps: false,
  }
);

// 定义关联关系
KnowledgeDocument.belongsTo(KnowledgeBase, { foreignKey: 'knowledge_base_id', as: 'knowledgeBase' });
KnowledgeBase.hasMany(KnowledgeDocument, { foreignKey: 'knowledge_base_id', as: 'documents' });

ChatSession.belongsTo(AIAgent, { foreignKey: 'agent_id', as: 'agent' });
AIAgent.hasMany(ChatSession, { foreignKey: 'agent_id', as: 'sessions' });

ChatMessage.belongsTo(ChatSession, { foreignKey: 'session_id', as: 'session' });
ChatSession.hasMany(ChatMessage, { foreignKey: 'session_id', as: 'messages' });

export { AIAgent, KnowledgeBase, KnowledgeDocument, ChatSession, ChatMessage };
export default AIAgent;
