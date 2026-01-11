<template>
    <el-dialog 
        :model-value="dialogVisible" 
        :title="title"
        @close="handleCancel"
        destroy-on-close
        width="800px"
    >
        <el-form 
            label-width="120px"
            :rules="rules"
            :model="ruleForm"
            ref="formRef"
        >
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="所属充电站:" prop="station_id">
                        <el-select 
                            v-model="ruleForm.station_id" 
                            placeholder="请选择充电站"
                            filterable
                            :disabled="disabled"
                            style="width: 100%"
                        >
                            <el-option 
                                v-for="station in stations" 
                                :key="station.id" 
                                :label="station.name" 
                                :value="station.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="充电桩类型:" prop="type">
                        <el-select 
                            v-model="ruleForm.type" 
                            placeholder="请选择类型"
                            style="width: 100%"
                        >
                            <el-option label="快充" value="快充" />
                            <el-option label="慢充" value="慢充" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态:" prop="status">
                        <el-select 
                            v-model="ruleForm.status" 
                            placeholder="请选择状态"
                            style="width: 100%"
                        >
                            <el-option label="空闲中" :value="1" />
                            <el-option label="充电中" :value="2" />
                            <el-option label="连接中" :value="3" />
                            <el-option label="排队中" :value="4" />
                            <el-option label="已预约" :value="5" />
                            <el-option label="故障/离线" :value="6" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="电压(V):" prop="voltage">
                        <el-input v-model.number="ruleForm.voltage" type="number" />
                    </el-form-item>
                    <el-form-item label="电流(A):" prop="current">
                        <el-input v-model.number="ruleForm.current" type="number" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="功率(kW):" prop="power">
                        <el-input v-model.number="ruleForm.power" type="number" />
                    </el-form-item>
                    <el-form-item label="温度(°C):" prop="temperature">
                        <el-input v-model.number="ruleForm.temperature" type="number" />
                    </el-form-item>
                    <el-form-item label="充电进度(%):" prop="percent">
                        <el-input 
                            v-model.number="ruleForm.percent" 
                            type="number"
                            :disabled="disabled"
                            :min="0"
                            :max="100"
                        />
                    </el-form-item>
                    <el-form-item label="安装日期:" prop="install_date">
                        <el-date-picker
                            v-model="ruleForm.install_date"
                            type="date"
                            placeholder="选择日期"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleConfirm">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue"
import type { FormRules, FormInstance } from "element-plus";
import { createPileApi, updatePileApi, getPileDetailApi } from "@/api/pile"
import { getStationListApi } from "@/api/chargingstation"
import { ElMessage } from 'element-plus'

interface Station {
    id: number;
    name: string;
}

interface PileForm {
    id?: number;
    station_id?: number;
    type?: string;
    status?: number;
    voltage?: number;
    current?: number;
    power?: number;
    temperature?: number;
    percent?: number;
    install_date?: string;
}

const props = defineProps({
    dialogVisible: {
        type: Boolean,
        required: true
    },
    pileId: {
        type: Number,
        default: null
    }
})

const emit = defineEmits(['close', 'success'])

const formRef = ref<FormInstance>()
const title = ref('新增充电桩')
const disabled = ref(false)
const stations = ref<Station[]>([])

const ruleForm = reactive<PileForm>({
    station_id: undefined,
    type: undefined,
    status: 1,
    voltage: undefined,
    current: undefined,
    power: undefined,
    temperature: undefined,
    percent: 0,
    install_date: undefined,
})

const rules: FormRules = {
    station_id: [
        { required: true, message: '请选择所属充电站', trigger: 'change' }
    ],
    type: [
        { required: true, message: '请选择充电桩类型', trigger: 'change' }
    ],
}

// 加载充电站列表
const loadStations = async () => {
    try {
        const res = await getStationListApi({ page: 1, pageSize: 1000 })
        if (res.code === 200 && res.data?.list) {
            stations.value = res.data.list
        }
    } catch (error) {
        console.error('加载充电站列表失败:', error)
    }
}

// 加载充电桩详情
const loadPileDetail = async (id: number) => {
    try {
        const res = await getPileDetailApi(id)
        if (res.code === 200 && res.data) {
            Object.assign(ruleForm, {
                station_id: res.data.stationId,
                type: res.data.type,
                status: res.data.status,
                voltage: res.data.voltage,
                current: res.data.current,
                power: res.data.power,
                temperature: res.data.temperature,
                percent: res.data.percent || 0,
                install_date: res.data.installDate || undefined,
            })
        }
    } catch (error) {
        ElMessage.error('加载充电桩详情失败')
    }
}

watch(() => props.dialogVisible, async (visible) => {
    if (visible) {
        // 重置表单
        Object.assign(ruleForm, {
            station_id: undefined,
            type: undefined,
            status: 1,
            voltage: undefined,
            current: undefined,
            power: undefined,
            temperature: undefined,
            percent: 0,
            install_date: undefined,
        })
        
        if (props.pileId) {
            title.value = '编辑充电桩'
            disabled.value = false
            await loadPileDetail(props.pileId)
        } else {
            title.value = '新增充电桩'
            disabled.value = false
        }
        
        // 加载充电站列表
        await loadStations()
    }
})

onMounted(() => {
    loadStations()
})

const handleCancel = () => {
    formRef.value?.resetFields()
    emit('close')
}

const handleConfirm = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            try {
                let res
                const formData: any = {
                    station_id: ruleForm.station_id,
                    type: ruleForm.type,
                    status: ruleForm.status,
                    voltage: ruleForm.voltage,
                    current: ruleForm.current,
                    power: ruleForm.power,
                    temperature: ruleForm.temperature,
                    install_date: ruleForm.install_date,
                }
                
                if (props.pileId) {
                    // 编辑：使用更新接口
                    if (ruleForm.percent !== undefined) {
                        formData.percent = ruleForm.percent
                    }
                    res = await updatePileApi(props.pileId, formData)
                } else {
                    // 新增：使用创建接口
                    res = await createPileApi(formData)
                }
                
                if (res.code === 200) {
                    ElMessage({
                        message: res.message || '操作成功',
                        type: 'success'
                    })
                    handleCancel()
                    emit('success')
                } else {
                    ElMessage.error(res.message || '操作失败')
                }
            } catch (error: any) {
                ElMessage.error(error.message || '操作失败')
            }
        }
    })
}
</script>

<style scoped lang="less">
.dialog-footer {
    text-align: right;
}
</style>
