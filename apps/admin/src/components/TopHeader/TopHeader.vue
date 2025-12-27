<template>
    <header class="top-header">
        <!-- 左侧功能区 -->
        <div class="header-left">
            <div class="header-action" @click="handleRefresh" title="刷新页面">
                <el-icon :size="18"><Refresh /></el-icon>
            </div>
        </div>

        <!-- 右侧功能区 -->
        <div class="header-right">
            <!-- 全局搜索 -->
            <div class="header-action" @click="openSearch" title="搜索 (Ctrl+K)">
                <el-icon :size="18"><Search /></el-icon>
            </div>

            <!-- 全屏切换 -->
            <div class="header-action" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
                <el-icon :size="18">
                    <FullScreen v-if="!isFullscreen" />
                    <Aim v-else />
                </el-icon>
            </div>

            <!-- 主题设置 -->
            <el-popover placement="bottom" :width="300" trigger="click">
                <template #reference>
                    <div class="header-action" title="主题设置">
                        <el-icon :size="18"><Brush /></el-icon>
                    </div>
                </template>
                <div class="theme-panel">
                    <!-- 主题模式 -->
                    <div class="theme-section">
                        <div class="theme-title">{{ t('header.themeMode') }}</div>
                        <div class="theme-modes">
                            <div
                                v-for="mode in themeModes"
                                :key="mode.value"
                                class="theme-mode-item"
                                :class="{ active: themeMode === mode.value }"
                                @click="handleThemeModeChange(mode.value)"
                            >
                                <el-icon :size="20"><component :is="mode.icon" /></el-icon>
                                <span>{{ t(mode.label) }}</span>
                            </div>
                        </div>
                    </div>
                    <!-- 主题色 -->
                    <div class="theme-section">
                        <div class="theme-title">{{ t('header.themeColor') }}</div>
                        <div class="theme-colors">
                            <div
                                v-for="(preset, key) in themeColorPresets"
                                :key="key"
                                class="theme-color-item"
                                :class="{ active: themeColor === key }"
                                :style="{ backgroundColor: preset.primary }"
                                :title="preset.name"
                                @click="handleThemeColorChange(key as ThemeColor)"
                            >
                                <el-icon v-if="themeColor === key" :size="14" color="#fff"><Check /></el-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </el-popover>

            <!-- 语言切换 -->
            <el-popover placement="bottom" :width="140" trigger="click">
                <template #reference>
                    <div class="header-action" title="语言切换">
                        <span class="lang-text">{{ currentLocaleName }}</span>
                    </div>
                </template>
                <div class="lang-panel">
                    <div
                        v-for="loc in localeOptions"
                        :key="loc.value"
                        class="lang-item"
                        :class="{ active: currentLocale === loc.value }"
                        @click="handleLocaleChange(loc.value)"
                    >
                        {{ loc.label }}
                        <el-icon v-if="currentLocale === loc.value" :size="14"><Check /></el-icon>
                    </div>
                </div>
            </el-popover>

            <!-- 消息通知 -->
            <el-popover placement="bottom-end" :width="350" trigger="click">
                <template #reference>
                    <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
                        <div class="header-action" title="消息通知">
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
                            <div class="notice-title">{{ notice.title || '通知' }}</div>
                            <div class="notice-content">{{ notice.content || '暂无内容' }}</div>
                            <div class="notice-time">{{ notice.createdAt || '' }}</div>
                        </div>
                        <el-empty v-if="!noticesLoading && notices.length === 0" :description="t('header.notificationEmpty')" :image-size="60" />
                    </div>
                    <div v-if="notices.length > 0" class="notice-footer">
                        <el-button text type="primary" @click="viewAllNotices">{{ t('header.viewAll') }}</el-button>
                    </div>
                </div>
            </el-popover>

            <!-- 分隔线 -->
            <div class="divider"></div>

            <!-- 用户信息 -->
            <el-avatar :src="userAvatar" :size="32" class="user-avatar">
                <el-icon :size="16"><User /></el-icon>
            </el-avatar>
            <el-dropdown trigger="click" @command="handleCommand">
                <span class="user-dropdown">
                    {{ displayName }}
                    <el-icon :size="14"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item icon="User" command="user">{{ t('header.userCenter') }}</el-dropdown-item>
                        <el-dropdown-item icon="Setting" command="setting">{{ t('header.systemSettings') }}</el-dropdown-item>
                        <el-dropdown-item divided icon="SwitchButton" command="logout">{{ t('header.logout') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </header>

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
            <span><kbd>↑↓</kbd> 导航</span>
            <span><kbd>Enter</kbd> 确认</span>
            <span><kbd>Esc</kbd> 关闭</span>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/auth'
import { useThemeStore, themeColorPresets, type ThemeMode, type ThemeColor } from '@/store/theme'
import { localeOptions, setLocale, getLocale, type LocaleType } from '@/locales'
import { getPersonalInfoApi, getPersonalNoticesApi } from '@/api/personal'
import {
    Bell, User, Refresh, ArrowDown, Search, FullScreen, Aim,
    Brush, Check, Sunny, Moon, Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const { username, menu } = storeToRefs(userStore)
const { themeMode, themeColor } = storeToRefs(themeStore)
const { setThemeMode, setThemeColor, initTheme } = themeStore

// 主题模式配置
const themeModes = [
    { value: 'light' as ThemeMode, label: 'header.light', icon: Sunny },
    { value: 'dark' as ThemeMode, label: 'header.dark', icon: Moon },
    { value: 'system' as ThemeMode, label: 'header.system', icon: Monitor },
]

// 语言
const currentLocale = ref<LocaleType>(getLocale())
const currentLocaleName = computed(() => {
    const loc = localeOptions.find(l => l.value === currentLocale.value)
    return loc?.label.slice(0, 2) || '中'
})

const handleLocaleChange = (loc: LocaleType) => {
    currentLocale.value = loc
    setLocale(loc)
    locale.value = loc
    ElMessage.success('语言切换成功')
}

// 主题切换
const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    ElMessage.success('主题切换成功')
}

const handleThemeColorChange = (color: ThemeColor) => {
    setThemeColor(color)
}

// 用户信息
const userAvatar = ref('')
const displayName = ref(username.value || '用户')

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

// 通知
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

// 搜索
const searchVisible = ref(false)
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const selectedIndex = ref(0)
const searchInputRef = ref()

const openSearch = () => {
    searchVisible.value = true
    searchKeyword.value = ''
    searchResults.value = []
    selectedIndex.value = 0
}

const focusSearch = () => {
    searchInputRef.value?.focus()
}

// 扁平化菜单
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

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
    }
}

// 个人信息
const loadPersonalInfo = async () => {
    try {
        const res = await getPersonalInfoApi()
        if (res.code === 200 && res.data) {
            userAvatar.value = res.data.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${res.data.id || 'default'}`
            displayName.value = res.data.name || username.value || '用户'
        }
    } catch {
        userAvatar.value = `https://api.dicebear.com/7.x/miniavs/svg?seed=${username.value || 'default'}`
    }
}

// 下拉菜单命令
const handleCommand = (command: string) => {
    switch (command) {
        case 'user': router.push('/personal'); break
        case 'setting': router.push('/system'); break
        case 'logout':
            userStore.logout()
            router.push('/login')
            break
    }
}

onMounted(() => {
    initTheme()
    loadPersonalInfo()
    loadNotices()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="less" scoped>
.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
    padding: 0 16px;
    background-color: var(--bg-container);
    border-bottom: 1px solid var(--border-color-light);
    transition: all 0.3s ease;
}

.header-left,
.header-right {
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

.lang-text {
    font-size: 14px;
    font-weight: 500;
}

.divider {
    width: 1px;
    height: 24px;
    background-color: var(--border-color);
    margin: 0 12px;
}

.user-avatar {
    cursor: pointer;
    margin-right: 8px;
}

.user-dropdown {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 14px;
    transition: color 0.2s;

    &:hover {
        color: var(--el-color-primary);
    }
}

// 主题面板
.theme-panel {
    padding: 4px;
}

.theme-section {
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
}

.theme-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.theme-modes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.theme-mode-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
    }

    &.active {
        border-color: var(--el-color-primary);
        background-color: var(--theme-color-light);
        color: var(--el-color-primary);
    }
}

.theme-colors {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.theme-color-item {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
    }

    &.active {
        border-color: var(--text-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
}

// 语言切换面板
.lang-panel {
    padding: 4px;
}

.lang-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-secondary);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--border-color-light);
        color: var(--text-primary);
    }

    &.active {
        background-color: var(--theme-color-light);
        color: var(--el-color-primary);
    }
}

// 通知面板
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
    border-bottom: 1px solid var(--border-color-light);
    font-weight: 500;
}

.notice-list {
    flex: 1;
    overflow-y: auto;
    max-height: 300px;
}

.notice-item {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color-light);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--border-color-light);
    }

    &.unread {
        background-color: var(--theme-color-light);
        border-left: 3px solid var(--el-color-primary);
    }

    .notice-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .notice-content {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .notice-time {
        font-size: 11px;
        color: var(--text-tertiary);
    }
}

.notice-footer {
    padding: 8px 16px;
    text-align: center;
    border-top: 1px solid var(--border-color-light);
}

// 搜索弹窗
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
