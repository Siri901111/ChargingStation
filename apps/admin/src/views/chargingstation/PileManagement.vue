<template>
    <div class="pile-management">
        <!-- 搜索和筛选 -->
        <el-card>
            <el-form :inline="true" :model="searchParams">
                <el-form-item label="充电站">
                    <el-select 
                        v-model="searchParams.stationId" 
                        placeholder="请选择充电站"
                        clearable
                        filterable
                        style="width: 200px"
                        @change="handleSearch"
                    >
                        <el-option 
                            v-for="station in stations" 
                            :key="station.id" 
                            :label="station.name" 
                            :value="station.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select 
                        v-model="searchParams.status" 
                        placeholder="请选择状态"
                        clearable
                        style="width: 150px"
                        @change="handleSearch"
                    >
                        <el-option label="空闲中" :value="1" />
                        <el-option label="充电中" :value="2" />
                        <el-option label="连接中" :value="3" />
                        <el-option label="排队中" :value="4" />
                        <el-option label="已预约" :value="5" />
                        <el-option label="故障/离线" :value="6" />
                    </el-select>
                </el-form-item>
                <el-form-item label="类型">
                    <el-select 
                        v-model="searchParams.type" 
                        placeholder="请选择类型"
                        clearable
                        style="width: 120px"
                        @change="handleSearch"
                    >
                        <el-option label="快充" value="快充" />
                        <el-option label="慢充" value="慢充" />
                    </el-select>
                </el-form-item>
                <el-form-item label="关键词">
                    <el-input 
                        v-model="searchParams.keyword" 
                        placeholder="充电桩ID或类型"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleSearch"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                    <el-button type="success" @click="handleCreate">新增充电桩</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 表格 -->
        <el-card class="mt">
            <el-table 
                :data="pileList" 
                v-loading="loading"
                style="width: 100%"
                border
            >
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="id" label="充电桩ID" width="100" align="center" />
                <el-table-column prop="stationName" label="所属站点" width="180" />
                <el-table-column prop="city" label="城市" width="120" />
                <el-table-column prop="type" label="类型" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.type === '快充' ? 'danger' : 'success'">
                            {{ row.type }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusTagType(row.status)">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="power" label="功率(kW)" width="100" align="center">
                    <template #default="{ row }">
                        {{ row.power || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="voltage" label="电压(V)" width="100" align="center">
                    <template #default="{ row }">
                        {{ row.voltage || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="current" label="电流(A)" width="100" align="center">
                    <template #default="{ row }">
                        {{ row.current || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="temperature" label="温度(°C)" width="100" align="center">
                    <template #default="{ row }">
                        {{ row.temperature || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="percent" label="进度(%)" width="100" align="center">
                    <template #default="{ row }">
                        <span v-if="row.status === 2">{{ row.percent || 0 }}%</span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="installDate" label="安装日期" width="120" />
                <el-table-column label="操作" width="280" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button 
                            size="small" 
                            type="primary" 
                            @click="handleView(row)"
                        >
                            详情
                        </el-button>
                        <el-button 
                            size="small" 
                            type="warning" 
                            @click="handleEdit(row)"
                        >
                            编辑
                        </el-button>
                        <el-button 
                            size="small" 
                            type="info" 
                            @click="handleUpdateStatus(row)"
                        >
                            更新状态
                        </el-button>
                        <el-popconfirm 
                            title="确定要删除该充电桩吗？" 
                            @confirm="handleDelete(row.id)"
                        >
                            <template #reference>
                                <el-button 
                                    size="small" 
                                    type="danger"
                                >
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination 
                class="fr mt mb"
                v-model:current-page="pageInfo.page" 
                v-model:page-size="pageInfo.pageSize"
                :page-sizes="[10, 20, 30, 50]" 
                layout="sizes, prev, pager, next, jumper, total" 
                :total="total" 
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange" 
                background
            />
        </el-card>

        <!-- 创建/编辑对话框 -->
        <PileForm 
            :dialog-visible="formDialogVisible" 
            :pile-id="currentPileId"
            @close="formDialogVisible = false" 
            @success="handleFormSuccess"
        />

        <!-- 详情对话框 -->
        <el-dialog
            v-model="detailDialogVisible"
            title="充电桩详情"
            width="800px"
            destroy-on-close
        >
            <el-descriptions :column="2" border v-if="currentPile">
                <el-descriptions-item label="充电桩ID">{{ currentPile.id }}</el-descriptions-item>
                <el-descriptions-item label="所属站点">{{ currentPile.stationName }}</el-descriptions-item>
                <el-descriptions-item label="城市">{{ currentPile.city }}</el-descriptions-item>
                <el-descriptions-item label="类型">
                    <el-tag :type="currentPile.type === '快充' ? 'danger' : 'success'">
                        {{ currentPile.type }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="getStatusTagType(currentPile.status)">
                        {{ getStatusText(currentPile.status) }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="功率(kW)">{{ currentPile.power || '-' }}</el-descriptions-item>
                <el-descriptions-item label="电压(V)">{{ currentPile.voltage || '-' }}</el-descriptions-item>
                <el-descriptions-item label="电流(A)">{{ currentPile.current || '-' }}</el-descriptions-item>
                <el-descriptions-item label="温度(°C)">{{ currentPile.temperature || '-' }}</el-descriptions-item>
                <el-descriptions-item label="进度(%)" v-if="currentPile.status === 2">
                    {{ currentPile.percent || 0 }}%
                </el-descriptions-item>
                <el-descriptions-item label="安装日期">{{ currentPile.installDate || '-' }}</el-descriptions-item>
            </el-descriptions>
        </el-dialog>

        <!-- 更新状态对话框 -->
        <el-dialog
            v-model="statusDialogVisible"
            title="更新充电桩状态"
            width="500px"
            destroy-on-close
        >
            <el-form :model="statusForm" label-width="120px">
                <el-form-item label="当前状态">
                    <el-tag :type="getStatusTagType(currentPile?.status || 1)">
                        {{ getStatusText(currentPile?.status || 1) }}
                    </el-tag>
                </el-form-item>
                <el-form-item label="新状态" required>
                    <el-select v-model="statusForm.status" placeholder="请选择状态" style="width: 100%">
                        <el-option label="空闲中" :value="1" />
                        <el-option label="充电中" :value="2" />
                        <el-option label="连接中" :value="3" />
                        <el-option label="排队中" :value="4" />
                        <el-option label="已预约" :value="5" />
                        <el-option label="故障/离线" :value="6" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="statusDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleConfirmUpdateStatus">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { 
    getPileListApi, 
    deletePileApi, 
    updatePileStatusApi,
    getPileDetailApi
} from "@/api/pile"
import { getStationListApi } from "@/api/chargingstation"
import PileForm from "./components/PileForm.vue"
import { ElMessage, ElMessageBox } from 'element-plus'
import type { PileType } from "@/types/pile"

interface Station {
    id: number;
    name: string;
}

const loading = ref(false)
const pileList = ref<PileType[]>([])
const total = ref(0)
const stations = ref<Station[]>([])
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const currentPileId = ref<number | null>(null)
const currentPile = ref<PileType | null>(null)

const pageInfo = reactive({
    page: 1,
    pageSize: 10
})

const searchParams = reactive({
    stationId: undefined as number | undefined,
    status: undefined as number | undefined,
    type: undefined as string | undefined,
    keyword: undefined as string | undefined,
})

const statusForm = reactive({
    status: 1
})

// 加载充电站列表
const loadStations = async () => {
    try {
        const res = await getStationListApi({ page: 1, pageSize: 1000 })
        if (res.code === 200 && res.data?.list) {
            stations.value = res.data.list
        }
    } catch (error) {
        console.error('加载充电站列表失败:', error)
    }
}

// 加载充电桩列表
const loadPileList = async () => {
    loading.value = true
    try {
        const params: any = {
            page: pageInfo.page,
            pageSize: pageInfo.pageSize
        }
        
        if (searchParams.stationId) {
            params.stationId = searchParams.stationId
        }
        if (searchParams.status) {
            params.status = searchParams.status
        }
        if (searchParams.type) {
            params.type = searchParams.type
        }
        if (searchParams.keyword) {
            params.keyword = searchParams.keyword
        }
        
        const res = await getPileListApi(params)
        if (res.code === 200 && res.data) {
            pileList.value = res.data.list || []
            total.value = res.data.total || 0
        }
    } catch (error) {
        console.error('加载充电桩列表失败:', error)
        ElMessage.error('加载充电桩列表失败')
    } finally {
        loading.value = false
    }
}

// 获取状态文本
const getStatusText = (status: number): string => {
    const statusMap: Record<number, string> = {
        1: '空闲中',
        2: '充电中',
        3: '连接中',
        4: '排队中',
        5: '已预约',
        6: '故障/离线'
    }
    return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusTagType = (status: number): string => {
    const typeMap: Record<number, string> = {
        1: 'success',
        2: 'warning',
        3: 'info',
        4: '',
        5: '',
        6: 'danger'
    }
    return typeMap[status] || ''
}

// 搜索
const handleSearch = () => {
    pageInfo.page = 1
    loadPileList()
}

// 重置
const handleReset = () => {
    searchParams.stationId = undefined
    searchParams.status = undefined
    searchParams.type = undefined
    searchParams.keyword = undefined
    pageInfo.page = 1
    pageInfo.pageSize = 10
    loadPileList()
}

// 分页
const handleSizeChange = (size: number) => {
    pageInfo.pageSize = size
    pageInfo.page = 1
    loadPileList()
}

const handleCurrentChange = (page: number) => {
    pageInfo.page = page
    loadPileList()
}

// 创建
const handleCreate = () => {
    currentPileId.value = null
    formDialogVisible.value = true
}

// 编辑
const handleEdit = (row: PileType) => {
    currentPileId.value = row.id
    formDialogVisible.value = true
}

// 查看详情
const handleView = async (row: PileType) => {
    try {
        const res = await getPileDetailApi(row.id)
        if (res.code === 200 && res.data) {
            currentPile.value = res.data
            detailDialogVisible.value = true
        }
    } catch (error) {
        ElMessage.error('加载充电桩详情失败')
    }
}

// 删除
const handleDelete = async (id: number) => {
    try {
        const res = await deletePileApi(id)
        if (res.code === 200) {
            ElMessage.success(res.message || '删除成功')
            loadPileList()
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '删除失败')
    }
}

// 更新状态
const handleUpdateStatus = (row: PileType) => {
    currentPile.value = row
    statusForm.status = row.status
    statusDialogVisible.value = true
}

// 确认更新状态
const handleConfirmUpdateStatus = async () => {
    if (!currentPile.value) return
    
    try {
        const res = await updatePileStatusApi(currentPile.value.id, { status: statusForm.status })
        if (res.code === 200) {
            ElMessage.success(res.message || '状态更新成功')
            statusDialogVisible.value = false
            loadPileList()
        } else {
            ElMessage.error(res.message || '状态更新失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '状态更新失败')
    }
}

// 表单成功回调
const handleFormSuccess = () => {
    loadPileList()
}

onMounted(() => {
    loadStations()
    loadPileList()
})
</script>

<style scoped lang="less">
.pile-management {
    .mt {
        margin-top: 20px;
    }
    
    .mb {
        margin-bottom: 20px;
    }
    
    .fr {
        float: right;
    }
}
</style>
