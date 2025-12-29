import type { Request, Response } from 'express';
import * as aiAgentService from '../services/aiAgentService.js';

// ==================== 智能体相关控制器 ====================

/**
 * 获取智能体列表
 */
export const getAgentList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, keyword, type, status } = req.body;
    const userId = (req as any).user?.id;

    const result = await aiAgentService.getAgentList({
      page: page || 1,
      pageSize: pageSize || 10,
      keyword,
      type,
      status
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取智能体列表失败:', error);
    res.json({
      code: 500,
      message: error.message || '获取智能体列表失败',
      data: null
    });
  }
};

/**
 * 获取智能体详情
 */
export const getAgentDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await aiAgentService.getAgentDetail(Number(id));

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取智能体详情失败:', error);
    res.json({
      code: 500,
      message: error.message || '获取智能体详情失败',
      data: null
    });
  }
};

/**
 * 创建智能体
 */
export const createAgent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const result = await aiAgentService.createAgent(req.body, userId);

    res.json({
      code: 200,
      message: '创建成功',
      data: { id: (result as any).id }
    });
  } catch (error: any) {
    console.error('创建智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '创建智能体失败',
      data: null
    });
  }
};

/**
 * 更新智能体
 */
export const updateAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await aiAgentService.updateAgent(Number(id), req.body);

    res.json({
      code: 200,
      message: '更新成功',
      data: null
    });
  } catch (error: any) {
    console.error('更新智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '更新智能体失败',
      data: null
    });
  }
};

/**
 * 删除智能体
 */
export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await aiAgentService.deleteAgent(Number(id));

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error: any) {
    console.error('删除智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '删除智能体失败',
      data: null
    });
  }
};

/**
 * 发布智能体
 */
export const publishAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await aiAgentService.publishAgent(Number(id));

    res.json({
      code: 200,
      message: '发布成功',
      data: null
    });
  } catch (error: any) {
    console.error('发布智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '发布智能体失败',
      data: null
    });
  }
};

/**
 * 停用智能体
 */
export const disableAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await aiAgentService.disableAgent(Number(id));

    res.json({
      code: 200,
      message: '停用成功',
      data: null
    });
  } catch (error: any) {
    console.error('停用智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '停用智能体失败',
      data: null
    });
  }
};

/**
 * 复制智能体
 */
export const copyAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || 1;
    const result = await aiAgentService.copyAgent(Number(id), userId);

    res.json({
      code: 200,
      message: '复制成功',
      data: { id: (result as any).id }
    });
  } catch (error: any) {
    console.error('复制智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '复制智能体失败',
      data: null
    });
  }
};

/**
 * 导出智能体配置
 */
export const exportAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await aiAgentService.exportAgent(Number(id));

    res.json({
      code: 200,
      message: '导出成功',
      data: result
    });
  } catch (error: any) {
    console.error('导出智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '导出智能体失败',
      data: null
    });
  }
};

/**
 * 导入智能体配置
 */
export const importAgent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const configData = req.body;

    const result = await aiAgentService.createAgent({
      name: configData.name,
      description: configData.description,
      type: configData.type,
      avatar: configData.avatar,
      systemPrompt: configData.systemPrompt,
      welcomeMessage: configData.welcomeMessage,
      suggestedQuestions: configData.suggestedQuestions,
      modelConfig: configData.modelConfig,
      mcpEnabled: configData.mcpEnabled,
      mcpServers: configData.mcpServers,
      ragEnabled: configData.ragEnabled,
      ragConfig: configData.ragConfig,
      workflowEnabled: configData.workflowEnabled,
      workflowConfig: configData.workflowConfig,
      plugins: configData.plugins,
      status: 0 // 导入后为草稿状态
    }, userId);

    res.json({
      code: 200,
      message: '导入成功',
      data: { id: (result as any).id }
    });
  } catch (error: any) {
    console.error('导入智能体失败:', error);
    res.json({
      code: 500,
      message: error.message || '导入智能体失败',
      data: null
    });
  }
};

// ==================== 对话相关控制器 ====================

/**
 * 与智能体对话
 */
export const chatWithAgent = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { message, history } = req.body;
    const userId = (req as any).user?.id;

    const result = await aiAgentService.chatWithAgent(
      Number(agentId),
      message,
      history || [],
      userId
    );

    res.json({
      code: 200,
      message: '成功',
      data: result
    });
  } catch (error: any) {
    console.error('对话失败:', error);
    res.json({
      code: 500,
      message: error.message || '对话失败',
      data: null
    });
  }
};

/**
 * 获取对话历史
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { page, pageSize } = req.body;

    const result = await aiAgentService.getChatHistory(Number(agentId), {
      page: page || 1,
      pageSize: pageSize || 20
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取对话历史失败:', error);
    res.json({
      code: 500,
      message: error.message || '获取对话历史失败',
      data: null
    });
  }
};

// ==================== 知识库相关控制器 ====================

/**
 * 获取知识库列表
 */
export const getKnowledgeBaseList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize } = req.body;
    const userId = (req as any).user?.id;

    const result = await aiAgentService.getKnowledgeBaseList({
      page: page || 1,
      pageSize: pageSize || 20
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取知识库列表失败:', error);
    res.json({
      code: 500,
      message: error.message || '获取知识库列表失败',
      data: null
    });
  }
};

/**
 * 创建知识库
 */
export const createKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1;
    const result = await aiAgentService.createKnowledgeBase(req.body, userId);

    res.json({
      code: 200,
      message: '创建成功',
      data: { id: (result as any).id }
    });
  } catch (error: any) {
    console.error('创建知识库失败:', error);
    res.json({
      code: 500,
      message: error.message || '创建知识库失败',
      data: null
    });
  }
};

/**
 * 删除知识库
 */
export const deleteKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await aiAgentService.deleteKnowledgeBase(Number(id));

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error: any) {
    console.error('删除知识库失败:', error);
    res.json({
      code: 500,
      message: error.message || '删除知识库失败',
      data: null
    });
  }
};

/**
 * 上传文档到知识库
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { knowledgeBaseId } = req.params;
    // 这里应该处理文件上传逻辑
    // 目前返回模拟结果

    res.json({
      code: 200,
      message: '上传成功，正在处理中',
      data: {
        id: Date.now(),
        status: 0 // 处理中
      }
    });
  } catch (error: any) {
    console.error('上传文档失败:', error);
    res.json({
      code: 500,
      message: error.message || '上传文档失败',
      data: null
    });
  }
};

/**
 * 获取知识库文档列表
 */
export const getKnowledgeBaseDocuments = async (req: Request, res: Response) => {
  try {
    const { knowledgeBaseId } = req.params;
    const result = await aiAgentService.getKnowledgeBaseDocuments(Number(knowledgeBaseId));

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取知识库文档失败:', error);
    res.json({
      code: 500,
      message: error.message || '获取知识库文档失败',
      data: null
    });
  }
};

// ==================== 插件相关控制器 ====================

/**
 * 获取可用插件列表
 */
export const getPlugins = async (req: Request, res: Response) => {
  try {
    const result = await aiAgentService.getPlugins();

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取插件列表失败:', error);
    res.json({
      code: 500,
      message: error.message || '获取插件列表失败',
      data: null
    });
  }
};

// ==================== MCP相关控制器 ====================

/**
 * 获取MCP服务列表
 */
export const getMcpServers = async (req: Request, res: Response) => {
  try {
    const result = await aiAgentService.getMcpServers();

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取MCP服务列表失败:', error);
    res.json({
      code: 500,
      message: error.message || '获取MCP服务列表失败',
      data: null
    });
  }
};

/**
 * 测试MCP连接
 */
export const testMcpConnection = async (req: Request, res: Response) => {
  try {
    const result = await aiAgentService.testMcpConnection(req.body);

    res.json({
      code: 200,
      message: '测试成功',
      data: result
    });
  } catch (error: any) {
    console.error('测试MCP连接失败:', error);
    res.json({
      code: 500,
      message: error.message || '测试MCP连接失败',
      data: null
    });
  }
};

// ==================== 工作流相关控制器 ====================

/**
 * 保存工作流配置
 */
export const saveWorkflow = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const workflowConfig = req.body;

    await aiAgentService.updateAgent(Number(agentId), {
      workflowConfig,
      workflowEnabled: true
    });

    res.json({
      code: 200,
      message: '保存成功',
      data: null
    });
  } catch (error: any) {
    console.error('保存工作流失败:', error);
    res.json({
      code: 500,
      message: error.message || '保存工作流失败',
      data: null
    });
  }
};

/**
 * 执行工作流
 */
export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const input = req.body;

    // 这里应该实际执行工作流
    // 目前返回模拟结果
    res.json({
      code: 200,
      message: '执行成功',
      data: {
        output: '工作流执行结果...',
        executionTime: 1234,
        nodes: []
      }
    });
  } catch (error: any) {
    console.error('执行工作流失败:', error);
    res.json({
      code: 500,
      message: error.message || '执行工作流失败',
      data: null
    });
  }
};
