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

    <!-- 文档详情对话框 -->
    <el-dialog
        v-model="docDialogVisible"
        :title="currentCategory?.name"
        width="85%"
        :close-on-click-modal="false"
        class="doc-dialog"
        destroy-on-close
    >
        <div class="markdown-body" v-html="docContent"></div>
        <template #footer>
            <el-button @click="docDialogVisible = false">{{ t('common.close') }}</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Document, Search, ArrowRight, Collection, Guide, Setting, DataAnalysis } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDocumentContent } from '@/utils/document/documentLoader'

const { t } = useI18n()

const searchKeyword = ref('')
const docDialogVisible = ref(false)
const currentCategory = ref<any>(null)
const docContent = ref('')

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
    docContent.value = '<div class="loading">' + t('common.loading') + '...</div>'
    
    try {
        const content = await getDocumentContent(category.files)
        docContent.value = content
    } catch (error) {
        ElMessage.error(t('doc.loadFailed'))
        docContent.value = '<div class="error">' + t('doc.loadFailed') + '</div>'
    }
}
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

// Markdown 样式 - 使用 GitHub 风格的样式
:deep(.markdown-body) {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 100%;
    margin: 0;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    font-size: 16px;
    line-height: 1.6;
    word-wrap: break-word;
    color: var(--text-primary);
    background-color: var(--bg-container);

    .doc-section {
        margin-bottom: 48px;

        .doc-section-title {
            font-size: 24px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--border-color);
            color: var(--text-primary);
        }
    }

    .doc-divider {
        margin: 48px 0;
        border: none;
        border-top: 1px solid var(--border-color);
    }

    h1, h2, h3, h4, h5, h6 {
        margin-top: 32px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--text-primary);
    }

    h1 {
        font-size: 32px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
    }

    h2 {
        font-size: 24px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color-light);
    }

    h3 {
        font-size: 20px;
    }

    h4 {
        font-size: 18px;
    }

    h5 {
        font-size: 16px;
    }

    h6 {
        font-size: 14px;
        color: var(--text-secondary);
    }

    p {
        margin-bottom: 16px;
        color: var(--text-primary);
    }

    ul, ol {
        margin-bottom: 16px;
        padding-left: 32px;
        color: var(--text-primary);

        li {
            margin-bottom: 8px;
            line-height: 1.6;

            p {
                margin-bottom: 8px;
            }
        }
    }

    blockquote {
        padding: 0 16px;
        margin: 16px 0;
        color: var(--text-secondary);
        border-left: 4px solid var(--el-color-primary);
        background-color: var(--bg-base);
        border-radius: 4px;
        padding: 12px 16px;

        p {
            margin: 0;
        }
    }

    code {
        padding: 2px 6px;
        margin: 0 2px;
        font-size: 85%;
        background-color: var(--bg-base);
        border-radius: 4px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        color: var(--el-color-danger);
    }

    pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: var(--bg-base);
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid var(--border-color-light);

        code {
            display: inline;
            max-width: auto;
            padding: 0;
            margin: 0;
            overflow: visible;
            line-height: inherit;
            word-wrap: normal;
            background-color: transparent;
            border: 0;
            color: var(--text-primary);
        }
    }

    // Highlight.js 代码高亮样式
    :deep(.hljs) {
        display: block;
        overflow-x: auto;
        padding: 16px;
        background: var(--bg-base);
        color: var(--text-primary);
        border-radius: 6px;
    }

    table {
        display: block;
        width: 100%;
        overflow: auto;
        margin: 16px 0;
        border-collapse: collapse;
        border-spacing: 0;

        th, td {
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            text-align: left;
        }

        th {
            font-weight: 600;
            background-color: var(--bg-base);
            color: var(--text-primary);
        }

        td {
            color: var(--text-secondary);
        }

        tr {
            background-color: var(--bg-container);
            border-top: 1px solid var(--border-color);

            &:nth-child(2n) {
                background-color: var(--bg-base);
            }
        }
    }

    a {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        margin: 16px 0;
    }

    hr {
        height: 1px;
        padding: 0;
        margin: 24px 0;
        background-color: var(--border-color);
        border: 0;
    }

    .loading, .error {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
        font-size: 14px;
    }
}

// Dark mode 适配
.dark :deep(.markdown-body) {
    .hljs {
        background: #1e1e1e;
        color: #d4d4d4;
    }
}
</style>
