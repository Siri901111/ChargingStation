<template>
    <el-row :gutter="20">
        <el-col :span="18">
            <el-card >
                <MapContainer ref="mapContainerRef"/>
            </el-card>
        </el-col>
        <el-col :span="6">
            <el-card class="des">
                <div>1.累计充电站数量：<el-text type="primary">{{ stats.totalStations || 0 }}个</el-text></div>
                <div>2.单省份最多充电站：<el-text type="primary">{{ stats.maxProvinceName || '暂无' }}({{ stats.maxProvinceCount || 0 }}个)</el-text></div>
                <div>3.充电站遍及省份：<el-text type="primary">{{ stats.provinceCount || 0 }}个</el-text></div>
                <div>4.暂无充电站省份：<el-text type="primary">{{ stats.noStationProvinces || 0 }}个</el-text></div>
                <div>5.累计充电站：<el-text type="primary">{{ stats.accumulatedStation || '暂无' }}</el-text></div>
                <div>6.单日营收最高：<el-text type="primary">{{ stats.maxRevenueStation || '暂无数据' }}</el-text></div>
                <div>7.单日营收最低：<el-text type="primary">{{ stats.minRevenueStation || '暂无数据' }}</el-text></div>
                <div>8.故障率最高：<el-text type="primary">{{ stats.maxFaultStation || '暂无数据' }}</el-text></div>
            </el-card>
            <el-card class="mt">
                <template #header>
                    <div class="card-header">
                        <h3>新增站点地图</h3>
                    </div>
                </template>
                <el-form :model="form" style="max-width: 600px;" label-width="85px">
                    <el-form-item label="站点名称：">
                        <el-input placeholder="请输入站点名称" v-model="form.name"/>
                    </el-form-item>
                    <el-form-item label="站点地址">
                        <el-input placeholder="请输入站点地址" v-model="form.region"/>
                    </el-form-item>
                    <el-form-item label="经度：">
                        <el-input placeholder="请输入经度" v-model="form.location1"/>
                    </el-form-item>
                    <el-form-item label="维度：">
                        <el-input placeholder="请输入维度" v-model="form.location2"/>
                    </el-form-item>
                    <el-form-item label="立即使用：">
                        <el-switch v-model="form.now"/>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input placeholder="请输入备注" type="textarea" v-model="form.remarks"/>
                    </el-form-item>
                    <el-form-item >
                        <el-button type="primary" @click="handleCreate">创建</el-button>
                        <el-button @click="handleClear">清空</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
    </el-row>
</template>
<script setup lang="ts">
    import MapContainer from "@/components/map/MapContain.vue"
    import { reactive, ref, onMounted } from "vue"
    import { getMapStatsApi, createStationFromMapApi } from "@/api/map"
    import { ElMessage } from "element-plus"
    
    const mapContainerRef = ref<InstanceType<typeof MapContainer> | null>(null)
    
    const form = reactive({
        name: "",
        region: "",
        location1: "",
        location2: "",
        now: false,
        remarks: ""
    })
    
    const stats = ref({
        totalStations: 0,
        maxProvinceName: '',
        maxProvinceCount: 0,
        provinceCount: 0,
        noStationProvinces: 0,
        accumulatedStation: '',
        maxRevenueStation: '',
        minRevenueStation: '',
        maxFaultStation: ''
    })
    
    const loading = ref<boolean>(false)
    
    // 加载统计信息
    const loadStats = async () => {
        loading.value = true
        try {
            const res = await getMapStatsApi()
            if (res.code === 200 && res.data) {
                stats.value = res.data
            } else {
                ElMessage.warning(res.message || '获取统计信息失败')
            }
        } catch (error: any) {
            console.error('加载统计信息失败:', error)
            ElMessage.error(error.message || '加载统计信息失败，请检查网络连接')
        } finally {
            loading.value = false
        }
    }
    
    // 创建充电站
    const handleCreate = async () => {
        if (!form.name || !form.region || !form.location1 || !form.location2) {
            ElMessage.warning('请填写完整的站点信息')
            return
        }
        
        // 验证经纬度格式
        const longitude = parseFloat(form.location1)
        const latitude = parseFloat(form.location2)
        
        if (isNaN(longitude) || isNaN(latitude)) {
            ElMessage.warning('经纬度格式不正确')
            return
        }
        
        if (longitude < -180 || longitude > 180) {
            ElMessage.warning('经度范围应在-180到180之间')
            return
        }
        
        if (latitude < -90 || latitude > 90) {
            ElMessage.warning('纬度范围应在-90到90之间')
            return
        }
        
        try {
            const res = await createStationFromMapApi({
                name: form.name,
                region: form.region,
                longitude: longitude,
                latitude: latitude,
                now: form.now,
                remarks: form.remarks
            })
            
            if (res.code === 200) {
                ElMessage.success(res.message || '充电站创建成功')
                handleClear()
                // 刷新统计信息和地图
                loadStats()
                // 触发地图组件刷新
                mapContainerRef.value?.refreshMap()
            } else {
                ElMessage.error(res.message || '创建失败')
            }
        } catch (error: any) {
            console.error('创建充电站失败:', error)
            ElMessage.error(error.message || '创建失败')
        }
    }
    
    // 清空表单
    const handleClear = () => {
        form.name = ""
        form.region = ""
        form.location1 = ""
        form.location2 = ""
        form.now = false
        form.remarks = ""
    }
    
    onMounted(() => {
        loadStats()
    })
</script>
<style scoped>
    .des{line-height: 35px;}
</style>