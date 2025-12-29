import { post, get, del } from "@/utils/http";

// AI智能体相关API

// 获取智能体列表参数
interface GetAgentListParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    type?: string;
    status?: number;
}

// 智能体表单数据
interface AgentFormData {
    name: string;
    description?: string;
    type: 'chat' | 'workflow' | 'multi-agent';
    avatar?: string;
    systemPrompt?: string;
    welcomeMessage?: string;
    suggestedQuestions?: string[];
    modelConfig?: {
        model: string;
        temperature: number;
        topP: number;
        maxTokens: number;
        contextLength: number;
    };
    mcpEnabled?: boolean;
    mcpServers?: any[];
    ragEnabled?: boolean;
    ragConfig?: {
        knowledgeBaseIds: number[];
        retrievalMode: string;
        topK: number;
        scoreThreshold: number;
        rerankEnabled: boolean;
    };
    workflowEnabled?: boolean;
    workflowConfig?: {
        nodes: any[];
        edges: any[];
    };
    plugins?: string[];
    status?: number;
}

// 对话请求参数
interface ChatParams {
    message: string;
    history?: {
        role: string;
        content: string;
    }[];
}

// 获取智能体列表
export function getAgentListApi(params: GetAgentListParams) {
    return post("/api/ai-agent/list", params);
}

// 获取智能体详情
export function getAgentDetailApi(id: number) {
    return get(`/api/ai-agent/detail/${id}`);
}

// 创建智能体
export function createAgentApi(data: AgentFormData) {
    return post("/api/ai-agent/create", data);
}

// 更新智能体
export function updateAgentApi(id: number, data: AgentFormData) {
    return post(`/api/ai-agent/update/${id}`, data);
}

// 删除智能体
export function deleteAgentApi(id: number) {
    return del(`/api/ai-agent/delete/${id}`);
}

// 发布智能体
export function publishAgentApi(id: number) {
    return post(`/api/ai-agent/publish/${id}`);
}

// 停用智能体
export function disableAgentApi(id: number) {
    return post(`/api/ai-agent/disable/${id}`);
}

// 复制智能体
export function copyAgentApi(id: number) {
    return post(`/api/ai-agent/copy/${id}`);
}

// 导出智能体配置
export function exportAgentApi(id: number) {
    return get(`/api/ai-agent/export/${id}`);
}

// 导入智能体配置
export function importAgentApi(data: any) {
    return post("/api/ai-agent/import", data);
}

// 与智能体对话
export function chatWithAgentApi(agentId: number, data: ChatParams) {
    return post(`/api/ai-agent/chat/${agentId}`, data);
}

// 获取对话历史
export function getChatHistoryApi(agentId: number, params?: { page?: number; pageSize?: number }) {
    return post(`/api/ai-agent/chat-history/${agentId}`, params || {});
}

// 知识库相关API

// 获取知识库列表
export function getKnowledgeBaseListApi(params?: { page?: number; pageSize?: number }) {
    return post("/api/ai-agent/knowledge-base/list", params || {});
}

// 创建知识库
export function createKnowledgeBaseApi(data: { name: string; description?: string; embeddingModel: string }) {
    return post("/api/ai-agent/knowledge-base/create", data);
}

// 删除知识库
export function deleteKnowledgeBaseApi(id: number) {
    return del(`/api/ai-agent/knowledge-base/${id}`);
}

// 上传文档到知识库
export function uploadDocumentApi(knowledgeBaseId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return post(`/api/ai-agent/knowledge-base/${knowledgeBaseId}/upload`, formData);
}

// 获取知识库文档列表
export function getKnowledgeBaseDocumentsApi(knowledgeBaseId: number) {
    return get(`/api/ai-agent/knowledge-base/${knowledgeBaseId}/documents`);
}

// MCP服务相关API

// 获取可用MCP服务列表
export function getMcpServersApi() {
    return get("/api/ai-agent/mcp/servers");
}

// 测试MCP服务连接
export function testMcpConnectionApi(serverConfig: any) {
    return post("/api/ai-agent/mcp/test", serverConfig);
}

// 插件相关API

// 获取可用插件列表
export function getPluginsApi() {
    return get("/api/ai-agent/plugins");
}

// 工作流相关API

// 保存工作流配置
export function saveWorkflowApi(agentId: number, workflowConfig: any) {
    return post(`/api/ai-agent/workflow/${agentId}`, workflowConfig);
}

// 执行工作流
export function executeWorkflowApi(agentId: number, input: any) {
    return post(`/api/ai-agent/workflow/${agentId}/execute`, input);
}
