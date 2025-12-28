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
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleShowReplay(row)">
              <el-icon><VideoPlay /></el-icon>回放
            </el-button>
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

    <!-- 行为回放对话框 -->
    <el-dialog
      v-model="replayDialogVisible"
      title="用户行为回放"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="replay-container" v-loading="replayLoading">
        <!-- 错误信息头部 -->
        <div class="replay-header" v-if="replayData?.error">
          <div class="error-info">
            <el-tag type="danger" size="large">
              <el-icon><WarningFilled /></el-icon>
              {{ getTypeName(replayData.error.type) }}
            </el-tag>
            <span class="error-msg">{{ getDataValue(replayData.error.data, 'message') }}</span>
          </div>
          <div class="error-meta">
            <span v-if="replayData.userInfo">
              <el-icon><User /></el-icon> {{ replayData.userInfo.name }}
            </span>
            <span>
              <el-icon><Clock /></el-icon> {{ formatTime(replayData.error.timestamp) }}
            </span>
          </div>
        </div>

        <!-- 播放控制栏 -->
        <div class="replay-controls" v-if="replayData?.behaviors?.length">
          <el-button-group>
            <el-button :type="isPlaying ? 'danger' : 'primary'" @click="togglePlay">
              <el-icon><component :is="isPlaying ? 'VideoPause' : 'VideoPlay'" /></el-icon>
              {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            <el-button @click="resetReplay">
              <el-icon><RefreshRight /></el-icon>重置
            </el-button>
          </el-button-group>
          <div class="speed-control">
            <span>播放速度:</span>
            <el-select v-model="playSpeed" size="small" style="width: 100px">
              <el-option label="0.5x" :value="2000" />
              <el-option label="1x" :value="1000" />
              <el-option label="2x" :value="500" />
              <el-option label="4x" :value="250" />
            </el-select>
          </div>
          <div class="progress-info">
            <span>{{ currentStep + 1 }} / {{ replayData.behaviors.length }}</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="replay-progress" v-if="replayData?.behaviors?.length">
          <el-slider
            v-model="currentStep"
            :max="replayData.behaviors.length - 1"
            :show-tooltip="false"
            @change="handleStepChange"
          />
          <div class="time-labels">
            <span>{{ formatRelativeTime(replayData.behaviors[0]?.timestamp, replayData.error?.timestamp) }}</span>
            <span class="error-marker">错误发生</span>
          </div>
        </div>

        <!-- 行为时间线 -->
        <div class="replay-timeline" v-if="replayData?.behaviors?.length">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in replayData.behaviors"
              :key="item.id"
              :color="index === currentStep ? '#409eff' : (index < currentStep ? '#67c23a' : '#e4e7ed')"
              :hollow="index > currentStep"
              :timestamp="formatRelativeTime(item.timestamp, replayData.error?.timestamp)"
              placement="top"
            >
              <div class="timeline-item" :class="{ active: index === currentStep, played: index < currentStep }">
                <div class="item-header">
                  <el-tag :type="getBehaviorTagType(item.type)" size="small">
                    {{ getBehaviorTypeName(item.type) }}
                  </el-tag>
                  <span class="item-page">{{ getPageName(item.page_url || '') }}</span>
                </div>
                <div class="item-content">{{ getBehaviorContent(item) }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <el-empty v-else-if="!replayLoading" description="该错误发生前10秒内无用户行为记录" />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <span class="tip" v-if="replayData?.timeRange">
            显示错误发生前 {{ replayData.timeRange.seconds }} 秒内的用户行为
          </span>
          <el-button @click="replayDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, markRaw, watch } from 'vue'
import * as echarts from 'echarts'
import { getErrorList, getErrorStats, getTrend, deleteMonitorData, getErrorBehaviorContext, type MonitorDataItem, type ErrorStats, type ErrorBehaviorContext } from '@/api/monitor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, VideoPause, RefreshRight, User, Clock } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<MonitorDataItem[]>([])
const total = ref(0)
const selectedRows = ref<MonitorDataItem[]>([])
const pageInfo = reactive({ page: 1, pageSize: 20 })
const filterParams = reactive({ type: '', keyword: '' })

// 行为回放相关
const replayDialogVisible = ref(false)
const replayLoading = ref(false)
const replayData = ref<ErrorBehaviorContext | null>(null)
const isPlaying = ref(false)
const currentStep = ref(0)
const playSpeed = ref(1000) // 播放速度，毫秒
let playTimer: number | null = null

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

// ==================== 行为回放相关方法 ====================

// 显示回放对话框
const handleShowReplay = async (row: MonitorDataItem) => {
  replayDialogVisible.value = true
  replayLoading.value = true
  currentStep.value = 0
  isPlaying.value = false

  try {
    const res = await getErrorBehaviorContext({ errorId: row.id, seconds: 10 })
    if (res.code === 200 && res.data) {
      replayData.value = res.data
    }
  } catch (error) {
    console.error('获取错误行为上下文失败:', error)
    ElMessage.error('获取行为回放数据失败')
  } finally {
    replayLoading.value = false
  }
}

// 切换播放/暂停
const togglePlay = () => {
  if (isPlaying.value) {
    stopPlay()
  } else {
    startPlay()
  }
}

// 开始播放
const startPlay = () => {
  if (!replayData.value?.behaviors?.length) return
  if (currentStep.value >= replayData.value.behaviors.length - 1) {
    currentStep.value = 0
  }
  isPlaying.value = true
  playNext()
}

// 播放下一步
const playNext = () => {
  if (!isPlaying.value || !replayData.value?.behaviors?.length) return

  if (currentStep.value < replayData.value.behaviors.length - 1) {
    playTimer = window.setTimeout(() => {
      currentStep.value++
      playNext()
    }, playSpeed.value)
  } else {
    isPlaying.value = false
  }
}

// 停止播放
const stopPlay = () => {
  isPlaying.value = false
  if (playTimer) {
    clearTimeout(playTimer)
    playTimer = null
  }
}

// 重置回放
const resetReplay = () => {
  stopPlay()
  currentStep.value = 0
}

// 手动调整进度
const handleStepChange = () => {
  stopPlay()
}

// 格式化相对时间（距错误发生的时间）
const formatRelativeTime = (timestamp: number | undefined, errorTimestamp: number | undefined) => {
  if (!timestamp || !errorTimestamp) return ''
  const diff = (timestamp - errorTimestamp) / 1000
  if (diff >= 0) return '错误发生时'
  return `${diff.toFixed(1)}秒`
}

// 获取行为类型标签样式
const getBehaviorTagType = (type: string) => {
  const map: Record<string, string> = {
    page_view: 'primary',
    page_leave: 'info',
    click: 'success',
    route_change: 'warning',
    custom_event: ''
  }
  return map[type] || 'info'
}

// 获取行为类型名称
const getBehaviorTypeName = (type: string) => {
  const map: Record<string, string> = {
    page_view: '页面访问',
    page_leave: '页面离开',
    click: '点击',
    route_change: '路由切换',
    custom_event: '自定义事件'
  }
  return map[type] || type
}

// 获取行为内容描述
const getBehaviorContent = (item: MonitorDataItem) => {
  const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data
  if (item.type === 'page_view') return item.page_title || '访问页面'
  if (item.type === 'click') return data?.target || data?.text || '点击元素'
  if (item.type === 'route_change') return `${data?.from || ''} → ${data?.to || ''}`
  if (item.type === 'page_leave') return `停留 ${data?.duration ? (data.duration / 1000).toFixed(1) + '秒' : '-'}`
  return item.page_title || '用户行为'
}

onMounted(async () => {
  await Promise.all([loadErrorStats(), loadErrorList(), loadTrendData()])
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  typeChart?.dispose()
  stopPlay() // 清理回放定时器
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
        background: var(--bg-base);
        color: var(--text-tertiary);
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        &.top { background: #f56c6c; color: #fff; }
      }
      .rank-page { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--text-secondary); }
      .rank-count { font-weight: bold; color: #f56c6c; }
    }
  }

  .data-card {
    .card-header { display: flex; justify-content: space-between; align-items: center; }

    .error-msg-cell {
      display: flex;
      align-items: flex-start;
      .error-icon { color: #f56c6c; margin-right: 8px; margin-top: 3px; flex-shrink: 0; }
      .error-text { color: var(--text-primary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    }

    .error-detail {
      padding: 20px;
      background: var(--bg-base);
      .error-message { color: #f56c6c; font-weight: 500; }
      .error-stack { background: var(--bg-container); padding: 15px; border-radius: 4px; font-size: 12px; max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-all; color: var(--el-color-danger); border-left: 3px solid var(--el-color-danger); }
      pre { background: var(--bg-container); padding: 10px; border-radius: 4px; font-size: 12px; max-height: 150px; overflow: auto; color: var(--text-primary); }
    }

    .pagination { margin-top: 20px; justify-content: flex-end; }
  }

  // 行为回放对话框样式
  .replay-container {
    min-height: 300px;

    .replay-header {
      background: var(--bg-base);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 4px solid #f56c6c;

      .error-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .error-msg {
          color: #c45656;
          font-weight: 500;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .error-meta {
        display: flex;
        gap: 20px;
        color: #909399;
        font-size: 13px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .replay-controls {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 16px;

      .speed-control {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #606266;
        font-size: 13px;
      }

      .progress-info {
        margin-left: auto;
        color: #409eff;
        font-weight: 500;
      }
    }

    .replay-progress {
      margin-bottom: 20px;
      padding: 0 8px;

      .time-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        color: #909399;

        .error-marker {
          color: #f56c6c;
          font-weight: 500;
        }
      }
    }

    .replay-timeline {
      max-height: 400px;
      overflow-y: auto;
      padding: 0 8px;

      .timeline-item {
        padding: 12px;
        border-radius: 8px;
        background: #fafafa;
        transition: all 0.3s;

        &.active {
          background: #ecf5ff;
          border: 1px solid #409eff;
          transform: scale(1.02);
        }

        &.played {
          background: #f0f9eb;
          border: 1px solid #67c23a;
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;

          .item-page {
            color: #909399;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .item-content {
          color: #606266;
          font-size: 13px;
          line-height: 1.5;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .tip {
      color: #909399;
      font-size: 12px;
    }
  }
}
</style>
