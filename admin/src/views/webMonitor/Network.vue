<template>
  <div class="network-monitor">
    <!-- 网络统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="network-stat-card total">
          <div class="stat-icon">
            <el-icon :size="36"><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(networkStats.total) }}</div>
            <div class="stat-label">请求总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="network-stat-card success">
          <div class="stat-icon">
            <el-icon :size="36"><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ networkStats.successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="network-stat-card time">
          <div class="stat-icon">
            <el-icon :size="36"><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ networkStats.avgDuration }}ms</div>
            <div class="stat-label">平均耗时</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="network-stat-card error">
          <div class="stat-icon">
            <el-icon :size="36"><CircleCloseFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ networkStats.errorCount }}</div>
            <div class="stat-label">失败请求</div>
          </div>
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
        <el-col :span="3">
          <el-select v-model="filterParams.method" placeholder="请求方法" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="filterParams.status" placeholder="状态码" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="2xx 成功" value="2xx" />
            <el-option label="3xx 重定向" value="3xx" />
            <el-option label="4xx 客户端错误" value="4xx" />
            <el-option label="5xx 服务端错误" value="5xx" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input v-model="filterParams.url" placeholder="搜索URL" clearable @keyup.enter="handleSearch" />
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
          <template #header><span>请求趋势</span></template>
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header><span>状态码分布</span></template>
          <div ref="statusChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header><span>耗时分布</span></template>
          <div ref="durationChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 慢请求排行 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="24">
        <el-card>
          <template #header><span>慢请求 Top10 (耗时 > 1s)</span></template>
          <div class="slow-requests">
            <div v-for="(item, index) in slowRequests" :key="index" class="slow-item">
              <span class="slow-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <span class="slow-method" :class="item.method?.toLowerCase()">{{ item.method }}</span>
              <span class="slow-url" :title="item.url">{{ item.url }}</span>
              <span class="slow-duration">{{ item.duration }}ms</span>
              <el-tag :type="getStatusType(item.status)" size="small">{{ item.status }}</el-tag>
            </div>
            <el-empty v-if="slowRequests.length === 0" description="暂无慢请求" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 请求列表 -->
    <el-card class="data-card">
      <template #header><span>网络请求详情</span></template>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="request-detail">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="请求方法">
                  <el-tag :type="getMethodType(getDataValue(row.data, 'method'))" size="small">
                    {{ getDataValue(row.data, 'method') }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="状态码">
                  <el-tag :type="getStatusType(getDataValue(row.data, 'status'))" size="small">
                    {{ getDataValue(row.data, 'status') }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="请求URL" :span="2">{{ getDataValue(row.data, 'url') }}</el-descriptions-item>
                <el-descriptions-item label="耗时">{{ getDataValue(row.data, 'duration') }}ms</el-descriptions-item>
                <el-descriptions-item label="发生时间">{{ formatTime(row.timestamp) }}</el-descriptions-item>
                <el-descriptions-item label="请求头" :span="2">
                  <pre>{{ JSON.stringify(getDataValue(row.data, 'requestHeaders'), null, 2) || '-' }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="请求体" :span="2">
                  <pre>{{ JSON.stringify(getDataValue(row.data, 'requestBody'), null, 2) || '-' }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="响应数据" :span="2">
                  <pre>{{ JSON.stringify(getDataValue(row.data, 'response'), null, 2) || '-' }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="方法" width="80">
          <template #default="{ row }">
            <el-tag :type="getMethodType(getDataValue(row.data, 'method'))" size="small">
              {{ getDataValue(row.data, 'method') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="URL" min-width="300">
          <template #default="{ row }">
            <div class="url-cell">
              <span class="url-text" :title="getDataValue(row.data, 'url')">{{ getDataValue(row.data, 'url') }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(getDataValue(row.data, 'status'))" size="small">
              {{ getDataValue(row.data, 'status') || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="100" align="center">
          <template #default="{ row }">
            <span :class="getDurationClass(getDataValue(row.data, 'duration'))">
              {{ getDataValue(row.data, 'duration') || '-' }}ms
            </span>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100" align="center">
          <template #default="{ row }">{{ formatSize(getDataValue(row.data, 'responseSize')) }}</template>
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
import { getNetworkList, getTrend, type MonitorDataItem } from '@/api/monitor'

const loading = ref(false)
const tableData = ref<MonitorDataItem[]>([])
const slowRequests = ref<any[]>([])
const total = ref(0)
const pageInfo = reactive({ page: 1, pageSize: 20 })
const filterParams = reactive({ method: '', status: '', url: '' })

const dateRange = ref<[Date, Date]>([new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()])

const shortcuts = [
  { text: '最近1小时', value: () => [new Date(Date.now() - 3600 * 1000), new Date()] },
  { text: '最近24小时', value: () => [new Date(Date.now() - 24 * 3600 * 1000), new Date()] },
  { text: '最近7天', value: () => [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()] }
]

const networkStats = reactive({ total: 0, successRate: 0, avgDuration: 0, errorCount: 0 })

const trendChartRef = ref<HTMLElement | null>(null)
const statusChartRef = ref<HTMLElement | null>(null)
const durationChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null
let durationChart: echarts.ECharts | null = null

const getTimeParams = () => {
  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    return { startTime: dateRange.value[0].getTime(), endTime: dateRange.value[1].getTime() }
  }
  return {}
}

const formatNumber = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num?.toLocaleString() || '0'
}

const formatSize = (bytes: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

const loadNetworkList = async () => {
  loading.value = true
  try {
    const params = { ...getTimeParams(), page: pageInfo.page, pageSize: pageInfo.pageSize }
    const res = await getNetworkList(params)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.list
      total.value = res.data.total
      calculateStats(res.data.list)
      updateSlowRequests(res.data.list)
    }
  } catch (error) { console.error('加载网络请求失败:', error) }
  finally { loading.value = false }
}

const calculateStats = (list: MonitorDataItem[]) => {
  if (list.length === 0) return
  let successCount = 0, totalDuration = 0
  list.forEach(item => {
    const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data
    const status = data?.status || 0
    if (status >= 200 && status < 400) successCount++
    totalDuration += data?.duration || 0
  })
  networkStats.total = total.value
  networkStats.successRate = Math.round((successCount / list.length) * 100)
  networkStats.avgDuration = Math.round(totalDuration / list.length)
  networkStats.errorCount = list.length - successCount
}

const updateSlowRequests = (list: MonitorDataItem[]) => {
  slowRequests.value = list
    .map(item => {
      const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data
      return { url: data?.url, method: data?.method, duration: data?.duration, status: data?.status }
    })
    .filter(item => item.duration > 1000)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)
}

const loadTrendData = async () => {
  try {
    const timeParams = getTimeParams()
    const params = {
      startTime: timeParams.startTime || Date.now() - 24 * 60 * 60 * 1000,
      endTime: timeParams.endTime || Date.now(),
      groupBy: 'hour' as const,
      category: 'network'
    }
    const res = await getTrend(params)
    if (res.code === 200 && res.data) updateTrendChart(res.data)
  } catch (error) { console.error('加载趋势数据失败:', error) }
}

const updateTrendChart = (data: any[]) => {
  if (!trendChartRef.value) return
  if (!trendChart) trendChart = markRaw(echarts.init(trendChartRef.value))

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(item => item.time), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '请求数' },
    series: [{
      name: '请求数',
      type: 'bar',
      data: data.map(item => item.count),
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#409eff' }, { offset: 1, color: '#67c23a' }]), borderRadius: [4, 4, 0, 0] }
    }]
  }
  trendChart.setOption(option)
}

const updateStatusChart = () => {
  if (!statusChartRef.value) return
  if (!statusChart) statusChart = markRaw(echarts.init(statusChartRef.value))

  const data = [
    { name: '2xx', value: 85, itemStyle: { color: '#67c23a' } },
    { name: '3xx', value: 5, itemStyle: { color: '#409eff' } },
    { name: '4xx', value: 7, itemStyle: { color: '#e6a23c' } },
    { name: '5xx', value: 3, itemStyle: { color: '#f56c6c' } }
  ]

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
      data
    }]
  }
  statusChart.setOption(option)
}

const updateDurationChart = () => {
  if (!durationChartRef.value) return
  if (!durationChart) durationChart = markRaw(echarts.init(durationChartRef.value))

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['<100ms', '100-500ms', '500ms-1s', '1s-3s', '>3s'] },
    yAxis: { type: 'value', name: '占比(%)' },
    series: [{
      type: 'bar',
      data: [45, 30, 15, 7, 3],
      itemStyle: { color: (params: any) => {
        const colors = ['#67c23a', '#95d475', '#e6a23c', '#f89898', '#f56c6c']
        return colors[params.dataIndex]
      }, borderRadius: [4, 4, 0, 0] }
    }]
  }
  durationChart.setOption(option)
}

const getDataValue = (data: any, key: string) => {
  if (!data) return null
  const parsed = typeof data === 'string' ? JSON.parse(data) : data
  return parsed[key]
}
const formatTime = (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN')
const getMethodType = (method: string) => {
  const map: Record<string, string> = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }
  return map[method] || 'info'
}
const getStatusType = (status: number) => {
  if (!status) return 'info'
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'primary'
  if (status >= 400 && status < 500) return 'warning'
  return 'danger'
}
const getDurationClass = (duration: number) => {
  if (!duration) return ''
  if (duration < 200) return 'duration-fast'
  if (duration < 1000) return 'duration-normal'
  return 'duration-slow'
}

const handleSearch = () => { pageInfo.page = 1; loadNetworkList(); loadTrendData() }
const handleReset = () => {
  filterParams.method = ''
  filterParams.status = ''
  filterParams.url = ''
  dateRange.value = [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()]
  handleSearch()
}
const handleSizeChange = (size: number) => { pageInfo.pageSize = size; loadNetworkList() }
const handleCurrentChange = (page: number) => { pageInfo.page = page; loadNetworkList() }

const handleResize = () => { trendChart?.resize(); statusChart?.resize(); durationChart?.resize() }

onMounted(async () => {
  await Promise.all([loadNetworkList(), loadTrendData()])
  updateStatusChart()
  updateDurationChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  statusChart?.dispose()
  durationChart?.dispose()
})
</script>

<style lang="less" scoped>
.network-monitor {
  .stats-row { margin-bottom: 20px; }

  .network-stat-card {
    display: flex;
    align-items: center;
    padding: 25px;
    border-radius: 12px;
    color: #fff;
    transition: all 0.3s;

    &:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    &.total { background: linear-gradient(135deg, #409eff 0%, #337ecc 100%); }
    &.success { background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%); }
    &.time { background: linear-gradient(135deg, #e6a23c 0%, #cf9236 100%); }
    &.error { background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%); }

    .stat-icon { margin-right: 20px; }
    .stat-info {
      .stat-value { font-size: 32px; font-weight: bold; line-height: 1; }
      .stat-label { font-size: 14px; margin-top: 8px; opacity: 0.9; }
    }
  }

  .filter-card { margin-bottom: 20px; }
  .chart-section { margin-bottom: 20px; }

  .slow-requests {
    .slow-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      gap: 15px;

      &:last-child { border-bottom: none; }

      .slow-rank {
        width: 24px; height: 24px; border-radius: 50%;
        background: #f0f0f0; color: #909399; font-size: 12px;
        display: flex; align-items: center; justify-content: center;
        &.top { background: #f56c6c; color: #fff; }
      }
      .slow-method {
        font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
        &.get { color: #67c23a; background: #f0f9eb; }
        &.post { color: #409eff; background: #ecf5ff; }
        &.put { color: #e6a23c; background: #fdf6ec; }
        &.delete { color: #f56c6c; background: #fef0f0; }
      }
      .slow-url { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #606266; }
      .slow-duration { font-weight: bold; color: #f56c6c; min-width: 80px; text-align: right; }
    }
  }

  .data-card {
    .url-cell {
      .url-text { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #409eff; }
    }
    .duration-fast { color: #67c23a; font-weight: 500; }
    .duration-normal { color: #e6a23c; font-weight: 500; }
    .duration-slow { color: #f56c6c; font-weight: 600; }
    .request-detail {
      padding: 20px;
      background: #f5f7fa;
      pre { background: #fff; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 200px; overflow: auto; }
    }
    .pagination { margin-top: 20px; justify-content: flex-end; }
  }
}
</style>
