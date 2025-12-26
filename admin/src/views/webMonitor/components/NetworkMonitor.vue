<template>
  <div class="network-monitor">
    <!-- 网络请求列表 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>网络请求记录</span>
          <div class="header-actions">
            <el-select v-model="filterStatus" placeholder="状态" clearable size="small" style="width: 120px;">
              <el-option label="全部" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="error" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="networkList" stripe v-loading="loading">
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.data?.success ? 'success' : 'danger'" size="small">
              {{ row.data?.status || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="方法" width="80">
          <template #default="{ row }">
            <span :class="'method-' + (row.data?.method?.toLowerCase() || 'get')">
              {{ row.data?.method || 'GET' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="URL" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.data?.url || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">
            <span :class="getDurationClass(row.data?.duration)">
              {{ row.data?.duration || 0 }}ms
            </span>
          </template>
        </el-table-column>
        <el-table-column label="请求大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.data?.requestSize) }}
          </template>
        </el-table-column>
        <el-table-column label="响应大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.data?.responseSize) }}
          </template>
        </el-table-column>
        <el-table-column label="页面" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.page_url?.split('?')[0]?.split('/').pop() || '-' }}
          </template>
        </el-table-column>
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
        @size-change="loadNetworkList"
        @current-change="loadNetworkList"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="请求详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRequest">
        <el-descriptions-item label="请求方法">
          {{ currentRequest.data?.method }}
        </el-descriptions-item>
        <el-descriptions-item label="状态码">
          <el-tag :type="currentRequest.data?.success ? 'success' : 'danger'" size="small">
            {{ currentRequest.data?.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">
          {{ currentRequest.data?.url }}
        </el-descriptions-item>
        <el-descriptions-item label="耗时">
          {{ currentRequest.data?.duration }}ms
        </el-descriptions-item>
        <el-descriptions-item label="请求时间">
          {{ formatTime(currentRequest.timestamp) }}
        </el-descriptions-item>
        <el-descriptions-item label="请求大小">
          {{ formatSize(currentRequest.data?.requestSize) }}
        </el-descriptions-item>
        <el-descriptions-item label="响应大小">
          {{ formatSize(currentRequest.data?.responseSize) }}
        </el-descriptions-item>
        <el-descriptions-item label="页面URL" :span="2">
          {{ currentRequest.page_url }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器">
          {{ currentRequest.device_info?.browser?.name }} {{ currentRequest.device_info?.browser?.version }}
        </el-descriptions-item>
        <el-descriptions-item label="操作系统">
          {{ currentRequest.device_info?.os?.name }} {{ currentRequest.device_info?.os?.version }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="currentRequest?.data?.timing" style="margin-top: 16px;">
        <div style="margin-bottom: 8px; font-weight: 600;">请求时序：</div>
        <el-descriptions :column="5" border>
          <el-descriptions-item label="DNS">{{ currentRequest.data.timing.dns }}ms</el-descriptions-item>
          <el-descriptions-item label="TCP">{{ currentRequest.data.timing.tcp }}ms</el-descriptions-item>
          <el-descriptions-item label="SSL">{{ currentRequest.data.timing.ssl }}ms</el-descriptions-item>
          <el-descriptions-item label="TTFB">{{ currentRequest.data.timing.ttfb }}ms</el-descriptions-item>
          <el-descriptions-item label="下载">{{ currentRequest.data.timing.download }}ms</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { getNetworkList, type MonitorDataItem } from '@/api/monitor';
import dayjs from 'dayjs';

const props = defineProps<{
  dateRange: [Date, Date] | null;
}>();

const loading = ref(false);
const networkList = ref<MonitorDataItem[]>([]);
const filterStatus = ref('');
const detailVisible = ref(false);
const currentRequest = ref<MonitorDataItem | null>(null);

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

const loadNetworkList = async () => {
  loading.value = true;
  try {
    const res = await getNetworkList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...getTimeParams(),
    });
    if (res.code === 200) {
      let list = res.data.list;
      // 客户端过滤状态
      if (filterStatus.value === 'success') {
        list = list.filter(item => item.data?.success);
      } else if (filterStatus.value === 'error') {
        list = list.filter(item => !item.data?.success);
      }
      networkList.value = list;
      pagination.value.total = res.data.total;
    }
  } catch (error) {
    console.error('加载网络请求数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const getDurationClass = (duration?: number) => {
  if (!duration) return '';
  if (duration < 200) return 'duration-fast';
  if (duration < 1000) return 'duration-normal';
  return 'duration-slow';
};

const formatSize = (size?: number) => {
  if (!size) return '-';
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${(size / 1024 / 1024).toFixed(2)}MB`;
};

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

const showDetail = (row: MonitorDataItem) => {
  currentRequest.value = row;
  detailVisible.value = true;
};

watch(() => props.dateRange, () => {
  loadNetworkList();
}, { deep: true });

watch(filterStatus, () => {
  loadNetworkList();
});

onMounted(() => {
  loadNetworkList();
});
</script>

<style scoped lang="less">
.network-monitor {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .method-get {
    color: #67c23a;
    font-weight: 600;
  }
  .method-post {
    color: #409eff;
    font-weight: 600;
  }
  .method-put {
    color: #e6a23c;
    font-weight: 600;
  }
  .method-delete {
    color: #f56c6c;
    font-weight: 600;
  }

  .duration-fast {
    color: #67c23a;
  }
  .duration-normal {
    color: #e6a23c;
  }
  .duration-slow {
    color: #f56c6c;
  }
}
</style>
