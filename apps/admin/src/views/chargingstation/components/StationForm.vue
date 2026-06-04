<template>
    <el-dialog 
    :model-value="dialogVisible" 
    :title="title"
    @close="handleCancel"
    destroy-on-close
    >
        <el-form 
            label-width="120"
            :rules="rules"
            :model="ruleForm"
            ref="formRef"
        >
            <el-row>
                <el-col :span="12">
                    <el-form-item label="站点名称:" prop="name">
                        <el-input v-model="ruleForm.name"/>
                    </el-form-item>
                    <el-form-item v-if="isEdit" label="站点id:" prop="id">
                        <el-input v-model="ruleForm.id" disabled/>
                    </el-form-item>
                    <el-form-item label="所属城市：" prop="city">
                        <el-input v-model="ruleForm.city"/>
                    </el-form-item>
                    <el-form-item label="站点地址：" prop="address">
                        <el-input v-model="ruleForm.address" placeholder="请输入详细地址"/>
                    </el-form-item>
                    <el-form-item label="经度：" prop="longitude">
                        <el-input v-model="ruleForm.longitude" placeholder="如 116.4074"/>
                    </el-form-item>
                    <el-form-item label="纬度：" prop="latitude">
                        <el-input v-model="ruleForm.latitude" placeholder="如 39.9042"/>
                    </el-form-item>
                    <el-form-item label="站点负责人：" prop="person">
                        <el-input v-model="ruleForm.person"/>
                    </el-form-item>
                    <el-form-item label="负责人电话：" prop="tel">
                        <el-input v-model="ruleForm.tel"/>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="快充数：" prop="fast">
                        <el-input v-model="ruleForm.fast"/>
                    </el-form-item>
                    <el-form-item label="慢充数：" prop="slow">
                        <el-input v-model="ruleForm.slow"/>
                    </el-form-item>
                    <el-form-item label="充电站状态：" prop="status">
                        <el-select placeholder="请选择充电站状态" v-model="ruleForm.status">
                            <el-option label="使用中" :value="2"></el-option>
                            <el-option label="空闲中" :value="3"></el-option>
                            <el-option label="维护中" :value="4"></el-option>
                            <el-option label="待维修" :value="5"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="isEdit" label="正在充电：" prop="now">
                        <el-input v-model="ruleForm.now" disabled/>
                    </el-form-item>
                    <el-form-item v-if="isEdit" label="故障数：" prop="fault">
                        <el-input v-model="ruleForm.fault" disabled/>
                    </el-form-item>
                    <el-form-item label="备注：">
                        <el-input v-model="ruleForm.remarks" type="textarea" placeholder="选填"/>
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
import { ref, reactive, watch } from "vue"
import type { FormRules, FormInstance } from "element-plus";
import type { RowType } from "@/types/station"
import { emptyStationForm } from "@/types/station"
import { useStationStore } from "@/store/station"
import { storeToRefs } from "pinia";
import { createStationApi, updateStationApi } from "@/api/chargingstation"
import { ElMessage } from 'element-plus'

const props = defineProps({
    dialogVisible: {
        type: Boolean,
        required: true
    }
})
const emit = defineEmits(["close", "reload"])

const ruleForm = ref<RowType>(emptyStationForm())
const isEdit = ref(false)
const title = ref<string>("")

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

const rules = reactive<FormRules<RowType>>({
    name: [{ required: true, message: "站点名称不能为空", trigger: "blur" }],
    city: [{ required: true, message: '所属城市不能为空', trigger: 'blur' }],
    address: [{ required: true, message: '站点地址不能为空', trigger: 'blur' }],
    longitude: [{ validator: validateCoordinate(-180, 180, '经度'), trigger: 'blur' }],
    latitude: [{ validator: validateCoordinate(-90, 90, '纬度'), trigger: 'blur' }],
    person: [{ required: true, message: '站点负责人不能为空', trigger: 'blur' }],
    tel: [{ required: true, message: '负责人电话不能为空', trigger: 'blur' }],
    fast: [{ required: true, message: '快充数不能为空', trigger: 'blur' }],
    slow: [{ required: true, message: '慢充数不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '充电站状态不能为空', trigger: 'change' }],
})

const stationStore = useStationStore();
const { rowData } = storeToRefs(stationStore)

watch(() => props.dialogVisible, (visible) => {
    if (!visible) return

    isEdit.value = !!rowData.value.id
    title.value = isEdit.value ? "编辑充电站信息" : "新增充电站信息"
    ruleForm.value = isEdit.value
        ? { ...rowData.value, remarks: rowData.value.remarks || "" }
        : emptyStationForm()
})

const handleCancel = () => {
    emit("close")
}

const buildPayload = (form: RowType) => ({
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

const formRef = ref<FormInstance>()
const handleConfirm = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            const payload = buildPayload(ruleForm.value)
            const res = isEdit.value
                ? await updateStationApi(ruleForm.value.id, payload)
                : await createStationApi(payload)

            if (res.code == 200 || res.code == 201) {
                ElMessage({
                    message: res.message || '操作成功',
                    type: "success"
                });
                handleCancel();
                emit("reload")
            }
        } catch (error: any) {
            ElMessage({
                message: error.message || '操作失败',
                type: "error"
            });
        }
    })
}
</script>
