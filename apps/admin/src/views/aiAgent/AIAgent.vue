<template>
    <div class="ai-agent-container">
        <!-- 顶部操作栏 -->
        <el-card class="header-card" shadow="never">
            <div class="header-content">
                <div class="header-left">
                    <h2 class="page-title">
                        <el-icon class="title-icon"><MagicStick /></el-icon>
                        AI智能体工作台
                    </h2>
                    <el-tag type="info" size="small" class="count-tag">
                        共 {{ total }} 个智能体
                    </el-tag>
                </div>
                <div class="header-right">
                    <el-button type="primary" :icon="Plus" @click="handleCreate">
                        创建智能体
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 筛选和搜索栏 -->
        <el-card class="filter-card" shadow="never">
            <el-row :gutter="20" align="middle">
                <el-col :span="6">
                    <el-input
                        v-model="searchParams.keyword"
                        placeholder="搜索智能体名称或描述..."
                        clearable
                        @clear="handleSearch"
                        @keyup.enter="handleSearch"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-select
                        v-model="searchParams.type"
                        placeholder="智能体类型"
                        clearable
                        @change="handleSearch"
                        style="width: 100%"
                    >
                        <el-option label="全部" value="" />
                        <el-option label="对话型" value="chat" />
                        <el-option label="工作流型" value="workflow" />
                        <el-option label="多Agent" value="multi-agent" />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-select
                        v-model="searchParams.status"
                        placeholder="状态"
                        clearable
                        @change="handleSearch"
                        style="width: 100%"
                    >
                        <el-option label="全部" value="" />
                        <el-option label="已发布" :value="1" />
                        <el-option label="草稿" :value="0" />
                        <el-option label="已停用" :value="-1" />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-button :icon="Search" type="primary" @click="handleSearch">查询</el-button>
                    <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 智能体卡片列表 -->
        <div class="agent-list" v-loading="loading">
            <el-empty v-if="!loading && agentList.length === 0" description="暂无智能体" :image-size="120">
                <el-button type="primary" @click="handleCreate">创建第一个智能体</el-button>
            </el-empty>
            <el-row :gutter="20" v-else>
                <el-col
                    :xs="24" :sm="12" :md="8" :lg="6"
                    v-for="agent in agentList"
                    :key="agent.id"
                    class="agent-col"
                >
                    <el-card
                        class="agent-card"
                        shadow="hover"
                        :class="{ published: agent.status === 1, draft: agent.status === 0, disabled: agent.status === -1 }"
                    >
                        <div class="card-header">
                            <div class="agent-avatar">
                                <el-avatar :size="56" :src="agent.avatar || defaultAvatar">
                                    <el-icon :size="28"><Search /></el-icon>
                                </el-avatar>
                            </div>
                            <div class="agent-info">
                                <h3 class="agent-name" :title="agent.name">{{ agent.name }}</h3>
                                <div class="agent-tags">
                                    <el-tag :type="getTypeTagType(agent.type)" size="small" effect="plain">
                                        {{ getTypeLabel(agent.type) }}
                                    </el-tag>
                                    <el-tag :type="getStatusTagType(agent.status)" size="small">
                                        {{ getStatusLabel(agent.status) }}
                                    </el-tag>
                                </div>
                            </div>
                        </div>

                        <div class="card-content">
                            <p class="agent-desc">{{ agent.description || '暂无描述' }}</p>
                            <div class="agent-capabilities">
                                <el-tooltip content="MCP服务" placement="top" v-if="agent.mcpEnabled">
                                    <el-tag type="success" size="small" effect="light">
                                        <el-icon><Connection /></el-icon> MCP
                                    </el-tag>
                                </el-tooltip>
                                <el-tooltip content="知识库RAG" placement="top" v-if="agent.ragEnabled">
                                    <el-tag type="warning" size="small" effect="light">
                                        <el-icon><Collection /></el-icon> RAG
                                    </el-tag>
                                </el-tooltip>
                                <el-tooltip content="工作流" placement="top" v-if="agent.workflowEnabled">
                                    <el-tag type="primary" size="small" effect="light">
                                        <el-icon><Share /></el-icon> 工作流
                                    </el-tag>
                                </el-tooltip>
                                <el-tooltip content="插件" placement="top" v-if="agent.pluginsCount > 0">
                                    <el-tag type="info" size="small" effect="light">
                                        <el-icon><Grid /></el-icon> {{ agent.pluginsCount }}个插件
                                    </el-tag>
                                </el-tooltip>
                            </div>
                        </div>

                        <div class="card-footer">
                            <div class="card-meta">
                                <span class="meta-item">
                                    <el-icon><ChatLineSquare /></el-icon>
                                    {{ formatNumber(agent.chatCount || 0) }}次对话
                                </span>
                                <span class="meta-item">
                                    <el-icon><Calendar /></el-icon>
                                    {{ formatDate(agent.updatedAt) }}
                                </span>
                            </div>
                            <div class="card-actions">
                                <el-tooltip content="配置" placement="top">
                                    <el-button text type="primary" size="small" :icon="Setting" @click="handleEdit(agent)" />
                                </el-tooltip>
                                <el-tooltip content="对话测试" placement="top">
                                    <el-button text type="success" size="small" :icon="ChatDotRound" @click="handleTest(agent)" />
                                </el-tooltip>
                                <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, agent)">
                                    <el-button text type="info" size="small" :icon="MoreFilled" />
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item command="publish" v-if="agent.status !== 1">
                                                <el-icon><CircleCheck /></el-icon> 发布
                                            </el-dropdown-item>
                                            <el-dropdown-item command="disable" v-if="agent.status === 1">
                                                <el-icon><CircleClose /></el-icon> 停用
                                            </el-dropdown-item>
                                            <el-dropdown-item command="copy">
                                                <el-icon><CopyDocument /></el-icon> 复制
                                            </el-dropdown-item>
                                            <el-dropdown-item command="export">
                                                <el-icon><Download /></el-icon> 导出
                                            </el-dropdown-item>
                                            <el-dropdown-item command="delete" divided>
                                                <span style="color: var(--el-color-danger)">
                                                    <el-icon><Delete /></el-icon> 删除
                                                </span>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 分页 -->
        <el-card class="pagination-card" shadow="never" v-if="total > 0">
            <el-pagination
                v-model:current-page="pageInfo.page"
                v-model:page-size="pageInfo.pageSize"
                :page-sizes="[8, 16, 24, 32]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </el-card>

        <!-- 创建/编辑智能体抽屉 -->
        <el-drawer
            v-model="drawerVisible"
            :title="isEdit ? '编辑智能体' : '创建智能体'"
            size="80%"
            :close-on-click-modal="false"
            class="agent-drawer"
        >
            <AgentConfig
                v-if="drawerVisible"
                :agent-id="currentAgentId"
                :is-edit="isEdit"
                @success="handleConfigSuccess"
                @cancel="drawerVisible = false"
            />
        </el-drawer>

        <!-- 对话测试抽屉 -->
        <el-drawer
            v-model="testDrawerVisible"
            title="对话测试"
            size="50%"
            class="test-drawer"
        >
            <AgentChat
                v-if="testDrawerVisible && currentTestAgent"
                :agent="currentTestAgent"
            />
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    MagicStick, Plus, Search, Refresh, Setting, ChatDotRound, MoreFilled,
    Delete, CopyDocument, Download, CircleCheck, CircleClose, Calendar,
    ChatLineSquare, Connection, Collection, Share, Grid, Service
} from '@element-plus/icons-vue'
import AgentConfig from './components/AgentConfig.vue'
import AgentChat from './components/AgentChat.vue'
import {
    getAgentListApi,
    deleteAgentApi,
    publishAgentApi,
    disableAgentApi,
    copyAgentApi,
    exportAgentApi
} from '@/api/aiAgent'

interface AIAgent {
    id: number
    name: string
    description: string
    type: 'chat' | 'workflow' | 'multi-agent'
    status: number // 1: 已发布, 0: 草稿, -1: 已停用
    avatar?: string
    mcpEnabled: boolean
    ragEnabled: boolean
    workflowEnabled: boolean
    pluginsCount: number
    chatCount: number
    createdAt: string
    updatedAt: string
}

const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=agent'
const loading = ref(false)
const total = ref(0)
const agentList = ref<AIAgent[]>([])
const drawerVisible = ref(false)
const testDrawerVisible = ref(false)
const isEdit = ref(false)
const currentAgentId = ref<number | null>(null)
const currentTestAgent = ref<AIAgent | null>(null)

const searchParams = reactive({
    keyword: '',
    type: '',
    status: ''
})

const pageInfo = reactive({
    page: 1,
    pageSize: 8
})

// 加载智能体列表
const loadAgentList = async () => {
    loading.value = true
    try {
        const params: any = {
            page: pageInfo.page,
            pageSize: pageInfo.pageSize
        }
        if (searchParams.keyword) params.keyword = searchParams.keyword
        if (searchParams.type) params.type = searchParams.type
        if (searchParams.status !== '') params.status = Number(searchParams.status)

        const res = await getAgentListApi(params)
        if (res.code === 200 && res.data) {
            agentList.value = res.data.list || []
            total.value = res.data.total || 0
        } else {
            ElMessage.error(res.message || '加载智能体列表失败')
        }
    } catch (error: any) {
        console.error('加载智能体列表失败:', error)
        ElMessage.error(error.message || '加载智能体列表失败')
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    pageInfo.page = 1
    loadAgentList()
}

// 重置
const handleReset = () => {
    searchParams.keyword = ''
    searchParams.type = ''
    searchParams.status = ''
    pageInfo.page = 1
    loadAgentList()
}

// 分页
const handleSizeChange = (size: number) => {
    pageInfo.pageSize = size
    pageInfo.page = 1
    loadAgentList()
}

const handleCurrentChange = (page: number) => {
    pageInfo.page = page
    loadAgentList()
}

// 创建智能体
const handleCreate = () => {
    isEdit.value = false
    currentAgentId.value = null
    drawerVisible.value = true
}

// 编辑智能体
const handleEdit = (agent: AIAgent) => {
    isEdit.value = true
    currentAgentId.value = agent.id
    drawerVisible.value = true
}

// 对话测试
const handleTest = (agent: AIAgent) => {
    currentTestAgent.value = agent
    testDrawerVisible.value = true
}

// 配置成功回调
const handleConfigSuccess = () => {
    drawerVisible.value = false
    loadAgentList()
}

// 下拉菜单命令处理
const handleCommand = async (command: string, agent: AIAgent) => {
    switch (command) {
        case 'publish':
            await handlePublish(agent)
            break
        case 'disable':
            await handleDisable(agent)
            break
        case 'copy':
            await handleCopy(agent)
            break
        case 'export':
            await handleExport(agent)
            break
        case 'delete':
            await handleDelete(agent)
            break
    }
}

// 发布智能体
const handlePublish = async (agent: AIAgent) => {
    try {
        await ElMessageBox.confirm(`确定要发布智能体"${agent.name}"吗？`, '发布确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        const res = await publishAgentApi(agent.id)
        if (res.code === 200) {
            ElMessage.success('发布成功')
            loadAgentList()
        } else {
            ElMessage.error(res.message || '发布失败')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '发布失败')
        }
    }
}

// 停用智能体
const handleDisable = async (agent: AIAgent) => {
    try {
        await ElMessageBox.confirm(`确定要停用智能体"${agent.name}"吗？`, '停用确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        const res = await disableAgentApi(agent.id)
        if (res.code === 200) {
            ElMessage.success('已停用')
            loadAgentList()
        } else {
            ElMessage.error(res.message || '停用失败')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '停用失败')
        }
    }
}

// 复制智能体
const handleCopy = async (agent: AIAgent) => {
    try {
        const res = await copyAgentApi(agent.id)
        if (res.code === 200) {
            ElMessage.success('复制成功')
            loadAgentList()
        } else {
            ElMessage.error(res.message || '复制失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '复制失败')
    }
}

// 导出智能体
const handleExport = async (agent: AIAgent) => {
    try {
        const res = await exportAgentApi(agent.id)
        if (res.code === 200 && res.data) {
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${agent.name}_config.json`
            a.click()
            URL.revokeObjectURL(url)
            ElMessage.success('导出成功')
        } else {
            ElMessage.error(res.message || '导出失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '导出失败')
    }
}

// 删除智能体
const handleDelete = async (agent: AIAgent) => {
    try {
        await ElMessageBox.confirm(`确定要删除智能体"${agent.name}"吗？此操作不可恢复！`, '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        const res = await deleteAgentApi(agent.id)
        if (res.code === 200) {
            ElMessage.success('删除成功')
            loadAgentList()
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '删除失败')
        }
    }
}

// 获取类型标签
const getTypeTagType = (type: string) => {
    const map: Record<string, string> = {
        'chat': 'primary',
        'workflow': 'success',
        'multi-agent': 'warning'
    }
    return map[type] || 'info'
}

const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
        'chat': '对话型',
        'workflow': '工作流型',
        'multi-agent': '多Agent'
    }
    return map[type] || type
}

// 获取状态标签
const getStatusTagType = (status: number) => {
    const map: Record<number, string> = {
        1: 'success',
        0: 'info',
        [-1]: 'danger'
    }
    return map[status] || 'info'
}

const getStatusLabel = (status: number) => {
    const map: Record<number, string> = {
        1: '已发布',
        0: '草稿',
        [-1]: '已停用'
    }
    return map[status] || '未知'
}

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
}

// 格式化数字
const formatNumber = (num: number) => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
}

onMounted(() => {
    loadAgentList()
})
</script>

<style lang="less" scoped>
.ai-agent-container {
    padding: 20px;
    background-color: var(--bg-base);
    min-height: calc(100vh - 60px);
}

.header-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;

            .page-title {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 10px;

                .title-icon {
                    color: var(--el-color-primary);
                }
            }
        }
    }
}

.filter-card {
    margin-bottom: 20px;
    border-radius: 8px;
}

.agent-list {
    min-height: 400px;

    .agent-col {
        margin-bottom: 20px;
    }

    .agent-card {
        height: 100%;
        border-radius: 12px;
        transition: all 0.3s;
        border: 1px solid #ebeef5;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        &.published {
            border-left: 4px solid var(--el-color-success);
        }

        &.draft {
            border-left: 4px solid var(--el-color-info);
        }

        &.disabled {
            border-left: 4px solid var(--el-color-danger);
            opacity: 0.7;
        }

        .card-header {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 15px;

            .agent-info {
                flex: 1;
                min-width: 0;

                .agent-name {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .agent-tags {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }
            }
        }

        .card-content {
            margin-bottom: 15px;

            .agent-desc {
                margin: 0 0 12px 0;
                color: #606266;
                font-size: 13px;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: 40px;
            }

            .agent-capabilities {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;

                .el-tag {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }
            }
        }

        .card-footer {
            padding-top: 12px;
            border-top: 1px solid #ebeef5;

            .card-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 12px;

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #909399;
                }
            }

            .card-actions {
                display: flex;
                justify-content: flex-end;
                gap: 5px;
            }
        }
    }
}

.pagination-card {
    margin-top: 20px;
    border-radius: 8px;
    text-align: center;
}

.agent-drawer {
    :deep(.el-drawer__body) {
        padding: 0;
    }
}

.test-drawer {
    :deep(.el-drawer__body) {
        padding: 0;
        display: flex;
        flex-direction: column;
    }
}
</style>
