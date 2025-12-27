<template>
  <div class="errors-monitor">
    <!-- 错误统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="error-stat-card total">
          <el-icon :size="40"><WarningFilled /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ errorStats.total }}</div>
            <div class="stat-label">错误总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="error-stat-card js">
          <el-icon :size="40"><DocumentRemove /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ getTypeCount('js_error') }}</div>
            <div class="stat-label">JS错误</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="error-stat-card promise">
          <el-icon :size="40"><Warning /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ getTypeCount('promise_error') }}</div>
            <div class="stat-label">Promise错误</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="error-stat-card resource">
          <el-icon :size="40"><PictureFilled /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ getTypeCount('resource_error') }}</div>
            <div class="stat-label">资源错误</div>
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
        <el-col :span="4">
          <el-select v-model="filterParams.type" placeholder="错误类型" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="JS错误" value="js_error" />
            <el-option label="Promise错误" value="promise_error" />
            <el-option label="资源错误" value="resource_error" />
            <el-option label="HTTP错误" value="http_error" />
            <el-option label="Vue错误" value="vue_error" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input v-model="filterParams.keyword" placeholder="搜索错误信息" clearable @keyup.enter="handleSearch" />
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
          <template #header><span>错误趋势</span></template>
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header><span>错误类型分布</span></template>
          <div ref="typeChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header><span>错误页面 Top5</span></template>
          <div class="page-ranking">
            <div v-for="(item, index) in errorStats.byPage.slice(0, 5)" :key="index" class="rank-item">
              <span class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <span class="rank-page" :title="item.page">{{ getPageName(item.page) }}</span>
              <span class="rank-count">{{ item.count }}</span>
            </div>
            <el-empty v-if="errorStats.byPage.length === 0" description="暂无数据" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错误列表 -->
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <span>错误详情列表</span>
          <el-button type="danger" size="small" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="error-detail">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="错误类型">
                  <el-tag :type="getErrorTagType(row.type)" size="small">{{ getTypeName(row.type) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="发生时间">{{ formatTime(row.timestamp) }}</el-descriptions-item>
                <el-descriptions-item label="页面URL" :span="2">{{ row.page_url }}</el-descriptions-item>
                <el-descriptions-item label="错误信息" :span="2">
                  <div class="error-message">{{ getDataValue(row.data, 'message') }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="错误堆栈" :span="2">
                  <pre class="error-stack">{{ getDataValue(row.data, 'stack') || '无堆栈信息' }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="设备信息" :span="2">
                  <pre>{{ JSON.stringify(row.device_info, null, 2) }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="错误类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getErrorTagType(row.type)" size="small">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="错误信息" min-width="300">
          <template #default="{ row }">
            <div class="error-msg-cell">
              <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
              <span class="error-text">{{ getDataValue(row.data, 'message') || '未知错误' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="page_url" label="页面" width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ getPageName(row.page_url) }}</template>
        </el-table-column>
        <el-table-column label="发生次数" width="100" align="center">
          <template #default>
            <el-tag type="info" size="small">1</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
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
import { getErrorList, getErrorStats, getTrend, deleteMonitorData, type MonitorDataItem, type ErrorStats } from '@/api/monitor'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref<MonitorDataItem[]>([])
const total = ref(0)
const selectedRows = ref<MonitorDataItem[]>([])
const pageInfo = reactive({ page: 1, pageSize: 20 })
const filterParams = reactive({ type: '', keyword: '' })

const dateRange = ref<[Date, Date]>([new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()])

const shortcuts = [
  { text: '最近1小时', value: () => [new Date(Date.now() - 3600 * 1000), new Date()] },
  { text: '最近24小时', value: () => [new Date(Date.now() - 24 * 3600 * 1000), new Date()] },
  { text: '最近7天', value: () => [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()] }
]

const errorStats = reactive<ErrorStats>({ total: 0, byType: [], byPage: [] })

const trendChartRef = ref<HTMLElement | null>(null)
const typeChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

const getTimeParams = () => {
  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    return { startTime: dateRange.value[0].getTime(), endTime: dateRange.value[1].getTime() }
  }
  return {}
}

const loadErrorStats = async () => {
  try {
    const res = await getErrorStats(getTimeParams())
    if (res.code === 200 && res.data) {
      Object.assign(errorStats, res.data)
      updateTypeChart()
    }
  } catch (error) { console.error('加载错误统计失败:', error) }
}

const loadErrorList = async () => {
  loading.value = true
  try {
    const params = { ...getTimeParams(), page: pageInfo.page, pageSize: pageInfo.pageSize, type: filterParams.type || undefined }
    const res = await getErrorList(params)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) { console.error('加载错误列表失败:', error) }
  finally { loading.value = false }
}

const loadTrendData = async () => {
  try {
    const timeParams = getTimeParams()
    const params = {
      startTime: timeParams.startTime || Date.now() - 24 * 60 * 60 * 1000,
      endTime: timeParams.endTime || Date.now(),
      groupBy: 'hour' as const,
      category: 'error'
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
    yAxis: { type: 'value', name: '错误数' },
    series: [{
      name: '错误数',
      type: 'line',
      smooth: true,
      data: data.map(item => item.count),
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(245,108,108,0.5)' }, { offset: 1, color: 'rgba(245,108,108,0.1)' }]) },
      lineStyle: { color: '#f56c6c', width: 2 },
      itemStyle: { color: '#f56c6c' }
    }]
  }
  trendChart.setOption(option)
}

const updateTypeChart = () => {
  if (!typeChartRef.value) return
  if (!typeChart) typeChart = markRaw(echarts.init(typeChartRef.value))

  const typeNames: Record<string, string> = {
    js_error: 'JS错误', promise_error: 'Promise错误', resource_error: '资源错误',
    http_error: 'HTTP错误', vue_error: 'Vue错误', console_error: '控制台错误'
  }
  const typeColors: Record<string, string> = {
    js_error: '#f56c6c', promise_error: '#e6a23c', resource_error: '#909399',
    http_error: '#409eff', vue_error: '#67c23a', console_error: '#c45656'
  }

  const data = errorStats.byType.map(item => ({
    name: typeNames[item.type] || item.type,
    value: item.count,
    itemStyle: { color: typeColors[item.type] || '#909399' }
  }))

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '50%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
      data
    }]
  }
  typeChart.setOption(option)
}

const getTypeCount = (type: string) => errorStats.byType.find(item => item.type === type)?.count || 0
const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    js_error: 'JS错误', promise_error: 'Promise', resource_error: '资源错误',
    http_error: 'HTTP错误', vue_error: 'Vue错误', console_error: '控制台'
  }
  return map[type] || type
}
const getErrorTagType = (type: string) => {
  const map: Record<string, string> = {
    js_error: 'danger', promise_error: 'warning', resource_error: 'info',
    http_error: 'primary', vue_error: 'success'
  }
  return map[type] || 'info'
}
const getPageName = (url: string) => {
  if (!url) return '-'
  try {
    const urlObj = new URL(url)
    return urlObj.pathname || url
  } catch { return url }
}
const getDataValue = (data: any, key: string) => {
  if (!data) return null
  const parsed = typeof data === 'string' ? JSON.parse(data) : data
  return parsed[key]
}
const formatTime = (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN')

const handleSearch = () => { pageInfo.page = 1; loadErrorList(); loadErrorStats(); loadTrendData() }
const handleReset = () => {
  filterParams.type = ''
  filterParams.keyword = ''
  dateRange.value = [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()]
  handleSearch()
}
const handleSizeChange = (size: number) => { pageInfo.pageSize = size; loadErrorList() }
const handleCurrentChange = (page: number) => { pageInfo.page = page; loadErrorList() }
const handleSelectionChange = (rows: MonitorDataItem[]) => { selectedRows.value = rows }

const handleDelete = async (row: MonitorDataItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该错误记录吗?', '提示', { type: 'warning' })
    const res = await deleteMonitorData([row.id])
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadErrorList()
      loadErrorStats()
    }
  } catch {}
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗?`, '提示', { type: 'warning' })
    const ids = selectedRows.value.map(row => row.id)
    const res = await deleteMonitorData(ids)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadErrorList()
      loadErrorStats()
    }
  } catch {}
}

const handleResize = () => { trendChart?.resize(); typeChart?.resize() }

onMounted(async () => {
  await Promise.all([loadErrorStats(), loadErrorList(), loadTrendData()])
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  typeChart?.dispose()
})
</script>

<style lang="less" scoped>
.errors-monitor {
  .stats-row { margin-bottom: 20px; }

  .error-stat-card {
    display: flex;
    align-items: center;
    padding: 25px;
    border-radius: 12px;
    color: #fff;
    transition: all 0.3s;

    &:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    &.total { background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%); }
    &.js { background: linear-gradient(135deg, #e6a23c 0%, #cf9236 100%); }
    &.promise { background: linear-gradient(135deg, #409eff 0%, #337ecc 100%); }
    &.resource { background: linear-gradient(135deg, #909399 0%, #73767a 100%); }

    .el-icon { margin-right: 20px; }
    .stat-info {
      .stat-value { font-size: 32px; font-weight: bold; line-height: 1; }
      .stat-label { font-size: 14px; margin-top: 8px; opacity: 0.9; }
    }
  }

  .filter-card { margin-bottom: 20px; }
  .chart-section { margin-bottom: 20px; }

  .page-ranking {
    .rank-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child { border-bottom: none; }

      .rank-num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #f0f0f0;
        color: #909399;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        &.top { background: #f56c6c; color: #fff; }
      }
      .rank-page { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #606266; }
      .rank-count { font-weight: bold; color: #f56c6c; }
    }
  }

  .data-card {
    .card-header { display: flex; justify-content: space-between; align-items: center; }

    .error-msg-cell {
      display: flex;
      align-items: flex-start;
      .error-icon { color: #f56c6c; margin-right: 8px; margin-top: 3px; flex-shrink: 0; }
      .error-text { color: #303133; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    }

    .error-detail {
      padding: 20px;
      background: #fef0f0;
      .error-message { color: #f56c6c; font-weight: 500; }
      .error-stack { background: #fff; padding: 15px; border-radius: 4px; font-size: 12px; max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-all; color: #c45656; border-left: 3px solid #f56c6c; }
      pre { background: #fff; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 150px; overflow: auto; }
    }

    .pagination { margin-top: 20px; justify-content: flex-end; }
  }
}
</style>
