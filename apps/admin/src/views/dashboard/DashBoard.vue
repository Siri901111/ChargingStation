<template>
    <el-row :gutter="20">
        <el-col :span="18">
            <el-card>
                <div class="title">
                    <h3>今日设备运行状态</h3>
                    <p class="ml">更新时间:{{ updateTime }}</p>
                    <el-icon color="#86909c" style="margin-left: 5px; cursor: pointer;" @click="refreshData">
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
                        <h1>常用功能</h1>
                    </div>
                </template>
                <div class="quick mt mb">
                    <el-row>
                        <el-col :span="4">
                            <img :src="repair">
                            <p>设备维修</p>
                        </el-col>
                        <el-col :span="4">
                            <img :src="daily">
                            <p>每日日报</p>
                        </el-col>
                        <el-col :span="4">
                            <img :src="progress">
                            <p>任务进度</p>
                        </el-col>
                        <el-col :span="4">
                            <img :src="total">
                            <p>营收占比</p>
                        </el-col>
                        <el-col :span="4">
                            <img :src="money">
                            <p>营收统计</p>
                        </el-col>
                        <el-col :span="4">
                            <img :src="remain">
                            <p>代办事项</p>
                        </el-col>
                    </el-row>
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
import repair from "@/assets/repair.png"
import progress from "@/assets/progress.png"
import remain from "@/assets/remain.png"
import total from "@/assets/total.png"
import money from "@/assets/money.png"
import daily from "@/assets/daily.png"
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
        { bg: 'rgb(103, 194, 58)', color: '#fff' },
        { bg: 'rgb(64, 158, 255)', color: '#fff' },
        { bg: 'rgb(230, 162, 60)', color: '#fff' }
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
                fill: "#333"
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
                { name: '闲置数', max: 200 },
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
        color: #86909c;

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

.quick {

    margin-top: 30px;
    text-align: center;

    p {
        margin-top: 10px;
        color: #333;
    }
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
            color: #666;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
        }

        .store-name {
            flex-grow: 1;
            padding: 0 10px;
        }

        .sales {
            color: #666;
        }
    }

    .ranking-item:nth-child(even) {
        background-color: rgb(253, 246, 236);
    }
}
</style>
