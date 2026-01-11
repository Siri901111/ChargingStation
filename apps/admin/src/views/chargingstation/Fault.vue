<template>
    <div class="pile-management-container">
        <!-- 顶部筛选区域 -->
        <el-card class="filter-card" shadow="never">
            <div class="filter-header">
                <div class="filter-left">
                    <el-select 
                        v-model="value" 
                        placeholder="选择站点名称" 
                        filterable
                        clearable
                        style="width: 300px;"
                        @change="handleStationChange"
                    >
                        <el-option 
                            v-for="item in options" 
                            :key="item.id" 
                            :value="item.name" 
                            :label="item.name"
                        />
                    </el-select>
                    <el-button 
                        type="success" 
                        icon="Plus" 
                        @click="handleCreate"
                        class="create-btn"
                    >
                        新增充电桩
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 状态筛选 -->
        <el-card class="status-filter-card" shadow="never">
            <el-radio-group 
                size="large" 
                v-model="radio" 
                @change="handleChange"
                class="status-radio-group"
            >
                <el-radio-button :label="`全部(${allCount})`" :value="0" />
                <el-radio-button :label="`空闲中(${checkCount(1)})`" :value="1" />
                <el-radio-button :label="`充电中(${checkCount(2)})`" :value="2" />
                <el-radio-button :label="`连接中(${checkCount(3)})`" :value="3" />
                <el-radio-button :label="`排队中(${checkCount(4)})`" :value="4" />
                <el-radio-button :label="`已预约(${checkCount(5)})`" :value="5" />
                <el-radio-button :label="`故障/离线(${checkCount(6)})`" :value="6" />
            </el-radio-group>
        </el-card>

        <!-- 充电桩卡片网格 -->
        <div class="pile-grid" v-loading="loading">
            <div 
                v-for="item in dataListCopy" 
                :key="item.id"
                class="pile-card"
                :class="getStatusClass(item.status)"
            >
                <!-- 卡片头部 -->
                <div class="card-header">
                    <div class="header-left">
                        <div class="status-indicator" :class="getStatusIndicatorClass(item.status)"></div>
                        <div class="header-info">
                            <div class="pile-id">充电桩 #{{ item.id }}</div>
                            <div class="status-badge" :class="getStatusBadgeClass(item.status)">
                                {{ getStatusText(item.status) }}
                            </div>
                        </div>
                    </div>
                    <div class="progress-badge" v-if="item.status === 2">
                        {{ item.percent || '0' }}
                    </div>
                </div>

                <!-- 卡片主体 - 横向布局 -->
                <div class="card-body">
                    <!-- 左侧：图标和进度 -->
                    <div class="card-left">
                        <div class="icon-container">
                            <img 
                                :src="item.status == 1 ? free : (item.status == 6 ? outline : ing)" 
                                class="pile-icon"
                                alt="充电桩"
                            />
                        </div>
                    </div>

                    <!-- 右侧：数据信息 -->
                    <div class="card-right">
                        <div class="data-list">
                            <div class="data-row">
                                <span class="data-label">电压</span>
                                <span class="data-value">{{ item.voltage || '0V' }}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">电流</span>
                                <span class="data-value">{{ item.current || '0A' }}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">功率</span>
                                <span class="data-value highlight">{{ item.power || '0KW' }}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">温度</span>
                                <span class="data-value">{{ item.tem || '0°c' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 卡片底部操作区 -->
                <div class="card-footer">
                    <div class="footer-left">
                        <el-icon class="alert-icon"><Warning /></el-icon>
                        <span class="alert-text">运行正常</span>
                    </div>
                    <div class="footer-actions">
                        <el-tooltip content="二维码" placement="top">
                            <el-button 
                                size="small" 
                                type="success" 
                                :icon="Grid"
                                circle
                                text
                                @click="openQRCodeDialog(item.id)"
                            />
                        </el-tooltip>
                        <el-tooltip content="维保记录" placement="top">
                            <el-button 
                                size="small" 
                                type="info" 
                                :icon="Document"
                                circle
                                text
                                @click="openMaintenanceDialog(item.id)"
                            />
                        </el-tooltip>
                        <el-tooltip content="使用记录" placement="top">
                            <el-popover 
                                placement="right" 
                                :width="400" 
                                trigger="click"
                                :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 10] } }] }"
                                @show="loadUsageRecords(item.id)"
                            >
                                <template #reference>
                                    <el-button 
                                        size="small" 
                                        type="primary" 
                                        :icon="Clock"
                                        circle
                                        text
                                    />
                                </template>
                                <div v-loading="usageLoading" class="usage-records-popover">
                                    <div class="popover-header">
                                        <h3 class="popover-title">使用记录</h3>
                                        <span class="popover-count" v-if="!usageLoading && usageRecords.length > 0">
                                            共 {{ usageRecords.length }} 条
                                        </span>
                                    </div>
                                    <div class="usage-list" v-if="!usageLoading && usageRecords.length > 0">
                                        <div 
                                            v-for="record in usageRecords" 
                                            :key="record.id || record.orderNo"
                                            class="usage-item"
                                        >
                                            <div class="usage-item-header">
                                                <span class="usage-order">订单：{{ record.orderNo || record.id }}</span>
                                                <span class="usage-money">¥{{ record.money }}</span>
                                            </div>
                                            <div class="usage-item-meta">
                                                <span class="usage-time">{{ record.startTime || record.date }}</span>
                                                <span class="usage-pay">{{ record.pay }}</span>
                                            </div>
                                            <div class="usage-station" v-if="record.stationName">
                                                站点：{{ record.stationName }}
                                            </div>
                                        </div>
                                    </div>
                                    <el-empty 
                                        v-else-if="!usageLoading" 
                                        description="暂无使用记录" 
                                        :image-size="80"
                                    />
                                </div>
                            </el-popover>
                        </el-tooltip>
                        <el-tooltip content="编辑" placement="top">
                            <el-button 
                                size="small" 
                                type="warning" 
                                :icon="Edit"
                                circle
                                text
                                @click="handleEdit(item)"
                            />
                        </el-tooltip>
                        <el-tooltip content="删除" placement="top">
                            <el-popconfirm 
                                title="确定要删除该充电桩吗？" 
                                @confirm="handleDelete(Number(item.id))"
                                width="200"
                            >
                                <template #reference>
                                    <el-button 
                                        size="small" 
                                        type="danger" 
                                        :icon="Delete"
                                        circle
                                        text
                                    />
                                </template>
                            </el-popconfirm>
                        </el-tooltip>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <el-empty 
                v-if="!loading && dataListCopy.length === 0" 
                description="暂无充电桩数据"
                :image-size="120"
                class="empty-state"
            />
        </div>

        <!-- 维保记录对话框 -->
        <el-dialog
            v-model="maintenanceDialogVisible"
            title="维保记录"
            width="900px"
            destroy-on-close
            class="maintenance-dialog"
        >
            <div v-loading="maintenanceLoading">
                <el-table 
                    :data="maintenanceRecords" 
                    style="width: 100%"
                    stripe
                >
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="maintenanceType" label="维保类型" width="120" />
                    <el-table-column prop="maintenancePerson" label="维保人员" width="120" />
                    <el-table-column prop="maintenanceTime" label="维保时间" width="160" />
                    <el-table-column prop="maintenanceContent" label="维保内容" show-overflow-tooltip min-width="200" />
                    <el-table-column prop="maintenanceCost" label="维保费用(元)" width="100" align="right">
                        <template #default="scope">
                            <span class="cost-value">{{ scope.row.maintenanceCost }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="nextMaintenanceTime" label="下次维保时间" width="160" />
                    <el-table-column prop="status" label="状态" width="80" align="center">
                        <template #default="scope">
                            <el-tag v-if="scope.row.status === 1" type="success" size="small">已完成</el-tag>
                            <el-tag v-else type="warning" size="small">进行中</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
                <el-empty 
                    v-if="!maintenanceLoading && maintenanceRecords.length === 0" 
                    description="暂无维保记录" 
                    :image-size="100"
                />
            </div>
        </el-dialog>

        <!-- 二维码对话框 -->
        <PileQRCode
            v-model="qrCodeDialogVisible"
            :pile-id="currentQRCodePileId"
            :size="300"
            format="PILE_ID"
        />

        <!-- 创建/编辑对话框 -->
        <PileForm 
            :dialog-visible="formDialogVisible" 
            :pile-id="currentEditPileId ?? undefined"
            @close="formDialogVisible = false" 
            @success="handleFormSuccess"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from 'element-plus';
import { Plus, Document, Edit, Delete, Clock, Warning, Grid } from '@element-plus/icons-vue';
import free from "@/assets/free.png"
import outline from "@/assets/outline.png";
import ing from "@/assets/ing.png"
import { getCurrentListApi } from "@/api/chargingstation"
import { getPileUsageRecordsApi, getPileMaintenanceApi, deletePileApi } from "@/api/pile"
import PileQRCode from "@/components/PileQRCode.vue";
import PileForm from "./components/PileForm.vue";

const loading = ref(false);
const options = ref<any>([]);
const dataList = ref<any>([]);
const dataListCopy = ref<any>([]);
const value = ref<string>("");
const radio = ref<number>(0);

// 加载数据
const loadData = async () => {
    loading.value = true;
    try {
        const res = await getCurrentListApi();
        if (res.code === 200 && res.data) {
            options.value = res.data || [];
            if (options.value.length > 0 && options.value[0].list) {
                dataList.value = options.value[0].list;
                dataListCopy.value = options.value[0].list;
            } else {
                dataList.value = [];
                dataListCopy.value = [];
            }
        }
    } catch (error) {
        console.error('加载充电桩监控数据失败:', error);
        options.value = [];
        dataList.value = [];
        dataListCopy.value = [];
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadData();
})

// 统计数量
function checkCount(num: number) {
    return dataList.value.filter((item: any) => item.status == num).length;
}

const allCount = computed(() => 
    checkCount(1) + checkCount(2) + checkCount(3) + checkCount(4) + checkCount(5) + checkCount(6)
);

// 状态筛选
const handleChange = () => {
    dataListCopy.value = dataList.value;
    if (radio.value != 0) {
        dataListCopy.value = dataListCopy.value.filter((item: any) => item.status == radio.value);
    }
}

// 站点筛选
const handleStationChange = () => {
    const selected = options.value.find((item: any) => item.name === value.value);
    if (selected && selected.list) {
        dataListCopy.value = selected.list;
        dataList.value = selected.list;
        radio.value = 0;
    } else if (!value.value) {
        if (options.value.length > 0 && options.value[0].list) {
            dataListCopy.value = options.value[0].list;
            dataList.value = options.value[0].list;
            radio.value = 0;
        }
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
    };
    return statusMap[status] || '未知';
}

// 获取状态样式类
const getStatusClass = (status: number): string => {
    const classMap: Record<number, string> = {
        1: 'status-free',
        2: 'status-charging',
        3: 'status-connecting',
        4: 'status-queuing',
        5: 'status-reserved',
        6: 'status-fault'
    };
    return classMap[status] || '';
}

// 获取状态指示器类
const getStatusIndicatorClass = (status: number): string => {
    const classMap: Record<number, string> = {
        1: 'indicator-free',
        2: 'indicator-charging',
        3: 'indicator-connecting',
        4: 'indicator-queuing',
        5: 'indicator-reserved',
        6: 'indicator-fault'
    };
    return classMap[status] || '';
}

// 获取状态徽章类
const getStatusBadgeClass = (status: number): string => {
    const classMap: Record<number, string> = {
        1: 'badge-free',
        2: 'badge-charging',
        3: 'badge-connecting',
        4: 'badge-queuing',
        5: 'badge-reserved',
        6: 'badge-fault'
    };
    return classMap[status] || '';
}

// 使用记录相关
const usageRecords = ref<any[]>([]);
const usageLoading = ref<boolean>(false);
const loadUsageRecords = async (pileId: string | number) => {
    usageLoading.value = true;
    usageRecords.value = [];
    try {
        const res = await getPileUsageRecordsApi(pileId, 1, 20);
        if (res.code === 200 && res.data) {
            // 处理返回的数据
            const list = res.data.list || [];
            usageRecords.value = list.map((record: any) => ({
                id: record.id || record.orderNo,
                orderNo: record.orderNo || record.id || '',
                startTime: record.startTime || record.date || '',
                endTime: record.endTime || '',
                money: record.money ? Number(record.money).toFixed(2) : '0.00',
                pay: record.pay || '未知',
                stationName: record.stationName || ''
            }));
        } else {
            usageRecords.value = [];
            if (res.message && res.message !== '获取使用记录成功') {
                ElMessage.warning(res.message);
            }
        }
    } catch (error: any) {
        console.error('加载使用记录失败:', error);
        usageRecords.value = [];
        ElMessage.error(error.message || '加载使用记录失败');
    } finally {
        usageLoading.value = false;
    }
}

// 维保记录相关
const maintenanceDialogVisible = ref<boolean>(false);
const maintenanceRecords = ref<any[]>([]);
const maintenanceLoading = ref<boolean>(false);
const currentPileId = ref<string | number>('');

const openMaintenanceDialog = async (pileId: string | number) => {
    currentPileId.value = pileId;
    maintenanceDialogVisible.value = true;
    await loadMaintenanceRecords(pileId);
}

const loadMaintenanceRecords = async (pileId: string | number) => {
    maintenanceLoading.value = true;
    maintenanceRecords.value = [];
    try {
        const res = await getPileMaintenanceApi(pileId, 1, 20);
        if (res.code === 200 && res.data) {
            maintenanceRecords.value = (res.data.list || []).map((record: any) => ({
                ...record,
                maintenanceType: record.maintenanceType || record.maintenance_type || '',
                maintenancePerson: record.maintenancePerson || record.maintenance_person || '',
                maintenanceTime: record.maintenanceTime || record.maintenance_time || '',
                maintenanceContent: record.maintenanceContent || record.maintenance_content || '',
                maintenanceCost: record.maintenanceCost || record.maintenance_cost || '0.00',
                nextMaintenanceTime: record.nextMaintenanceTime || record.next_maintenance_time || '',
                status: record.status || 1
            }));
        } else {
            maintenanceRecords.value = [];
            if (res.message && res.message !== '获取维保记录成功') {
                ElMessage.warning(res.message);
            }
        }
    } catch (error: any) {
        console.error('加载维保记录失败:', error);
        maintenanceRecords.value = [];
        ElMessage.error(error.message || '加载维保记录失败');
    } finally {
        maintenanceLoading.value = false;
    }
}

// 二维码相关
const qrCodeDialogVisible = ref<boolean>(false);
const currentQRCodePileId = ref<string | number>('');

const openQRCodeDialog = (pileId: string | number) => {
    currentQRCodePileId.value = pileId;
    qrCodeDialogVisible.value = true;
}

// CRUD功能相关
const formDialogVisible = ref<boolean>(false);
const currentEditPileId = ref<number | null>(null);

const handleCreate = () => {
    currentEditPileId.value = null;
    formDialogVisible.value = true;
}

const handleEdit = (item: any) => {
    currentEditPileId.value = Number(item.id);
    formDialogVisible.value = true;
}

const handleDelete = async (id: number) => {
    try {
        const res = await deletePileApi(id);
        if (res.code === 200) {
            ElMessage.success(res.message || '删除成功');
            await loadData();
            if (value.value) {
                handleStationChange();
            }
        } else {
            ElMessage.error(res.message || '删除失败');
        }
    } catch (error: any) {
        ElMessage.error(error.message || '删除失败');
    }
}

const handleFormSuccess = async () => {
    await loadData();
    if (value.value) {
        handleStationChange();
    } else {
        if (options.value.length > 0 && options.value[0].list) {
            dataListCopy.value = options.value[0].list;
            dataList.value = options.value[0].list;
            radio.value = 0;
        }
    }
}
</script>

<style lang="less" scoped>
.pile-management-container {
    padding: 20px;
    background: #f5f7fa;
    min-height: calc(100vh - 60px);

    .filter-card {
        margin-bottom: 16px;
        border-radius: 12px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

        .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .filter-left {
                display: flex;
                gap: 16px;
                align-items: center;

                .create-btn {
                    height: 36px;
                    border-radius: 8px;
                    font-weight: 500;
                    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
                    transition: all 0.3s;

                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
                    }
                }
            }
        }
    }

    .status-filter-card {
        margin-bottom: 20px;
        border-radius: 12px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

        .status-radio-group {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            :deep(.el-radio-button__inner) {
                border-radius: 8px;
                padding: 10px 20px;
                font-weight: 500;
                transition: all 0.3s;
            }

            :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-color: #667eea;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
        }
    }

    .pile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 16px;
        margin-bottom: 20px;

        .pile-card {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #ebeef5;
            position: relative;
            display: flex;
            flex-direction: column;
            height: 220px;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                transition: width 0.3s;
            }

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

                &::before {
                    width: 4px;
                }
            }

            // 状态左边框
            &.status-free::before { background: linear-gradient(180deg, #67c23a 0%, #5daf34 100%); }
            &.status-charging::before { background: linear-gradient(180deg, #409eff 0%, #337ecc 100%); }
            &.status-connecting::before { background: linear-gradient(180deg, #e6a23c 0%, #cf9236 100%); }
            &.status-queuing::before { background: linear-gradient(180deg, #909399 0%, #7a7e83 100%); }
            &.status-reserved::before { background: linear-gradient(180deg, #f56c6c 0%, #dd6161 100%); }
            &.status-fault::before { background: linear-gradient(180deg, #f56c6c 0%, #dd6161 100%); }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 14px 16px;
                background: #fafbfc;
                border-bottom: 1px solid #f0f2f5;

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;

                    .status-indicator {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        flex-shrink: 0;
                        animation: pulse 2s infinite;
                    }

                    .indicator-free { background: #67c23a; box-shadow: 0 0 8px rgba(103, 194, 58, 0.5); }
                    .indicator-charging { background: #409eff; box-shadow: 0 0 8px rgba(64, 158, 255, 0.5); }
                    .indicator-connecting { background: #e6a23c; box-shadow: 0 0 8px rgba(230, 162, 60, 0.5); }
                    .indicator-queuing { background: #909399; }
                    .indicator-reserved { background: #f56c6c; }
                    .indicator-fault { background: #f56c6c; box-shadow: 0 0 8px rgba(245, 108, 108, 0.5); }

                    .header-info {
                        flex: 1;
                        min-width: 0;

                        .pile-id {
                            font-size: 15px;
                            font-weight: 600;
                            color: #303133;
                            margin-bottom: 4px;
                            line-height: 1.4;
                        }

                        .status-badge {
                            display: inline-block;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: 500;
                            line-height: 1.5;
                        }

                        .badge-free { background: #f0f9ff; color: #67c23a; }
                        .badge-charging { background: #ecf5ff; color: #409eff; }
                        .badge-connecting { background: #fdf6ec; color: #e6a23c; }
                        .badge-queuing { background: #f4f4f5; color: #909399; }
                        .badge-reserved { background: #fef0f0; color: #f56c6c; }
                        .badge-fault { background: #fef0f0; color: #f56c6c; }
                    }
                }

                .progress-badge {
                    padding: 4px 12px;
                    background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
                    color: #fff;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
                }
            }

            .card-body {
                flex: 1;
                display: flex;
                padding: 16px;
                gap: 16px;
                overflow: hidden;

                .card-left {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .icon-container {
                        width: 80px;
                        height: 80px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        border-radius: 10px;
                        padding: 12px;

                        .pile-icon {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
                        }
                    }
                }

                .card-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    min-width: 0;

                    .data-list {
                        width: 100%;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                        

                        .data-row {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;

                            .data-label {
                                font-size: 12px;
                                color: #909399;
                                font-weight: 500;
                            }

                            .data-value {
                                font-size: 14px;
                                font-weight: 600;
                                color: #303133;
                                line-height: 1.4;

                                &.highlight {
                                    color: #409eff;
                                }
                            }
                        }
                    }
                }
            }

            .card-footer {
                padding: 12px 16px;
                background: #fafbfc;
                border-top: 1px solid #f0f2f5;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .footer-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #67c23a;

                    .alert-icon {
                        font-size: 14px;
                    }

                    .alert-text {
                        font-weight: 500;
                    }
                }

                .footer-actions {
                    display: flex;
                    gap: 4px;

                    .el-button {
                        padding: 6px;
                        transition: all 0.2s;

                        &:hover {
                            transform: scale(1.1);
                            background: rgba(64, 158, 255, 0.1);
                        }
                    }
                }
            }
        }

        .empty-state {
            grid-column: 1 / -1;
            padding: 60px 0;
        }
    }
}

// 使用记录弹窗样式
.usage-records-popover {
    max-height: 500px;
    overflow-y: auto;

    .popover-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;

        .popover-title {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
        }

        .popover-count {
            font-size: 12px;
            color: #909399;
        }
    }

    .usage-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .usage-item {
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #409eff;
            transition: all 0.2s;

            &:hover {
                background: #f0f4f8;
                transform: translateX(4px);
            }

            .usage-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;

                .usage-order {
                    font-size: 13px;
                    font-weight: 600;
                    color: #303133;
                }

                .usage-money {
                    font-size: 16px;
                    font-weight: 700;
                    color: #409eff;
                }
            }

            .usage-item-meta {
                display: flex;
                gap: 12px;
                margin-bottom: 6px;
                font-size: 12px;
                color: #606266;

                .usage-time {
                    flex: 1;
                }

                .usage-pay {
                    color: #909399;
                }
            }

            .usage-station {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}

// 维保记录对话框样式
.maintenance-dialog {
    .cost-value {
        font-weight: 600;
        color: #f56c6c;
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}

// 响应式设计
@media (max-width: 1400px) {
    .pile-grid {
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    }
}

@media (max-width: 1200px) {
    .pile-grid {
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    }
}

@media (max-width: 768px) {
    .pile-grid {
        grid-template-columns: 1fr;
    }

    .filter-header {
        flex-direction: column;
        gap: 12px;

        .filter-left {
            width: 100%;
            flex-direction: column;

            .el-select {
                width: 100% !important;
            }

            .create-btn {
                width: 100%;
            }
        }
    }

    .status-radio-group {
        :deep(.el-radio-button) {
            flex: 1;
            min-width: calc(50% - 4px);
        }
    }
}
</style>
