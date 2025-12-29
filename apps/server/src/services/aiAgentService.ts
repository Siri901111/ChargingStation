import { Op } from 'sequelize';
import { AIAgent, KnowledgeBase, KnowledgeDocument, ChatSession, ChatMessage, User } from '../models/index.js';

// ==================== 智能体相关服务 ====================

/**
 * 获取智能体列表
 */
export const getAgentList = async (params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: number;
  creatorId?: number;
}) => {
  const { page = 1, pageSize = 10, keyword, type, status, creatorId } = params;
  const offset = (page - 1) * pageSize;

  const where: any = {};

  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } }
    ];
  }

  if (type) {
    where.type = type;
  }

  if (status !== undefined && status !== null) {
    where.status = status;
  }

  if (creatorId) {
    where.creator_id = creatorId;
  }

  const { count, rows } = await AIAgent.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'account']
      }
    ],
    order: [['updated_at', 'DESC']],
    offset,
    limit: pageSize
  });

  const list = rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    avatar: row.avatar,
    status: row.status,
    mcpEnabled: row.mcp_enabled,
    ragEnabled: row.rag_enabled,
    workflowEnabled: row.workflow_enabled,
    pluginsCount: row.plugins ? row.plugins.length : 0,
    chatCount: row.chat_count,
    creatorName: row.creator?.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  return { list, total: count };
};

/**
 * 获取智能体详情
 */
export const getAgentDetail = async (id: number) => {
  const agent = await AIAgent.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'account']
      }
    ]
  });

  if (!agent) {
    throw new Error('智能体不存在');
  }

  const data = agent.toJSON() as any;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    type: data.type,
    avatar: data.avatar,
    systemPrompt: data.system_prompt,
    welcomeMessage: data.welcome_message,
    suggestedQuestions: data.suggested_questions || [],
    modelConfig: data.model_config || {
      model: 'gpt-4o',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4096,
      contextLength: 10
    },
    mcpEnabled: data.mcp_enabled,
    mcpServers: data.mcp_servers || [],
    ragEnabled: data.rag_enabled,
    ragConfig: data.rag_config || {
      knowledgeBaseIds: [],
      retrievalMode: 'hybrid',
      topK: 5,
      scoreThreshold: 0.5,
      rerankEnabled: true
    },
    workflowEnabled: data.workflow_enabled,
    workflowConfig: data.workflow_config || { nodes: [], edges: [] },
    plugins: data.plugins || [],
    status: data.status,
    chatCount: data.chat_count,
    creatorName: data.creator?.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * 创建智能体
 */
export const createAgent = async (data: any, creatorId: number) => {
  const agent = await AIAgent.create({
    name: data.name,
    description: data.description,
    type: data.type || 'chat',
    avatar: data.avatar,
    system_prompt: data.systemPrompt,
    welcome_message: data.welcomeMessage,
    suggested_questions: data.suggestedQuestions || [],
    model_config: data.modelConfig,
    mcp_enabled: data.mcpEnabled || false,
    mcp_servers: data.mcpServers || [],
    rag_enabled: data.ragEnabled || false,
    rag_config: data.ragConfig,
    workflow_enabled: data.workflowEnabled || false,
    workflow_config: data.workflowConfig,
    plugins: data.plugins || [],
    status: data.status || 0,
    creator_id: creatorId,
    created_at: new Date(),
    updated_at: new Date()
  });

  return agent;
};

/**
 * 更新智能体
 */
export const updateAgent = async (id: number, data: any) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error('智能体不存在');
  }

  const updateData: any = {
    updated_at: new Date()
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.systemPrompt !== undefined) updateData.system_prompt = data.systemPrompt;
  if (data.welcomeMessage !== undefined) updateData.welcome_message = data.welcomeMessage;
  if (data.suggestedQuestions !== undefined) updateData.suggested_questions = data.suggestedQuestions;
  if (data.modelConfig !== undefined) updateData.model_config = data.modelConfig;
  if (data.mcpEnabled !== undefined) updateData.mcp_enabled = data.mcpEnabled;
  if (data.mcpServers !== undefined) updateData.mcp_servers = data.mcpServers;
  if (data.ragEnabled !== undefined) updateData.rag_enabled = data.ragEnabled;
  if (data.ragConfig !== undefined) updateData.rag_config = data.ragConfig;
  if (data.workflowEnabled !== undefined) updateData.workflow_enabled = data.workflowEnabled;
  if (data.workflowConfig !== undefined) updateData.workflow_config = data.workflowConfig;
  if (data.plugins !== undefined) updateData.plugins = data.plugins;
  if (data.status !== undefined) updateData.status = data.status;

  await agent.update(updateData);
  return agent;
};

/**
 * 删除智能体
 */
export const deleteAgent = async (id: number) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error('智能体不存在');
  }

  // 删除关联的会话和消息
  const sessions = await ChatSession.findAll({ where: { agent_id: id } });
  for (const session of sessions) {
    await ChatMessage.destroy({ where: { session_id: (session as any).id } });
  }
  await ChatSession.destroy({ where: { agent_id: id } });

  await agent.destroy();
  return true;
};

/**
 * 发布智能体
 */
export const publishAgent = async (id: number) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error('智能体不存在');
  }

  await agent.update({ status: 1, updated_at: new Date() });
  return true;
};

/**
 * 停用智能体
 */
export const disableAgent = async (id: number) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error('智能体不存在');
  }

  await agent.update({ status: -1, updated_at: new Date() });
  return true;
};

/**
 * 复制智能体
 */
export const copyAgent = async (id: number, creatorId: number) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error('智能体不存在');
  }

  const data = agent.toJSON() as any;
  const newAgent = await AIAgent.create({
    name: `${data.name} (副本)`,
    description: data.description,
    type: data.type,
    avatar: data.avatar,
    system_prompt: data.system_prompt,
    welcome_message: data.welcome_message,
    suggested_questions: data.suggested_questions,
    model_config: data.model_config,
    mcp_enabled: data.mcp_enabled,
    mcp_servers: data.mcp_servers,
    rag_enabled: data.rag_enabled,
    rag_config: data.rag_config,
    workflow_enabled: data.workflow_enabled,
    workflow_config: data.workflow_config,
    plugins: data.plugins,
    status: 0, // 复制后为草稿状态
    chat_count: 0,
    creator_id: creatorId,
    created_at: new Date(),
    updated_at: new Date()
  });

  return newAgent;
};

/**
 * 导出智能体配置
 */
export const exportAgent = async (id: number) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error('智能体不存在');
  }

  const data = agent.toJSON() as any;
  return {
    name: data.name,
    description: data.description,
    type: data.type,
    avatar: data.avatar,
    systemPrompt: data.system_prompt,
    welcomeMessage: data.welcome_message,
    suggestedQuestions: data.suggested_questions,
    modelConfig: data.model_config,
    mcpEnabled: data.mcp_enabled,
    mcpServers: data.mcp_servers,
    ragEnabled: data.rag_enabled,
    ragConfig: data.rag_config,
    workflowEnabled: data.workflow_enabled,
    workflowConfig: data.workflow_config,
    plugins: data.plugins,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
};

// ==================== 对话相关服务 ====================

/**
 * 与智能体对话
 */
export const chatWithAgent = async (
  agentId: number,
  message: string,
  history: any[],
  userId?: number
) => {
  const agent = await AIAgent.findByPk(agentId);
  if (!agent) {
    throw new Error('智能体不存在');
  }

  // 增加对话次数
  await agent.increment('chat_count');

  // 这里是模拟的回复，实际应该调用LLM API
  const agentData = agent.toJSON() as any;
  const modelConfig = agentData.model_config || {};
  const systemPrompt = agentData.system_prompt || '';

  // 模拟响应
  const reply = `收到您的消息："${message}"。这是来自智能体"${agentData.name}"的回复。

当前配置：
- 模型：${modelConfig.model || 'gpt-4o'}
- Temperature：${modelConfig.temperature || 0.7}
- MCP：${agentData.mcp_enabled ? '已启用' : '未启用'}
- RAG：${agentData.rag_enabled ? '已启用' : '未启用'}
- 工作流：${agentData.workflow_enabled ? '已启用' : '未启用'}

在实际使用中，这里会调用真实的AI服务进行回复。`;

  const tokens = Math.floor(message.length * 1.5 + reply.length * 1.5);

  return {
    reply,
    tokens,
    model: modelConfig.model || 'gpt-4o'
  };
};

/**
 * 获取对话历史
 */
export const getChatHistory = async (agentId: number, params: { page?: number; pageSize?: number }) => {
  const { page = 1, pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;

  const { count, rows } = await ChatSession.findAndCountAll({
    where: { agent_id: agentId },
    order: [['updated_at', 'DESC']],
    offset,
    limit: pageSize
  });

  const list = rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    messageCount: row.message_count,
    totalTokens: row.total_tokens,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  return { list, total: count };
};

// ==================== 知识库相关服务 ====================

/**
 * 获取知识库列表
 */
export const getKnowledgeBaseList = async (params: { page?: number; pageSize?: number; creatorId?: number }) => {
  const { page = 1, pageSize = 20, creatorId } = params;
  const offset = (page - 1) * pageSize;

  const where: any = {};
  if (creatorId) {
    where.creator_id = creatorId;
  }

  const { count, rows } = await KnowledgeBase.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }
    ],
    order: [['updated_at', 'DESC']],
    offset,
    limit: pageSize
  });

  const list = rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    embeddingModel: row.embedding_model,
    docCount: row.doc_count,
    chunkCount: row.chunk_count,
    status: row.status,
    creatorName: row.creator?.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  return { list, total: count };
};

/**
 * 创建知识库
 */
export const createKnowledgeBase = async (data: any, creatorId: number) => {
  const kb = await KnowledgeBase.create({
    name: data.name,
    description: data.description,
    embedding_model: data.embeddingModel || 'text-embedding-3-small',
    status: 1,
    creator_id: creatorId,
    created_at: new Date(),
    updated_at: new Date()
  });

  return kb;
};

/**
 * 删除知识库
 */
export const deleteKnowledgeBase = async (id: number) => {
  const kb = await KnowledgeBase.findByPk(id);
  if (!kb) {
    throw new Error('知识库不存在');
  }

  // 删除关联的文档
  await KnowledgeDocument.destroy({ where: { knowledge_base_id: id } });
  await kb.destroy();

  return true;
};

/**
 * 获取知识库文档列表
 */
export const getKnowledgeBaseDocuments = async (knowledgeBaseId: number) => {
  const documents = await KnowledgeDocument.findAll({
    where: { knowledge_base_id: knowledgeBaseId },
    order: [['created_at', 'DESC']]
  });

  return documents.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    chunkCount: doc.chunk_count,
    status: doc.status,
    errorMessage: doc.error_message,
    createdAt: doc.created_at
  }));
};

// ==================== 插件相关服务 ====================

/**
 * 获取可用插件列表
 */
export const getPlugins = async () => {
  // 返回预定义的插件列表
  return [
    {
      id: 'web_search',
      name: '联网搜索',
      description: '搜索互联网获取最新信息',
      icon: 'Search',
      color: '#409eff',
      tags: ['信息获取', '实时性']
    },
    {
      id: 'code_interpreter',
      name: '代码解释器',
      description: '执行Python代码进行数据分析',
      icon: 'Cpu',
      color: '#67c23a',
      tags: ['代码执行', '数据分析']
    },
    {
      id: 'image_gen',
      name: '图片生成',
      description: '使用DALL-E生成图片',
      icon: 'Picture',
      color: '#e6a23c',
      tags: ['图片生成', 'AI绘画']
    },
    {
      id: 'file_reader',
      name: '文件阅读',
      description: '读取和解析各类文档',
      icon: 'Files',
      color: '#909399',
      tags: ['文档处理', 'PDF']
    },
    {
      id: 'calendar',
      name: '日程管理',
      description: '管理日程和提醒',
      icon: 'Calendar',
      color: '#f56c6c',
      tags: ['日程', '提醒']
    },
    {
      id: 'weather',
      name: '天气查询',
      description: '查询天气预报',
      icon: 'Clock',
      color: '#00bcd4',
      tags: ['天气', '生活']
    }
  ];
};

// ==================== MCP相关服务 ====================

/**
 * 获取预置MCP服务列表
 */
export const getMcpServers = async () => {
  return [
    {
      id: 'filesystem',
      name: '文件系统',
      description: '读写本地文件',
      command: 'npx',
      args: '["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]'
    },
    {
      id: 'database',
      name: '数据库',
      description: '连接SQL数据库',
      command: 'npx',
      args: '["-y", "@modelcontextprotocol/server-postgres"]'
    },
    {
      id: 'web',
      name: 'Web浏览',
      description: '访问和解析网页',
      command: 'npx',
      args: '["-y", "@anthropics/mcp-server-puppeteer"]'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: '操作GitHub仓库',
      command: 'npx',
      args: '["-y", "@modelcontextprotocol/server-github"]'
    }
  ];
};

/**
 * 测试MCP连接
 */
export const testMcpConnection = async (serverConfig: any) => {
  // 这里应该实际测试MCP服务的连接
  // 目前返回模拟结果
  return {
    success: true,
    message: 'MCP服务连接测试成功',
    tools: ['tool1', 'tool2', 'tool3']
  };
};
