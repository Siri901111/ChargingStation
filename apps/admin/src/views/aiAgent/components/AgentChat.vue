<template>
    <div class="agent-chat">
        <div class="chat-container">
            <!-- 消息列表 -->
            <div class="chat-messages" ref="messagesRef">
                <!-- 欢迎消息 -->
                <div class="message bot" v-if="agent.welcomeMessage">
                    <div class="message-avatar">
                        <el-avatar :size="36" :src="agent.avatar || defaultAvatar">
                            <el-icon><Search /></el-icon>
                        </el-avatar>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            {{ agent.welcomeMessage }}
                        </div>
                        <div class="suggested-questions" v-if="agent.suggestedQuestions?.length > 0 && messages.length === 0">
                            <el-button
                                v-for="(q, index) in agent.suggestedQuestions"
                                :key="index"
                                size="small"
                                round
                                @click="sendMessage(q)"
                            >
                                {{ q }}
                            </el-button>
                        </div>
                    </div>
                </div>

                <!-- 对话消息 -->
                <div
                    v-for="(msg, index) in messages"
                    :key="index"
                    class="message"
                    :class="msg.role"
                >
                    <div class="message-avatar">
                        <el-avatar v-if="msg.role === 'bot'" :size="36" :src="agent.avatar || defaultAvatar">
                            <el-icon><Search /></el-icon>
                        </el-avatar>
                        <el-avatar v-else :size="36">
                            <el-icon><User /></el-icon>
                        </el-avatar>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble" v-if="msg.role === 'user'">
                            {{ msg.content }}
                        </div>
                        <div class="message-bubble markdown-body" v-else v-html="renderMarkdown(msg.content)"></div>
                        <div class="message-meta">
                            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                            <span class="message-actions" v-if="msg.role === 'bot'">
                                <el-tooltip content="复制" placement="top">
                                    <el-button text size="small" :icon="CopyDocument" @click="copyMessage(msg.content)" />
                                </el-tooltip>
                                <el-tooltip content="重新生成" placement="top">
                                    <el-button text size="small" :icon="Refresh" @click="regenerate(index)" />
                                </el-tooltip>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 加载中 -->
                <div class="message bot" v-if="loading">
                    <div class="message-avatar">
                        <el-avatar :size="36" :src="agent.avatar || defaultAvatar">
                            <el-icon><Search /></el-icon>
                        </el-avatar>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble typing">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 输入区域 -->
            <div class="chat-input-area">
                <div class="input-toolbar">
                    <el-tooltip content="上传文件" placement="top">
                        <el-button text :icon="Upload" />
                    </el-tooltip>
                    <el-tooltip content="插入图片" placement="top">
                        <el-button text :icon="Picture" />
                    </el-tooltip>
                    <el-divider direction="vertical" />
                    <el-tooltip content="清空对话" placement="top">
                        <el-button text :icon="Delete" @click="clearMessages" />
                    </el-tooltip>
                </div>
                <div class="input-wrapper">
                    <el-input
                        v-model="inputMessage"
                        type="textarea"
                        :rows="3"
                        placeholder="输入消息，按 Enter 发送..."
                        resize="none"
                        @keydown.enter.exact.prevent="handleSend"
                    />
                    <el-button
                        class="send-btn"
                        type="primary"
                        :icon="Promotion"
                        circle
                        :disabled="!inputMessage.trim() || loading"
                        @click="handleSend"
                    />
                </div>
                <div class="input-tips">
                    <span>{{ agent.modelConfig?.model || 'GPT-4o' }}</span>
                    <span>·</span>
                    <span>Token: {{ totalTokens }}</span>
                </div>
            </div>
        </div>

        <!-- 侧边信息栏 -->
        <div class="chat-sidebar">
            <el-collapse v-model="activeCollapse">
                <el-collapse-item title="智能体信息" name="info">
                    <div class="agent-info">
                        <div class="info-item">
                            <label>名称</label>
                            <span>{{ agent.name }}</span>
                        </div>
                        <div class="info-item">
                            <label>类型</label>
                            <el-tag size="small">{{ getTypeLabel(agent.type) }}</el-tag>
                        </div>
                        <div class="info-item">
                            <label>描述</label>
                            <span>{{ agent.description || '暂无描述' }}</span>
                        </div>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="能力配置" name="capabilities">
                    <div class="capabilities">
                        <div class="capability-item">
                            <el-icon><Connection /></el-icon>
                            <span>MCP服务</span>
                            <el-tag :type="agent.mcpEnabled ? 'success' : 'info'" size="small">
                                {{ agent.mcpEnabled ? '已启用' : '未启用' }}
                            </el-tag>
                        </div>
                        <div class="capability-item">
                            <el-icon><Collection /></el-icon>
                            <span>知识库RAG</span>
                            <el-tag :type="agent.ragEnabled ? 'success' : 'info'" size="small">
                                {{ agent.ragEnabled ? '已启用' : '未启用' }}
                            </el-tag>
                        </div>
                        <div class="capability-item">
                            <el-icon><Share /></el-icon>
                            <span>工作流</span>
                            <el-tag :type="agent.workflowEnabled ? 'success' : 'info'" size="small">
                                {{ agent.workflowEnabled ? '已启用' : '未启用' }}
                            </el-tag>
                        </div>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="对话历史" name="history">
                    <div class="history-list">
                        <div
                            v-for="(session, index) in chatHistory"
                            :key="index"
                            class="history-item"
                            @click="loadSession(session)"
                        >
                            <div class="history-title">{{ session.title }}</div>
                            <div class="history-time">{{ formatDate(session.createdAt) }}</div>
                        </div>
                        <el-empty v-if="chatHistory.length === 0" description="暂无历史记录" :image-size="60" />
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
    Search, User, CopyDocument, Refresh, Upload, Picture, Delete,
    Promotion, Connection, Collection, Share
} from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import { chatWithAgentApi } from '@/api/aiAgent'

// 初始化markdown-it
const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true
})

interface Message {
    role: 'user' | 'bot'
    content: string
    timestamp: Date
}

interface ChatSession {
    id: number
    title: string
    createdAt: string
}

const props = defineProps<{
    agent: any
}>()

const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=agent'
const messagesRef = ref<HTMLElement>()
const inputMessage = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const totalTokens = ref(0)
const activeCollapse = ref(['info', 'capabilities'])
const chatHistory = ref<ChatSession[]>([])

// 发送消息
const sendMessage = async (content: string) => {
    if (!content.trim() || loading.value) return

    // 添加用户消息
    messages.value.push({
        role: 'user',
        content: content.trim(),
        timestamp: new Date()
    })

    inputMessage.value = ''
    await scrollToBottom()

    // 调用API获取回复
    loading.value = true
    try {
        const res = await chatWithAgentApi(props.agent.id, {
            message: content,
            history: messages.value.slice(-10).map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }))
        })

        if (res.code === 200 && res.data) {
            messages.value.push({
                role: 'bot',
                content: res.data.reply,
                timestamp: new Date()
            })
            totalTokens.value += res.data.tokens || 0
        } else {
            ElMessage.error(res.message || '获取回复失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '请求失败')
        // 模拟回复
        messages.value.push({
            role: 'bot',
            content: `收到您的消息："${content}"。这是一个测试回复，实际使用时会连接真实的AI服务。`,
            timestamp: new Date()
        })
    } finally {
        loading.value = false
        await scrollToBottom()
    }
}

// 处理发送
const handleSend = () => {
    sendMessage(inputMessage.value)
}

// 重新生成
const regenerate = async (index: number) => {
    // 找到最后一条用户消息
    const userMsgIndex = messages.value.slice(0, index).reverse().findIndex(m => m.role === 'user')
    if (userMsgIndex === -1) return

    const actualIndex = index - userMsgIndex - 1
    const userMessage = messages.value[actualIndex].content

    // 移除之后的所有消息
    messages.value = messages.value.slice(0, actualIndex + 1)

    // 重新发送
    loading.value = true
    try {
        const res = await chatWithAgentApi(props.agent.id, {
            message: userMessage,
            history: messages.value.slice(-10).map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }))
        })

        if (res.code === 200 && res.data) {
            messages.value.push({
                role: 'bot',
                content: res.data.reply,
                timestamp: new Date()
            })
        }
    } catch (error: any) {
        messages.value.push({
            role: 'bot',
            content: '重新生成的回复内容...',
            timestamp: new Date()
        })
    } finally {
        loading.value = false
        await scrollToBottom()
    }
}

// 清空消息
const clearMessages = () => {
    messages.value = []
    totalTokens.value = 0
}

// 复制消息
const copyMessage = async (content: string) => {
    try {
        await navigator.clipboard.writeText(content)
        ElMessage.success('已复制到剪贴板')
    } catch {
        ElMessage.error('复制失败')
    }
}

// 渲染Markdown
const renderMarkdown = (content: string) => {
    return md.render(content)
}

// 滚动到底部
const scrollToBottom = async () => {
    await nextTick()
    if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
}

// 格式化时间
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 获取类型标签
const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
        'chat': '对话型',
        'workflow': '工作流型',
        'multi-agent': '多Agent'
    }
    return map[type] || type
}

// 加载历史会话
const loadSession = (session: ChatSession) => {
    ElMessage.info(`加载会话: ${session.title}`)
}

onMounted(() => {
    // 模拟历史记录
    chatHistory.value = [
        { id: 1, title: '关于产品功能的咨询', createdAt: '2024-12-28' },
        { id: 2, title: '技术问题排查', createdAt: '2024-12-27' }
    ]
})
</script>

<style lang="less" scoped>
.agent-chat {
    display: flex;
    height: 100%;
    background: #fff;
}

.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
}

.chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f5f7fa;
}

.message {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    &.user {
        flex-direction: row-reverse;

        .message-content {
            align-items: flex-end;
        }

        .message-bubble {
            background: var(--el-color-primary);
            color: #fff;
            border-radius: 12px 0 12px 12px;
        }

        .message-meta {
            text-align: right;
        }
    }

    &.bot {
        .message-bubble {
            background: #fff;
            border-radius: 0 12px 12px 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
    }
}

.message-content {
    display: flex;
    flex-direction: column;
    max-width: 70%;
}

.message-bubble {
    padding: 12px 16px;
    line-height: 1.6;

    &.typing {
        display: flex;
        gap: 4px;
        padding: 15px 20px;

        .dot {
            width: 8px;
            height: 8px;
            background: #909399;
            border-radius: 50%;
            animation: typing 1.4s infinite;

            &:nth-child(2) {
                animation-delay: 0.2s;
            }

            &:nth-child(3) {
                animation-delay: 0.4s;
            }
        }
    }
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-5px);
    }
}

.message-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
}

.suggested-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.chat-input-area {
    padding: 15px 20px;
    background: #fff;
    border-top: 1px solid #ebeef5;
}

.input-toolbar {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 10px;
}

.input-wrapper {
    position: relative;

    .send-btn {
        position: absolute;
        right: 10px;
        bottom: 10px;
    }
}

.input-tips {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
}

.chat-sidebar {
    width: 280px;
    padding: 15px;
    overflow-y: auto;
}

.agent-info {
    .info-item {
        margin-bottom: 12px;

        label {
            display: block;
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
        }

        span {
            font-size: 14px;
            color: #303133;
        }
    }
}

.capabilities {
    .capability-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
            border-bottom: none;
        }

        span {
            flex: 1;
            font-size: 14px;
        }
    }
}

.history-list {
    .history-item {
        padding: 10px;
        margin-bottom: 8px;
        background: #f5f7fa;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            background: #ebeef5;
        }

        .history-title {
            font-size: 14px;
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .history-time {
            font-size: 12px;
            color: #909399;
        }
    }
}

.markdown-body {
    :deep(p) {
        margin: 0 0 10px 0;

        &:last-child {
            margin-bottom: 0;
        }
    }

    :deep(pre) {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
    }

    :deep(code) {
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
    }

    :deep(ul), :deep(ol) {
        padding-left: 20px;
        margin: 10px 0;
    }
}
</style>
