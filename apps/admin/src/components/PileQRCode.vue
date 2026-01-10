<template>
  <el-dialog
    v-model="visible"
    title="充电桩二维码"
    width="500px"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading" class="qrcode-dialog">
      <!-- 二维码图片 -->
      <div class="qrcode-container">
        <img
          v-if="qrCodeData?.qrCodeImage"
          :src="qrCodeData.qrCodeImage"
          alt="充电桩二维码"
          class="qrcode-image"
        />
        <div v-else class="qrcode-placeholder">
          <el-icon :size="60"><Picture /></el-icon>
          <p>二维码加载中...</p>
        </div>
      </div>

      <!-- 充电桩信息 -->
      <div v-if="qrCodeData" class="qrcode-info">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="充电桩名称">
            {{ qrCodeData.pileName }}
          </el-descriptions-item>
          <el-descriptions-item label="所属充电站">
            {{ qrCodeData.stationName }}
          </el-descriptions-item>
          <el-descriptions-item label="充电桩ID">
            {{ qrCodeData.pileId }}
          </el-descriptions-item>
          <el-descriptions-item label="二维码内容">
            <el-text copyable>{{ qrCodeData.qrCode }}</el-text>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="qrcode-actions">
        <el-button type="primary" @click="handleDownload" :loading="downloading">
          <el-icon><Download /></el-icon>
          下载二维码
        </el-button>
        <el-button @click="handlePrint" :disabled="!qrCodeData?.qrCodeImage">
          <el-icon><Printer /></el-icon>
          打印二维码
        </el-button>
        <el-button @click="handleRefresh" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Picture, Download, Printer, Refresh } from '@element-plus/icons-vue';
import { getPileQRCodeApi, type PileQRCodeData } from '@/api/pileQRCode';

interface Props {
  modelValue: boolean;
  pileId: number | string;
  size?: number;
  format?: 'PILE_ID' | 'number' | 'json';
}

const props = withDefaults(defineProps<Props>(), {
  size: 300,
  format: 'PILE_ID',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'close': [];
}>();

const visible = ref(false);
const loading = ref(false);
const downloading = ref(false);
const qrCodeData = ref<PileQRCodeData | null>(null);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val && props.pileId) {
      loadQRCode();
    }
  },
  { immediate: true }
);

// 监听 visible 变化，同步到父组件
watch(visible, (val) => {
  if (!val) {
    emit('update:modelValue', false);
    emit('close');
  }
});

// 加载二维码数据
const loadQRCode = async () => {
  if (!props.pileId) return;

  loading.value = true;
  try {
    const res = await getPileQRCodeApi(props.pileId, {
      format: props.format,
      size: props.size,
      includeInfo: true,
    });

    if (res.code === 200 && res.data) {
      qrCodeData.value = res.data;
    } else {
      ElMessage.error(res.message || '获取二维码失败');
    }
  } catch (error: any) {
    console.error('获取二维码失败:', error);
    ElMessage.error(error.message || '获取二维码失败');
  } finally {
    loading.value = false;
  }
};

// 下载二维码
const handleDownload = async () => {
  if (!props.pileId || !qrCodeData.value) return;

  downloading.value = true;
  try {
    // 直接使用axios下载文件
    const axios = (await import('@/utils/axios')).default;
    const response = await axios.get(`/api/piles/${props.pileId}/qrcode/download`, {
      params: { size: props.size, format: 'png' },
      responseType: 'blob',
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pile_${props.pileId}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('二维码下载成功');
  } catch (error: any) {
    console.error('下载二维码失败:', error);
    ElMessage.error(error.message || '下载二维码失败');
  } finally {
    downloading.value = false;
  }
};

// 构建打印HTML内容的辅助函数（避免Vue编译器解析）
function buildPrintHTML(pileName: string, stationName: string, pileId: number, qrCode: string, qrCodeImage: string): string {
  // 使用字符串拼接构建HTML，将闭合标签分开
  const closeScript = '</' + 'script>';
  const closeBody = '</' + 'body>';
  const closeHtml = '</' + 'html>';
  
  return (
    '<!DOCTYPE html>\n' +
    '<html>\n' +
    '  <head>\n' +
    `    <title>充电桩二维码 - ${pileName}</title>\n` +
    '    <style>\n' +
    '      body {\n' +
    '        display: flex;\n' +
    '        flex-direction: column;\n' +
    '        align-items: center;\n' +
    '        justify-content: center;\n' +
    '        padding: 40px;\n' +
    '        font-family: Arial, sans-serif;\n' +
    '      }\n' +
    '      .qrcode-container {\n' +
    '        margin: 20px 0;\n' +
    '      }\n' +
    '      .qrcode-container img {\n' +
    '        width: 300px;\n' +
    '        height: 300px;\n' +
    '        border: 2px solid #000;\n' +
    '      }\n' +
    '      .info {\n' +
    '        text-align: center;\n' +
    '        margin-top: 20px;\n' +
    '      }\n' +
    '      .info h2 {\n' +
    '        margin: 10px 0;\n' +
    '        font-size: 18px;\n' +
    '      }\n' +
    '      .info p {\n' +
    '        margin: 5px 0;\n' +
    '        font-size: 14px;\n' +
    '        color: #666;\n' +
    '      }\n' +
    '    </style>\n' +
    '  </head>\n' +
    '  <body>\n' +
    '    <div class="qrcode-container">\n' +
    `      <img src="${qrCodeImage}" alt="充电桩二维码" />\n` +
    '    </div>\n' +
    '    <div class="info">\n' +
    `      <h2>${pileName}</h2>\n` +
    `      <p>${stationName}</p>\n` +
    `      <p>充电桩ID: ${pileId}</p>\n` +
    `      <p>二维码内容: ${qrCode}</p>\n` +
    '    </div>\n' +
    '    <script type="text/javascript">\n' +
    '      window.onload = function() {\n' +
    '        window.print();\n' +
    '        window.onafterprint = function() {\n' +
    '          window.close();\n' +
    '        };\n' +
    '      };\n' +
    `    ${closeScript}\n` +
    `  ${closeBody}\n` +
    closeHtml
  );
}

// 打印二维码
const handlePrint = () => {
  if (!qrCodeData.value?.qrCodeImage) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    ElMessage.warning('无法打开打印窗口，请检查浏览器设置');
    return;
  }

  const htmlContent = buildPrintHTML(
    qrCodeData.value.pileName,
    qrCodeData.value.stationName,
    qrCodeData.value.pileId,
    qrCodeData.value.qrCode,
    qrCodeData.value.qrCodeImage
  );

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// 刷新二维码
const handleRefresh = () => {
  loadQRCode();
};

// 关闭对话框
const handleClose = () => {
  qrCodeData.value = null;
};
</script>

<style lang="less" scoped>
.qrcode-dialog {
  padding: 20px;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  min-height: 300px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;

  .qrcode-image {
    width: 300px;
    height: 300px;
    border: 2px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
  }

  .qrcode-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    min-height: 300px;

    p {
      margin-top: 10px;
      font-size: 14px;
    }
  }
}

.qrcode-info {
  margin-bottom: 20px;
}

.qrcode-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;

  .el-button {
    flex: 1;
    max-width: 150px;
  }
}
</style>
