import { Router } from 'express';
import * as aiAgentController from '../controllers/aiAgentController.js';

const router = Router();

// ==================== 智能体相关路由 ====================

// 获取智能体列表
router.post('/list', aiAgentController.getAgentList);

// 获取智能体详情
router.get('/detail/:id', aiAgentController.getAgentDetail);

// 创建智能体
router.post('/create', aiAgentController.createAgent);

// 更新智能体
router.post('/update/:id', aiAgentController.updateAgent);

// 删除智能体
router.delete('/delete/:id', aiAgentController.deleteAgent);

// 发布智能体
router.post('/publish/:id', aiAgentController.publishAgent);

// 停用智能体
router.post('/disable/:id', aiAgentController.disableAgent);

// 复制智能体
router.post('/copy/:id', aiAgentController.copyAgent);

// 导出智能体配置
router.get('/export/:id', aiAgentController.exportAgent);

// 导入智能体配置
router.post('/import', aiAgentController.importAgent);

// ==================== 对话相关路由 ====================

// 与智能体对话
router.post('/chat/:agentId', aiAgentController.chatWithAgent);

// 获取对话历史
router.post('/chat-history/:agentId', aiAgentController.getChatHistory);

// ==================== 知识库相关路由 ====================

// 获取知识库列表
router.post('/knowledge-base/list', aiAgentController.getKnowledgeBaseList);

// 创建知识库
router.post('/knowledge-base/create', aiAgentController.createKnowledgeBase);

// 删除知识库
router.delete('/knowledge-base/:id', aiAgentController.deleteKnowledgeBase);

// 上传文档到知识库
router.post('/knowledge-base/:knowledgeBaseId/upload', aiAgentController.uploadDocument);

// 获取知识库文档列表
router.get('/knowledge-base/:knowledgeBaseId/documents', aiAgentController.getKnowledgeBaseDocuments);

// ==================== 插件相关路由 ====================

// 获取可用插件列表
router.get('/plugins', aiAgentController.getPlugins);

// ==================== MCP相关路由 ====================

// 获取MCP服务列表
router.get('/mcp/servers', aiAgentController.getMcpServers);

// 测试MCP连接
router.post('/mcp/test', aiAgentController.testMcpConnection);

// ==================== 工作流相关路由 ====================

// 保存工作流配置
router.post('/workflow/:agentId', aiAgentController.saveWorkflow);

// 执行工作流
router.post('/workflow/:agentId/execute', aiAgentController.executeWorkflow);

export default router;
