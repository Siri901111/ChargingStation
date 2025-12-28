<template>
    <div class="header-actions">
        <!-- 刷新 -->
        <div class="header-action" @click="handleRefresh" :title="t('header.refreshPage')">
            <el-icon :size="18"><Refresh /></el-icon>
        </div>

        <!-- 全局搜索 -->
        <div class="header-action" @click="openSearch" :title="`${t('header.search')} (Ctrl+K)`">
            <el-icon :size="18"><Search /></el-icon>
        </div>

        <!-- 全屏切换 -->
        <div class="header-action" @click="toggleFullscreen" :title="isFullscreen ? t('header.exitFullscreen') : t('header.fullscreen')">
            <el-icon :size="18">
                <FullScreen v-if="!isFullscreen" />
                <Aim v-else />
            </el-icon>
        </div>

        <!-- 页面缩放 -->
        <el-popover placement="bottom" :width="200" trigger="click">
            <template #reference>
                <div class="header-action" :title="t('header.pageZoom')">
                    <el-icon :size="18"><ZoomIn /></el-icon>
                </div>
            </template>
            <div class="zoom-panel">
                <div class="zoom-display">{{ Math.round(zoomLevel * 100) }}%</div>
                <el-slider :model-value="zoomLevel * 100" :min="50" :max="200" :step="10" @input="handleZoomChange" />
                <div class="zoom-actions">
                    <el-button size="small" @click="zoomIn">{{ t('header.zoomIn') }}</el-button>
                    <el-button size="small" @click="zoomOut">{{ t('header.zoomOut') }}</el-button>
                    <el-button size="small" @click="resetZoom">{{ t('header.resetZoom') }}</el-button>
                </div>
            </div>
        </el-popover>

        <!-- 水印 -->
        <div class="header-action" @click="toggleWatermark" :title="t('header.watermark')">
            <el-icon :size="18"><Document /></el-icon>
        </div>

        <!-- 锁屏 -->
        <div class="header-action" @click="handleLock" :title="t('header.lockScreen')">
            <el-icon :size="18"><Lock /></el-icon>
        </div>

        <!-- 快捷键帮助 -->
        <el-popover placement="bottom" :width="400" trigger="click">
            <template #reference>
                <div class="header-action" :title="t('header.shortcuts')">
                    <el-icon :size="18"><QuestionFilled /></el-icon>
                </div>
            </template>
            <div class="shortcuts-panel">
                <div class="shortcuts-title">{{ t('header.shortcuts') }}</div>
                <div v-for="(shortcuts, category) in shortcutsByCategory" :key="category" class="shortcuts-category">
                    <div class="category-title">{{ category }}</div>
                    <div v-for="shortcut in shortcuts" :key="shortcut.key" class="shortcut-item">
                        <kbd class="shortcut-key">{{ shortcut.key }}</kbd>
                        <span class="shortcut-desc">{{ shortcut.description }}</span>
                    </div>
                </div>
            </div>
        </el-popover>

        <!-- 清除缓存 -->
        <el-popover placement="bottom" :width="250" trigger="click">
            <template #reference>
                <div class="header-action" :title="t('header.clearCache')">
                    <el-icon :size="18"><Delete /></el-icon>
                </div>
            </template>
            <div class="cache-panel">
                <div class="cache-info">
                    <div>{{ t('header.cacheSize') }}: {{ cacheSize }}</div>
                </div>
                <el-button type="danger" size="small" @click="handleClearCache" style="width: 100%; margin-top: 12px;">
                    {{ t('header.clearCache') }}
                </el-button>
            </div>
        </el-popover>

        <!-- 系统信息 -->
        <el-popover placement="bottom" :width="400" trigger="click">
            <template #reference>
                <div class="header-action" :title="t('header.systemInfo')">
                    <el-icon :size="18"><InfoFilled /></el-icon>
                </div>
            </template>
            <div class="system-info-panel">
                <div class="info-title">{{ t('header.systemInfo') }}</div>
                <pre class="info-content">{{ systemInfoText }}</pre>
            </div>
        </el-popover>
    </div>

    <!-- 全局搜索弹窗 -->
    <el-dialog v-model="searchVisible" :title="t('header.search')" width="560px" @opened="focusSearch">
        <el-input
            ref="searchInputRef"
            v-model="searchKeyword"
            :placeholder="t('header.searchPlaceholder')"
            size="large"
            clearable
            @input="handleSearch"
            @keyup.enter="confirmSearch"
            @keyup.up.prevent="navigateUp"
            @keyup.down.prevent="navigateDown"
        >
            <template #prefix>
                <el-icon><Search /></el-icon>
            </template>
        </el-input>

        <!-- 搜索结果 -->
        <div class="search-results" v-if="searchResults.length > 0">
            <div
                v-for="(item, index) in searchResults"
                :key="item.url"
                class="search-item"
                :class="{ active: selectedIndex === index }"
                @click="goToMenu(item)"
                @mouseenter="selectedIndex = index"
            >
                <el-icon :size="18"><component :is="item.icon || 'Document'" /></el-icon>
                <div class="search-item-info">
                    <div class="search-item-name">{{ item.name }}</div>
                    <div class="search-item-path">{{ item.url }}</div>
                </div>
            </div>
        </div>

        <div v-else-if="searchKeyword" class="search-empty">
            {{ t('common.noData') }}
        </div>

        <div v-else class="search-tip">
            {{ t('header.searchTip') }}
        </div>

        <div class="search-footer">
            <span><kbd>↑↓</kbd> {{ t('header.navigate') }}</span>
            <span><kbd>Enter</kbd> {{ t('header.confirm') }}</span>
            <span><kbd>Esc</kbd> {{ t('header.close') }}</span>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/auth'
import {
    Refresh, Search, FullScreen, Aim, ZoomIn, Document, Lock,
    QuestionFilled, Delete, InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createWatermark, removeWatermark } from '@/utils/watermark'
import { lockScreen } from '@/utils/lockScreen'
import { getZoomLevel, setZoomLevel, zoomIn as zoomInUtil, zoomOut as zoomOutUtil, resetZoom as resetZoomUtil, initZoom } from '@/utils/pageZoom'
import { getCacheSize, formatCacheSize, clearAllCache } from '@/utils/cache'
import { getSystemInfo, formatSystemInfo } from '@/utils/systemInfo'
import { getShortcutsByCategory } from '@/utils/shortcuts'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const { menu } = storeToRefs(userStore)

// 全屏
const isFullscreen = ref(false)
const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}
const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

// 刷新
const handleRefresh = () => window.location.reload()

// 搜索
const searchVisible = ref(false)
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const selectedIndex = ref(0)
const searchInputRef = ref()
const isWatermarkEnabled = ref(false)

const openSearch = () => {
    searchVisible.value = true
    searchKeyword.value = ''
    searchResults.value = []
    selectedIndex.value = 0
}

const focusSearch = () => {
    searchInputRef.value?.focus()
}

const flattenMenu = (items: any[], result: any[] = []): any[] => {
    for (const item of items) {
        if (item.url) {
            result.push({ name: item.name, url: item.url, icon: item.icon })
        }
        if (item.children) {
            flattenMenu(item.children, result)
        }
    }
    return result
}

const handleSearch = () => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    if (!keyword) {
        searchResults.value = []
        return
    }
    const allMenus = flattenMenu(menu.value || [])
    searchResults.value = allMenus.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.url.toLowerCase().includes(keyword)
    ).slice(0, 10)
    selectedIndex.value = 0
}

const navigateUp = () => {
    if (searchResults.value.length > 0) {
        selectedIndex.value = (selectedIndex.value - 1 + searchResults.value.length) % searchResults.value.length
    }
}

const navigateDown = () => {
    if (searchResults.value.length > 0) {
        selectedIndex.value = (selectedIndex.value + 1) % searchResults.value.length
    }
}

const confirmSearch = () => {
    if (searchResults.value.length > 0) {
        goToMenu(searchResults.value[selectedIndex.value])
    }
}

const goToMenu = (item: any) => {
    searchVisible.value = false
    router.push(item.url)
}

// 页面缩放
const zoomLevel = ref(getZoomLevel())
const handleZoomChange = (value: number) => {
    zoomLevel.value = setZoomLevel(value / 100)
}

const zoomIn = () => {
    zoomLevel.value = zoomInUtil()
}

const zoomOut = () => {
    zoomLevel.value = zoomOutUtil()
}

const resetZoom = () => {
    zoomLevel.value = resetZoomUtil()
}

// 水印
const toggleWatermark = () => {
    if (isWatermarkEnabled.value) {
        removeWatermark()
        isWatermarkEnabled.value = false
        ElMessage.success(t('header.watermarkDisabled'))
    } else {
        createWatermark({ text: '充电站管理系统' })
        isWatermarkEnabled.value = true
        ElMessage.success(t('header.watermarkEnabled'))
    }
}

// 锁屏
const handleLock = () => {
    ElMessageBox.prompt(t('header.enterLockPassword'), t('header.lockScreen'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        inputType: 'password',
    }).then(({ value }) => {
        lockScreen({
            password: value,
        })
    }).catch(() => {})
}

// 缓存
const cacheSize = ref(formatCacheSize(getCacheSize()))
const handleClearCache = async () => {
    try {
        await ElMessageBox.confirm(t('header.clearCacheConfirm'), t('header.clearCache'), {
            type: 'warning',
        })
        clearAllCache()
        cacheSize.value = formatCacheSize(getCacheSize())
        ElMessage.success(t('header.cacheCleared'))
    } catch {}
}

// 系统信息
const systemInfoText = ref('')
const updateSystemInfo = () => {
    const info = getSystemInfo()
    systemInfoText.value = formatSystemInfo(info)
}

// 快捷键
const shortcutsByCategory = computed(() => getShortcutsByCategory())

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        // 显示快捷键帮助
    }
}

onMounted(() => {
    initZoom()
    zoomLevel.value = getZoomLevel()
    updateSystemInfo()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="less" scoped>
.header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

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

.zoom-panel {
    padding: 8px;
}

.zoom-display {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
}

.zoom-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.shortcuts-panel {
    padding: 8px;
    max-height: 500px;
    overflow-y: auto;
}

.shortcuts-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);
}

.shortcuts-category {
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }
}

.category-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color-light);

    &:last-child {
        border-bottom: none;
    }
}

.shortcut-key {
    padding: 4px 8px;
    background-color: var(--border-color-light);
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    color: var(--text-primary);
}

.shortcut-desc {
    font-size: 14px;
    color: var(--text-secondary);
}

.cache-panel {
    padding: 8px;
}

.cache-info {
    font-size: 14px;
    color: var(--text-secondary);
}

.system-info-panel {
    padding: 8px;
    max-height: 500px;
    overflow-y: auto;
}

.info-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
}

.info-content {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    background-color: var(--bg-base);
    padding: 12px;
    border-radius: 4px;
}

.search-results {
    margin-top: 16px;
    max-height: 320px;
    overflow-y: auto;
}

.search-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover,
    &.active {
        background-color: var(--border-color-light);
    }

    .search-item-info {
        flex: 1;
    }

    .search-item-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }

    .search-item-path {
        font-size: 12px;
        color: var(--text-tertiary);
    }
}

.search-empty,
.search-tip {
    padding: 32px;
    text-align: center;
    color: var(--text-tertiary);
}

.search-footer {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color-light);
    font-size: 12px;
    color: var(--text-tertiary);

    kbd {
        padding: 2px 6px;
        background-color: var(--border-color-light);
        border-radius: 4px;
        font-family: monospace;
    }
}
</style>

