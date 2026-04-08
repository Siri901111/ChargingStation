<template>
    <el-row :gutter="20">
        <el-col :span="18">
            <el-card>
                <div class="title">
                    <h3>今日设备运行状态</h3>
                    <p class="ml">更新时间:{{ updateTime }}</p>
                    <el-icon :style="{ color: 'rgba(0,0,0,0.45)', marginLeft: '5px', cursor: 'pointer' }" @click="refreshData">
                        <Refresh />
                    </el-icon>
                </div>
                <div class="equipment">
                    <div class="item">
                        <h4 class="mt mb">充电桩使用率</h4>
                        <img :src="flash" class="mt mb">
                        <h1 class="mb">{{ deviceStatus.usingPiles }} / {{ deviceStatus.totalPiles }}</h1>
                        <div class="statistic-card">
                            <el-statistic :value="deviceStatus.faultPiles">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        异常设备
                                        <el-tooltip effect="dark" :content="`当前有${deviceStatus.faultPiles}台设备异常，请尽快处理`" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                            <div class="statistic-footer">
                                <div class="footer-item">
                                    <span>相较昨日</span>
                                    <span class="green">
                                        {{ deviceStatusChange.pile }}%
                                        <el-icon :color="deviceStatusChange.pile >= 0 ? 'green' : 'red'">
                                            <CaretTop v-if="deviceStatusChange.pile >= 0" />
                                            <CaretBottom v-else />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="item">
                        <h4 class="mt mb">充电柜使用率</h4>
                        <img :src="flash2" class="mt mb">
                        <h1 class="mb">{{ deviceStatus.usingPiles }} / {{ deviceStatus.totalPiles }}</h1>
                        <div class="statistic-card">
                            <el-statistic :value="deviceStatus.faultPiles">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        异常设备
                                        <el-tooltip effect="dark" :content="`当前有${deviceStatus.faultPiles}台设备异常，请尽快处理`" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                            <div class="statistic-footer">
                                <div class="footer-item">
                                    <span>相较昨日</span>
                                    <span class="green">
                                        {{ deviceStatusChange.cabinet }}%
                                        <el-icon :color="deviceStatusChange.cabinet >= 0 ? 'green' : 'red'">
                                            <CaretTop v-if="deviceStatusChange.cabinet >= 0" />
                                            <CaretBottom v-else />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="item">
                        <h4 class="mt mb">充电站使用率</h4>
                        <img :src="flash3" class="mt mb">
                        <h1 class="mb">{{ stationStatus.using }} / {{ stationStatus.total }}</h1>
                        <div class="statistic-card">
                            <el-statistic :value="stationStatus.fault">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        异常设备
                                        <el-tooltip effect="dark" :content="`当前有${stationStatus.fault}个充电站异常，请尽快处理`" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                            <div class="statistic-footer">
                                <div class="footer-item">
                                    <span>相较昨日</span>
                                    <span class="green">
                                        {{ deviceStatusChange.station }}%
                                        <el-icon :color="deviceStatusChange.station >= 0 ? 'green' : 'red'">
                                            <CaretTop v-if="deviceStatusChange.station >= 0" />
                                            <CaretBottom v-else />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </el-card>
            <el-card class="mt">
                <template #header>
                    <div class="card-header">
                        <h1>快捷入口 & 系统状态</h1>
                    </div>
                </template>
                <div class="quick-section">
                    <!-- 快捷入口 -->
                    <div class="quick-links">
                        <div class="quick-link-item" @click="$router.push('/chargingstation/monitor')">
                            <div class="quick-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                <el-icon :size="24"><OfficeBuilding /></el-icon>
                            </div>
                            <span>充电站管理</span>
                        </div>
                        <div class="quick-link-item" @click="$router.push('chargingstation/fault')">
                            <div class="quick-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                                <el-icon :size="24"><Connection /></el-icon>
                            </div>
                            <span>充电桩管理</span>
                        </div>
                        <div class="quick-link-item" @click="$router.push('operations/orders')">
                            <div class="quick-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                                <el-icon :size="24"><List /></el-icon>
                            </div>
                            <span>订单查询</span>
                        </div>
                        <div class="quick-link-item" @click="$router.push('/alarm')">
                            <div class="quick-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                                <el-icon :size="24"><Bell /></el-icon>
                            </div>
                            <span>故障报警</span>
                        </div>
                    </div>

                    <!-- 系统状态 -->
                    <div class="system-status">
                        <div class="status-item">
                            <div class="status-dot online"></div>
                            <span class="status-label">系统状态</span>
                            <span class="status-value">运行正常</span>
                        </div>
                        <div class="status-item">
                            <div class="status-dot online"></div>
                            <span class="status-label">数据库</span>
                            <span class="status-value">已连接</span>
                        </div>
                        <div class="status-item">
                            <div class="status-dot online"></div>
                            <span class="status-label">API服务</span>
                            <span class="status-value">响应正常</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">系统版本</span>
                            <span class="status-value">v1.0.0</span>
                        </div>
                    </div>
                </div>
            </el-card>
            <el-card class="mt">
                <template #header>
                    <div class="card-header">
                        <h1>能源统计</h1>
                    </div>
                </template>
                <el-row>
                    <el-col :span="6">
                        <div ref="chartRef2" style="width: 100%;height: 400px;"></div>
                    </el-col>
                    <el-col :span="18">
                        <div ref="chartRef" style="width: 100%;height: 400px;"></div>
                    </el-col>
                </el-row>
            </el-card>
        </el-col>
        <el-col :span="6">
            <el-card>
                <template #header>
                    <div class="card-heder"> 
                        <h1>设备总览</h1>
                    </div>
                </template>
                <div ref="chartRef3" style="width:100%;height: 240px;"></div>
            </el-card>
            <el-card class="mt">
                <template #header>
                    <div class="card-heder">
                        <h1>营收统计表</h1>
                    </div>
                </template>
                <ul class="ranking-list">
                    <li class="ranking-item" v-for="(item, index) in revenueRanking" :key="index">
                        <span class="rank" :style="getRankStyle(index)">{{ index + 1 }}</span>
                        <span class="store-name">{{ item.name }}</span>
                        <span class="sales">{{ formatNumber(item.value) }}</span>
                        <span style="margin-left:50px">
                            {{ item.growth }}%
                            <el-icon :color="item.growth >= 0 ? 'green' : 'red'">
                                <CaretTop v-if="item.growth >= 0" />
                                <CaretBottom v-else />
                            </el-icon>
                        </span>
                    </li>
                </ul>
            </el-card>
            <el-card class="mt">
                <template #header>
                    <div class="card-heder">
                        <h1>故障报警</h1>
                    </div>
                </template>
                <el-timeline style="max-width: 600px">
                    <el-timeline-item 
                        v-for="(alarm, index) in recentAlarms" 
                        :key="index"
                        :timestamp="alarm.time" 
                        placement="top" 
                        :hollow="true" 
                        :type="alarm.level <= 2 ? 'danger' : 'warning'">
                        <el-card>
                            <h4>{{ alarm.content }}</h4>
                        </el-card>
                    </el-timeline-item>
                    <el-empty v-if="recentAlarms.length === 0" description="暂无故障报警" :image-size="80" />
                </el-timeline>
            </el-card>
        </el-col>
    </el-row>
</template>
<script setup lang="ts">
import flash from "@/assets/flash.png"
import flash2 from "@/assets/flash2.png"
import flash3 from "@/assets/flash3.png"
import { ref, reactive, onMounted } from "vue"
import { useChart } from "@/hooks/useChart"
import {
    getElectricityStatsApi,
    getRevenueRatioApi,
    getDeviceOverviewApi,
    getDeviceStatusApi
} from "@/api/dashboard"
import { getAlarmListApi } from "@/api/alarm"
import { ElMessage } from "element-plus"

const chartRef = ref(null)
const chartRef2 = ref(null)
const chartRef3 = ref(null)

// 更新时间
const updateTime = ref(new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}))

// 设备状态数据
const deviceStatus = reactive({
    totalPiles: 0,
    usingPiles: 0,
    faultPiles: 0,
    todayRevenue: 0
})

// 充电站状态数据
const stationStatus = reactive({
    total: 0,
    using: 0,
    fault: 0
})

// 状态变化百分比（模拟数据，实际应该从后端获取）
const deviceStatusChange = reactive({
    pile: 24,
    cabinet: -24,
    station: 14
})

// 营收排名数据
const revenueRanking = ref<Array<{ name: string; value: number; growth: number }>>([])

// 最近报警数据
const recentAlarms = ref<Array<{ content: string; time: string; level: number }>>([])

// 格式化数字
const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN')
}

// 获取排名样式
const getRankStyle = (index: number) => {
    const colors = [
        { bg: 'var(--el-color-success)', color: '#fff' },
        { bg: 'var(--el-color-primary)', color: '#fff' },
        { bg: 'var(--el-color-warning)', color: '#fff' }
    ]
    if (index < 3) {
        return {
            backgroundColor: colors[index].bg,
            color: colors[index].color
        }
    }
    return {}
}

// 刷新数据
const refreshData = async () => {
    updateTime.value = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
    await loadDeviceStatus()
    await loadRevenueRanking()
    await loadRecentAlarms()
    ElMessage.success('数据已刷新')
}

// 加载设备状态数据
const loadDeviceStatus = async () => {
    try {
        const res = await getDeviceStatusApi()
        if (res.code === 200 && res.data) {
            deviceStatus.totalPiles = res.data.totalPiles || 0
            deviceStatus.usingPiles = res.data.usingPiles || 0
            deviceStatus.faultPiles = res.data.faultPiles || 0
            deviceStatus.todayRevenue = res.data.todayRevenue || 0
            
            // 模拟充电站数据（实际应该从后端获取）
            stationStatus.total = Math.ceil(deviceStatus.totalPiles / 10)
            stationStatus.using = Math.ceil(deviceStatus.usingPiles / 10)
            stationStatus.fault = Math.ceil(deviceStatus.faultPiles / 10)
        }
    } catch (error) {
        console.error('加载设备状态失败:', error)
    }
}

// 加载营收排名数据
const loadRevenueRanking = async () => {
    try {
        const res = await getRevenueRatioApi()
        if (res.code === 200 && res.data && res.data.list) {
            // 将营收占比数据转换为排名数据
            revenueRanking.value = res.data.list
                .map((item: any) => ({
                    name: item.name,
                    value: item.value,
                    growth: Math.floor(Math.random() * 50) - 25 // 模拟增长率
                }))
                .sort((a: any, b: any) => b.value - a.value)
                .slice(0, 7) // 取前7名
        }
    } catch (error) {
        console.error('加载营收排名失败:', error)
    }
}

// 加载最近报警数据
const loadRecentAlarms = async () => {
    try {
        const res = await getAlarmListApi({ page: 1, pageSize: 3 })
        if (res.code === 200 && res.data && res.data.list) {
            recentAlarms.value = res.data.list.map((alarm: any) => ({
                content: alarm.content || alarm.description || '报警信息',
                time: alarm.fault_time ? new Date(alarm.fault_time).toLocaleDateString('zh-CN') : '',
                level: alarm.level || 3
            }))
        }
    } catch (error) {
        console.error('加载报警数据失败:', error)
    }
}

// 设置折线图数据
const setChartData = async () => {
    const chartOptions: any = reactive({
        title: {
            text: '电量统计',
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: []
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}kw'
            }
        },
        series: []
    });
    
    try {
        const res = await getElectricityStatsApi()
        if (res.code === 200 && res.data) {
            // 后端返回格式：{ xAxis: [], series: [{ name, type, data }] }
            chartOptions.xAxis.data = res.data.xAxis || []
            chartOptions.legend.data = res.data.series?.map((item: any) => item.name) || []
            
            // 设置系列数据
            chartOptions.series = res.data.series?.map((item: any, index: number) => ({
                name: item.name,
                type: 'line',
                data: item.data || [],
                lineStyle: {
                    width: 4
                },
                itemStyle: {
                    color: index === 0 ? "purple" : index === 1 ? "lightgreen" : "skyblue",
                    shadowBlur: 5,
                    shadowColor: 'rgba(0,255,0,0.5)'
                },
                smooth: true
            })) || []
        }
    } catch (error) {
        console.error('加载电量统计数据失败:', error)
    }
    
    return chartOptions
}

// 设置饼图数据
const setChartData2 = async () => {
    const chartOptions: any = reactive({
        legend: {
            top: 'bottom'
        },
        tooltip: {
            trigger: "item",
            formatter: '{a}<br/>{b}:{c}'
        },
        series: [
            {
                name: '营收占比',
                type: 'pie',
                radius: ["50%", "70%"],
                center: ['50%', '50%'],
                roseType: "area",
                emphasis: {
                    label: {
                        show: true,
                        fontSize: "16",
                        fontWeight: "bold"
                    }
                },
                data: []
            }
        ],
        graphic: {
            type: 'text',
            left: "center",
            top: "center",
            style: {
                text: "营收占比",
                fontSize: 20,
                fill: "rgba(0, 0, 0, 0.88)"
            }
        }
    })
    
    try {
        const res = await getRevenueRatioApi()
        if (res.code === 200 && res.data && res.data.list) {
            chartOptions.series[0].data = res.data.list.map((item: any) => ({
                name: item.name,
                value: item.value
            }))
        }
    } catch (error) {
        console.error('加载营收占比数据失败:', error)
    }
    
    return chartOptions
}

// 设置雷达图数据
const setChartData3 = async () => {
    const chartOptions = reactive({
        radar: {
            indicator: [
                { name: '闲置数', max: 800 },
                { name: '使用数', max: 200 },
                { name: '故障数', max: 200 },
                { name: '维修数', max: 200 },
                { name: '更换数', max: 200 },
                { name: '报废数', max: 200 }
            ]
        },
        series: [
            {
                name: '设备总览',
                type: 'radar',
                data: [
                    {
                        value: [],
                        name: '设备总览'
                    },
                ]
            }
        ]
    })
    
    try {
        const res = await getDeviceOverviewApi()
        if (res.code === 200 && res.data && res.data.list) {
            // 后端返回格式：{ list: [idleCount, usingCount, faultCount, repairCount, replaceCount, scrapCount] }
            chartOptions.series[0].data[0].value = res.data.list
        }
    } catch (error) {
        console.error('加载设备总览数据失败:', error)
    }
    
    return chartOptions
}

// 初始化
onMounted(async () => {
    await loadDeviceStatus()
    await loadRevenueRanking()
    await loadRecentAlarms()
})

useChart(chartRef, setChartData)
useChart(chartRef2, setChartData2)
useChart(chartRef3, setChartData3)

</script>

<style lang="less" scoped>
.title {
    display: flex;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    align-items: flex-end;
    margin-bottom: 20px;

    p {
        color: rgba(0, 0, 0, 0.65);
    }
}

.equipment {
    display: flex;
    justify-content: space-between;
    padding: 0 50px;

    .item {
        h1 {
            font-size: 36px;
        }

        :deep(.el-statistic__content) {
            margin-top: 10px !important;
            margin-bottom: 10px
        }
    }
}

// 卡片头部
.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

// 快捷入口 & 系统状态
.quick-section {
    display: flex;
    gap: 40px;
    align-items: flex-start;
}

.quick-links {
    display: flex;
    gap: 24px;
    flex: 1;
}

.quick-link-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    background: #fafafa;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .quick-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
    }

    span {
        font-size: 14px;
        color: #333;
        font-weight: 500;
    }
}

.system-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    min-width: 200px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.online {
            background: #10b981;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
            animation: pulse 2s infinite;
        }

        &.offline {
            background: #ef4444;
        }
    }

    .status-label {
        color: #666;
        flex: 1;
    }

    .status-value {
        color: #333;
        font-weight: 500;
    }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.ranking-list {
    .ranking-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;

        .rank {
            display: inline-block;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.65);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
        }

        .store-name {
            flex-grow: 1;
            padding: 0 10px;
            color: rgba(0, 0, 0, 0.88);
        }

        .sales {
            color: rgba(0, 0, 0, 0.65);
        }
    }

    .ranking-item:nth-child(even) {
        background-color: #f0f2f5;
    }
}
</style>
