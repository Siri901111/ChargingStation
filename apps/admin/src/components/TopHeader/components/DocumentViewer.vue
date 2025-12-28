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
        width="80%"
        :close-on-click-modal="false"
        class="doc-dialog"
    >
        <div class="doc-content" v-html="docContent"></div>
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

:deep(.doc-dialog) {
    .doc-content {
        max-height: 70vh;
        overflow-y: auto;
        padding: 20px;
        background-color: var(--bg-container);
        border-radius: 8px;
        line-height: 1.8;
        color: var(--text-primary);

        h1, h2, h3, h4, h5, h6 {
            color: var(--text-primary);
            margin-top: 24px;
            margin-bottom: 16px;
        }

        p {
            color: var(--text-secondary);
            margin-bottom: 12px;
        }

        code {
            background-color: var(--bg-base);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: var(--el-color-primary);
        }

        pre {
            background-color: var(--bg-base);
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            border: 1px solid var(--border-color-light);

            code {
                background: none;
                padding: 0;
                color: var(--text-primary);
            }
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;

            th, td {
                padding: 12px;
                border: 1px solid var(--border-color-light);
                text-align: left;
            }

            th {
                background-color: var(--bg-base);
                font-weight: 600;
                color: var(--text-primary);
            }

            td {
                color: var(--text-secondary);
            }
        }

        ul, ol {
            padding-left: 24px;
            margin-bottom: 12px;

            li {
                color: var(--text-secondary);
                margin-bottom: 8px;
            }
        }

        blockquote {
            border-left: 4px solid var(--el-color-primary);
            padding-left: 16px;
            margin: 16px 0;
            color: var(--text-secondary);
            background-color: var(--bg-base);
            padding: 12px 16px;
            border-radius: 4px;
        }

        .loading, .error {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
        }
    }
}
</style>

