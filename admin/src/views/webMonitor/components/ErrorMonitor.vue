<template>
  <div class="error-monitor">
    <!-- 错误统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-statistic title="错误总数" :value="errorStats.total || 0" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="JS错误" :value="getTypeCount('js_error')" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="Promise错误" :value="getTypeCount('promise_error')" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="资源错误" :value="getTypeCount('resource_error')" />
      </el-col>
    </el-row>

    <!-- 错误分布图表 -->
    <el-row :gutter="16" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>按错误类型分布</template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>按页面分布（Top 10）</template>
          <div ref="pageChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错误列表 -->
    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>错误列表</span>
          <el-select v-model="filterType" placeholder="错误类型" clearable size="small" style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="JS错误" value="js_error" />
            <el-option label="Promise错误" value="promise_error" />
            <el-option label="资源错误" value="resource_error" />
            <el-option label="HTTP错误" value="http_error" />
            <el-option label="Vue错误" value="vue_error" />
          </el-select>
        </div>
      </template>

      <el-table :data="errorList" stripe v-loading="loading">
        <el-table-column prop="type" label="错误类型" width="130">
          <template #default="{ row }">
            <el-tag :type="getErrorTagType(row.type)" size="small">
              {{ getErrorTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="错误信息" min-width="300">
          <template #default="{ row }">
            <div class="error-message">
              {{ row.data?.message || row.data?.resourceUrl || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="page_url" label="页面" width="200" show-overflow-tooltip />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadErrorList"
        @current-change="loadErrorList"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="错误详情" width="700px">
      <el-descriptions :column="2" border v-if="currentError">
        <el-descriptions-item label="错误类型">
          {{ getErrorTypeName(currentError.type) }}
        </el-descriptions-item>
        <el-descriptions-item label="发生时间">
          {{ formatTime(currentError.timestamp) }}
        </el-descriptions-item>
        <el-descriptions-item label="页面URL" :span="2">
          {{ currentError.page_url }}
        </el-descriptions-item>
        <el-descriptions-item label="页面标题" :span="2">
          {{ currentError.page_title }}
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
          {{ currentError.data?.message || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="文件位置" :span="2" v-if="currentError.data?.filename">
          {{ currentError.data.filename }}:{{ currentError.data.lineno }}:{{ currentError.data.colno }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器" :span="1">
          {{ currentError.device_info?.browser?.name }} {{ currentError.device_info?.browser?.version }}
        </el-descriptions-item>
        <el-descriptions-item label="操作系统" :span="1">
          {{ currentError.device_info?.os?.name }} {{ currentError.device_info?.os?.version }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="currentError?.data?.stack" style="margin-top: 16px;">
        <div style="margin-bottom: 8px; font-weight: 600;">错误堆栈：</div>
        <pre class="stack-trace">{{ currentError.data.stack }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts';
import { getErrorList, getErrorStats, type MonitorDataItem, type ErrorStats } from '@/api/monitor';
import dayjs from 'dayjs';

const props = defineProps<{
  dateRange: [Date, Date] | null;
}>();

const loading = ref(false);
const errorList = ref<MonitorDataItem[]>([]);
const errorStats = ref<Partial<ErrorStats>>({});
const filterType = ref('');
const detailVisible = ref(false);
const currentError = ref<MonitorDataItem | null>(null);

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const typeChartRef = ref<HTMLElement | null>(null);
const pageChartRef = ref<HTMLElement | null>(null);
let typeChart: echarts.ECharts | null = null;
let pageChart: echarts.ECharts | null = null;

const getTimeParams = () => {
  if (props.dateRange) {
    return {
      startTime: props.dateRange[0].getTime(),
      endTime: props.dateRange[1].getTime(),
    };
  }
  return {};
};

const loadErrorList = async () => {
  loading.value = true;
  try {
    const res = await getErrorList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      type: filterType.value || undefined,
      ...getTimeParams(),
    });
    if (res.code === 200) {
      errorList.value = res.data.list;
      pagination.value.total = res.data.total;
    }
  } catch (error) {
    console.error('加载错误列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadErrorStats = async () => {
  try {
    const res = await getErrorStats(getTimeParams());
    if (res.code === 200) {
      errorStats.value = res.data;
      updateCharts();
    }
  } catch (error) {
    console.error('加载错误统计失败:', error);
  }
};

const updateCharts = () => {
  if (typeChart && errorStats.value.byType) {
    const typeNames: Record<string, string> = {
      js_error: 'JS错误',
      promise_error: 'Promise错误',
      resource_error: '资源错误',
      http_error: 'HTTP错误',
      vue_error: 'Vue错误',
    };
    typeChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: errorStats.value.byType.map(item => ({
          name: typeNames[item.type] || item.type,
          value: item.count,
        })),
      }],
    });
  }

  if (pageChart && errorStats.value.byPage) {
    const pages = errorStats.value.byPage.slice(0, 10);
    pageChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: pages.map(p => p.page?.split('?')[0]?.slice(-30) || '未知'),
        axisLabel: { fontSize: 10 },
      },
      series: [{
        type: 'bar',
        data: pages.map(p => p.count),
        itemStyle: { color: '#f56c6c' },
      }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    });
  }
};

const getTypeCount = (type: string) => {
  return errorStats.value.byType?.find(t => t.type === type)?.count || 0;
};

const getErrorTypeName = (type: string) => {
  const names: Record<string, string> = {
    js_error: 'JS错误',
    promise_error: 'Promise',
    resource_error: '资源错误',
    http_error: 'HTTP错误',
    vue_error: 'Vue错误',
  };
  return names[type] || type;
};

const getErrorTagType = (type: string) => {
  const types: Record<string, string> = {
    js_error: 'danger',
    promise_error: 'warning',
    resource_error: 'info',
    http_error: 'danger',
    vue_error: 'warning',
  };
  return types[type] || 'info';
};

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

const showDetail = (row: MonitorDataItem) => {
  currentError.value = row;
  detailVisible.value = true;
};

const initCharts = () => {
  nextTick(() => {
    if (typeChartRef.value) {
      typeChart = echarts.init(typeChartRef.value);
    }
    if (pageChartRef.value) {
      pageChart = echarts.init(pageChartRef.value);
    }
  });
};

watch(() => props.dateRange, () => {
  loadErrorList();
  loadErrorStats();
}, { deep: true });

watch(filterType, () => {
  pagination.value.page = 1;
  loadErrorList();
});

onMounted(() => {
  initCharts();
  loadErrorList();
  loadErrorStats();
});
</script>

<style scoped lang="less">
.error-monitor {
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

  .error-message {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #f56c6c;
  }

  .stack-trace {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.6;
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>
