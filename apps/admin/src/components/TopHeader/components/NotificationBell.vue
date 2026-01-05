<template>
    <el-popover placement="bottom-end" :width="350" trigger="click">
        <template #reference>
            <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
                <div class="header-action" :title="t('header.notification')">
                    <el-icon :size="18"><Bell /></el-icon>
                </div>
            </el-badge>
        </template>
        <div class="notice-panel">
            <div class="notice-header">
                <span>{{ t('header.notification') }}</span>
                <el-button text type="primary" size="small" @click="loadNotices">
                    <el-icon><Refresh /></el-icon>
                </el-button>
            </div>
            <div class="notice-list" v-loading="noticesLoading">
                <div
                    v-for="notice in notices"
                    :key="notice.id"
                    class="notice-item"
                    :class="{ unread: !notice.read }"
                    @click="handleNoticeClick(notice)"
                >
                    <div class="notice-title">{{ notice.title || t('header.notification') }}</div>
                    <div class="notice-content">{{ notice.content || t('common.noData') }}</div>
                    <div class="notice-time">{{ notice.createdAt || '' }}</div>
                </div>
                <el-empty v-if="!noticesLoading && notices.length === 0" :description="t('header.notificationEmpty')" :image-size="60" />
            </div>
            <div v-if="notices.length > 0" class="notice-footer">
                <el-button text type="primary" @click="viewAllNotices">{{ t('header.viewAll') }}</el-button>
            </div>
        </div>
    </el-popover>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getPersonalNoticesApi } from '@/api/personal'
import { Bell, Refresh } from '@element-plus/icons-vue'

const { t } = useI18n()
const router = useRouter()

const noticesLoading = ref(false)
const notices = ref<any[]>([])
const unreadCount = ref(0)

const loadNotices = async () => {
    noticesLoading.value = true
    try {
        const res = await getPersonalNoticesApi()
        if (res.code === 200 && res.data) {
            notices.value = res.data.list || []
            unreadCount.value = notices.value.filter((n: any) => !n.read).length
        }
    } catch {
        notices.value = []
        unreadCount.value = 0
    } finally {
        noticesLoading.value = false
    }
}

const handleNoticeClick = (notice: any) => {
    notice.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
}

const viewAllNotices = () => router.push('/personal')

onMounted(() => {
    loadNotices()
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
    color: rgba(0, 0, 0, 0.65);
    transition: all 0.2s ease;

    &:hover {
        background-color: #f0f0f0;
        color: var(--el-color-primary);
    }
}

.notice-panel {
    max-height: 400px;
    display: flex;
    flex-direction: column;
}

.notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 500;
}

.notice-list {
    flex: 1;
    overflow-y: auto;
    max-height: 300px;
}

.notice-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f0f0f0;
    }

    &.unread {
        background-color: #ecf5ff;
        border-left: 3px solid var(--el-color-primary);
    }

    .notice-title {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.88);
        margin-bottom: 4px;
    }

    .notice-content {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.65);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .notice-time {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.45);
    }
}

.notice-footer {
    padding: 8px 16px;
    text-align: center;
    border-top: 1px solid #f0f0f0;
}
</style>

