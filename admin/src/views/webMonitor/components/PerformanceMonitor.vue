<template>
  <div class="performance-monitor">
    <!-- 性能指标卡片 -->
    <el-row :gutter="16" class="metric-cards">
      <el-col :span="4">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value" :class="getFCPClass(metrics.avgFCP)">
            {{ metrics.avgFCP || 0 }}ms
          </div>
          <div class="metric-label">FCP (首次内容绘制)</div>
          <div class="metric-desc">{{ getFCPDesc(metrics.avgFCP) }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value" :class="getLCPClass(metrics.avgLCP)">
            {{ metrics.avgLCP || 0 }}ms
          </div>
          <div class="metric-label">LCP (最大内容绘制)</div>
          <div class="metric-desc">{{ getLCPDesc(metrics.avgLCP) }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value" :class="getTTFBClass(metrics.avgTTFB)">
            {{ metrics.avgTTFB || 0 }}ms
          </div>
          <div class="metric-label">TTFB (首字节时间)</div>
          <div class="metric-desc">{{ getTTFBDesc(metrics.avgTTFB) }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value" :class="getFIDClass(metrics.avgFID)">
            {{ metrics.avgFID || 0 }}ms
          </div>
          <div class="metric-label">FID (首次输入延迟)</div>
          <div class="metric-desc">{{ getFIDDesc(metrics.avgFID) }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value" :class="getCLSClass(Number(metrics.avgCLS))">
            {{ metrics.avgCLS || 0 }}
          </div>
          <div class="metric-label">CLS (累积布局偏移)</div>
          <div class="metric-desc">{{ getCLSDesc(Number(metrics.avgCLS)) }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ metrics.avgLoadComplete || 0 }}ms</div>
          <div class="metric-label">完全加载时间</div>
          <div class="metric-desc">样本数: {{ metrics.sampleCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能数据列表 -->
    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>性能数据详情</template>

      <el-table :data="performanceList" stripe v-loading="loading">
        <el-table-column label="页面" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.page_url?.split('?')[0] || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="FCP" width="100">
          <template #default="{ row }">
            <span :class="getFCPClass(row.data?.firstContentfulPaint)">
              {{ row.data?.firstContentfulPaint || 0 }}ms
            </span>
          </template>
        </el-table-column>
        <el-table-column label="LCP" width="100">
          <template #default="{ row }">
            <span :class="getLCPClass(row.data?.largestContentfulPaint)">
              {{ row.data?.largestContentfulPaint || 0 }}ms
            </span>
          </template>
        </el-table-column>
        <el-table-column label="TTFB" width="100">
          <template #default="{ row }">
            {{ row.data?.timeToFirstByte || 0 }}ms
          </template>
        </el-table-column>
        <el-table-column label="DNS" width="80">
          <template #default="{ row }">
            {{ row.data?.dnsLookup || 0 }}ms
          </template>
        </el-table-column>
        <el-table-column label="TCP" width="80">
          <template #default="{ row }">
            {{ row.data?.tcpConnection || 0 }}ms
          </template>
        </el-table-column>
        <el-table-column label="完全加载" width="100">
          <template #default="{ row }">
            {{ row.data?.loadComplete || 0 }}ms
          </template>
        </el-table-column>
        <el-table-column label="浏览器" width="150">
          <template #default="{ row }">
            {{ row.device_info?.browser?.name }} {{ row.device_info?.browser?.major }}
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
        @size-change="loadPerformanceList"
        @current-change="loadPerformanceList"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getPerformanceList, getPerformanceMetrics, type MonitorDataItem, type PerformanceMetrics } from '@/api/monitor';
import dayjs from 'dayjs';

const props = defineProps<{
  dateRange: [Date, Date] | null;
}>();

const loading = ref(false);
const performanceList = ref<MonitorDataItem[]>([]);
const metrics = ref<Partial<PerformanceMetrics>>({});

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const getTimeParams = () => {
  if (props.dateRange) {
    return {
      startTime: props.dateRange[0].getTime(),
      endTime: props.dateRange[1].getTime(),
    };
  }
  return {};
};

const loadPerformanceList = async () => {
  loading.value = true;
  try {
    const res = await getPerformanceList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      type: 'performance',
      ...getTimeParams(),
    });
    if (res.code === 200) {
      performanceList.value = res.data.list;
      pagination.value.total = res.data.total;
    }
  } catch (error) {
    console.error('加载性能数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadMetrics = async () => {
  try {
    const res = await getPerformanceMetrics(getTimeParams());
    if (res.code === 200) {
      metrics.value = res.data;
    }
  } catch (error) {
    console.error('加载性能指标失败:', error);
  }
};

// FCP 评估（单位：ms）
const getFCPClass = (value?: number) => {
  if (!value) return '';
  if (value <= 1800) return 'good';
  if (value <= 3000) return 'needs-improvement';
  return 'poor';
};

const getFCPDesc = (value?: number) => {
  if (!value) return '-';
  if (value <= 1800) return '良好';
  if (value <= 3000) return '需要改进';
  return '较差';
};

// LCP 评估
const getLCPClass = (value?: number) => {
  if (!value) return '';
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
};

const getLCPDesc = (value?: number) => {
  if (!value) return '-';
  if (value <= 2500) return '良好';
  if (value <= 4000) return '需要改进';
  return '较差';
};

// TTFB 评估
const getTTFBClass = (value?: number) => {
  if (!value) return '';
  if (value <= 800) return 'good';
  if (value <= 1800) return 'needs-improvement';
  return 'poor';
};

const getTTFBDesc = (value?: number) => {
  if (!value) return '-';
  if (value <= 800) return '良好';
  if (value <= 1800) return '需要改进';
  return '较差';
};

// FID 评估
const getFIDClass = (value?: number) => {
  if (!value) return '';
  if (value <= 100) return 'good';
  if (value <= 300) return 'needs-improvement';
  return 'poor';
};

const getFIDDesc = (value?: number) => {
  if (!value) return '-';
  if (value <= 100) return '良好';
  if (value <= 300) return '需要改进';
  return '较差';
};

// CLS 评估
const getCLSClass = (value?: number) => {
  if (!value) return '';
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
};

const getCLSDesc = (value?: number) => {
  if (!value) return '-';
  if (value <= 0.1) return '良好';
  if (value <= 0.25) return '需要改进';
  return '较差';
};

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

watch(() => props.dateRange, () => {
  loadPerformanceList();
  loadMetrics();
}, { deep: true });

onMounted(() => {
  loadPerformanceList();
  loadMetrics();
});
</script>

<style scoped lang="less">
.performance-monitor {
  .metric-cards {
    .metric-card {
      text-align: center;
      padding: 16px;

      .metric-value {
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;

        &.good {
          color: #67c23a;
        }
        &.needs-improvement {
          color: #e6a23c;
        }
        &.poor {
          color: #f56c6c;
        }
      }

      .metric-label {
        font-size: 13px;
        color: #606266;
        margin-bottom: 4px;
      }

      .metric-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .good {
    color: #67c23a;
  }
  .needs-improvement {
    color: #e6a23c;
  }
  .poor {
    color: #f56c6c;
  }
}
</style>
