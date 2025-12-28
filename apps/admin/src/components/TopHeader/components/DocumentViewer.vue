<template>
    <el-popover placement="bottom-end" :width="600" trigger="click">
        <template #reference>
            <div class="header-action" :title="t('header.documentation')">
                <el-icon :size="18"><Document /></el-icon>
            </div>
        </template>
        <div class="document-viewer">
            <div class="doc-header">
                <h3>{{ t('header.documentation') }}</h3>
                <el-input
                    v-model="searchKeyword"
                    :placeholder="t('header.searchDocument')"
                    size="small"
                    clearable
                    style="margin-top: 12px;"
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
            </div>
            <div class="doc-categories">
                <div
                    v-for="category in filteredCategories"
                    :key="category.id"
                    class="doc-category"
                    @click="openCategory(category)"
                >
                    <el-icon :size="20"><component :is="category.icon" /></el-icon>
                    <div class="category-info">
                        <div class="category-name">{{ category.name }}</div>
                        <div class="category-count">{{ category.count }} {{ t('header.documents') }}</div>
                    </div>
                    <el-icon :size="14"><ArrowRight /></el-icon>
                </div>
            </div>
        </div>
    </el-popover>

    <!-- 文档详情对话框 - Typora 风格 -->
    <el-dialog
        v-model="docDialogVisible"
        :title="currentCategory?.name"
        width="90%"
        top="3vh"
        :close-on-click-modal="false"
        class="typora-dialog"
        destroy-on-close
        :fullscreen="isFullscreen"
    >
        <template #header="{ titleId }">
            <div class="dialog-header">
                <span :id="titleId" class="dialog-title">{{ currentCategory?.name }}</span>
                <div class="dialog-actions">
                    <el-tooltip content="切换全屏" placement="bottom">
                        <el-button text @click="isFullscreen = !isFullscreen">
                            <el-icon :size="18">
                                <FullScreen v-if="!isFullscreen" />
                                <Close v-else />
                            </el-icon>
                        </el-button>
                    </el-tooltip>
                </div>
            </div>
        </template>

        <div class="typora-container" :class="{ 'dark-mode': isDarkMode }">
            <!-- 侧边目录 -->
            <aside class="typora-sidebar" v-if="showSidebar && tocList.length > 0">
                <div class="sidebar-header">
                    <span>目录</span>
                    <el-button text size="small" @click="showSidebar = false">
                        <el-icon><Close /></el-icon>
                    </el-button>
                </div>
                <nav class="toc-nav">
                    <a
                        v-for="item in tocList"
                        :key="item.id"
                        :href="'#' + item.id"
                        class="toc-item"
                        :class="['level-' + item.level]"
                        @click.prevent="scrollToHeading(item.id)"
                    >
                        {{ item.text }}
                    </a>
                </nav>
            </aside>

            <!-- 主内容区 -->
            <main class="typora-main" ref="mainContentRef">
                <div
                    class="typora-content"
                    v-html="docContent"
                    v-loading="loading"
                    element-loading-text="正在加载文档..."
                ></div>
            </main>

            <!-- 悬浮工具栏 -->
            <div class="typora-toolbar">
                <el-tooltip content="显示目录" placement="left" v-if="!showSidebar && tocList.length > 0">
                    <el-button circle @click="showSidebar = true">
                        <el-icon><Menu /></el-icon>
                    </el-button>
                </el-tooltip>
                <el-tooltip content="返回顶部" placement="left">
                    <el-button circle @click="scrollToTop">
                        <el-icon><Top /></el-icon>
                    </el-button>
                </el-tooltip>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <span class="file-count" v-if="currentCategory">
                    共 {{ currentCategory.files.length }} 个文档
                </span>
                <el-button @click="docDialogVisible = false">{{ t('common.close') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/theme'
import { storeToRefs } from 'pinia'
import {
    Document, Search, ArrowRight, Collection, Guide, Setting,
    DataAnalysis, FullScreen, Close, Menu, Top
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDocumentContent, extractToc } from '@/utils/document/documentLoader'

const { t } = useI18n()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const searchKeyword = ref('')
const docDialogVisible = ref(false)
const currentCategory = ref<any>(null)
const docContent = ref('')
const loading = ref(false)
const isFullscreen = ref(false)
const showSidebar = ref(true)
const tocList = ref<{ id: string; text: string; level: number }[]>([])
const mainContentRef = ref<HTMLElement | null>(null)

const isDarkMode = computed(() => isDark.value)

const categories = [
    {
        id: 'overview',
        name: t('doc.overview'),
        icon: Guide,
        count: 2,
        files: ['README.md', '项目文档总览.md']
    },
    {
        id: 'guides',
        name: t('doc.guides'),
        icon: Setting,
        count: 4,
        files: [
            'guides/快速启动指南.md',
            'guides/admin-环境变量配置.md',
            'guides/server-环境变量配置.md',
            'guides/前后端对接说明.md'
        ]
    },
    {
        id: 'api',
        name: t('doc.api'),
        icon: DataAnalysis,
        count: 13,
        files: [
            'api/API接口文档.md',
            'api/API文档-用户管理.md',
            'api/API文档-充电站管理.md',
            'api/API文档-充电桩管理.md',
            'api/API文档-订单管理.md',
            'api/API文档-会员卡管理.md',
            'api/API文档-计费模板管理.md',
            'api/API文档-报警管理.md',
            'api/API文档-营收统计.md',
            'api/API文档-数据看板.md',
            'api/API文档-电子地图.md',
            'api/API文档-个人中心.md',
            'api/API文档-招商管理.md',
            'api/API文档-前端监控.md'
        ]
    },
    {
        id: 'design',
        name: t('doc.design'),
        icon: Collection,
        count: 2,
        files: [
            'design/数据库设计文档.md',
            'design/系统功能分析与扩展建议.md'
        ]
    }
]

const filteredCategories = computed(() => {
    if (!searchKeyword.value) return categories
    const keyword = searchKeyword.value.toLowerCase()
    return categories.filter(cat =>
        cat.name.toLowerCase().includes(keyword) ||
        cat.files.some(file => file.toLowerCase().includes(keyword))
    )
})

const openCategory = async (category: any) => {
    currentCategory.value = category
    docDialogVisible.value = true
    loading.value = true
    docContent.value = ''
    tocList.value = []

    try {
        const content = await getDocumentContent(category.files)
        docContent.value = content

        // 提取目录
        await nextTick()
        tocList.value = extractToc(content)
    } catch (error) {
        ElMessage.error(t('doc.loadFailed'))
        docContent.value = `<div class="error-message">${t('doc.loadFailed')}</div>`
    } finally {
        loading.value = false
    }
}

const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element && mainContentRef.value) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

const scrollToTop = () => {
    if (mainContentRef.value) {
        mainContentRef.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

// 监听对话框关闭，重置状态
watch(docDialogVisible, (val) => {
    if (!val) {
        isFullscreen.value = false
        showSidebar.value = true
    }
})
</script>

<style lang="less" scoped>
.header-action {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--border-color-light);
        color: var(--el-color-primary);
    }
}

.document-viewer {
    max-height: 600px;
    overflow-y: auto;
}

.doc-header {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color-light);
    margin-bottom: 12px;

    h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
    }
}

.doc-categories {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.doc-category {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--bg-container);
    border: 1px solid var(--border-color-light);

    &:hover {
        background-color: var(--border-color-light);
        border-color: var(--el-color-primary);
        transform: translateX(4px);
    }

    .category-info {
        flex: 1;

        .category-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .category-count {
            font-size: 12px;
            color: var(--text-tertiary);
        }
    }
}

// Dialog 自定义样式
.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .dialog-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .dialog-actions {
        display: flex;
        gap: 8px;
    }
}

.dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .file-count {
        font-size: 13px;
        color: var(--text-tertiary);
    }
}

// Typora 容器
.typora-container {
    display: flex;
    height: calc(85vh - 140px);
    background-color: var(--bg-container);
    border-radius: 8px;
    overflow: hidden;
    position: relative;

    &.dark-mode {
        background-color: #1e1e1e;
    }
}

// 侧边目录
.typora-sidebar {
    width: 260px;
    min-width: 260px;
    background-color: var(--bg-base);
    border-right: 1px solid var(--border-color-light);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .dark-mode & {
        background-color: #252526;
        border-color: #3c3c3c;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        font-weight: 600;
        font-size: 14px;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-color-light);

        .dark-mode & {
            border-color: #3c3c3c;
        }
    }

    .toc-nav {
        flex: 1;
        overflow-y: auto;
        padding: 12px 0;

        .toc-item {
            display: block;
            padding: 8px 16px;
            font-size: 13px;
            color: var(--text-secondary);
            text-decoration: none;
            transition: all 0.2s;
            border-left: 3px solid transparent;

            &:hover {
                background-color: var(--border-color-light);
                color: var(--el-color-primary);
            }

            &.level-1 {
                font-weight: 600;
                padding-left: 16px;
            }

            &.level-2 {
                padding-left: 28px;
            }

            &.level-3 {
                padding-left: 40px;
                font-size: 12px;
            }
        }
    }
}

// 主内容区
.typora-main {
    flex: 1;
    overflow-y: auto;
    padding: 32px 48px;
    scroll-behavior: smooth;

    .dark-mode & {
        background-color: #1e1e1e;
    }
}

// 悬浮工具栏
.typora-toolbar {
    position: absolute;
    right: 24px;
    bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
}

// ==========================================
// Typora 风格 Markdown 内容样式
// ==========================================
:deep(.typora-content) {
    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: #333;
    word-wrap: break-word;

    .dark-mode & {
        color: #d4d4d4;
    }

    // 文档文章
    .doc-article {
        margin-bottom: 64px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .doc-article-header {
        margin-bottom: 32px;
        padding-bottom: 16px;
        border-bottom: 2px solid var(--el-color-primary);

        .doc-article-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 12px 0;
            line-height: 1.3;
        }

        .doc-article-meta {
            .doc-file-path {
                font-size: 13px;
                color: var(--text-tertiary);
                font-family: 'SF Mono', Consolas, monospace;
                background: var(--bg-base);
                padding: 4px 8px;
                border-radius: 4px;
            }
        }
    }

    .doc-separator {
        margin: 48px 0;
        border: none;
        border-top: 2px dashed var(--border-color);
    }

    // 标题样式 - Typora 风格
    h1, h2, h3, h4, h5, h6 {
        margin-top: 32px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary);
        position: relative;

        .header-anchor {
            position: absolute;
            left: -24px;
            color: var(--text-tertiary);
            font-weight: 400;
            opacity: 0;
            transition: opacity 0.2s;
            text-decoration: none;
        }

        &:hover .header-anchor {
            opacity: 1;
        }
    }

    h1 {
        font-size: 2em;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color-light);
        margin-top: 0;
    }

    h2 {
        font-size: 1.5em;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color-light);
    }

    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.9em; color: var(--text-secondary); }

    // 段落
    p {
        margin: 0 0 16px 0;
        line-height: 1.8;
    }

    // 链接
    a {
        color: var(--el-color-primary);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s;

        &:hover {
            border-bottom-color: var(--el-color-primary);
        }
    }

    // 强调
    strong { font-weight: 600; }
    em { font-style: italic; }

    // 高亮标记
    mark {
        background-color: #fff3bf;
        padding: 2px 4px;
        border-radius: 3px;

        .dark-mode & {
            background-color: #5c4d1e;
        }
    }

    // 删除线
    del {
        text-decoration: line-through;
        color: var(--text-tertiary);
    }

    // 列表
    ul, ol {
        margin: 0 0 16px 0;
        padding-left: 24px;

        li {
            margin-bottom: 8px;
            line-height: 1.7;

            p {
                margin-bottom: 8px;
            }

            &::marker {
                color: var(--el-color-primary);
            }
        }

        // 嵌套列表
        ul, ol {
            margin-top: 8px;
            margin-bottom: 0;
        }
    }

    // 任务列表 - Typora 风格
    .task-list-item {
        list-style: none;
        margin-left: -24px;
        padding-left: 0;

        input[type="checkbox"] {
            margin-right: 8px;
            width: 16px;
            height: 16px;
            accent-color: var(--el-color-primary);
        }

        &.checked {
            color: var(--text-tertiary);
            text-decoration: line-through;
        }
    }

    // 引用块 - Typora 风格
    blockquote {
        margin: 16px 0;
        padding: 12px 20px;
        border-left: 4px solid var(--el-color-primary);
        background-color: #f8f9fa;
        border-radius: 0 8px 8px 0;
        color: var(--text-secondary);

        .dark-mode & {
            background-color: #2d2d2d;
        }

        p {
            margin: 0;
        }

        blockquote {
            margin-top: 12px;
            border-left-color: var(--border-color);
        }
    }

    // 代码块 - Typora 风格
    .hljs-code-block {
        margin: 16px 0;
        border-radius: 8px;
        overflow: hidden;
        background-color: #fafafa;
        border: 1px solid var(--border-color-light);

        .dark-mode & {
            background-color: #1e1e1e;
            border-color: #3c3c3c;
        }

        .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            background-color: #f0f0f0;
            border-bottom: 1px solid var(--border-color-light);

            .dark-mode & {
                background-color: #2d2d2d;
                border-color: #3c3c3c;
            }

            .code-lang {
                font-size: 12px;
                font-weight: 500;
                color: var(--text-secondary);
                text-transform: uppercase;
            }

            .copy-btn {
                padding: 4px 12px;
                font-size: 12px;
                color: var(--text-secondary);
                background-color: transparent;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                    background-color: var(--el-color-primary);
                    border-color: var(--el-color-primary);
                    color: #fff;
                }

                &.copied {
                    background-color: #67c23a;
                    border-color: #67c23a;
                    color: #fff;
                }
            }
        }

        code {
            display: block;
            padding: 16px;
            overflow-x: auto;
            font-family: 'SF Mono', 'Fira Code', Consolas, Monaco, 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            tab-size: 4;
        }
    }

    // 行内代码
    code:not(.hljs) {
        padding: 2px 6px;
        margin: 0 2px;
        font-size: 90%;
        font-family: 'SF Mono', Consolas, monospace;
        background-color: #f5f5f5;
        border-radius: 4px;
        color: #e83e8c;

        .dark-mode & {
            background-color: #2d2d2d;
            color: #ce9178;
        }
    }

    // 表格 - Typora 风格
    .table-wrapper {
        margin: 16px 0;
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid var(--border-color-light);

        .typora-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;

            th, td {
                padding: 12px 16px;
                text-align: left;
                border-bottom: 1px solid var(--border-color-light);
            }

            th {
                font-weight: 600;
                background-color: #fafafa;
                color: var(--text-primary);

                .dark-mode & {
                    background-color: #2d2d2d;
                }
            }

            td {
                color: var(--text-secondary);
            }

            tr:last-child td {
                border-bottom: none;
            }

            tr:hover td {
                background-color: #f5f7fa;

                .dark-mode & {
                    background-color: #2d2d2d;
                }
            }
        }
    }

    // 图片 - Typora 风格
    .typora-image {
        margin: 24px 0;
        text-align: center;

        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        figcaption {
            margin-top: 12px;
            font-size: 14px;
            color: var(--text-tertiary);
            font-style: italic;
        }
    }

    // 分割线
    hr {
        margin: 32px 0;
        border: none;
        border-top: 1px solid var(--border-color-light);
    }

    // 自定义容器 - 类似 VuePress 风格
    .custom-container {
        margin: 16px 0;
        padding: 16px 20px;
        border-radius: 8px;
        border-left: 4px solid;

        .custom-container-title {
            font-weight: 600;
            margin-bottom: 8px;
        }

        p:last-child {
            margin-bottom: 0;
        }

        &.tip {
            background-color: #e6f7ff;
            border-color: #1890ff;
            .custom-container-title { color: #1890ff; }
            .dark-mode & { background-color: #111d2c; }
        }

        &.warning {
            background-color: #fffbe6;
            border-color: #faad14;
            .custom-container-title { color: #faad14; }
            .dark-mode & { background-color: #2b2111; }
        }

        &.danger {
            background-color: #fff2f0;
            border-color: #ff4d4f;
            .custom-container-title { color: #ff4d4f; }
            .dark-mode & { background-color: #2a1215; }
        }

        &.info {
            background-color: #f4f4f5;
            border-color: #909399;
            .custom-container-title { color: #909399; }
            .dark-mode & { background-color: #262626; }
        }

        &.success {
            background-color: #f6ffed;
            border-color: #52c41a;
            .custom-container-title { color: #52c41a; }
            .dark-mode & { background-color: #162312; }
        }
    }

    // 折叠详情
    .custom-details {
        margin: 16px 0;
        padding: 12px 16px;
        background-color: var(--bg-base);
        border-radius: 8px;
        border: 1px solid var(--border-color-light);

        summary {
            font-weight: 600;
            cursor: pointer;
            color: var(--text-primary);
            outline: none;

            &:hover {
                color: var(--el-color-primary);
            }
        }

        &[open] summary {
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border-color-light);
        }
    }

    // 脚注
    .footnotes {
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid var(--border-color-light);
        font-size: 14px;
        color: var(--text-secondary);

        hr { display: none; }

        ol {
            padding-left: 20px;
        }
    }

    // 错误消息
    .error-message {
        padding: 48px;
        text-align: center;
        color: var(--el-color-danger);
        font-size: 16px;
    }

    // 加载中
    .loading {
        padding: 48px;
        text-align: center;
        color: var(--text-tertiary);
    }
}
</style>
