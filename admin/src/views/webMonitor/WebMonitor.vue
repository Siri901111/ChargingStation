<template>
  <div class="p-6 space-y-6">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">前端监控平台</h2>
      <div class="flex gap-3">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
        <Button @click="refreshData" class="gap-2">
          <RefreshCw class="h-4 w-4" />
          刷新
        </Button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-6 gap-4">
      <Card class="hover:shadow-lg transition-shadow">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BarChart3 class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ overviewData.total || 0 }}</div>
              <div class="text-sm text-gray-500">总上报数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-lg transition-shadow">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Calendar class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ overviewData.todayCount || 0 }}</div>
              <div class="text-sm text-gray-500">今日上报</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-lg transition-shadow">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <AlertTriangle class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ overviewData.errorCount || 0 }}</div>
              <div class="text-sm text-gray-500">错误数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-lg transition-shadow">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Eye class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ overviewData.pv || 0 }}</div>
              <div class="text-sm text-gray-500">页面访问(PV)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-lg transition-shadow">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Users class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ overviewData.uv || 0 }}</div>
              <div class="text-sm text-gray-500">独立访客(UV)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-lg transition-shadow">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Clock class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ performanceMetrics.avgFCP || 0 }}ms</div>
              <div class="text-sm text-gray-500">平均FCP</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 子路由导航 -->
    <Card>
      <CardContent class="pt-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="errors">错误监控</TabsTrigger>
            <TabsTrigger value="performance">性能监控</TabsTrigger>
            <TabsTrigger value="behavior">行为分析</TabsTrigger>
            <TabsTrigger value="network">网络请求</TabsTrigger>
          </TabsList>

          <!-- 概览内容 -->
          <TabsContent value="overview" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle class="text-base">上报趋势</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref="trendChartRef" class="h-[280px]"></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle class="text-base">数据类型分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref="typeChartRef" class="h-[280px]"></div>
                </CardContent>
              </Card>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle class="text-base">类别分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref="categoryChartRef" class="h-[280px]"></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle class="text-base">性能指标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref="performanceChartRef" class="h-[280px]"></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <!-- 错误监控内容 -->
          <TabsContent value="errors">
            <ErrorMonitor :date-range="dateRange" />
          </TabsContent>

          <!-- 性能监控内容 -->
          <TabsContent value="performance">
            <PerformanceMonitor :date-range="dateRange" />
          </TabsContent>

          <!-- 行为分析内容 -->
          <TabsContent value="behavior">
            <BehaviorMonitor :date-range="dateRange" />
          </TabsContent>

          <!-- 网络请求内容 -->
          <TabsContent value="network">
            <NetworkMonitor :date-range="dateRange" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
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

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// lucide icons
import { RefreshCw, BarChart3, Calendar, AlertTriangle, Eye, Users, Clock } from 'lucide-vue-next';

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
        color: '#3b82f6',
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
            const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#6b7280'];
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
        { value: metrics.avgFCP || 0, itemStyle: { color: '#22c55e' } },
        { value: metrics.avgLCP || 0, itemStyle: { color: '#f59e0b' } },
        { value: metrics.avgTTFB || 0, itemStyle: { color: '#3b82f6' } },
        { value: metrics.avgFID || 0, itemStyle: { color: '#ef4444' } },
        { value: metrics.avgLoadComplete || 0, itemStyle: { color: '#6b7280' } },
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
watch(activeTab, (tab) => {
  if (tab === 'overview') {
    nextTick(() => {
      initCharts();
      refreshData();
    });
  }
});

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
