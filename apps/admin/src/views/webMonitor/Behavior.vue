<template>
  <div class="behavior-monitor">
    <!-- 行为统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="behavior-stat-card pv">
          <div class="stat-icon">
            <el-icon :size="36"><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(behaviorStats.pv) }}</div>
            <div class="stat-label">页面访问量 (PV)</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="behavior-stat-card uv">
          <div class="stat-icon">
            <el-icon :size="36"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(behaviorStats.uv) }}</div>
            <div class="stat-label">独立访客 (UV)</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="behavior-stat-card click">
          <div class="stat-icon">
            <el-icon :size="36"><Pointer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(behaviorStats.clickCount) }}</div>
            <div class="stat-label">点击事件</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="behavior-stat-card route">
          <div class="stat-icon">
            <el-icon :size="36"><Switch /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(behaviorStats.routeChangeCount) }}</div>
            <div class="stat-label">路由切换</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="6">
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
          <el-select v-model="filterParams.type" placeholder="行为类型" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="页面访问" value="page_view" />
            <el-option label="页面离开" value="page_leave" />
            <el-option label="点击事件" value="click" />
            <el-option label="路由切换" value="route_change" />
            <el-option label="自定义事件" value="custom_event" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-input
            v-model="filterParams.userName"
            placeholder="输入用户名搜索追踪"
            clearable
            @keyup.enter="handleUserTracking"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button type="success" @click="handleUserTracking" :loading="trackingLoading" :disabled="!filterParams.userName">
            <el-icon><Aim /></el-icon>追踪用户
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户追踪结果面板 -->
    <el-card v-if="isTrackingMode && trackingResult" class="tracking-card">
      <template #header>
        <div class="tracking-header">
          <span class="tracking-title">
            <el-icon><Aim /></el-icon>
            用户追踪: {{ trackingResult.userInfo?.name || filterParams.userName }}
          </span>
          <el-button type="danger" size="small" @click="exitTrackingMode">
            <el-icon><Close /></el-icon>退出追踪
          </el-button>
        </div>
      </template>

      <div v-if="trackingResult.userInfo" class="tracking-content">
        <!-- 用户信息 -->
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="tracking-stat-card">
              <div class="stat-label">用户名</div>
              <div class="stat-value user-name">{{ trackingResult.userInfo.name }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="tracking-stat-card">
              <div class="stat-label">总行为数</div>
              <div class="stat-value">{{ trackingResult.stats?.totalBehaviors || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="tracking-stat-card">
              <div class="stat-label">首次访问</div>
              <div class="stat-value time">{{ formatTime(trackingResult.stats?.firstVisit) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="tracking-stat-card">
              <div class="stat-label">最后访问</div>
              <div class="stat-value time">{{ formatTime(trackingResult.stats?.lastVisit) }}</div>
            </div>
          </el-col>
        </el-row>

        <!-- 行为类型分布 -->
        <el-row :gutter="20" class="tracking-charts">
          <el-col :span="12">
            <div class="chart-section">
              <div class="section-title">行为类型分布</div>
              <div class="behavior-type-list">
                <div v-for="item in trackingResult.stats?.behaviorTypes || []" :key="item.type" class="type-item">
                  <el-tag :type="getBehaviorTagType(item.type)" size="small">{{ getTypeName(item.type) }}</el-tag>
                  <el-progress
                    :percentage="getPercentage(item.count, trackingResult.stats?.totalBehaviors || 1)"
                    :color="getBehaviorColor(item.type)"
                    :stroke-width="12"
                  />
                  <span class="count">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-section">
              <div class="section-title">常访问页面 Top5</div>
              <div class="top-pages-list">
                <div v-for="(item, index) in (trackingResult.stats?.topPages || []).slice(0, 5)" :key="item.page" class="page-item">
                  <span class="rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
                  <span class="page-name">{{ getPageName(item.page) }}</span>
                  <span class="count">{{ item.count }}次</span>
                </div>
                <el-empty v-if="!trackingResult.stats?.topPages?.length" description="暂无访问记录" :image-size="60" />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-empty v-else description="未找到该用户的行为记录" :image-size="100" />
    </el-card>

    <!-- 图表区域（非追踪模式显示） -->
    <el-row v-if="!isTrackingMode" :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card>
          <template #header><span>访问趋势 (PV/UV)</span></template>
          <div ref="trendChartRef" style="height: 320px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>热门页面 Top10</span></template>
          <div ref="pageChartRef" style="height: 320px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为类型分布（非追踪模式显示） -->
    <el-row v-if="!isTrackingMode" :gutter="20" class="chart-section">
      <el-col :span="8">
        <el-card>
          <template #header><span>行为类型分布</span></template>
          <div ref="typeChartRef" style="height: 280px;"></div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header><span>用户行为路径</span></template>
          <div class="behavior-path">
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in behaviorPath.slice(0, 8)"
                :key="index"
                :color="getBehaviorColor(item.type)"
                :timestamp="formatTime(item.timestamp)"
                placement="top"
              >
                <div class="path-item">
                  <el-tag :type="getBehaviorTagType(item.type)" size="small">{{ getTypeName(item.type) }}</el-tag>
                  <span class="path-content">{{ getPathContent(item) }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-if="behaviorPath.length === 0" description="暂无行为数据" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为数据列表 -->
    <el-card class="data-card">
      <template #header>
        <span>{{ isTrackingMode ? `${trackingResult?.userInfo?.name || '用户'} 的行为数据详情` : '行为数据详情' }}</span>
      </template>
      <el-table :data="tableData" v-loading="loading || trackingLoading" stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="行为类型">
                  <el-tag :type="getBehaviorTagType(row.type)" size="small">{{ getTypeName(row.type) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="发生时间">{{ formatTime(row.timestamp) }}</el-descriptions-item>
                <el-descriptions-item label="页面URL" :span="2">{{ row.page_url }}</el-descriptions-item>
                <el-descriptions-item label="页面标题" :span="2">{{ row.page_title }}</el-descriptions-item>
                <el-descriptions-item label="用户ID">{{ row.user_id || '-' }}</el-descriptions-item>
                <el-descriptions-item label="会话信息">{{ row.session_info?.sessionId || '-' }}</el-descriptions-item>
                <el-descriptions-item label="行为数据" :span="2">
                  <pre>{{ JSON.stringify(row.data, null, 2) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="设备信息" :span="2">
                  <pre>{{ JSON.stringify(row.device_info, null, 2) }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="行为类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getBehaviorTagType(row.type)" size="small">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="行为内容" min-width="250">
          <template #default="{ row }">
            <div class="behavior-content">
              <el-icon :color="getBehaviorColor(row.type)"><component :is="getBehaviorIcon(row.type)" /></el-icon>
              <span>{{ getPathContent(row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="page_url" label="页面" width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ getPageName(row.page_url) }}</template>
        </el-table-column>
        <el-table-column prop="user_id" label="用户" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.user_name"
              size="small"
              type="info"
              class="clickable-user"
              @click="handleTrackUser(row.user_name)"
            >
              {{ row.user_name }}
            </el-tag>
            <span v-else class="text-gray">匿名</span>
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
import { getBehaviorList, getBehaviorStats, getTrend, getUserTracking, type MonitorDataItem, type BehaviorStats, type UserTrackingResult } from '@/api/monitor'
import { View, User, Pointer, Switch, Position, Link, Search, Aim, Close } from '@element-plus/icons-vue'

const loading = ref(false)
const trackingLoading = ref(false)
const isTrackingMode = ref(false)
const trackingResult = ref<UserTrackingResult | null>(null)
const tableData = ref<MonitorDataItem[]>([])
const behaviorPath = ref<MonitorDataItem[]>([])
const total = ref(0)
const pageInfo = reactive({ page: 1, pageSize: 20 })
const filterParams = reactive({ type: '', userName: '' })

const dateRange = ref<[Date, Date]>([new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()])

const shortcuts = [
  { text: '最近1小时', value: () => [new Date(Date.now() - 3600 * 1000), new Date()] },
  { text: '最近24小时', value: () => [new Date(Date.now() - 24 * 3600 * 1000), new Date()] },
  { text: '最近7天', value: () => [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()] }
]

const behaviorStats = reactive<BehaviorStats>({ pv: 0, uv: 0, clickCount: 0, routeChangeCount: 0, topPages: [] })

const trendChartRef = ref<HTMLElement | null>(null)
const pageChartRef = ref<HTMLElement | null>(null)
const typeChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let pageChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

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

const loadBehaviorStats = async () => {
  try {
    const res = await getBehaviorStats(getTimeParams())
    if (res.code === 200 && res.data) {
      Object.assign(behaviorStats, res.data)
      updatePageChart()
      updateTypeChart()
    }
  } catch (error) { console.error('加载行为统计失败:', error) }
}

const loadBehaviorList = async () => {
  loading.value = true
  try {
    const params = { ...getTimeParams(), page: pageInfo.page, pageSize: pageInfo.pageSize, type: filterParams.type || undefined }
    const res = await getBehaviorList(params)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.list
      total.value = res.data.total
      behaviorPath.value = res.data.list.slice(0, 10)
    }
  } catch (error) { console.error('加载行为列表失败:', error) }
  finally { loading.value = false }
}

const loadTrendData = async () => {
  try {
    const timeParams = getTimeParams()
    const params = {
      startTime: timeParams.startTime || Date.now() - 24 * 60 * 60 * 1000,
      endTime: timeParams.endTime || Date.now(),
      groupBy: 'hour' as const,
      category: 'behavior'
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
    legend: { data: ['PV', 'UV'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(item => item.time), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [
      { name: 'PV', type: 'line', smooth: true, data: data.map(item => item.count), areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.5)' }, { offset: 1, color: 'rgba(64,158,255,0.1)' }]) }, lineStyle: { color: '#409eff' } },
      { name: 'UV', type: 'line', smooth: true, data: data.map(item => Math.floor(item.count * 0.3)), areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(103,194,58,0.5)' }, { offset: 1, color: 'rgba(103,194,58,0.1)' }]) }, lineStyle: { color: '#67c23a' } }
    ]
  }
  trendChart.setOption(option)
}

const updatePageChart = () => {
  if (!pageChartRef.value) return
  if (!pageChart) pageChart = markRaw(echarts.init(pageChartRef.value))

  const data = behaviorStats.topPages.slice(0, 10)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '15%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.map(item => getPageName(item.page)).reverse() },
    series: [{
      type: 'bar',
      data: data.map(item => item.count).reverse(),
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#409eff' }, { offset: 1, color: '#67c23a' }]), borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: '{c}' }
    }]
  }
  pageChart.setOption(option)
}

const updateTypeChart = () => {
  if (!typeChartRef.value) return
  if (!typeChart) typeChart = markRaw(echarts.init(typeChartRef.value))

  const data = [
    { name: '页面访问', value: behaviorStats.pv, itemStyle: { color: '#409eff' } },
    { name: '点击事件', value: behaviorStats.clickCount, itemStyle: { color: '#67c23a' } },
    { name: '路由切换', value: behaviorStats.routeChangeCount, itemStyle: { color: '#e6a23c' } }
  ]

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data
    }]
  }
  typeChart.setOption(option)
}

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    page_view: '页面访问', page_leave: '页面离开', click: '点击',
    route_change: '路由切换', custom_event: '自定义事件', behavior_stack: '行为堆栈'
  }
  return map[type] || type
}
const getBehaviorTagType = (type: string) => {
  const map: Record<string, string> = {
    page_view: 'primary', page_leave: 'info', click: 'success',
    route_change: 'warning', custom_event: ''
  }
  return map[type] || 'info'
}
const getBehaviorColor = (type: string) => {
  const map: Record<string, string> = {
    page_view: '#409eff', page_leave: '#909399', click: '#67c23a',
    route_change: '#e6a23c', custom_event: '#f56c6c'
  }
  return map[type] || '#909399'
}
const getBehaviorIcon = (type: string) => {
  const map: Record<string, any> = {
    page_view: View, page_leave: Position, click: Pointer,
    route_change: Switch, custom_event: Link
  }
  return map[type] || View
}
const getPageName = (url: string) => {
  if (!url) return '-'
  try { return new URL(url).pathname || url } catch { return url }
}
const getPathContent = (item: MonitorDataItem) => {
  const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data
  if (item.type === 'page_view') return item.page_title || item.page_url || '访问页面'
  if (item.type === 'click') return data?.target || data?.text || '点击元素'
  if (item.type === 'route_change') return `${data?.from || ''} → ${data?.to || ''}`
  return item.page_title || '用户行为'
}
const formatTime = (timestamp: number | null | undefined) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 计算百分比
const getPercentage = (count: number, total: number) => {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

// 用户追踪相关方法
const handleUserTracking = async () => {
  if (!filterParams.userName.trim()) return

  trackingLoading.value = true
  isTrackingMode.value = true

  try {
    const params = {
      userName: filterParams.userName.trim(),
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
      ...getTimeParams()
    }
    const res = await getUserTracking(params)
    if (res.code === 200 && res.data) {
      trackingResult.value = res.data
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('用户追踪失败:', error)
  } finally {
    trackingLoading.value = false
  }
}

// 退出追踪模式
const exitTrackingMode = () => {
  isTrackingMode.value = false
  trackingResult.value = null
  filterParams.userName = ''
  handleSearch()
}

// 点击用户名追踪
const handleTrackUser = (userName: string) => {
  filterParams.userName = userName
  handleUserTracking()
}

const handleSearch = () => {
  if (isTrackingMode.value && filterParams.userName) {
    pageInfo.page = 1
    handleUserTracking()
  } else {
    isTrackingMode.value = false
    trackingResult.value = null
    pageInfo.page = 1
    loadBehaviorList()
    loadBehaviorStats()
    loadTrendData()
  }
}
const handleReset = () => {
  filterParams.type = ''
  filterParams.userName = ''
  isTrackingMode.value = false
  trackingResult.value = null
  dateRange.value = [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()]
  pageInfo.page = 1
  loadBehaviorList()
  loadBehaviorStats()
  loadTrendData()
}
const handleSizeChange = (size: number) => {
  pageInfo.pageSize = size
  if (isTrackingMode.value) {
    handleUserTracking()
  } else {
    loadBehaviorList()
  }
}
const handleCurrentChange = (page: number) => {
  pageInfo.page = page
  if (isTrackingMode.value) {
    handleUserTracking()
  } else {
    loadBehaviorList()
  }
}

const handleResize = () => { trendChart?.resize(); pageChart?.resize(); typeChart?.resize() }

onMounted(async () => {
  await Promise.all([loadBehaviorStats(), loadBehaviorList(), loadTrendData()])
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pageChart?.dispose()
  typeChart?.dispose()
})
</script>

<style lang="less" scoped>
.behavior-monitor {
  .stats-row { margin-bottom: 20px; }

  .behavior-stat-card {
    display: flex;
    align-items: center;
    padding: 25px;
    border-radius: 12px;
    color: #fff;
    transition: all 0.3s;

    &:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    &.pv { background: linear-gradient(135deg, #409eff 0%, #337ecc 100%); }
    &.uv { background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%); }
    &.click { background: linear-gradient(135deg, #e6a23c 0%, #cf9236 100%); }
    &.route { background: linear-gradient(135deg, #909399 0%, #73767a 100%); }

    .stat-icon { margin-right: 20px; }
    .stat-info {
      .stat-value { font-size: 32px; font-weight: bold; line-height: 1; }
      .stat-label { font-size: 14px; margin-top: 8px; opacity: 0.9; }
    }
  }

  .filter-card { margin-bottom: 20px; }
  .chart-section { margin-bottom: 20px; }

  // 用户追踪面板样式
  .tracking-card {
    margin-bottom: 20px;
    border: 2px solid #67c23a;

    .tracking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .tracking-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: bold;
        color: #67c23a;
      }
    }

    .tracking-content {
      .tracking-stat-card {
        background: #f0f2f5;
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 16px;

        .stat-label {
          color: #909399;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #303133;

          &.user-name { color: #67c23a; }
          &.time { font-size: 14px; }
        }
      }

      .tracking-charts {
        margin-top: 16px;

        .chart-section {
          background: #f9fafc;
          padding: 16px;
          border-radius: 8px;

          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ebeef5;
          }

          .behavior-type-list {
            .type-item {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;

              .el-tag { min-width: 70px; text-align: center; }
              .el-progress { flex: 1; }
              .count { min-width: 40px; text-align: right; color: #606266; font-weight: bold; }
            }
          }

          .top-pages-list {
            .page-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 0;
              border-bottom: 1px solid #ebeef5;

              &:last-child { border-bottom: none; }

              .rank {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #909399;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;

                &.top3 { background: linear-gradient(135deg, #f39c12, #e74c3c); }
              }
              .page-name {
                flex: 1;
                color: #606266;
                font-size: 13px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .count {
                color: #409eff;
                font-weight: bold;
              }
            }
          }
        }
      }
    }
  }

  .behavior-path {
    max-height: 320px;
    overflow-y: auto;
    .path-item {
      display: flex;
      align-items: center;
      gap: 10px;
      .path-content { color: #606266; font-size: 13px; }
    }
  }

  .data-card {
    .behavior-content {
      display: flex;
      align-items: center;
      gap: 8px;
      span { color: #606266; }
    }
    .expand-content {
      padding: 20px;
      background: #f0f2f5;
      pre { background: #ffffff; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 200px; overflow: auto; }
    }
    .text-gray { color: #909399; }
    .clickable-user {
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        background: #67c23a;
        color: #fff;
        border-color: #67c23a;
      }
    }
    .pagination { margin-top: 20px; justify-content: flex-end; }
  }
}
</style>
