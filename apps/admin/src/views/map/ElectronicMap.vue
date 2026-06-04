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
                        <h3>新增充电站</h3>
                    </div>
                </template>
                <el-form ref="formRef" :model="form" :rules="rules" style="max-width: 600px;" label-width="95px">
                    <el-form-item label="站点名称" prop="name">
                        <el-input placeholder="请输入站点名称" v-model="form.name"/>
                    </el-form-item>
                    <el-form-item label="所属城市" prop="city">
                        <el-input placeholder="请输入所属城市" v-model="form.city"/>
                    </el-form-item>
                    <el-form-item label="站点地址" prop="address">
                        <el-input placeholder="请输入站点地址" v-model="form.address"/>
                    </el-form-item>
                    <el-form-item label="经度" prop="longitude">
                        <el-input placeholder="请输入经度" v-model="form.longitude"/>
                    </el-form-item>
                    <el-form-item label="纬度" prop="latitude">
                        <el-input placeholder="请输入纬度" v-model="form.latitude"/>
                    </el-form-item>
                    <el-form-item label="快充数" prop="fast">
                        <el-input placeholder="请输入快充数" v-model="form.fast"/>
                    </el-form-item>
                    <el-form-item label="慢充数" prop="slow">
                        <el-input placeholder="请输入慢充数" v-model="form.slow"/>
                    </el-form-item>
                    <el-form-item label="充电站状态" prop="status">
                        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                            <el-option label="使用中" :value="2" />
                            <el-option label="空闲中" :value="3" />
                            <el-option label="维护中" :value="4" />
                            <el-option label="待维修" :value="5" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="站点负责人" prop="person">
                        <el-input placeholder="请输入负责人" v-model="form.person"/>
                    </el-form-item>
                    <el-form-item label="负责人电话" prop="tel">
                        <el-input placeholder="请输入电话" v-model="form.tel"/>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input placeholder="选填" type="textarea" v-model="form.remarks"/>
                    </el-form-item>
                    <el-form-item>
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
    import type { FormInstance, FormRules } from "element-plus"
    import { getMapStatsApi } from "@/api/map"
    import { createStationApi } from "@/api/chargingstation"
    import { emptyStationForm } from "@/types/station"
    import { ElMessage } from "element-plus"
    
    const mapContainerRef = ref<InstanceType<typeof MapContainer> | null>(null)
    const formRef = ref<FormInstance>()
    
    const form = reactive(emptyStationForm())

    const validateCoordinate = (min: number, max: number, label: string) => {
        return (_rule: unknown, value: string, callback: (err?: Error) => void) => {
            if (!value) {
                callback(new Error(`${label}不能为空`))
                return
            }
            const num = parseFloat(value)
            if (isNaN(num) || num < min || num > max) {
                callback(new Error(`${label}格式不正确`))
                return
            }
            callback()
        }
    }

    const rules: FormRules = {
        name: [{ required: true, message: '站点名称不能为空', trigger: 'blur' }],
        city: [{ required: true, message: '所属城市不能为空', trigger: 'blur' }],
        address: [{ required: true, message: '站点地址不能为空', trigger: 'blur' }],
        longitude: [{ validator: validateCoordinate(-180, 180, '经度'), trigger: 'blur' }],
        latitude: [{ validator: validateCoordinate(-90, 90, '纬度'), trigger: 'blur' }],
        fast: [{ required: true, message: '快充数不能为空', trigger: 'blur' }],
        slow: [{ required: true, message: '慢充数不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '请选择充电站状态', trigger: 'change' }],
        person: [{ required: true, message: '站点负责人不能为空', trigger: 'blur' }],
        tel: [{ required: true, message: '负责人电话不能为空', trigger: 'blur' }],
    }
    
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
    
    const handleCreate = async () => {
        const valid = await formRef.value?.validate().catch(() => false)
        if (!valid) return

        try {
            const res = await createStationApi({
                name: form.name.trim(),
                city: form.city.trim(),
                address: form.address.trim(),
                fast: Number(form.fast),
                slow: Number(form.slow),
                status: form.status,
                person: form.person.trim(),
                tel: form.tel.trim(),
                longitude: parseFloat(form.longitude),
                latitude: parseFloat(form.latitude),
            })
            
            if (res.code === 200 || res.code === 201) {
                ElMessage.success(res.message || '充电站创建成功')
                handleClear()
                loadStats()
                mapContainerRef.value?.refreshMap()
            } else {
                ElMessage.error(res.message || '创建失败')
            }
        } catch (error: any) {
            console.error('创建充电站失败:', error)
            ElMessage.error(error.message || '创建失败')
        }
    }
    
    const handleClear = () => {
        Object.assign(form, emptyStationForm())
        formRef.value?.clearValidate()
    }
    
    onMounted(() => {
        loadStats()
    })
</script>
<style scoped>
    .des{line-height: 35px;}
</style>
