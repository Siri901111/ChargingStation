<template>
  <div class="performance-monitor">
    <!-- 性能概览卡片 -->
    <el-row :gutter="16" class="overview-cards">
      <el-col :span="4">
        <div class="perf-card" :class="getScoreClass(performanceData.avgFCP, 1800, 3000)">
          <div class="perf-score">{{ performanceData.avgFCP || 0 }}</div>
          <div class="perf-unit">ms</div>
          <div class="perf-label">FCP</div>
          <div class="perf-desc">首次内容绘制</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="perf-card" :class="getScoreClass(performanceData.avgLCP, 2500, 4000)">
          <div class="perf-score">{{ performanceData.avgLCP || 0 }}</div>
          <div class="perf-unit">ms</div>
          <div class="perf-label">LCP</div>
          <div class="perf-desc">最大内容绘制</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="perf-card" :class="getScoreClass(performanceData.avgTTFB, 200, 500)">
          <div class="perf-score">{{ performanceData.avgTTFB || 0 }}</div>
          <div class="perf-unit">ms</div>
          <div class="perf-label">TTFB</div>
          <div class="perf-desc">首字节时间</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="perf-card" :class="getScoreClass(performanceData.avgFID, 100, 300)">
          <div class="perf-score">{{ performanceData.avgFID || 0 }}</div>
          <div class="perf-unit">ms</div>
          <div class="perf-label">FID</div>
          <div class="perf-desc">首次输入延迟</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="perf-card" :class="getScoreClass(Number(performanceData.avgCLS) * 1000, 100, 250)">
          <div class="perf-score">{{ performanceData.avgCLS || 0 }}</div>
          <div class="perf-unit"></div>
          <div class="perf-label">CLS</div>
          <div class="perf-desc">累计布局偏移</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="perf-card" :class="getScoreClass(performanceData.avgLoadComplete, 3000, 5000)">
          <div class="perf-score">{{ performanceData.avgLoadComplete || 0 }}</div>
          <div class="perf-unit">ms</div>
          <div class="perf-label">Load</div>
          <div class="perf-desc">页面加载完成</div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="shortcuts"
            @change="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterParams.type" placeholder="性能类型" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="性能指标" value="performance" />
            <el-option label="资源加载" value="resource_timing" />
            <el-option label="长任务" value="long_task" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>性能趋势</span>
              <el-radio-group v-model="trendMetric" size="small" @change="loadTrendData">
                <el-radio-button label="fcp">FCP</el-radio-button>
                <el-radio-button label="lcp">LCP</el-radio-button>
                <el-radio-button label="ttfb">TTFB</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>性能分布</span></template>
          <div ref="distributionChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Web Vitals 说明 -->
    <el-card class="vitals-card">
      <template #header><span>Web Vitals 指标说明</span></template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="vital-item">
            <div class="vital-header">
              <el-icon :size="24" color="#67c23a"><Promotion /></el-icon>
              <span class="vital-name">LCP (Largest Contentful Paint)</span>
            </div>
            <div class="vital-thresholds">
              <div class="threshold good"><span class="label">优秀</span><span class="value">&lt; 2.5s</span></div>
              <div class="threshold warning"><span class="label">需改进</span><span class="value">2.5s - 4s</span></div>
              <div class="threshold poor"><span class="label">较差</span><span class="value">&gt; 4s</span></div>
            </div>
            <p class="vital-desc">衡量页面主要内容的加载速度</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="vital-item">
            <div class="vital-header">
              <el-icon :size="24" color="#e6a23c"><Pointer /></el-icon>
              <span class="vital-name">FID (First Input Delay)</span>
            </div>
            <div class="vital-thresholds">
              <div class="threshold good"><span class="label">优秀</span><span class="value">&lt; 100ms</span></div>
              <div class="threshold warning"><span class="label">需改进</span><span class="value">100-300ms</span></div>
              <div class="threshold poor"><span class="label">较差</span><span class="value">&gt; 300ms</span></div>
            </div>
            <p class="vital-desc">衡量用户首次交互的响应速度</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="vital-item">
            <div class="vital-header">
              <el-icon :size="24" color="#f56c6c"><Grid /></el-icon>
              <span class="vital-name">CLS (Cumulative Layout Shift)</span>
            </div>
            <div class="vital-thresholds">
              <div class="threshold good"><span class="label">优秀</span><span class="value">&lt; 0.1</span></div>
              <div class="threshold warning"><span class="label">需改进</span><span class="value">0.1 - 0.25</span></div>
              <div class="threshold poor"><span class="label">较差</span><span class="value">&gt; 0.25</span></div>
            </div>
            <p class="vital-desc">衡量页面视觉稳定性</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 性能数据列表 -->
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <span>性能数据详情</span>
          <span class="sample-count">样本数：{{ performanceData.sampleCount }}</span>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions :column="3" border size="small">
                <el-descriptions-item label="页面URL">{{ row.page_url }}</el-descriptions-item>
                <el-descriptions-item label="页面标题">{{ row.page_title }}</el-descriptions-item>
                <el-descriptions-item label="上报时间">{{ formatTime(row.timestamp) }}</el-descriptions-item>
                <el-descriptions-item label="设备信息" :span="3">
                  <pre>{{ JSON.stringify(row.device_info, null, 2) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="完整数据" :span="3">
                  <pre>{{ JSON.stringify(row.data, null, 2) }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="140">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="page_url" label="页面" min-width="200" show-overflow-tooltip />
        <el-table-column label="FCP" width="100">
          <template #default="{ row }">
            <span :style="{ color: getMetricColor(getDataValue(row.data, 'firstContentfulPaint'), 1800, 3000) }">
              {{ getDataValue(row.data, 'firstContentfulPaint') || '-' }}ms
            </span>
          </template>
        </el-table-column>
        <el-table-column label="LCP" width="100">
          <template #default="{ row }">
            <span :style="{ color: getMetricColor(getDataValue(row.data, 'largestContentfulPaint'), 2500, 4000) }">
              {{ getDataValue(row.data, 'largestContentfulPaint') || '-' }}ms
            </span>
          </template>
        </el-table-column>
        <el-table-column label="TTFB" width="100">
          <template #default="{ row }">
            <span :style="{ color: getMetricColor(getDataValue(row.data, 'timeToFirstByte'), 200, 500) }">
              {{ getDataValue(row.data, 'timeToFirstByte') || '-' }}ms
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="pageInfo.page"
        v-model:page-size="pageInfo.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, markRaw } from 'vue'
import * as echarts from 'echarts'
import { getPerformanceList, getPerformanceMetrics, getTrend, type MonitorDataItem, type PerformanceMetrics } from '@/api/monitor'

const loading = ref(false)
const tableData = ref<MonitorDataItem[]>([])
const total = ref(0)
const pageInfo = reactive({ page: 1, pageSize: 20 })
const filterParams = reactive({ type: '' })

const dateRange = ref<[Date, Date]>([new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()])

const shortcuts = [
  { text: '最近1小时', value: () => [new Date(Date.now() - 3600 * 1000), new Date()] },
  { text: '最近24小时', value: () => [new Date(Date.now() - 24 * 3600 * 1000), new Date()] },
  { text: '最近7天', value: () => [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()] }
]

const performanceData = reactive<PerformanceMetrics>({
  avgFCP: 0, avgLCP: 0, avgTTFB: 0, avgFID: 0, avgCLS: 0, avgLoadComplete: 0, sampleCount: 0
})

const trendMetric = ref('lcp')
const trendChartRef = ref<HTMLElement | null>(null)
const distributionChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null

const getTimeParams = () => {
  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    return { startTime: dateRange.value[0].getTime(), endTime: dateRange.value[1].getTime() }
  }
  return {}
}

const loadPerformanceMetrics = async () => {
  try {
    const res = await getPerformanceMetrics(getTimeParams())
    if (res.code === 200 && res.data) Object.assign(performanceData, res.data)
  } catch (error) { console.error('加载性能指标失败:', error) }
}

const loadPerformanceData = async () => {
  loading.value = true
  try {
    const params = { ...getTimeParams(), page: pageInfo.page, pageSize: pageInfo.pageSize, type: filterParams.type || undefined }
    const res = await getPerformanceList(params)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) { console.error('加载性能数据失败:', error) }
  finally { loading.value = false }
}

const loadTrendData = async () => {
  try {
    const timeParams = getTimeParams()
    const params = {
      startTime: timeParams.startTime || Date.now() - 24 * 60 * 60 * 1000,
      endTime: timeParams.endTime || Date.now(),
      groupBy: 'hour' as const,
      category: 'performance'
    }
    const res = await getTrend(params)
    if (res.code === 200 && res.data) updateTrendChart(res.data)
  } catch (error) { console.error('加载趋势数据失败:', error) }
}

const updateTrendChart = (data: any[]) => {
  if (!trendChartRef.value) return
  if (!trendChart) trendChart = markRaw(echarts.init(trendChartRef.value))

  const metricNames: Record<string, string> = { fcp: 'FCP', lcp: 'LCP', ttfb: 'TTFB' }
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(item => item.time), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: 'ms' },
    series: [{
      name: metricNames[trendMetric.value],
      type: 'line',
      smooth: true,
      data: data.map(item => item.count),
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(103,194,58,0.5)' }, { offset: 1, color: 'rgba(103,194,58,0.1)' }]) },
      lineStyle: { color: '#67c23a', width: 2 }
    }]
  }
  trendChart.setOption(option)
}

const updateDistributionChart = () => {
  if (!distributionChartRef.value) return
  if (!distributionChart) distributionChart = markRaw(echarts.init(distributionChartRef.value))

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['FCP', 'LCP', 'TTFB'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['优秀', '需改进', '较差'] },
    yAxis: { type: 'value', name: '占比(%)' },
    series: [
      { name: 'FCP', type: 'bar', data: [65, 25, 10], itemStyle: { color: '#67c23a' } },
      { name: 'LCP', type: 'bar', data: [55, 30, 15], itemStyle: { color: '#409eff' } },
      { name: 'TTFB', type: 'bar', data: [70, 20, 10], itemStyle: { color: '#e6a23c' } }
    ]
  }
  distributionChart.setOption(option)
}

const getScoreClass = (value: number, good: number, poor: number) => {
  if (value <= good) return 'good'
  if (value <= poor) return 'warning'
  return 'poor'
}
const getMetricColor = (value: number, good: number, poor: number) => {
  if (!value) return '#909399'
  if (value <= good) return '#67c23a'
  if (value <= poor) return '#e6a23c'
  return '#f56c6c'
}
const getTypeTagType = (type: string) => {
  const map: Record<string, string> = { performance: 'primary', resource_timing: 'success', long_task: 'warning' }
  return map[type] || 'info'
}
const getTypeName = (type: string) => {
  const map: Record<string, string> = { performance: '性能指标', resource_timing: '资源加载', long_task: '长任务', first_contentful_paint: 'FCP', largest_contentful_paint: 'LCP' }
  return map[type] || type
}
const getDataValue = (data: any, key: string) => {
  if (!data) return null
  const parsed = typeof data === 'string' ? JSON.parse(data) : data
  return parsed[key]
}
const formatTime = (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN')

const handleSearch = () => { pageInfo.page = 1; loadPerformanceData(); loadPerformanceMetrics(); loadTrendData() }
const handleReset = () => {
  filterParams.type = ''
  dateRange.value = [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()]
  handleSearch()
}
const handleSizeChange = (size: number) => { pageInfo.pageSize = size; loadPerformanceData() }
const handleCurrentChange = (page: number) => { pageInfo.page = page; loadPerformanceData() }

const handleResize = () => { trendChart?.resize(); distributionChart?.resize() }

onMounted(async () => {
  await Promise.all([loadPerformanceMetrics(), loadPerformanceData(), loadTrendData()])
  updateDistributionChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  distributionChart?.dispose()
})
</script>

<style lang="less" scoped>
.performance-monitor {
  .overview-cards { margin-bottom: 20px; }

  .perf-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px 15px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    border-left: 4px solid;

    &:hover { transform: translateY(-5px); box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15); }
    &.good { border-left-color: #67c23a; .perf-score { color: #67c23a; } }
    &.warning { border-left-color: #e6a23c; .perf-score { color: #e6a23c; } }
    &.poor { border-left-color: #f56c6c; .perf-score { color: #f56c6c; } }

    .perf-score { font-size: 28px; font-weight: bold; line-height: 1; }
    .perf-unit { font-size: 14px; color: #909399; margin-top: 4px; }
    .perf-label { font-size: 16px; font-weight: 600; color: #303133; margin-top: 10px; }
    .perf-desc { font-size: 12px; color: #909399; margin-top: 4px; }
  }

  .filter-card { margin-bottom: 20px; }
  .chart-section { margin-bottom: 20px; .card-header { display: flex; justify-content: space-between; align-items: center; } }

  .vitals-card {
    margin-bottom: 20px;
    .vital-item {
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      .vital-header { display: flex; align-items: center; margin-bottom: 15px; .vital-name { margin-left: 10px; font-weight: 600; font-size: 14px; } }
      .vital-thresholds {
        display: flex; gap: 10px; margin-bottom: 15px;
        .threshold { flex: 1; padding: 8px; border-radius: 4px; text-align: center;
          &.good { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
          &.warning { background: rgba(230, 162, 60, 0.1); color: #e6a23c; }
          &.poor { background: rgba(245, 108, 108, 0.1); color: #f56c6c; }
          .label { display: block; font-size: 12px; margin-bottom: 4px; }
          .value { font-weight: 600; }
        }
      }
      .vital-desc { font-size: 13px; color: #606266; line-height: 1.5; }
    }
  }

  .data-card {
    .card-header { display: flex; justify-content: space-between; align-items: center; .sample-count { font-size: 14px; color: #909399; } }
    .expand-content { padding: 20px; background: #f5f7fa; pre { background: #fff; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 200px; overflow: auto; } }
    .pagination { margin-top: 20px; justify-content: flex-end; }
  }
}
</style>
