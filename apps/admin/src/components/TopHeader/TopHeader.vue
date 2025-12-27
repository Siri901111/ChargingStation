<template>
    <div class="header" :class="{ 'header-dark': isDark }">
        <!-- 左侧功能区 -->
        <div class="header-left">
            <el-tooltip content="刷新页面" placement="bottom">
                <div class="header-action" @click="handleRefresh">
                    <el-icon :size="18"><Refresh /></el-icon>
                </div>
            </el-tooltip>
        </div>

        <!-- 右侧功能区 -->
        <div class="header-right">
            <!-- 搜索按钮 -->
            <el-tooltip content="搜索" placement="bottom">
                <div class="header-action" @click="handleSearch">
                    <el-icon :size="18"><Search /></el-icon>
                </div>
            </el-tooltip>

            <!-- 全屏切换 -->
            <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
                <div class="header-action" @click="toggleFullscreen">
                    <el-icon :size="18">
                        <FullScreen v-if="!isFullscreen" />
                        <Aim v-else />
                    </el-icon>
                </div>
            </el-tooltip>

            <!-- 主题色切换 -->
            <el-popover placement="bottom" :width="280" trigger="click">
                <template #reference>
                    <el-tooltip content="主题设置" placement="bottom">
                        <div class="header-action">
                            <el-icon :size="18"><Brush /></el-icon>
                        </div>
                    </el-tooltip>
                </template>
                <div class="theme-panel">
                    <div class="theme-section">
                        <div class="theme-title">主题模式</div>
                        <div class="theme-modes">
                            <div
                                v-for="mode in themeModes"
                                :key="mode.value"
                                class="theme-mode-item"
                                :class="{ active: themeMode === mode.value }"
                                @click="setThemeMode(mode.value)"
                            >
                                <el-icon :size="20"><component :is="mode.icon" /></el-icon>
                                <span>{{ mode.label }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="theme-section">
                        <div class="theme-title">主题色</div>
                        <div class="theme-colors">
                            <div
                                v-for="(config, color) in themeColorMap"
                                :key="color"
                                class="theme-color-item"
                                :style="{ backgroundColor: config.primary }"
                                :class="{ active: themeColor === color }"
                                @click="setThemeColor(color as ThemeColor)"
                            >
                                <el-icon v-if="themeColor === color" :size="14" color="#fff">
                                    <Check />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </el-popover>

            <!-- 消息通知 -->
            <el-popover
                placement="bottom-end"
                :width="350"
                trigger="click"
                :visible="noticePopoverVisible"
                @show="loadNotices"
            >
                <template #reference>
                    <el-tooltip content="消息通知" placement="bottom">
                        <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="header-action">
                            <el-icon :size="18"><Bell /></el-icon>
                        </el-badge>
                    </el-tooltip>
                </template>
                <template #default>
                    <div class="notice-popover">
                        <div class="notice-header">
                            <span>消息通知</span>
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
                                <div class="notice-content">
                                    <div class="notice-title">{{ notice.title || '通知' }}</div>
                                    <div class="notice-text">{{ notice.content || '暂无内容' }}</div>
                                    <div class="notice-time">{{ notice.createdAt || '' }}</div>
                                </div>
                            </div>
                            <el-empty v-if="!noticesLoading && notices.length === 0" description="暂无通知" :image-size="80" />
                        </div>
                        <div class="notice-footer" v-if="notices.length > 0">
                            <el-button text type="primary" @click="viewAllNotices">查看全部</el-button>
                        </div>
                    </div>
                </template>
            </el-popover>

            <!-- 分隔线 -->
            <el-divider direction="vertical" />

            <!-- 用户头像和下拉菜单 -->
            <el-avatar
                :src="userAvatar"
                :size="36"
                class="user-avatar"
            >
                <el-icon :size="18"><User /></el-icon>
            </el-avatar>
            <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                    {{ displayName }}
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item icon="User" command="user">个人中心</el-dropdown-item>
                        <el-dropdown-item icon="Setting" command="setting">系统设置</el-dropdown-item>
                        <el-dropdown-item divided icon="SwitchButton" command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>

    <!-- 搜索对话框 -->
    <el-dialog v-model="searchDialogVisible" title="搜索" width="500px" :show-close="true">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索菜单、功能..."
            size="large"
            prefix-icon="Search"
            clearable
            @keyup.enter="doSearch"
        />
        <div class="search-tips">
            <p>提示：输入关键词搜索菜单或功能</p>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { useUserStore } from "@/store/auth"
import { useThemeStore, themeColorMap, type ThemeMode, type ThemeColor } from "@/store/theme"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"
import { getPersonalInfoApi, getPersonalNoticesApi } from "@/api/personal"
import {
    Bell,
    User,
    Refresh,
    ArrowDown,
    Search,
    FullScreen,
    Aim,
    Brush,
    Check,
    Sunny,
    Moon,
    Platform
} from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { username } = storeToRefs(userStore)
const { themeMode, themeColor, isDark } = storeToRefs(themeStore)
const { setThemeMode, setThemeColor, initTheme } = themeStore

// 主题模式配置
const themeModes = [
    { value: 'light' as ThemeMode, label: '浅色', icon: Sunny },
    { value: 'dark' as ThemeMode, label: '深色', icon: Moon },
    { value: 'auto' as ThemeMode, label: '跟随系统', icon: Platform },
]

// 用户信息
const userAvatar = ref<string>('')
const displayName = ref<string>(username.value || '用户')

// 通知相关
const noticePopoverVisible = ref(false)
const noticesLoading = ref(false)
const notices = ref<any[]>([])
const unreadCount = ref(0)

// 全屏相关
const isFullscreen = ref(false)

// 搜索相关
const searchDialogVisible = ref(false)
const searchKeyword = ref('')

// 切换全屏
const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        isFullscreen.value = true
    } else {
        document.exitFullscreen()
        isFullscreen.value = false
    }
}

// 监听全屏变化
const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

// 刷新页面
const handleRefresh = () => {
    window.location.reload()
}

// 打开搜索
const handleSearch = () => {
    searchDialogVisible.value = true
}

// 执行搜索
const doSearch = () => {
    if (searchKeyword.value.trim()) {
        ElMessage.info(`搜索：${searchKeyword.value}`)
        // TODO: 实现搜索逻辑
    }
}

// 加载个人信息
const loadPersonalInfo = async () => {
    try {
        const res = await getPersonalInfoApi()
        if (res.code === 200 && res.data) {
            userAvatar.value = res.data.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${res.data.id || 'default'}`
            displayName.value = res.data.name || username.value || '用户'
        }
    } catch (error) {
        console.error('加载个人信息失败:', error)
        userAvatar.value = `https://api.dicebear.com/7.x/miniavs/svg?seed=${username.value || 'default'}`
    }
}

// 加载通知列表
const loadNotices = async () => {
    noticesLoading.value = true
    try {
        const res = await getPersonalNoticesApi()
        if (res.code === 200 && res.data) {
            notices.value = res.data.list || []
            unreadCount.value = notices.value.length
        }
    } catch (error) {
        console.error('加载通知列表失败:', error)
        notices.value = []
        unreadCount.value = 0
    } finally {
        noticesLoading.value = false
    }
}

// 点击通知
const handleNoticeClick = (notice: any) => {
    notice.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    ElMessage.info(`查看通知：${notice.title}`)
}

// 查看全部通知
const viewAllNotices = () => {
    noticePopoverVisible.value = false
    router.push('/personal')
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
    switch (command) {
        case 'user':
            router.push('/personal')
            break
        case 'setting':
            router.push('/system')
            break
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
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style lang="less" scoped>
.header {
    background-color: #fff;
    height: 60px;
    padding: 0 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;

    &.header-dark {
        background-color: #1f1f1f;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);

        .header-action {
            color: #ffffffa6;

            &:hover {
                background-color: rgba(255, 255, 255, 0.08);
                color: #fff;
            }
        }

        .el-dropdown-link {
            color: #ffffffa6;

            &:hover {
                color: #fff;
            }
        }
    }
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
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    color: #606266;
    transition: all 0.3s;

    &:hover {
        background-color: #f5f7fa;
        color: var(--el-color-primary);
    }
}

.user-avatar {
    margin-left: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        transform: scale(1.05);
    }
}

.el-dropdown-link {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    cursor: pointer;
    color: #606266;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
        color: var(--el-color-primary);
    }
}

.el-divider--vertical {
    height: 24px;
    margin: 0 12px;
}

// 主题设置面板
.theme-panel {
    .theme-section {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .theme-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 12px;
    }

    .theme-modes {
        display: flex;
        gap: 8px;

        .theme-mode-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 12px 8px;
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 12px;
            color: #606266;

            &:hover {
                border-color: var(--el-color-primary);
                color: var(--el-color-primary);
            }

            &.active {
                border-color: var(--el-color-primary);
                background-color: var(--el-color-primary-light-9);
                color: var(--el-color-primary);
            }
        }
    }

    .theme-colors {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;

        .theme-color-item {
            width: 36px;
            height: 36px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            border: 2px solid transparent;

            &:hover {
                transform: scale(1.1);
            }

            &.active {
                border-color: #303133;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
        }
    }
}

// 通知弹窗样式
.notice-popover {
    .notice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #ebeef5;
        font-weight: 500;
        font-size: 14px;
    }

    .notice-list {
        max-height: 360px;
        overflow-y: auto;

        .notice-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f5f7fa;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
                background-color: #f5f7fa;
            }

            &.unread {
                background-color: #ecf5ff;
                border-left: 3px solid var(--el-color-primary);
            }

            .notice-content {
                .notice-title {
                    font-size: 13px;
                    font-weight: 500;
                    color: #303133;
                    margin-bottom: 6px;
                }

                .notice-text {
                    font-size: 12px;
                    color: #606266;
                    line-height: 1.5;
                    margin-bottom: 6px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .notice-time {
                    font-size: 11px;
                    color: #909399;
                }
            }
        }
    }

    .notice-footer {
        padding: 8px 16px;
        text-align: center;
        border-top: 1px solid #ebeef5;
    }
}

// 搜索对话框
.search-tips {
    margin-top: 16px;
    color: #909399;
    font-size: 13px;

    p {
        margin: 0;
    }
}
</style>