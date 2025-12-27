<template>
    <div class="header">
        <div class="personal">
            <!-- 消息通知 -->
            <el-popover
                placement="bottom-end"
                :width="350"
                trigger="click"
                :visible="noticePopoverVisible"
                @show="loadNotices"
            >
                <template #reference>
                    <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="item">
                        <el-icon class="bell-icon" :size="20">
                            <Bell />
                        </el-icon>
                    </el-badge>
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

            <!-- 用户头像和下拉菜单 -->
            <el-avatar 
                :src="userAvatar" 
                class="ml mr"
                :size="36"
            >
                <el-icon :size="18"><User /></el-icon>
            </el-avatar>
            <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                    欢迎你，{{ displayName }}
                    <el-icon class="el-icon--right">
                        <ArrowDown />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item icon="User" command="user">个人中心</el-dropdown-item>
                        <el-dropdown-item icon="SwitchButton" command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useUserStore } from "@/store/auth";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router"
import { getPersonalInfoApi, getPersonalNoticesApi } from "@/api/personal"
import { Bell, User, Refresh, ArrowDown } from "@element-plus/icons-vue"

// 兼容旧版本
const ArrowDownIcon = ArrowDown
import { ElMessage } from "element-plus"

const router = useRouter()
const userStore = useUserStore();
const { username } = storeToRefs(userStore)

const userAvatar = ref<string>('')
const displayName = ref<string>(username.value || '用户')
const noticePopoverVisible = ref(false)
const noticesLoading = ref(false)
const notices = ref<any[]>([])
const unreadCount = ref(0)

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
        // 使用默认头像
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
            // 计算未读数量（这里假设所有通知都是未读的，实际应该根据后端返回的read字段）
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
    // 标记为已读（这里可以调用后端接口）
    notice.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    ElMessage.info(`查看通知：${notice.title}`)
    // 可以跳转到通知详情页面
}

// 查看全部通知
const viewAllNotices = () => {
    noticePopoverVisible.value = false
    router.push('/personal')
}

const handleCommand = (command: string) => {
    if (command == "user") {
        router.push("/personal")
    } else {
        userStore.logout()
        router.push("/login")
    }
}

onMounted(() => {
    loadPersonalInfo()
    // 初始加载通知数量（不加载详细列表，节省资源）
    loadNotices()
})
</script>

<style lang="less" scoped>
.header {
    background-color: white;
    height: 60px;
    padding: 0 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .personal {
        float: right;
        display: flex;
        height: 60px;
        align-items: center;
        gap: 15px;
        
        .item {
            cursor: pointer;
            transition: all 0.3s;
            
            .bell-icon {
                color: #606266;
                transition: all 0.3s;
            }
            
            &:hover .bell-icon {
                color: #409eff;
                transform: scale(1.1);
            }
        }
        
        .el-avatar {
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }
        }
        
        .el-dropdown-link {
            cursor: pointer;
            color: #606266;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s;
            
            &:hover {
                color: #409eff;
            }
        }
    }
}

// 通知弹窗样式
:deep(.el-popover) {
    padding: 0;
}

.notice-popover {
    .notice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #ebeef5;
        font-weight: 600;
        font-size: 16px;
    }
    
    .notice-list {
        max-height: 400px;
        overflow-y: auto;
        
        .notice-item {
            padding: 15px;
            border-bottom: 1px solid #f5f7fa;
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
                background-color: #f5f7fa;
            }
            
            &.unread {
                background-color: #ecf5ff;
                border-left: 3px solid #409eff;
            }
            
            .notice-content {
                .notice-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 8px;
                }
                
                .notice-text {
                    font-size: 12px;
                    color: #606266;
                    line-height: 1.5;
                    margin-bottom: 8px;
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
        padding: 10px 15px;
        text-align: center;
        border-top: 1px solid #ebeef5;
    }
}
</style>