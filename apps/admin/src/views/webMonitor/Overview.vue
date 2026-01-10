<template>
  <div class="monitor-overview">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">
            <el-icon :size="32"><DataAnalysis /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(overviewData.total) }}</div>
            <div class="stat-label">总上报量</div>
          </div>
          <div class="stat-trend up">
            <span>今日 +{{ overviewData.todayCount }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-danger">
          <div class="stat-icon">
            <el-icon :size="32"><WarningFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(overviewData.errorCount) }}</div>
            <div class="stat-label">错误总数</div>
          </div>
          <div class="stat-trend" :class="Number(errorRate) > 5 ? 'down' : 'up'">
            <span>错误率 {{ errorRate }}%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-success">
          <div class="stat-icon">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(overviewData.uv) }}</div>
            <div class="stat-label">独立访客 (UV)</div>
          </div>
          <div class="stat-trend up">
            <span>PV {{ formatNumber(overviewData.pv) }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-warning">
          <div class="stat-icon">
            <el-icon :size="32"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ performanceData.avgFCP || 0 }}ms</div>
            <div class="stat-label">平均FCP</div>
          </div>
          <div class="stat-trend" :class="performanceData.avgFCP < 2000 ? 'up' : 'down'">
            <span>{{ performanceData.avgFCP < 2000 ? '良好' : '需优化' }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">时间范围：</span>
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="shortcuts"
            @change="handleDateChange"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">应用端：</span>
          <el-select v-model="filterAppId" placeholder="选择应用端" clearable @change="handleDateChange" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="管理端" value="charging-station-admin" />
            <el-option label="用户端" value="charging-station-user-app" />
          </el-select>
        </div>
        <div class="filter-item">
          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据上报趋势</span>
              <el-radio-group v-model="trendGroupBy" size="small" @change="loadTrendData">
                <el-radio-button label="hour">按小时</el-radio-button>
                <el-radio-button label="day">按天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>数据分类占比</span>
          </template>
          <div ref="categoryChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能和类型统计 -->
    <el-row :gutter="20" class="detail-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Core Web Vitals</span>
              <el-tag :type="getPerformanceLevel(performanceData.avgLCP)" size="small">
                {{ getPerformanceLevelText(performanceData.avgLCP) }}
              </el-tag>
            </div>
          </template>
          <div class="performance-metrics">
            <div class="metric-item">
              <div class="metric-label">
                <span>FCP (首次内容绘制)</span>
                <el-tooltip content="页面首次渲染内容的时间" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="metric-value">
                <el-progress
                  :percentage="getProgressPercent(performanceData.avgFCP, 3000)"
                  :color="getMetricColor(performanceData.avgFCP, 1800, 3000)"
                />
                <span class="value-text">{{ performanceData.avgFCP || 0 }}ms</span>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-label">
                <span>LCP (最大内容绘制)</span>
                <el-tooltip content="最大内容元素渲染的时间" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="metric-value">
                <el-progress
                  :percentage="getProgressPercent(performanceData.avgLCP, 4000)"
                  :color="getMetricColor(performanceData.avgLCP, 2500, 4000)"
                />
                <span class="value-text">{{ performanceData.avgLCP || 0 }}ms</span>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-label">
                <span>TTFB (首字节时间)</span>
                <el-tooltip content="从请求到接收首字节的时间" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="metric-value">
                <el-progress
                  :percentage="getProgressPercent(performanceData.avgTTFB, 1000)"
                  :color="getMetricColor(performanceData.avgTTFB, 200, 500)"
                />
                <span class="value-text">{{ performanceData.avgTTFB || 0 }}ms</span>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-label">
                <span>FID (首次输入延迟)</span>
                <el-tooltip content="用户首次交互到响应的延迟" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="metric-value">
                <el-progress
                  :percentage="getProgressPercent(performanceData.avgFID, 300)"
                  :color="getMetricColor(performanceData.avgFID, 100, 300)"
                />
                <span class="value-text">{{ performanceData.avgFID || 0 }}ms</span>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-label">
                <span>CLS (累计布局偏移)</span>
                <el-tooltip content="页面视觉稳定性评分" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="metric-value">
                <el-progress
                  :percentage="getProgressPercent(Number(performanceData.avgCLS) * 1000, 250)"
                  :color="getMetricColor(Number(performanceData.avgCLS) * 1000, 100, 250)"
                />
                <span class="value-text">{{ performanceData.avgCLS || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>上报类型 Top10</span>
          </template>
          <div ref="typeChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速入口 -->
    <el-card class="quick-entry-card">
      <template #header>
        <span>监控模块</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <router-link to="/webmonitor/errors" class="quick-entry-item">
            <el-icon :size="40" :style="{ color: 'var(--el-color-danger)' }"><CircleCloseFilled /></el-icon>
            <span>错误监控</span>
            <el-badge :value="overviewData.errorCount" :max="999" class="entry-badge" />
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/webmonitor/performance" class="quick-entry-item">
            <el-icon :size="40" :style="{ color: 'var(--el-color-warning)' }"><Odometer /></el-icon>
            <span>性能监控</span>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/webmonitor/behavior" class="quick-entry-item">
            <el-icon :size="40" color="#409eff"><Pointer /></el-icon>
            <span>行为分析</span>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/webmonitor/network" class="quick-entry-item">
            <el-icon :size="40" color="#67c23a"><Connection /></el-icon>
            <span>网络请求</span>
          </router-link>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, markRaw } from 'vue'
import * as echarts from 'echarts'
import {
  getOverview,
  getTrend,
  getPerformanceMetrics,
  type OverviewStats,
  type PerformanceMetrics,
  type TrendItem
} from '@/api/monitor'
import { ElMessage } from 'element-plus'

const dateRange = ref<[Date, Date]>([
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  new Date()
])

const shortcuts = [
  {
    text: '最近1小时',
    value: () => [new Date(Date.now() - 3600 * 1000), new Date()]
  },
  {
    text: '最近24小时',
    value: () => [new Date(Date.now() - 24 * 3600 * 1000), new Date()]
  },
  {
    text: '最近7天',
    value: () => [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()]
  },
  {
    text: '最近30天',
    value: () => [new Date(Date.now() - 30 * 24 * 3600 * 1000), new Date()]
  }
]

const loading = ref(false)
const trendGroupBy = ref<'hour' | 'day'>('hour')
const filterAppId = ref('')

const overviewData = reactive<OverviewStats>({
  total: 0,
  errorCount: 0,
  todayCount: 0,
  uv: 0,
  pv: 0,
  categoryStats: {},
  typeStats: []
})

const performanceData = reactive<PerformanceMetrics>({
  avgFCP: 0,
  avgLCP: 0,
  avgTTFB: 0,
  avgFID: 0,
  avgCLS: 0,
  avgLoadComplete: 0,
  sampleCount: 0
})

const trendData = ref<TrendItem[]>([])

const trendChartRef = ref<HTMLElement | null>(null)
const categoryChartRef = ref<HTMLElement | null>(null)
const typeChartRef = ref<HTMLElement | null>(null)

let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

const errorRate = computed(() => {
  if (overviewData.total === 0) return '0.00'
  return ((overviewData.errorCount / overviewData.total) * 100).toFixed(2)
})

const formatNumber = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num?.toLocaleString() || '0'
}

const getTimeParams = () => {
  const params: any = {}
  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    params.startTime = dateRange.value[0].getTime()
    params.endTime = dateRange.value[1].getTime()
  }
  if (filterAppId.value) {
    params.appId = filterAppId.value
  }
  return params
}

const loadOverviewData = async () => {
  try {
    const res = await getOverview(getTimeParams())
    if (res.code === 200 && res.data) {
      Object.assign(overviewData, res.data)
      updateCategoryChart()
      updateTypeChart()
    }
  } catch (error) {
    console.error('加载概览数据失败:', error)
  }
}

const loadPerformanceData = async () => {
  try {
    const res = await getPerformanceMetrics(getTimeParams())
    if (res.code === 200 && res.data) {
      Object.assign(performanceData, res.data)
    }
  } catch (error) {
    console.error('加载性能数据失败:', error)
  }
}

const loadTrendData = async () => {
  try {
    const timeParams = getTimeParams()
    const params = {
      startTime: timeParams.startTime || Date.now() - 24 * 60 * 60 * 1000,
      endTime: timeParams.endTime || Date.now(),
      groupBy: trendGroupBy.value
    }
    const res = await getTrend(params)
    if (res.code === 200 && res.data) {
      trendData.value = res.data
      updateTrendChart()
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  }
}

const updateTrendChart = () => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = markRaw(echarts.init(trendChartRef.value))
  }

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.map(item => item.time),
      axisLabel: { rotate: 30 }
    },
    yAxis: { type: 'value', name: '上报量' },
    series: [{
      name: '上报量',
      type: 'line',
      smooth: true,
      data: trendData.value.map(item => item.count),
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
        ])
      },
      lineStyle: { color: '#409eff', width: 2 },
      itemStyle: { color: '#409eff' }
    }]
  }
  trendChart.setOption(option)
}

const updateCategoryChart = () => {
  if (!categoryChartRef.value) return
  if (!categoryChart) {
    categoryChart = markRaw(echarts.init(categoryChartRef.value))
  }

  const categoryNames: Record<string, string> = {
    error: '错误', performance: '性能', behavior: '行为', network: '网络', session: '会话'
  }
  const categoryColors: Record<string, string> = {
    error: '#f56c6c', performance: '#e6a23c', behavior: '#409eff', network: '#67c23a', session: '#909399'
  }

  const data = Object.entries(overviewData.categoryStats).map(([key, value]) => ({
    name: categoryNames[key] || key,
    value,
    itemStyle: { color: categoryColors[key] || '#909399' }
  }))

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data
    }]
  }
  categoryChart.setOption(option)
}

const updateTypeChart = () => {
  if (!typeChartRef.value) return
  if (!typeChart) {
    typeChart = markRaw(echarts.init(typeChartRef.value))
  }

  const data = overviewData.typeStats.slice(0, 10)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: data.map(item => item.type).reverse(),
      axisLabel: { width: 100, overflow: 'truncate' }
    },
    series: [{
      type: 'bar',
      data: data.map(item => item.count).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#67c23a' }
        ]),
        borderRadius: [0, 4, 4, 0]
      }
    }]
  }
  typeChart.setOption(option)
}

const getProgressPercent = (value: number, max: number) => Math.min(Math.round((value / max) * 100), 100)
const getMetricColor = (value: number, good: number, bad: number) => {
  if (value <= good) return '#67c23a'
  if (value <= bad) return '#e6a23c'
  return '#f56c6c'
}
const getPerformanceLevel = (lcp: number) => {
  if (lcp <= 2500) return 'success'
  if (lcp <= 4000) return 'warning'
  return 'danger'
}
const getPerformanceLevelText = (lcp: number) => {
  if (lcp <= 2500) return '优秀'
  if (lcp <= 4000) return '需改进'
  return '较差'
}

const handleDateChange = () => refreshData()

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([loadOverviewData(), loadPerformanceData(), loadTrendData()])
    ElMessage.success('数据已刷新')
  } catch {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
  typeChart?.resize()
}

onMounted(async () => {
  await refreshData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  categoryChart?.dispose()
  typeChart?.dispose()
})
</script>

<style lang="less" scoped>
.monitor-overview {
  .stats-row { margin-bottom: 20px; }

  .stat-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    color: #fff;
    display: flex;
    align-items: center;
    position: relative;
    min-height: 120px;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    &.stat-card-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.stat-card-danger { background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%); }
    &.stat-card-success { background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%); }
    &.stat-card-warning { background: linear-gradient(135deg, #e6a23c 0%, #cf9236 100%); }

    .stat-icon { margin-right: 20px; opacity: 0.9; }
    .stat-content {
      flex: 1;
      .stat-value { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
      .stat-label { font-size: 14px; opacity: 0.9; }
    }
    .stat-trend {
      position: absolute;
      right: 15px;
      bottom: 15px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
    }
  }

  .filter-card {
    margin-bottom: 20px;
    .filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .filter-item {
        display: flex;
        align-items: center;
        .filter-label { margin-right: 10px; color: #606266; }
      }
    }
  }

  .chart-row, .detail-row { margin-bottom: 20px; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .performance-metrics {
    .metric-item {
      margin-bottom: 20px;
      &:last-child { margin-bottom: 0; }
      .metric-label {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        color: #606266;
        font-size: 14px;
        .el-icon { margin-left: 5px; cursor: help; color: #909399; }
      }
      .metric-value {
        display: flex;
        align-items: center;
        .el-progress { flex: 1; margin-right: 15px; }
        .value-text { min-width: 80px; text-align: right; font-weight: bold; color: #303133; }
      }
    }
  }

  .quick-entry-card {
    .quick-entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
      border-radius: 12px;
      background: #f5f7fa;
      transition: all 0.3s;
      text-decoration: none;
      color: #303133;
      position: relative;

      &:hover {
        background: #ecf5ff;
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      }

      span { margin-top: 12px; font-size: 14px; }
      .entry-badge { position: absolute; top: 10px; right: 10px; }
    }
  }
}
</style>
