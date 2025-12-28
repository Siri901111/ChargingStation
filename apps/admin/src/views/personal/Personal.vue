<template>
    <div class="personal-container">
        <!-- 顶部个人信息卡片 -->
        <el-card class="profile-card" shadow="hover">
            <div class="profile-header" v-loading="loading">
                <div class="avatar-section">
                    <el-avatar :size="120" :src="personalInfo.avatar || defaultAvatar" class="avatar">
                        <el-icon :size="60"><User /></el-icon>
                    </el-avatar>
                    <el-button 
                        type="primary" 
                        :icon="Edit" 
                        circle 
                        size="small" 
                        class="edit-avatar-btn"
                        @click="showEditDialog = true"
                    />
                </div>
                <div class="profile-info">
                    <h2 class="name">{{ personalInfo.name || '未设置姓名' }}</h2>
                    <div class="meta-info">
                        <el-tag :type="getStatusType(personalInfo.workStatus)" size="large" class="status-tag">
                            <el-icon class="mr-2"><Clock /></el-icon>
                            {{ getWorkStatusText(personalInfo.workStatus) }}
                        </el-tag>
                        <span class="divider">|</span>
                        <span class="position">{{ personalInfo.position || '未设置职位' }}</span>
                        <span class="divider">|</span>
                        <span class="department">{{ personalInfo.department || '未设置部门' }}</span>
                    </div>
                    <div class="tags-section" v-if="personalInfo.tags && personalInfo.tags.length > 0">
                        <el-tag 
                            v-for="(tag, index) in personalInfo.tags" 
                            :key="index" 
                            :type="getTagType(index)"
                            size="small"
                            class="tag-item"
                        >
                            {{ tag }}
                        </el-tag>
                    </div>
                </div>
                <div class="profile-actions">
                    <el-button type="primary" :icon="Edit" @click="showEditDialog = true">编辑资料</el-button>
                    <el-button :icon="Lock" @click="showPasswordDialog = true">修改密码</el-button>
                </div>
            </div>
            
            <!-- 详细信息 -->
            <el-divider />
            <el-row :gutter="20" class="detail-section">
                <el-col :span="8">
                    <div class="detail-item">
                        <el-icon class="detail-icon"><Phone /></el-icon>
                        <div class="detail-content">
                            <div class="detail-label">联系电话</div>
                            <div class="detail-value">{{ personalInfo.phone || '未设置' }}</div>
                        </div>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="detail-item">
                        <el-icon class="detail-icon"><Location /></el-icon>
                        <div class="detail-content">
                            <div class="detail-label">联系地址</div>
                            <div class="detail-value">{{ personalInfo.address || '未设置' }}</div>
                        </div>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="detail-item">
                        <el-icon class="detail-icon"><Calendar /></el-icon>
                        <div class="detail-content">
                            <div class="detail-label">注册时间</div>
                            <div class="detail-value">{{ personalInfo.createdAt || '未知' }}</div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 统计数据和快捷操作 -->
        <el-row :gutter="20" class="stats-section">
            <el-col :span="6" v-for="(stat, index) in statCards" :key="index">
                <el-card class="stat-card" shadow="hover" @click="handleStatClick(stat.key)">
                    <div class="stat-content">
                        <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ stat.value }}</div>
                            <div class="stat-label">{{ stat.label }}</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 主要内容区域 -->
        <el-row :gutter="20" class="content-section">
            <!-- 左侧：资料完善度和日历 -->
            <el-col :span="12">
                <!-- 资料完善度 -->
                <el-card class="completeness-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>资料完善度</span>
                            <el-tag :type="getCompletenessType()" size="small">
                                {{ calculateCompleteness() }}%
                            </el-tag>
                        </div>
                    </template>
                    <div class="completeness-content">
                        <el-progress 
                            type="circle" 
                            :percentage="calculateCompleteness()"
                            :color="getCompletenessColor()"
                            :width="150"
                        />
                        <div class="completeness-tips">
                            <div 
                                v-for="(item, index) in completenessItems" 
                                :key="index"
                                class="tip-item"
                                :class="{ completed: item.completed }"
                            >
                                <el-icon :class="item.completed ? 'completed-icon' : 'uncompleted-icon'">
                                    <component :is="item.completed ? 'Check' : 'Close'" />
                                </el-icon>
                                <span>{{ item.label }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>

                <!-- 日历 -->
                <el-card class="calendar-card mt" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>工作日历</span>
                        </div>
                    </template>
                    <el-calendar v-model="calendarValue" />
                </el-card>
            </el-col>

            <!-- 右侧：通知列表 -->
            <el-col :span="12">
                <el-card class="notices-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>最新通知</span>
                            <el-button text type="primary" size="small" @click="loadNotices">
                                <el-icon><Refresh /></el-icon>
                                刷新
                            </el-button>
                        </div>
                    </template>
                    <div class="notices-content">
                        <el-timeline v-if="notices.length > 0">
                            <el-timeline-item
                                v-for="(notice, index) in notices.slice(0, 5)"
                                :key="notice.id"
                                :timestamp="notice.createdAt"
                                placement="top"
                                :type="getNoticeType(index)"
                            >
                                <el-card shadow="hover" class="notice-item">
                                    <h4>{{ notice.title || '通知' }}</h4>
                                    <p>{{ notice.content || '暂无内容' }}</p>
                                    <el-button text type="primary" size="small" @click="viewNotice(notice)">
                                        查看详情
                                    </el-button>
                                </el-card>
                            </el-timeline-item>
                        </el-timeline>
                        <el-empty v-else description="暂无通知" :image-size="100" />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 编辑资料对话框 -->
        <el-dialog
            v-model="showEditDialog"
            title="编辑个人资料"
            width="600px"
            :close-on-click-modal="false"
        >
            <el-form :model="editForm" label-width="100px" :rules="editRules" ref="editFormRef">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
                </el-form-item>
                <el-form-item label="联系地址" prop="address">
                    <el-input v-model="editForm.address" type="textarea" :rows="2" placeholder="请输入联系地址" />
                </el-form-item>
                <el-form-item label="在职状态" prop="workStatus">
                    <el-select v-model="editForm.workStatus" placeholder="请选择在职状态" style="width: 100%">
                        <el-option label="工作中" :value="1" />
                        <el-option label="请假中" :value="2" />
                        <el-option label="出差中" :value="3" />
                        <el-option label="年假中" :value="4" />
                    </el-select>
                </el-form-item>
                <el-form-item label="个人标签">
                    <el-select
                        v-model="editForm.tags"
                        multiple
                        filterable
                        allow-create
                        default-first-option
                        placeholder="选择或输入标签"
                        style="width: 100%"
                    >
                        <el-option label="认真" value="认真" />
                        <el-option label="工作狂" value="工作狂" />
                        <el-option label="与人和善" value="与人和善" />
                        <el-option label="代码洁癖" value="代码洁癖" />
                        <el-option label="技术专家" value="技术专家" />
                        <el-option label="团队协作" value="团队协作" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showEditDialog = false">取消</el-button>
                <el-button type="primary" @click="handleSaveEdit" :loading="saving">保存</el-button>
            </template>
        </el-dialog>

        <!-- 修改密码对话框 -->
        <el-dialog
            v-model="showPasswordDialog"
            title="修改密码"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
                <el-form-item label="旧密码" prop="oldPassword">
                    <el-input 
                        v-model="passwordForm.oldPassword" 
                        type="password" 
                        placeholder="请输入旧密码"
                        show-password
                    />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input 
                        v-model="passwordForm.newPassword" 
                        type="password" 
                        placeholder="请输入新密码（至少6位）"
                        show-password
                    />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input 
                        v-model="passwordForm.confirmPassword" 
                        type="password" 
                        placeholder="请再次输入新密码"
                        show-password
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showPasswordDialog = false">取消</el-button>
                <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">确认修改</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
    getPersonalInfoApi, 
    updatePersonalInfoApi, 
    getPersonalStatsApi, 
    getPersonalNoticesApi,
    changePasswordApi
} from '@/api/personal'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { 
    User, Edit, Lock, Phone, Location, Calendar, Clock,
    Check, Close, Refresh, Document, Bell, List, UserFilled, Warning
} from '@element-plus/icons-vue'

const loading = ref<boolean>(false)
const saving = ref<boolean>(false)
const changingPassword = ref<boolean>(false)
const personalInfo = ref<any>({})
const stats = ref({
    todoCount: 0,
    assignedToMeCount: 0,
    noticeCount: 0,
    messageCount: 0,
    myAssignedCount: 0
})
const notices = ref<any[]>([])
const calendarValue = ref(new Date())
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)

const defaultAvatar = computed(() => {
    return `https://api.dicebear.com/7.x/miniavs/svg?seed=${personalInfo.value.id || 'default'}`
})

const editFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const editForm = ref({
    name: '',
    phone: '',
    address: '',
    workStatus: 1,
    tags: [] as string[]
})

const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const editRules: FormRules = {
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
}

const passwordRules: FormRules = {
    oldPassword: [
        { required: true, message: '请输入旧密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== passwordForm.value.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

// 统计卡片数据
const statCards = computed(() => [
    {
        key: 'todo',
        label: '待办事项',
        value: stats.value.todoCount,
        icon: Document,
        color: 'var(--el-color-primary)'
    },
    {
        key: 'assigned',
        label: '指派给我',
        value: stats.value.assignedToMeCount,
        icon: Bell,
        color: 'var(--el-color-success)'
    },
    {
        key: 'notice',
        label: '部门公告',
        value: stats.value.noticeCount,
        icon: List,
        color: 'var(--el-color-warning)'
    },
    {
        key: 'assignedByMe',
        label: '我指派的',
        value: stats.value.myAssignedCount,
        icon: UserFilled,
        color: '#F56C6C'
    }
])

// 资料完善度项目
const completenessItems = computed(() => [
    { label: '姓名', completed: !!personalInfo.value.name },
    { label: '联系电话', completed: !!personalInfo.value.phone },
    { label: '联系地址', completed: !!personalInfo.value.address },
    { label: '在职状态', completed: !!personalInfo.value.workStatus }
])

// 加载个人信息
const loadPersonalInfo = async () => {
    loading.value = true
    try {
        const res = await getPersonalInfoApi()
        if (res.code === 200 && res.data) {
            personalInfo.value = res.data
            // 填充编辑表单
            editForm.value = {
                name: res.data.name || '',
                phone: res.data.phone || '',
                address: res.data.address || '',
                workStatus: res.data.workStatus || 1,
                tags: res.data.tags || []
            }
        } else {
            ElMessage.error(res.message || '获取个人信息失败')
        }
    } catch (error: any) {
        console.error('加载个人信息失败:', error)
        ElMessage.error(error.message || '加载个人信息失败')
    } finally {
        loading.value = false
    }
}

// 加载统计数据
const loadStats = async () => {
    try {
        const res = await getPersonalStatsApi()
        if (res.code === 200 && res.data) {
            stats.value = res.data
        }
    } catch (error) {
        console.error('加载统计数据失败:', error)
    }
}

// 加载通知列表
const loadNotices = async () => {
    try {
        const res = await getPersonalNoticesApi()
        if (res.code === 200 && res.data) {
            notices.value = res.data.list || []
        }
    } catch (error) {
        console.error('加载通知列表失败:', error)
    }
}

// 保存编辑
const handleSaveEdit = async () => {
    if (!editFormRef.value) return
    
    try {
        await editFormRef.value.validate()
        saving.value = true
        
        const res = await updatePersonalInfoApi({
            name: editForm.value.name,
            phone: editForm.value.phone,
            address: editForm.value.address,
            workStatus: editForm.value.workStatus,
            tags: editForm.value.tags
        })
        
        if (res.code === 200) {
            ElMessage.success(res.message || '个人信息更新成功')
            showEditDialog.value = false
            loadPersonalInfo()
        } else {
            ElMessage.error(res.message || '更新失败')
        }
    } catch (error: any) {
        if (error !== false) { // 表单验证失败时 error 为 false
            console.error('更新个人信息失败:', error)
            ElMessage.error(error.message || '更新失败')
        }
    } finally {
        saving.value = false
    }
}

// 修改密码
const handleChangePassword = async () => {
    if (!passwordFormRef.value) return
    
    try {
        await passwordFormRef.value.validate()
        changingPassword.value = true
        
        const res = await changePasswordApi({
            oldPassword: passwordForm.value.oldPassword,
            newPassword: passwordForm.value.newPassword
        })
        
        if (res.code === 200) {
            ElMessage.success(res.message || '密码修改成功')
            showPasswordDialog.value = false
            passwordForm.value = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }
        } else {
            ElMessage.error(res.message || '密码修改失败')
        }
    } catch (error: any) {
        if (error !== false) {
            console.error('修改密码失败:', error)
            ElMessage.error(error.message || '修改密码失败')
        }
    } finally {
        changingPassword.value = false
    }
}

// 计算资料完善度
const calculateCompleteness = () => {
    let completed = 0
    const total = 4
    
    if (personalInfo.value.name) completed++
    if (personalInfo.value.phone) completed++
    if (personalInfo.value.address) completed++
    if (personalInfo.value.workStatus) completed++
    
    return Math.round((completed / total) * 100)
}

// 获取完善度类型
const getCompletenessType = () => {
    const percentage = calculateCompleteness()
    if (percentage >= 80) return 'success'
    if (percentage >= 50) return 'warning'
    return 'danger'
}

// 获取完善度颜色
const getCompletenessColor = () => {
    const percentage = calculateCompleteness()
    if (percentage >= 80) return '#67C23A'
    if (percentage >= 50) return '#E6A23C'
    return '#F56C6C'
}

// 获取工作状态文本
const getWorkStatusText = (status: number) => {
    const statusMap: Record<number, string> = {
        1: '工作中',
        2: '请假中',
        3: '出差中',
        4: '年假中'
    }
    return statusMap[status] || '未知'
}

// 获取工作状态类型
const getStatusType = (status: number) => {
    const typeMap: Record<number, string> = {
        1: 'success',
        2: 'warning',
        3: 'info',
        4: 'info'
    }
    return typeMap[status] || 'info'
}

// 获取标签类型
const getTagType = (index: number) => {
    const types = ['primary', 'success', 'info', 'warning', 'danger']
    return types[index % types.length]
}

// 获取通知类型
const getNoticeType = (index: number) => {
    const types = ['primary', 'success', 'warning', 'danger']
    return types[index % types.length]
}

// 统计卡片点击
const handleStatClick = (key: string) => {
    ElMessage.info(`查看${statCards.value.find(s => s.key === key)?.label}`)
    // 这里可以添加跳转到对应页面的逻辑
}

// 查看通知
const viewNotice = (notice: any) => {
    ElMessage.info(`查看通知：${notice.title}`)
    // 这里可以添加查看通知详情的逻辑
}

onMounted(() => {
    loadPersonalInfo()
    loadStats()
    loadNotices()
})
</script>

<style lang="less" scoped>
.personal-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

// 个人信息卡片
.profile-card {
    margin-bottom: 20px;
    border-radius: 8px;
    
    .profile-header {
        display: flex;
        align-items: flex-start;
        gap: 30px;
        
        .avatar-section {
            position: relative;
            
            .avatar {
                border: 4px solid #e4e7ed;
                transition: all 0.3s;
                
                &:hover {
                    border-color: #409eff;
                    transform: scale(1.05);
                }
            }
            
            .edit-avatar-btn {
                position: absolute;
                bottom: 0;
                right: 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
        }
        
        .profile-info {
            flex: 1;
            
            .name {
                margin: 0 0 15px 0;
                font-size: 28px;
                font-weight: 600;
                color: #303133;
            }
            
            .meta-info {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
                flex-wrap: wrap;
                
                .status-tag {
                    font-size: 14px;
                }
                
                .divider {
                    color: #c0c4cc;
                }
                
                .position, .department {
                    color: #606266;
                    font-size: 14px;
                }
            }
            
            .tags-section {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                
                .tag-item {
                    margin: 0;
                }
            }
        }
        
        .profile-actions {
            display: flex;
            gap: 10px;
        }
    }
    
    .detail-section {
        margin-top: 20px;
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f5f7fa;
            border-radius: 6px;
            transition: all 0.3s;
            
            &:hover {
                background: #ecf5ff;
                transform: translateY(-2px);
            }
            
            .detail-icon {
                font-size: 24px;
                color: #409eff;
            }
            
            .detail-content {
                flex: 1;
                
                .detail-label {
                    font-size: 12px;
                    color: #909399;
                    margin-bottom: 5px;
                }
                
                .detail-value {
                    font-size: 16px;
                    color: #303133;
                    font-weight: 500;
                }
            }
        }
    }
}

// 统计卡片
.stats-section {
    margin-bottom: 20px;
    
    .stat-card {
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 8px;
        
        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .stat-content {
            display: flex;
            align-items: center;
            gap: 20px;
            
            .stat-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            
            .stat-info {
                flex: 1;
                
                .stat-value {
                    font-size: 28px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 5px;
                }
                
                .stat-label {
                    font-size: 14px;
                    color: #909399;
                }
            }
        }
    }
}

// 内容区域
.content-section {
    .completeness-card, .calendar-card, .notices-card {
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
    }
    
    .completeness-content {
        display: flex;
        align-items: center;
        gap: 40px;
        padding: 20px 0;
        
        .completeness-tips {
            flex: 1;
            
            .tip-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 0;
                color: #909399;
                transition: all 0.3s;
                
                &.completed {
                    color: #67C23A;
                }
                
                .completed-icon {
                    color: #67C23A;
                }
                
                .uncompleted-icon {
                    color: #F56C6C;
                }
            }
        }
    }
    
    .notices-content {
        max-height: 600px;
        overflow-y: auto;
        
        .notice-item {
            margin-bottom: 10px;
            
            h4 {
                margin: 0 0 10px 0;
                color: #303133;
            }
            
            p {
                margin: 0 0 10px 0;
                color: #606266;
                line-height: 1.6;
            }
        }
    }
}

.mt {
    margin-top: 20px;
}

.mr-2 {
    margin-right: 8px;
}
</style>
