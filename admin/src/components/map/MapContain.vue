<template>
    <div id="container">
        <div v-if="loading" class="loading-mask">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>地图加载中...</span>
        </div>
        <div v-if="error" class="error-mask">
            <el-icon><Warning /></el-icon>
            <p>{{ error }}</p>
            <el-button type="primary" size="small" @click="retryLoad">重试</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">

import AMapLoader from '@amap/amap-jsapi-loader';
import { onMounted, ref, onUnmounted } from 'vue';
import { mapListApi } from "@/api/map"
import { ElMessage } from 'element-plus'
import { Loading, Warning } from '@element-plus/icons-vue'
import icon from "@/assets/flashIcon.png"
import station from "@/assets/station.jpg"
let map:any = null;
let AMapInstance:any = null; // 存储AMap实例
const markersData = ref<any>([])
const markers = ref<any[]>([]) // 存储marker实例，用于刷新时清除
const loading = ref<boolean>(true)
const error = ref<string>('')

// 加载标记点
const loadMarkers = async () => {
    if (!AMapInstance || !map) {
        console.warn('地图未初始化，无法加载标记点');
        return;
    }
    
    try {
        const res = await mapListApi();
        if (res.code === 200 && res.data && Array.isArray(res.data)) {
            markersData.value = res.data;
            
            if (markersData.value.length === 0) {
                ElMessage.info('暂无充电站数据');
                return;
            }
            
            //创建信息窗体
            const infoWindow = new AMapInstance.InfoWindow({
                offset: new AMapInstance.Pixel(0, -30),
            });
            markersData.value.forEach((markerData: any) => {
                if (!markerData.position || !Array.isArray(markerData.position) || markerData.position.length !== 2) {
                    console.warn('无效的坐标数据:', markerData);
                    return;
                }
                
                const marker = new AMapInstance.Marker({
                    position: markerData.position,
                    icon: icon, //添加 icon 图标 URL
                    title: markerData.title || markerData.city,
                });
                marker.on("click", () => {
                    infoWindow.setContent(`
                        <div style="display:flex;padding:10px;align-items:center">
                            <div>
                                <img src="${station}" width="200px"/>    
                            </div>
                            <div style="width:180px;line-height:30px;margin-left:20px">
                                <h3>${markerData.title}</h3>
                                <p>充电桩数量：${markerData.count}</p>   
                                <p>充电站状态：<span style="color:${markerData.status==1?'blue':'red'}">${markerData.status==1?"使用中":"维护中"}</span></p>
                                <p>所在城市：${markerData.city || '未知'}</p>
                            </div>
                        </div>
                    `);
                    infoWindow.open(map, marker.getPosition());
                });
                map.add(marker);
                markers.value.push(marker);
            });
            
            // 如果有标记点，调整地图视野
            if (markers.value.length > 0) {
                map.setFitView(markers.value);
            }
        } else {
            const errorMsg = res.message || '获取地图数据失败';
            console.error('获取地图数据失败:', errorMsg);
            ElMessage.warning(errorMsg);
        }
    } catch (error: any) {
        console.error('加载地图数据失败:', error);
        ElMessage.error(error.message || '加载地图数据失败，请检查网络连接');
    }
}

// 定义刷新方法，供父组件调用
const refreshMap = async () => {
    // 清除现有标记
    markers.value.forEach(marker => {
        map?.remove(marker);
    });
    markers.value = [];
    
    // 重新加载数据
    await loadMarkers();
}

// 暴露刷新方法给父组件
defineExpose({
    refreshMap
});

// 重试加载
const retryLoad = () => {
    error.value = '';
    loading.value = true;
    initMap();
}

// 初始化地图
const initMap = () => {
    AMapLoader.load({
        key: "7066344199d5d8c8bd499c1d4bfc1984", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "1.4.15", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
    }).then((AMap) => {
        AMapInstance = AMap; // 保存AMap实例
        map = new AMap.Map("container", {
            // 设置地图容器id
            viewMode: "3D", // 是否为3D地图模式
            zoom: 5, // 初始化地图级别
            center: [116.397428, 39.90923], // 初始化地图中心点位置
        });
        loading.value = false;
        error.value = '';
        // 加载标记点
        loadMarkers();
    }).catch((e) => {
        console.error('地图加载失败:', e);
        loading.value = false;
        error.value = '地图加载失败，可能是网络问题或API Key配置错误。请检查网络连接或联系管理员。';
        ElMessage.error('地图加载失败，请检查网络连接');
    });
}

onMounted(() => {
    initMap();
})

onUnmounted(() => {
  map?.destroy();
});

</script>

<style lang="less" scoped>
#container {
    width: 100%;
    height: 80vh;
    position: relative;
}

.loading-mask,
.error-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 1000;
    gap: 10px;
}

.error-mask {
    p {
        margin: 10px 0;
        color: #f56c6c;
        text-align: center;
        padding: 0 20px;
    }
}
</style>