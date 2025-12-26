<template>
  <div class="web-monitor">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>前端监控平台</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.total || 0 }}</div>
              <div class="stat-label">总上报数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon today">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.todayCount || 0 }}</div>
              <div class="stat-label">今日上报</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon error">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.errorCount || 0 }}</div>
              <div class="stat-label">错误数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pv">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.pv || 0 }}</div>
              <div class="stat-label">页面访问(PV)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon uv">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.uv || 0 }}</div>
              <div class="stat-label">独立访客(UV)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon perf">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ performanceMetrics.avgFCP || 0 }}ms</div>
              <div class="stat-label">平均FCP</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 子路由导航 -->
    <el-card class="sub-nav-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="概览" name="overview" />
        <el-tab-pane label="错误监控" name="errors" />
        <el-tab-pane label="性能监控" name="performance" />
        <el-tab-pane label="行为分析" name="behavior" />
        <el-tab-pane label="网络请求" name="network" />
      </el-tabs>

      <!-- 概览内容 -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span>上报趋势</span>
              </template>
              <div ref="trendChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span>数据类型分布</span>
              </template>
              <div ref="typeChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span>类别分布</span>
              </template>
              <div ref="categoryChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span>性能指标</span>
              </template>
              <div ref="performanceChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 错误监控内容 -->
      <div v-if="activeTab === 'errors'" class="tab-content">
        <ErrorMonitor :date-range="dateRange" />
      </div>

      <!-- 性能监控内容 -->
      <div v-if="activeTab === 'performance'" class="tab-content">
        <PerformanceMonitor :date-range="dateRange" />
      </div>

      <!-- 行为分析内容 -->
      <div v-if="activeTab === 'behavior'" class="tab-content">
        <BehaviorMonitor :date-range="dateRange" />
      </div>

      <!-- 网络请求内容 -->
      <div v-if="activeTab === 'network'" class="tab-content">
        <NetworkMonitor :date-range="dateRange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import {
  getOverview,
  getTrend,
  getPerformanceMetrics,
  type OverviewStats,
  type PerformanceMetrics
} from '@/api/monitor';
import ErrorMonitor from './components/ErrorMonitor.vue';
import PerformanceMonitor from './components/PerformanceMonitor.vue';
import BehaviorMonitor from './components/BehaviorMonitor.vue';
import NetworkMonitor from './components/NetworkMonitor.vue';

// 日期范围
const dateRange = ref<[Date, Date] | null>(null);
const activeTab = ref('overview');

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近1小时',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000);
      return [start, end];
    },
  },
  {
    text: '今天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return [start, end];
    },
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
];

// 数据
const overviewData = ref<Partial<OverviewStats>>({});
const performanceMetrics = ref<Partial<PerformanceMetrics>>({});

// 图表引用
const trendChartRef = ref<HTMLElement | null>(null);
const typeChartRef = ref<HTMLElement | null>(null);
const categoryChartRef = ref<HTMLElement | null>(null);
const performanceChartRef = ref<HTMLElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let typeChart: echarts.ECharts | null = null;
let categoryChart: echarts.ECharts | null = null;
let performanceChart: echarts.ECharts | null = null;

// 初始化日期范围（默认最近24小时）
const initDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 3600 * 1000 * 24);
  dateRange.value = [start, end];
};

// 获取时间戳参数
const getTimeParams = () => {
  if (dateRange.value) {
    return {
      startTime: dateRange.value[0].getTime(),
      endTime: dateRange.value[1].getTime(),
    };
  }
  return {};
};

// 加载概览数据
const loadOverviewData = async () => {
  try {
    const res = await getOverview(getTimeParams());
    if (res.code === 200) {
      overviewData.value = res.data;
      updateCharts();
    }
  } catch (error) {
    console.error('加载概览数据失败:', error);
  }
};

// 加载性能指标
const loadPerformanceMetrics = async () => {
  try {
    const res = await getPerformanceMetrics(getTimeParams());
    if (res.code === 200) {
      performanceMetrics.value = res.data;
      updatePerformanceChart();
    }
  } catch (error) {
    console.error('加载性能指标失败:', error);
  }
};

// 加载趋势数据
const loadTrendData = async () => {
  if (!dateRange.value) return;

  try {
    const res = await getTrend({
      ...getTimeParams(),
      groupBy: 'hour',
    } as any);
    if (res.code === 200) {
      updateTrendChart(res.data);
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error);
  }
};

// 更新趋势图表
const updateTrendChart = (data: any[]) => {
  if (!trendChart) return;

  const times = data.map(item => item.time);
  const counts = data.map(item => item.count);

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [{
      name: '上报数量',
      type: 'line',
      smooth: true,
      data: counts,
      areaStyle: {
        opacity: 0.3,
      },
      itemStyle: {
        color: '#409eff',
      },
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
  });
};

// 更新图表
const updateCharts = () => {
  if (!overviewData.value) return;

  // 类型分布图
  if (typeChart && overviewData.value.typeStats) {
    typeChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
        },
        data: overviewData.value.typeStats.map(item => ({
          name: item.type,
          value: item.count,
        })),
      }],
    });
  }

  // 类别分布图
  if (categoryChart && overviewData.value.categoryStats) {
    const categories = Object.keys(overviewData.value.categoryStats);
    const values = Object.values(overviewData.value.categoryStats);
    const categoryNames: Record<string, string> = {
      error: '错误',
      performance: '性能',
      behavior: '行为',
      network: '网络',
      session: '会话',
    };

    categoryChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: categories.map(c => categoryNames[c] || c),
      },
      yAxis: {
        type: 'value',
      },
      series: [{
        type: 'bar',
        data: values,
        itemStyle: {
          color: (params: any) => {
            const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399'];
            return colors[params.dataIndex % colors.length];
          },
        },
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
    });
  }
};

// 更新性能图表
const updatePerformanceChart = () => {
  if (!performanceChart || !performanceMetrics.value) return;

  const metrics = performanceMetrics.value;
  performanceChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: ['FCP', 'LCP', 'TTFB', 'FID', '完全加载'],
    },
    yAxis: {
      type: 'value',
      name: '毫秒(ms)',
    },
    series: [{
      type: 'bar',
      data: [
        { value: metrics.avgFCP || 0, itemStyle: { color: '#67c23a' } },
        { value: metrics.avgLCP || 0, itemStyle: { color: '#e6a23c' } },
        { value: metrics.avgTTFB || 0, itemStyle: { color: '#409eff' } },
        { value: metrics.avgFID || 0, itemStyle: { color: '#f56c6c' } },
        { value: metrics.avgLoadComplete || 0, itemStyle: { color: '#909399' } },
      ],
      label: {
        show: true,
        position: 'top',
        formatter: '{c}ms',
      },
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
  });
};

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value);
    }
    if (typeChartRef.value) {
      typeChart = echarts.init(typeChartRef.value);
    }
    if (categoryChartRef.value) {
      categoryChart = echarts.init(categoryChartRef.value);
    }
    if (performanceChartRef.value) {
      performanceChart = echarts.init(performanceChartRef.value);
    }
  });
};

// 刷新数据
const refreshData = () => {
  loadOverviewData();
  loadPerformanceMetrics();
  loadTrendData();
};

// 日期变化处理
const handleDateChange = () => {
  refreshData();
};

// Tab切换处理
const handleTabChange = (tab: string) => {
  if (tab === 'overview') {
    nextTick(() => {
      initCharts();
      refreshData();
    });
  }
};

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize();
  typeChart?.resize();
  categoryChart?.resize();
  performanceChart?.resize();
};

onMounted(() => {
  initDateRange();
  initCharts();
  refreshData();
  window.addEventListener('resize', handleResize);
});
</script>

<style scoped lang="less">
.web-monitor {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          &.today {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
          }
          &.error {
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            color: white;
          }
          &.pv {
            background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
            color: white;
          }
          &.uv {
            background: linear-gradient(135deg, #cc2b5e 0%, #753a88 100%);
            color: white;
          }
          &.perf {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .sub-nav-card {
    .tab-content {
      padding: 16px 0;
    }

    .chart-card {
      height: 350px;

      .chart-container {
        height: 280px;
      }
    }
  }
}
</style>
