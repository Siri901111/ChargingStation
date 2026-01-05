<template>
    <div class="agent-config">
        <!-- 左侧配置面板 -->
        <div class="config-panel">
            <el-tabs v-model="activeTab" class="config-tabs">
                <!-- 基础配置 -->
                <el-tab-pane label="基础配置" name="basic">
                    <el-scrollbar height="calc(100vh - 200px)">
                        <div class="config-section">
                            <el-form
                                :model="agentForm"
                                :rules="formRules"
                                ref="formRef"
                                label-position="top"
                                class="agent-form"
                            >
                                <el-form-item label="智能体头像">
                                    <div class="avatar-upload">
                                        <el-avatar :size="80" :src="agentForm.avatar || defaultAvatar">
                                            <el-icon :size="32"><Search /></el-icon>
                                        </el-avatar>
                                        <el-button type="primary" text @click="showAvatarDialog = true">
                                            更换头像
                                        </el-button>
                                    </div>
                                </el-form-item>

                                <el-form-item label="智能体名称" prop="name">
                                    <el-input
                                        v-model="agentForm.name"
                                        placeholder="给你的智能体起个名字"
                                        maxlength="50"
                                        show-word-limit
                                    />
                                </el-form-item>

                                <el-form-item label="智能体描述" prop="description">
                                    <el-input
                                        v-model="agentForm.description"
                                        type="textarea"
                                        :rows="3"
                                        placeholder="描述你的智能体能做什么"
                                        maxlength="500"
                                        show-word-limit
                                    />
                                </el-form-item>

                                <el-form-item label="智能体类型" prop="type">
                                    <el-radio-group v-model="agentForm.type" class="type-radio-group">
                                        <el-radio-button value="chat">
                                            <el-icon><ChatDotRound /></el-icon>
                                            <span>对话型</span>
                                            <small>适合问答、客服场景</small>
                                        </el-radio-button>
                                        <el-radio-button value="workflow">
                                            <el-icon><Share /></el-icon>
                                            <span>工作流型</span>
                                            <small>复杂任务自动化</small>
                                        </el-radio-button>
                                        <el-radio-button value="multi-agent">
                                            <el-icon><SetUp /></el-icon>
                                            <span>多Agent</span>
                                            <small>多智能体协作</small>
                                        </el-radio-button>
                                    </el-radio-group>
                                </el-form-item>

                                <el-form-item label="系统提示词 (System Prompt)" prop="systemPrompt">
                                    <el-input
                                        v-model="agentForm.systemPrompt"
                                        type="textarea"
                                        :rows="6"
                                        placeholder="定义智能体的角色、能力和行为准则..."
                                    />
                                    <div class="prompt-tips">
                                        <el-button text type="primary" size="small" @click="showPromptTemplates = true">
                                            <el-icon><Document /></el-icon> 使用模板
                                        </el-button>
                                    </div>
                                </el-form-item>

                                <el-form-item label="开场白">
                                    <el-input
                                        v-model="agentForm.welcomeMessage"
                                        type="textarea"
                                        :rows="2"
                                        placeholder="用户打开对话时的欢迎语"
                                    />
                                </el-form-item>

                                <el-form-item label="推荐问题">
                                    <div class="suggested-questions">
                                        <el-tag
                                            v-for="(q, index) in agentForm.suggestedQuestions"
                                            :key="index"
                                            closable
                                            @close="removeSuggestedQuestion(index)"
                                            class="question-tag"
                                        >
                                            {{ q }}
                                        </el-tag>
                                        <el-input
                                            v-if="showQuestionInput"
                                            ref="questionInputRef"
                                            v-model="newQuestion"
                                            size="small"
                                            style="width: 200px"
                                            @keyup.enter="addSuggestedQuestion"
                                            @blur="addSuggestedQuestion"
                                        />
                                        <el-button
                                            v-else
                                            text
                                            type="primary"
                                            size="small"
                                            @click="showQuestionInput = true"
                                        >
                                            <el-icon><Plus /></el-icon> 添加问题
                                        </el-button>
                                    </div>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-scrollbar>
                </el-tab-pane>

                <!-- 模型配置 -->
                <el-tab-pane label="模型配置" name="model">
                    <el-scrollbar height="calc(100vh - 200px)">
                        <div class="config-section">
                            <el-form label-position="top">
                                <el-form-item label="基础模型">
                                    <el-select v-model="agentForm.modelConfig.model" style="width: 100%">
                                        <el-option-group label="OpenAI">
                                            <el-option label="GPT-4o" value="gpt-4o" />
                                            <el-option label="GPT-4o-mini" value="gpt-4o-mini" />
                                            <el-option label="GPT-4-turbo" value="gpt-4-turbo" />
                                        </el-option-group>
                                        <el-option-group label="Anthropic">
                                            <el-option label="Claude-3.5-sonnet" value="claude-3-5-sonnet" />
                                            <el-option label="Claude-3-opus" value="claude-3-opus" />
                                        </el-option-group>
                                        <el-option-group label="国产模型">
                                            <el-option label="通义千问-Max" value="qwen-max" />
                                            <el-option label="文心一言-4.0" value="ernie-4" />
                                            <el-option label="DeepSeek-V3" value="deepseek-v3" />
                                            <el-option label="GLM-4" value="glm-4" />
                                        </el-option-group>
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="Temperature（创造性）">
                                    <el-slider
                                        v-model="agentForm.modelConfig.temperature"
                                        :min="0"
                                        :max="2"
                                        :step="0.1"
                                        show-input
                                    />
                                    <div class="slider-tips">
                                        <span>精确</span>
                                        <span>创造</span>
                                    </div>
                                </el-form-item>

                                <el-form-item label="Top P（多样性）">
                                    <el-slider
                                        v-model="agentForm.modelConfig.topP"
                                        :min="0"
                                        :max="1"
                                        :step="0.05"
                                        show-input
                                    />
                                </el-form-item>

                                <el-form-item label="最大输出Token">
                                    <el-input-number
                                        v-model="agentForm.modelConfig.maxTokens"
                                        :min="100"
                                        :max="128000"
                                        :step="100"
                                        style="width: 100%"
                                    />
                                </el-form-item>

                                <el-form-item label="上下文长度">
                                    <el-input-number
                                        v-model="agentForm.modelConfig.contextLength"
                                        :min="1"
                                        :max="50"
                                        :step="1"
                                        style="width: 100%"
                                    />
                                    <div class="form-tip">保留最近N轮对话作为上下文</div>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-scrollbar>
                </el-tab-pane>

                <!-- MCP配置 -->
                <el-tab-pane label="MCP服务" name="mcp">
                    <el-scrollbar height="calc(100vh - 200px)">
                        <div class="config-section">
                            <div class="section-header">
                                <h4>MCP (Model Context Protocol) 服务</h4>
                                <el-switch v-model="agentForm.mcpEnabled" />
                            </div>
                            <p class="section-desc">
                                MCP允许智能体连接外部工具和数据源，扩展其能力边界
                            </p>

                            <div v-if="agentForm.mcpEnabled" class="mcp-config">
                                <el-form label-position="top">
                                    <el-form-item label="MCP服务列表">
                                        <div class="mcp-server-list">
                                            <el-card
                                                v-for="(server, index) in agentForm.mcpServers"
                                                :key="index"
                                                class="mcp-server-card"
                                                shadow="hover"
                                            >
                                                <div class="server-header">
                                                    <el-input
                                                        v-model="server.name"
                                                        placeholder="服务名称"
                                                        size="small"
                                                    />
                                                    <el-switch v-model="server.enabled" size="small" />
                                                    <el-button
                                                        type="danger"
                                                        text
                                                        size="small"
                                                        :icon="Delete"
                                                        @click="removeMcpServer(index)"
                                                    />
                                                </div>
                                                <el-input
                                                    v-model="server.command"
                                                    placeholder="执行命令，如：npx -y @modelcontextprotocol/server-filesystem"
                                                    size="small"
                                                    class="mt-10"
                                                />
                                                <el-input
                                                    v-model="server.args"
                                                    placeholder="参数（JSON数组格式）"
                                                    size="small"
                                                    class="mt-10"
                                                />
                                                <el-input
                                                    v-model="server.env"
                                                    placeholder="环境变量（JSON对象格式）"
                                                    size="small"
                                                    class="mt-10"
                                                />
                                            </el-card>
                                        </div>
                                        <el-button
                                            type="primary"
                                            text
                                            :icon="Plus"
                                            @click="addMcpServer"
                                        >
                                            添加MCP服务
                                        </el-button>
                                    </el-form-item>

                                    <el-divider />

                                    <el-form-item label="预置MCP服务">
                                        <div class="preset-mcp-list">
                                            <el-card
                                                v-for="preset in presetMcpServers"
                                                :key="preset.id"
                                                class="preset-card"
                                                shadow="hover"
                                                @click="addPresetMcpServer(preset)"
                                            >
                                                <div class="preset-icon">
                                                    <el-icon :size="24"><component :is="preset.icon" /></el-icon>
                                                </div>
                                                <div class="preset-info">
                                                    <h5>{{ preset.name }}</h5>
                                                    <p>{{ preset.description }}</p>
                                                </div>
                                            </el-card>
                                        </div>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-scrollbar>
                </el-tab-pane>

                <!-- 知识库RAG -->
                <el-tab-pane label="知识库" name="rag">
                    <el-scrollbar height="calc(100vh - 200px)">
                        <div class="config-section">
                            <div class="section-header">
                                <h4>知识库 (RAG)</h4>
                                <el-switch v-model="agentForm.ragEnabled" />
                            </div>
                            <p class="section-desc">
                                上传文档构建专属知识库，让智能体基于你的数据进行回答
                            </p>

                            <div v-if="agentForm.ragEnabled" class="rag-config">
                                <el-form label-position="top">
                                    <el-form-item label="知识库">
                                        <el-select
                                            v-model="agentForm.ragConfig.knowledgeBaseIds"
                                            multiple
                                            placeholder="选择关联的知识库"
                                            style="width: 100%"
                                        >
                                            <el-option
                                                v-for="kb in knowledgeBases"
                                                :key="kb.id"
                                                :label="kb.name"
                                                :value="kb.id"
                                            >
                                                <span>{{ kb.name }}</span>
                                                <span style="color: #909399; font-size: 12px; margin-left: 10px">
                                                    {{ kb.docCount }}个文档
                                                </span>
                                            </el-option>
                                        </el-select>
                                        <el-button type="primary" text @click="showKnowledgeBaseDialog = true">
                                            <el-icon><Plus /></el-icon> 创建知识库
                                        </el-button>
                                    </el-form-item>

                                    <el-form-item label="检索设置">
                                        <el-card class="rag-settings-card" shadow="never">
                                            <el-form-item label="检索模式">
                                                <el-radio-group v-model="agentForm.ragConfig.retrievalMode">
                                                    <el-radio value="semantic">语义检索</el-radio>
                                                    <el-radio value="keyword">关键词检索</el-radio>
                                                    <el-radio value="hybrid">混合检索</el-radio>
                                                </el-radio-group>
                                            </el-form-item>

                                            <el-form-item label="返回结果数量">
                                                <el-slider
                                                    v-model="agentForm.ragConfig.topK"
                                                    :min="1"
                                                    :max="20"
                                                    :step="1"
                                                    show-input
                                                />
                                            </el-form-item>

                                            <el-form-item label="相似度阈值">
                                                <el-slider
                                                    v-model="agentForm.ragConfig.scoreThreshold"
                                                    :min="0"
                                                    :max="1"
                                                    :step="0.05"
                                                    show-input
                                                />
                                            </el-form-item>

                                            <el-form-item label="Rerank重排序">
                                                <el-switch v-model="agentForm.ragConfig.rerankEnabled" />
                                            </el-form-item>
                                        </el-card>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-scrollbar>
                </el-tab-pane>

                <!-- 工作流配置 -->
                <el-tab-pane label="工作流" name="workflow">
                    <el-scrollbar height="calc(100vh - 200px)">
                        <div class="config-section">
                            <div class="section-header">
                                <h4>工作流引擎</h4>
                                <el-switch v-model="agentForm.workflowEnabled" />
                            </div>
                            <p class="section-desc">
                                通过可视化编排，构建复杂的自动化任务流程
                            </p>

                            <div v-if="agentForm.workflowEnabled" class="workflow-config">
                                <el-button type="primary" @click="openWorkflowEditor">
                                    <el-icon><Edit /></el-icon> 打开工作流编辑器
                                </el-button>

                                <div class="workflow-preview" v-if="agentForm.workflowConfig.nodes.length > 0">
                                    <h5>当前工作流</h5>
                                    <div class="workflow-nodes">
                                        <div
                                            v-for="(node, index) in agentForm.workflowConfig.nodes"
                                            :key="node.id"
                                            class="workflow-node"
                                        >
                                            <el-tag :type="getNodeTagType(node.type)">
                                                {{ node.name }}
                                            </el-tag>
                                            <el-icon v-if="index < agentForm.workflowConfig.nodes.length - 1">
                                                <ArrowRight />
                                            </el-icon>
                                        </div>
                                    </div>
                                </div>

                                <el-divider />

                                <h5>工作流节点类型</h5>
                                <div class="node-types">
                                    <el-card
                                        v-for="nodeType in workflowNodeTypes"
                                        :key="nodeType.type"
                                        class="node-type-card"
                                        shadow="hover"
                                    >
                                        <el-icon :size="24" :style="{ color: nodeType.color }">
                                            <component :is="nodeType.icon" />
                                        </el-icon>
                                        <div class="node-info">
                                            <h6>{{ nodeType.name }}</h6>
                                            <p>{{ nodeType.description }}</p>
                                        </div>
                                    </el-card>
                                </div>
                            </div>
                        </div>
                    </el-scrollbar>
                </el-tab-pane>

                <!-- 插件配置 -->
                <el-tab-pane label="插件" name="plugins">
                    <el-scrollbar height="calc(100vh - 200px)">
                        <div class="config-section">
                            <div class="section-header">
                                <h4>插件市场</h4>
                            </div>
                            <p class="section-desc">
                                为智能体添加更多能力，如联网搜索、代码执行、图片生成等
                            </p>

                            <div class="plugins-list">
                                <el-card
                                    v-for="plugin in availablePlugins"
                                    :key="plugin.id"
                                    class="plugin-card"
                                    shadow="hover"
                                >
                                    <div class="plugin-header">
                                        <div class="plugin-icon" :style="{ backgroundColor: plugin.color }">
                                            <el-icon :size="20"><component :is="plugin.icon" /></el-icon>
                                        </div>
                                        <div class="plugin-info">
                                            <h5>{{ plugin.name }}</h5>
                                            <p>{{ plugin.description }}</p>
                                        </div>
                                        <el-switch
                                            :model-value="agentForm.plugins.includes(plugin.id)"
                                            @change="(val: boolean) => togglePlugin(plugin.id, val)"
                                        />
                                    </div>
                                    <div class="plugin-tags" v-if="plugin.tags">
                                        <el-tag
                                            v-for="tag in plugin.tags"
                                            :key="tag"
                                            size="small"
                                            type="info"
                                            effect="plain"
                                        >
                                            {{ tag }}
                                        </el-tag>
                                    </div>
                                </el-card>
                            </div>
                        </div>
                    </el-scrollbar>
                </el-tab-pane>
            </el-tabs>
        </div>

        <!-- 右侧预览面板 -->
        <div class="preview-panel">
            <div class="preview-header">
                <h4>实时预览</h4>
                <el-button type="primary" text size="small" @click="refreshPreview">
                    <el-icon><Refresh /></el-icon> 刷新
                </el-button>
            </div>
            <div class="preview-content">
                <div class="chat-preview">
                    <div class="chat-header">
                        <el-avatar :size="36" :src="agentForm.avatar || defaultAvatar">
                            <el-icon><Search /></el-icon>
                        </el-avatar>
                        <span class="agent-name">{{ agentForm.name || '未命名智能体' }}</span>
                    </div>
                    <div class="chat-messages">
                        <div class="message bot" v-if="agentForm.welcomeMessage">
                            <div class="message-content">{{ agentForm.welcomeMessage }}</div>
                        </div>
                        <div class="suggested-questions-preview" v-if="agentForm.suggestedQuestions.length > 0">
                            <el-button
                                v-for="(q, index) in agentForm.suggestedQuestions"
                                :key="index"
                                size="small"
                                round
                            >
                                {{ q }}
                            </el-button>
                        </div>
                    </div>
                    <div class="chat-input">
                        <el-input placeholder="输入消息..." disabled>
                            <template #append>
                                <el-button :icon="Promotion" />
                            </template>
                        </el-input>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="config-footer">
            <el-button @click="$emit('cancel')">取消</el-button>
            <el-button type="info" @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="saving">
                {{ isEdit ? '保存并发布' : '创建智能体' }}
            </el-button>
        </div>

        <!-- 头像选择对话框 -->
        <el-dialog v-model="showAvatarDialog" title="选择头像" width="500px">
            <div class="avatar-selector">
                <div
                    v-for="avatar in avatarOptions"
                    :key="avatar"
                    class="avatar-option"
                    :class="{ active: agentForm.avatar === avatar }"
                    @click="agentForm.avatar = avatar"
                >
                    <el-avatar :size="60" :src="avatar" />
                </div>
            </div>
            <template #footer>
                <el-button @click="showAvatarDialog = false">取消</el-button>
                <el-button type="primary" @click="showAvatarDialog = false">确定</el-button>
            </template>
        </el-dialog>

        <!-- 提示词模板对话框 -->
        <el-dialog v-model="showPromptTemplates" title="提示词模板" width="600px">
            <div class="prompt-templates">
                <el-card
                    v-for="template in promptTemplates"
                    :key="template.id"
                    class="template-card"
                    shadow="hover"
                    @click="applyPromptTemplate(template)"
                >
                    <h5>{{ template.name }}</h5>
                    <p>{{ template.description }}</p>
                    <el-tag size="small" type="info">{{ template.category }}</el-tag>
                </el-card>
            </div>
        </el-dialog>

        <!-- 知识库创建对话框 -->
        <el-dialog v-model="showKnowledgeBaseDialog" title="创建知识库" width="500px">
            <el-form :model="newKnowledgeBase" label-position="top">
                <el-form-item label="知识库名称">
                    <el-input v-model="newKnowledgeBase.name" placeholder="请输入知识库名称" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input
                        v-model="newKnowledgeBase.description"
                        type="textarea"
                        :rows="3"
                        placeholder="描述知识库用途"
                    />
                </el-form-item>
                <el-form-item label="Embedding模型">
                    <el-select v-model="newKnowledgeBase.embeddingModel" style="width: 100%">
                        <el-option label="text-embedding-3-small" value="text-embedding-3-small" />
                        <el-option label="text-embedding-3-large" value="text-embedding-3-large" />
                        <el-option label="bge-large-zh-v1.5" value="bge-large-zh" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showKnowledgeBaseDialog = false">取消</el-button>
                <el-button type="primary" @click="createKnowledgeBase">创建</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import {
    ChatDotRound, Share, SetUp, Document, Plus, Delete,
    Refresh, Edit, Promotion, ArrowRight, Search, FolderOpened,
    DataLine, Connection, Picture, VideoCamera, Cpu, Calendar,
    Clock, Key, Files, Link, Monitor, Flag, CircleCheck
} from '@element-plus/icons-vue'
import { getAgentDetailApi, createAgentApi, updateAgentApi } from '@/api/aiAgent'

interface MCPServer {
    name: string
    command: string
    args: string
    env: string
    enabled: boolean
}

interface AgentForm {
    name: string
    description: string
    type: 'chat' | 'workflow' | 'multi-agent'
    avatar: string
    systemPrompt: string
    welcomeMessage: string
    suggestedQuestions: string[]
    modelConfig: {
        model: string
        temperature: number
        topP: number
        maxTokens: number
        contextLength: number
    }
    mcpEnabled: boolean
    mcpServers: MCPServer[]
    ragEnabled: boolean
    ragConfig: {
        knowledgeBaseIds: number[]
        retrievalMode: string
        topK: number
        scoreThreshold: number
        rerankEnabled: boolean
    }
    workflowEnabled: boolean
    workflowConfig: {
        nodes: any[]
        edges: any[]
    }
    plugins: string[]
}

const props = defineProps<{
    agentId?: number | null
    isEdit: boolean
}>()

const emit = defineEmits(['success', 'cancel'])

const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=agent'
const formRef = ref<FormInstance>()
const activeTab = ref('basic')
const saving = ref(false)
const showAvatarDialog = ref(false)
const showPromptTemplates = ref(false)
const showKnowledgeBaseDialog = ref(false)
const showQuestionInput = ref(false)
const questionInputRef = ref()
const newQuestion = ref('')

const agentForm = reactive<AgentForm>({
    name: '',
    description: '',
    type: 'chat',
    avatar: '',
    systemPrompt: '',
    welcomeMessage: '你好！我是你的AI助手，有什么可以帮助你的吗？',
    suggestedQuestions: [],
    modelConfig: {
        model: 'gpt-4o',
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 4096,
        contextLength: 10
    },
    mcpEnabled: false,
    mcpServers: [],
    ragEnabled: false,
    ragConfig: {
        knowledgeBaseIds: [],
        retrievalMode: 'hybrid',
        topK: 5,
        scoreThreshold: 0.5,
        rerankEnabled: true
    },
    workflowEnabled: false,
    workflowConfig: {
        nodes: [],
        edges: []
    },
    plugins: []
})

const formRules: FormRules = {
    name: [
        { required: true, message: '请输入智能体名称', trigger: 'blur' },
        { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择智能体类型', trigger: 'change' }
    ]
}

// 头像选项
const avatarOptions = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=agent1',
    'https://api.dicebear.com/7.x/bottts/svg?seed=agent2',
    'https://api.dicebear.com/7.x/bottts/svg?seed=agent3',
    'https://api.dicebear.com/7.x/bottts/svg?seed=agent4',
    'https://api.dicebear.com/7.x/bottts/svg?seed=agent5',
    'https://api.dicebear.com/7.x/bottts/svg?seed=agent6',
    'https://api.dicebear.com/7.x/bottts/svg?seed=robot1',
    'https://api.dicebear.com/7.x/bottts/svg?seed=robot2'
]

// 提示词模板
const promptTemplates = [
    {
        id: 1,
        name: '客服助手',
        description: '专业的客服对话助手，能够耐心解答用户问题',
        category: '客服',
        content: '你是一个专业的客服助手。请用友好、专业的语气回答用户的问题。如果遇到无法解答的问题，请建议用户联系人工客服。'
    },
    {
        id: 2,
        name: '代码助手',
        description: '帮助开发者编写、审查和优化代码',
        category: '开发',
        content: '你是一个资深的软件开发工程师。请帮助用户解决编程问题，提供代码示例，并解释代码的工作原理。确保代码遵循最佳实践。'
    },
    {
        id: 3,
        name: '写作助手',
        description: '协助用户进行各类文案写作',
        category: '写作',
        content: '你是一个专业的写作助手。请帮助用户完成各类写作任务，包括文章、邮件、报告等。确保内容清晰、有条理、符合目标读者的需求。'
    },
    {
        id: 4,
        name: '数据分析师',
        description: '帮助用户分析数据并提供洞察',
        category: '分析',
        content: '你是一个专业的数据分析师。请帮助用户理解和分析数据，提供有价值的洞察和建议。使用清晰的语言解释复杂的数据概念。'
    }
]

// 预置MCP服务
const presetMcpServers = [
    {
        id: 'filesystem',
        name: '文件系统',
        description: '读写本地文件',
        icon: FolderOpened,
        command: 'npx',
        args: '["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]'
    },
    {
        id: 'database',
        name: '数据库',
        description: '连接SQL数据库',
        icon: DataLine,
        command: 'npx',
        args: '["-y", "@modelcontextprotocol/server-postgres"]'
    },
    {
        id: 'web',
        name: 'Web浏览',
        description: '访问和解析网页',
        icon: Monitor,
        command: 'npx',
        args: '["-y", "@anthropics/mcp-server-puppeteer"]'
    },
    {
        id: 'github',
        name: 'GitHub',
        description: '操作GitHub仓库',
        icon: Link,
        command: 'npx',
        args: '["-y", "@modelcontextprotocol/server-github"]'
    }
]

// 知识库列表
const knowledgeBases = ref([
    { id: 1, name: '产品文档库', docCount: 156 },
    { id: 2, name: '技术FAQ库', docCount: 89 },
    { id: 3, name: '用户手册库', docCount: 42 }
])

// 新建知识库表单
const newKnowledgeBase = reactive({
    name: '',
    description: '',
    embeddingModel: 'text-embedding-3-small'
})

// 工作流节点类型
const workflowNodeTypes = [
    { type: 'start', name: '开始节点', description: '工作流入口', icon: Flag, color: '#67c23a' },
    { type: 'llm', name: 'LLM节点', description: '调用大语言模型', icon: Cpu, color: '#409eff' },
    { type: 'knowledge', name: '知识检索', description: '从知识库检索', icon: Search, color: '#e6a23c' },
    { type: 'code', name: '代码执行', description: '执行Python代码', icon: Monitor, color: '#909399' },
    { type: 'http', name: 'HTTP请求', description: '调用外部API', icon: Connection, color: '#f56c6c' },
    { type: 'condition', name: '条件分支', description: '条件判断', icon: Share, color: '#9b59b6' },
    { type: 'end', name: '结束节点', description: '工作流出口', icon: CircleCheck, color: '#67c23a' }
]

// 可用插件
const availablePlugins = [
    {
        id: 'web_search',
        name: '联网搜索',
        description: '搜索互联网获取最新信息',
        icon: Search,
        color: '#409eff',
        tags: ['信息获取', '实时性']
    },
    {
        id: 'code_interpreter',
        name: '代码解释器',
        description: '执行Python代码进行数据分析',
        icon: Cpu,
        color: '#67c23a',
        tags: ['代码执行', '数据分析']
    },
    {
        id: 'image_gen',
        name: '图片生成',
        description: '使用DALL-E生成图片',
        icon: Picture,
        color: '#e6a23c',
        tags: ['图片生成', 'AI绘画']
    },
    {
        id: 'file_reader',
        name: '文件阅读',
        description: '读取和解析各类文档',
        icon: Files,
        color: '#909399',
        tags: ['文档处理', 'PDF']
    },
    {
        id: 'calendar',
        name: '日程管理',
        description: '管理日程和提醒',
        icon: Calendar,
        color: '#f56c6c',
        tags: ['日程', '提醒']
    },
    {
        id: 'weather',
        name: '天气查询',
        description: '查询天气预报',
        icon: Clock,
        color: '#00bcd4',
        tags: ['天气', '生活']
    }
]

// 添加推荐问题
const addSuggestedQuestion = () => {
    if (newQuestion.value.trim()) {
        agentForm.suggestedQuestions.push(newQuestion.value.trim())
        newQuestion.value = ''
    }
    showQuestionInput.value = false
}

// 移除推荐问题
const removeSuggestedQuestion = (index: number) => {
    agentForm.suggestedQuestions.splice(index, 1)
}

// 添加MCP服务
const addMcpServer = () => {
    agentForm.mcpServers.push({
        name: '',
        command: '',
        args: '',
        env: '',
        enabled: true
    })
}

// 移除MCP服务
const removeMcpServer = (index: number) => {
    agentForm.mcpServers.splice(index, 1)
}

// 添加预置MCP服务
const addPresetMcpServer = (preset: any) => {
    agentForm.mcpServers.push({
        name: preset.name,
        command: preset.command,
        args: preset.args,
        env: '',
        enabled: true
    })
    ElMessage.success(`已添加 ${preset.name} 服务`)
}

// 切换插件
const togglePlugin = (pluginId: string, enabled: boolean) => {
    if (enabled) {
        if (!agentForm.plugins.includes(pluginId)) {
            agentForm.plugins.push(pluginId)
        }
    } else {
        const index = agentForm.plugins.indexOf(pluginId)
        if (index > -1) {
            agentForm.plugins.splice(index, 1)
        }
    }
}

// 应用提示词模板
const applyPromptTemplate = (template: any) => {
    agentForm.systemPrompt = template.content
    showPromptTemplates.value = false
    ElMessage.success('已应用模板')
}

// 创建知识库
const createKnowledgeBase = () => {
    if (!newKnowledgeBase.name) {
        ElMessage.warning('请输入知识库名称')
        return
    }
    const newId = knowledgeBases.value.length + 1
    knowledgeBases.value.push({
        id: newId,
        name: newKnowledgeBase.name,
        docCount: 0
    })
    agentForm.ragConfig.knowledgeBaseIds.push(newId)
    showKnowledgeBaseDialog.value = false
    newKnowledgeBase.name = ''
    newKnowledgeBase.description = ''
    ElMessage.success('知识库创建成功')
}

// 打开工作流编辑器
const openWorkflowEditor = () => {
    ElMessage.info('工作流编辑器功能开发中...')
}

// 获取节点标签类型
const getNodeTagType = (type: string) => {
    const map: Record<string, string> = {
        start: 'success',
        end: 'success',
        llm: 'primary',
        knowledge: 'warning',
        code: 'info',
        http: 'danger',
        condition: ''
    }
    return map[type] || 'info'
}

// 刷新预览
const refreshPreview = () => {
    ElMessage.success('预览已刷新')
}

// 加载智能体详情
const loadAgentDetail = async () => {
    if (!props.agentId) return
    try {
        const res = await getAgentDetailApi(props.agentId)
        if (res.code === 200 && res.data) {
            Object.assign(agentForm, res.data)
        }
    } catch (error: any) {
        ElMessage.error(error.message || '加载智能体详情失败')
    }
}

// 保存草稿
const handleSaveDraft = async () => {
    saving.value = true
    try {
        const params = { ...agentForm, status: 0 }
        let res
        if (props.isEdit && props.agentId) {
            res = await updateAgentApi(props.agentId, params)
        } else {
            res = await createAgentApi(params)
        }
        if (res.code === 200) {
            ElMessage.success('草稿已保存')
            emit('success')
        } else {
            ElMessage.error(res.message || '保存失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
    } finally {
        saving.value = false
    }
}

// 提交
const handleSubmit = async () => {
    if (!formRef.value) return
    try {
        await formRef.value.validate()
        saving.value = true
        const params = { ...agentForm, status: 1 }
        let res
        if (props.isEdit && props.agentId) {
            res = await updateAgentApi(props.agentId, params)
        } else {
            res = await createAgentApi(params)
        }
        if (res.code === 200) {
            ElMessage.success(props.isEdit ? '保存成功' : '创建成功')
            emit('success')
        } else {
            ElMessage.error(res.message || '操作失败')
        }
    } catch (error: any) {
        if (error !== false) {
            ElMessage.error(error.message || '操作失败')
        }
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    if (props.isEdit && props.agentId) {
        loadAgentDetail()
    }
})
</script>

<style lang="less" scoped>
.agent-config {
    display: flex;
    height: calc(100vh - 60px);
    position: relative;
}

.config-panel {
    flex: 1;
    padding: 20px;
    overflow: hidden;
    border-right: 1px solid #f0f0f0;

    .config-tabs {
        height: 100%;

        :deep(.el-tabs__content) {
            height: calc(100% - 55px);
        }
    }
}

.config-section {
    padding: 20px;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
    }

    .section-desc {
        color: #909399;
        font-size: 13px;
        margin-bottom: 20px;
    }
}

.avatar-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.type-radio-group {
    display: flex;
    gap: 15px;
    width: 100%;

    :deep(.el-radio-button) {
        flex: 1;

        .el-radio-button__inner {
            width: 100%;
            height: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            white-space: normal;

            .el-icon {
                font-size: 24px;
            }

            span {
                font-size: 14px;
                font-weight: 500;
            }

            small {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}

.prompt-tips {
    margin-top: 8px;
    text-align: right;
}

.suggested-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .question-tag {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.slider-tips {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

.form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

.mcp-server-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 15px;
}

.mcp-server-card {
    .server-header {
        display: flex;
        align-items: center;
        gap: 10px;

        .el-input {
            flex: 1;
        }
    }

    .mt-10 {
        margin-top: 10px;
    }
}

.preset-mcp-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.preset-card {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
    }

    .preset-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
    }

    .preset-info {
        flex: 1;

        h5 {
            margin: 0 0 5px 0;
            font-size: 14px;
        }

        p {
            margin: 0;
            font-size: 12px;
            color: #909399;
        }
    }
}

.rag-settings-card {
    background: #f5f7fa;
}

.workflow-preview {
    margin-top: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 8px;

    h5 {
        margin: 0 0 10px 0;
    }

    .workflow-nodes {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }

    .workflow-node {
        display: flex;
        align-items: center;
        gap: 10px;
    }
}

.node-types {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-top: 15px;
}

.node-type-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;

    .node-info {
        flex: 1;

        h6 {
            margin: 0 0 5px 0;
            font-size: 13px;
        }

        p {
            margin: 0;
            font-size: 12px;
            color: #909399;
        }
    }
}

.plugins-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.plugin-card {
    .plugin-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .plugin-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }

        .plugin-info {
            flex: 1;

            h5 {
                margin: 0 0 5px 0;
                font-size: 14px;
            }

            p {
                margin: 0;
                font-size: 12px;
                color: #909399;
            }
        }
    }

    .plugin-tags {
        margin-top: 10px;
        display: flex;
        gap: 5px;
    }
}

.preview-panel {
    width: 380px;
    padding: 20px;
    background: #f5f7fa;
    display: flex;
    flex-direction: column;

    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h4 {
            margin: 0;
        }
    }

    .preview-content {
        flex: 1;
        overflow: auto;
    }

    .chat-preview {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        height: 100%;

        .chat-header {
            padding: 15px;
            border-bottom: 1px solid #ebeef5;
            display: flex;
            align-items: center;
            gap: 10px;

            .agent-name {
                font-weight: 500;
            }
        }

        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow: auto;

            .message {
                margin-bottom: 15px;

                &.bot {
                    .message-content {
                        background: #f5f7fa;
                        padding: 10px 15px;
                        border-radius: 0 12px 12px 12px;
                        display: inline-block;
                    }
                }
            }

            .suggested-questions-preview {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }
        }

        .chat-input {
            padding: 15px;
            border-top: 1px solid #ebeef5;
        }
    }
}

.config-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px 20px;
    background: #fff;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.avatar-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;

    .avatar-option {
        cursor: pointer;
        padding: 10px;
        border-radius: 8px;
        border: 2px solid transparent;
        text-align: center;
        transition: all 0.3s;

        &:hover {
            background: #f5f7fa;
        }

        &.active {
            border-color: var(--el-color-primary);
            background: #ecf5ff;
        }
    }
}

.prompt-templates {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .template-card {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            transform: translateX(5px);
        }

        h5 {
            margin: 0 0 8px 0;
        }

        p {
            margin: 0 0 10px 0;
            color: #606266;
            font-size: 13px;
        }
    }
}
</style>
