<template>
    <el-card>
        <el-select style="width: 300px;" placeholder="选择站点名称" v-model="value" filterable>
            <el-option v-for="item in options" :key="item.id" :value="item.name" :label="item.name"></el-option>
        </el-select>
    </el-card>

    <el-card class="mt">
        <el-radio-group size="large" v-model="radio" @change="handleChange">
            <el-radio-button :label="`全部(${allCount})`" :value="0" />
            <el-radio-button :label="`空闲中(${checkCount(1)})`" :value="1" />
            <el-radio-button :label="`充电中(${checkCount(2)})`" :value="2" />
            <el-radio-button :label="`连接中(${checkCount(3)})`" :value="3" />
            <el-radio-button :label="`排队中(${checkCount(4)})`" :value="4" />
            <el-radio-button :label="`已预约(${checkCount(5)})`" :value="5" />
            <el-radio-button :label="`故障/离线(${checkCount(6)})`" :value="6" />
        </el-radio-group>
    </el-card>
    <el-card class="mt">
        <el-row :gutter="20">
            <el-col :span="6" v-for="item in dataListCopy" :key="item.id">
                <div class="item">
                    <div class="pic">
                        <p v-if="item.status === 1">空闲中</p>
                        <p v-else-if="item.status === 2">充电中</p>
                        <p v-else-if="item.status === 3">连接中</p>
                        <p v-else-if="item.status === 4">排队中</p>
                        <p v-else-if="item.status === 5">已预约</p>
                        <p v-else-if="item.status === 6">故障/离线</p>
                        <img :src="item.status == 1 ? free : (item.status == 6 ? outline : ing)" width="100px">
                        <p v-if="item.status == 2">{{ item.percent }}</p>
                        <p v-else>0%</p>
                    </div>
                    <div class="info">
                        <h3>{{ item.id }}</h3>
                        <hr class="mb">
                        <p>电压：{{ item.voltage }}</p>
                        <p>电流：{{ item.current }}</p>
                        <p>功率：{{ item.power }}</p>
                        <p>温度：{{ item.tem }}</p>
                    </div>
                </div>
                <div class="btn">
                    <div class="divder"></div>
                    <div>
                        <p class="fl ml" style="font-size: 12px;color: rgba(0, 0, 0, 0.45);">暂无预警</p>
                        <div class="fr" style="text-align: right;">
                            <el-button size="small" @click="openMaintenanceDialog(item.id)">维保记录</el-button>

                            <el-popover 
                                placement="right" 
                                :width="350" 
                                trigger="click"
                                :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 10] } }] }"
                                @show="loadUsageRecords(item.id)"
                            >
                                <template #reference>
                                    <el-button size="small" type="primary" class="mr">使用记录</el-button>
                                </template>
                                <div v-loading="usageLoading">
                                    <h3 class="mb">使用记录</h3>
                                    <el-timeline style="max-width: 600px" v-if="!usageLoading && usageRecords.length > 0">
                                        <el-timeline-item 
                                            :timestamp="record.startTime || record.date" 
                                            v-for="record in usageRecords" 
                                            :key="record.id || record.orderNo" 
                                            :hollow="true" 
                                            type="primary"
                                        >
                                            <div style="line-height: 1.8;">
                                                <p style="margin: 4px 0; font-weight: 500;">订单号：{{ record.orderNo || record.id }}</p>
                                                <p style="margin: 4px 0;">金额：<span style="color: var(--el-color-primary); font-weight: 500;">{{ record.money }}元</span></p>
                                                <p style="margin: 4px 0;">支付方式：{{ record.pay }}</p>
                                                <p v-if="record.stationName" style="margin: 4px 0; color: rgba(0, 0, 0, 0.45); font-size: 12px;">充电站：{{ record.stationName }}</p>
                                            </div>
                                        </el-timeline-item>
                                    </el-timeline>
                                    <el-empty v-else-if="!usageLoading" description="暂无使用记录" :image-size="80"></el-empty>
                                </div>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
    </el-card>

    <!-- 维保记录对话框 -->
    <el-dialog
        v-model="maintenanceDialogVisible"
        title="维保记录"
        width="800px"
        destroy-on-close
    >
        <div v-loading="maintenanceLoading">
            <el-table :data="maintenanceRecords" style="width: 100%">
                <el-table-column type="index" label="序号" width="60"></el-table-column>
                <el-table-column prop="maintenanceType" label="维保类型" width="120"></el-table-column>
                <el-table-column prop="maintenancePerson" label="维保人员" width="120"></el-table-column>
                <el-table-column prop="maintenanceTime" label="维保时间" width="160"></el-table-column>
                <el-table-column prop="maintenanceContent" label="维保内容" show-overflow-tooltip></el-table-column>
                <el-table-column prop="maintenanceCost" label="维保费用(元)" width="100">
                    <template #default="scope">
                        {{ scope.row.maintenanceCost }}
                    </template>
                </el-table-column>
                <el-table-column prop="nextMaintenanceTime" label="下次维保时间" width="160"></el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                    <template #default="scope">
                        <el-tag v-if="scope.row.status === 1" type="success">已完成</el-tag>
                        <el-tag v-else type="warning">进行中</el-tag>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-if="!maintenanceLoading && maintenanceRecords.length === 0" description="暂无维保记录" :image-size="100"></el-empty>
        </div>
    </el-dialog>
</template>
<script setup lang="ts">
import free from "@/assets/free.png"
import outline from "@/assets/outline.png";
import ing from "@/assets/ing.png"
import { getCurrentListApi } from "@/api/chargingstation"
import { getPileUsageRecordsApi, getPileMaintenanceApi } from "@/api/pile"
import { onMounted, ref } from "vue";
import { computed, watch } from "vue";
import { ElMessage } from 'element-plus';


const options = ref<any>([]) //下拉菜单数据
const dataList = ref<any>([]) //渲染列表数据
const dataListCopy = ref<any>([])
const loadData = async () => {
    try {
        const res = await getCurrentListApi();
        if (res.code === 200 && res.data) {
            options.value = res.data || [];
            // 确保有数据
            if (options.value.length > 0 && options.value[0].list) {
                dataList.value = options.value[0].list; //原始数据
                dataListCopy.value = options.value[0].list; //做列表渲染
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
    }
}
onMounted(() => {
    loadData()
})
const value = ref<string>("");
const radio = ref<number>(0)
function checkCount(num: number) {
    return dataList.value.filter((item: any) => item.status == num).length
}
const allCount = computed(() => checkCount(1) + checkCount(2) + checkCount(3) + checkCount(4) + checkCount(5) + checkCount(6))

const handleChange = () => {
    dataListCopy.value = dataList.value
    if (radio.value != 0) {
        dataListCopy.value = dataListCopy.value.filter((item: any) => item.status == radio.value)
    }
}

watch(value, () => {
    const selected = options.value.find((item: any) => item.name === value.value);
    if (selected && selected.list) {
        dataListCopy.value = selected.list;
        dataList.value = selected.list;
        radio.value = 0;
    }
})

// 使用记录相关
const usageRecords = ref<any[]>([]);
const usageLoading = ref<boolean>(false);
const loadUsageRecords = async (pileId: string | number) => {
    usageLoading.value = true;
    usageRecords.value = []; // 清空之前的数据
    try {
        const res = await getPileUsageRecordsApi(pileId, 1, 10);
        if (res.code === 200 && res.data) {
            // 后端返回的数据格式：{ list: [{ id, orderNo, startTime, endTime, money, pay, status, date }], total }
            usageRecords.value = (res.data.list || []).map((record: any) => ({
                ...record,
                // 确保时间格式正确显示
                startTime: record.startTime || record.date || '',
                // 格式化金额显示
                money: record.money ? Number(record.money).toFixed(2) : '0.00',
                // 支付方式显示
                pay: record.pay || '未知'
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
    maintenanceRecords.value = []; // 清空之前的数据
    try {
        const res = await getPileMaintenanceApi(pileId, 1, 20);
        if (res.code === 200 && res.data) {
            // 后端返回的数据格式：{ list: [{ id, maintenanceType, maintenancePerson, maintenanceTime, maintenanceContent, maintenanceCost, nextMaintenanceTime, status }], total }
            maintenanceRecords.value = (res.data.list || []).map((record: any) => ({
                ...record,
                // 确保字段名正确
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

</script>

<style lang="less" scoped>
.item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    background-color: rgb(247, 251, 254);
    padding: 20px;
    border-radius: 10px 10px 0 0;
    margin-top: 20px;

    .pic {
        p {
            width: 76px;
            text-align: center;
            margin-bottom: 10px;
            color: rgb(61, 187, 146);
        }
    }

    .info {
        color: rgba(0, 0, 0, 0.45);
        margin-left: 30px;
        line-height: 26px;
        margin-top: -10px;
    }
}

.btn {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #f7fbfe;

    .divder {
        background-color: #f4f4f4;
        height: 2px;
        width: 95%;
        margin: auto;
    }
}
</style>