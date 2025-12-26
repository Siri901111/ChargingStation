<template>
  <div class="behavior-monitor">
    <!-- 行为统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-statistic title="页面访问(PV)" :value="behaviorStats.pv || 0" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="独立访客(UV)" :value="behaviorStats.uv || 0" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="点击事件" :value="behaviorStats.clickCount || 0" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="路由切换" :value="behaviorStats.routeChangeCount || 0" />
      </el-col>
    </el-row>

    <!-- 页面排行和行为分布 -->
    <el-row :gutter="16" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>页面访问排行（Top 10）</template>
          <div ref="pageChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>行为类型分布</template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为列表 -->
    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>行为记录</span>
          <el-select v-model="filterType" placeholder="行为类型" clearable size="small" style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="页面访问" value="page_view" />
            <el-option label="页面离开" value="page_leave" />
            <el-option label="点击事件" value="click" />
            <el-option label="路由切换" value="route_change" />
            <el-option label="自定义事件" value="custom_event" />
          </el-select>
        </div>
      </template>

      <el-table :data="behaviorList" stripe v-loading="loading">
        <el-table-column prop="type" label="行为类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getBehaviorTagType(row.type)" size="small">
              {{ getBehaviorTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="页面" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.page_url?.split('?')[0] || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="详情" min-width="200">
          <template #default="{ row }">
            <span v-if="row.type === 'click'">
              {{ row.data?.tagName }} {{ row.data?.innerText?.slice(0, 20) }}
            </span>
            <span v-else-if="row.type === 'page_leave'">
              停留 {{ Math.round((row.data?.stayTime || 0) / 1000) }}s，滚动 {{ row.data?.scrollDepth }}%
            </span>
            <span v-else-if="row.type === 'route_change'">
              {{ row.data?.from }} → {{ row.data?.to }}
            </span>
            <span v-else-if="row.type === 'custom_event'">
              {{ row.data?.eventName }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="设备" width="100">
          <template #default="{ row }">
            {{ row.device_info?.device?.type || 'desktop' }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadBehaviorList"
        @current-change="loadBehaviorList"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getBehaviorList, getBehaviorStats, type MonitorDataItem, type BehaviorStats } from '@/api/monitor';
import dayjs from 'dayjs';

const props = defineProps<{
  dateRange: [Date, Date] | null;
}>();

const loading = ref(false);
const behaviorList = ref<MonitorDataItem[]>([]);
const behaviorStats = ref<Partial<BehaviorStats>>({});
const filterType = ref('');

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const pageChartRef = ref<HTMLElement | null>(null);
const typeChartRef = ref<HTMLElement | null>(null);
let pageChart: echarts.ECharts | null = null;
let typeChart: echarts.ECharts | null = null;

const getTimeParams = () => {
  if (props.dateRange) {
    return {
      startTime: props.dateRange[0].getTime(),
      endTime: props.dateRange[1].getTime(),
    };
  }
  return {};
};

const loadBehaviorList = async () => {
  loading.value = true;
  try {
    const res = await getBehaviorList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      type: filterType.value || undefined,
      ...getTimeParams(),
    });
    if (res.code === 200) {
      behaviorList.value = res.data.list;
      pagination.value.total = res.data.total;
    }
  } catch (error) {
    console.error('加载行为数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadBehaviorStats = async () => {
  try {
    const res = await getBehaviorStats(getTimeParams());
    if (res.code === 200) {
      behaviorStats.value = res.data;
      updateCharts();
    }
  } catch (error) {
    console.error('加载行为统计失败:', error);
  }
};

const updateCharts = () => {
  // 页面访问排行图
  if (pageChart && behaviorStats.value.topPages) {
    const pages = behaviorStats.value.topPages.slice(0, 10);
    pageChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: pages.map(p => p.page?.split('?')[0]?.slice(-30) || '未知').reverse(),
        axisLabel: { fontSize: 10 },
      },
      series: [{
        type: 'bar',
        data: pages.map(p => p.count).reverse(),
        itemStyle: { color: '#409eff' },
      }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    });
  }

  // 行为类型分布图
  if (typeChart) {
    const stats = behaviorStats.value;
    typeChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { name: '页面访问', value: stats.pv || 0 },
          { name: '点击事件', value: stats.clickCount || 0 },
          { name: '路由切换', value: stats.routeChangeCount || 0 },
        ],
      }],
    });
  }
};

const getBehaviorTypeName = (type: string) => {
  const names: Record<string, string> = {
    page_view: '页面访问',
    page_leave: '页面离开',
    click: '点击',
    route_change: '路由切换',
    custom_event: '自定义事件',
    behavior_stack: '行为栈',
  };
  return names[type] || type;
};

const getBehaviorTagType = (type: string) => {
  const types: Record<string, string> = {
    page_view: 'success',
    page_leave: 'info',
    click: 'primary',
    route_change: 'warning',
    custom_event: '',
  };
  return types[type] || 'info';
};

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

const initCharts = () => {
  nextTick(() => {
    if (pageChartRef.value) {
      pageChart = echarts.init(pageChartRef.value);
    }
    if (typeChartRef.value) {
      typeChart = echarts.init(typeChartRef.value);
    }
  });
};

watch(() => props.dateRange, () => {
  loadBehaviorList();
  loadBehaviorStats();
}, { deep: true });

watch(filterType, () => {
  pagination.value.page = 1;
  loadBehaviorList();
});

onMounted(() => {
  initCharts();
  loadBehaviorList();
  loadBehaviorStats();
});
</script>

<style scoped lang="less">
.behavior-monitor {
  .stat-row {
    margin-bottom: 16px;
  }

  .chart-container {
    height: 250px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
