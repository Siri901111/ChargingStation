<template>
    <el-row :gutter="20">
        <el-col :span="6">
            <el-card>
                <el-input style="width: 80%;" placeholder="请输入关键词" v-model="filterText">
                    <template #append>
                        <el-button icon="Search" />
                    </template>
                </el-input>
                <el-tree ref="treeRef" :data="treeData" style="max-width: 600px;" :props="defaultProps" class="mt"
                    show-checkbox :filter-node-method="filterNode" @node-click="handleNodeClick"></el-tree>
            </el-card>
        </el-col>
        <el-col :span="18">
            <el-card>
                <template #header>
                    <div class="card-header">
                        <h3>{{ title }}:计费模板</h3>
                    </div>
                </template>
                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <el-form-item label="模板名称:" prop="name">
                        <el-input v-model="ruleForm.name" placeholder="请输入模板名称" style="max-width: 200px;" :disabled="!title"/>
                    </el-form-item>
                        <el-form-item :label="'时间区间'+(index+1)+':'" v-for="(timeSlot,index) in ruleForm.date" :key="index">
                            <el-col :span="8">
                                <el-form-item label="开始时间" :prop="'date.'+index+'.date1'" :rules="{required:true,message:'时间不能为空',trigger:'blur'}"> <!--date.1.date1   ruleForm.date[0].date1-->
                                    <el-time-picker value-format="hh:mm:ss" v-model="timeSlot.date1" placeholder="选择开始时间" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="1">
                                <span class="ml">--</span>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item :prop="'date.'+index+'.date2'" label="结束时间"  :rules="{required:true,message:'时间不能为空',trigger:'blur'}">
                                    <el-time-picker value-format="hh:mm:ss"  v-model="timeSlot.date2" placeholder="选择结束时间" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="电费" :prop="'date.'+index+'.electricity'"  :rules="{required:true,message:'电费不能为空',trigger:'blur'}">
                                    <el-input placeholder="请输入电费"  v-model="timeSlot.electricity" style="width:100%" />
                                </el-form-item>
                            </el-col>
                        </el-form-item>
                   

                    <el-button type="primary" class="mb" @click="addTimeSlot">添加时间区间</el-button>
                    <el-form-item label="服务费：" prop="service">
                        <el-input v-model="ruleForm.service" style="max-width: 200px;" />
                    </el-form-item>
                    <el-form-item label="停车费：" prop="parking">
                        <el-input v-model="ruleForm.parking" style="max-width: 200px;" />
                    </el-form-item>
                    <el-form-item label="特殊备注：" prop="remarks">
                        <el-input v-model="ruleForm.remarks" type="textarea" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm">创建</el-button>
                        <el-button @click=resetForm>重置</el-button>
                    </el-form-item>
                </el-form>

            </el-card>
        </el-col>
    </el-row>
</template>


<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getCityListApi, getBillingTemplateApi, saveBillingTemplateApi } from "@/api/operation"
import { watch } from "vue";
import { ElTree, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { reactive } from "vue";

interface Tree {
    label: string,
    children?: Tree[]
}
interface RuleFormType {
    name: string,
    service: string,
    parking: string,
    remarks: string,
    date: Array<{ date1: string, date2: string, electricity: string }>
}

const treeRef = ref<InstanceType<typeof ElTree>>();
const filterText = ref<string>("")

watch(filterText, (val) => {
    treeRef.value!.filter(val)
})

const defaultProps = {
    children: 'children',
    label: 'label',
}
const treeData = ref<Tree[]>([]);
const currentStationId = ref<number | null>(null);

onMounted(async () => {
    try {
        const res = await getCityListApi();
        if (res.code === 200 && res.data) {
            treeData.value = res.data;
        } else {
            ElMessage.error(res.message || '获取城市列表失败');
        }
    } catch (error: any) {
        console.error('加载城市列表失败:', error);
        ElMessage.error(error.message || '加载城市列表失败');
    }
})
const filterNode: any = (value: string, data: Tree) => {
    console.log(value, data)
    if (!value) return true
    return data.label.includes(value)
}

/**计费模板 */
const title = ref<string>("")
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleFormType>>({
    name:[
        {required:true,message:"请输入模板名称",trigger:"blur"}
    ],
    service:[
        {required:true,message:"请输入服务费",trigger:"blur"}
    ],
    parking:[
        {required:true,message:"请输入停车费",trigger:"blur"}
    ],
    remarks:[
        {required:true,message:"请输入备注",trigger:"blur"}
    ],

})

const ruleForm = ref<RuleFormType>({
    name: "",
    service: "",
    parking: "",
    remarks: "",
    date: [
        { date1: "", date2: "", electricity: "" }
    ]
})
const addTimeSlot=()=>{
    ruleForm.value.date.push( { date1: "", date2: "", electricity: "" })
}

const submitForm=async ()=>{
    if (!currentStationId.value) {
        ElMessage.warning('请先选择充电站');
        return;
    }
    
    ruleFormRef.value?.validate(async (valid)=>{
        if(valid){
            try {
                // 转换时间段数据格式
                const timeSlots = ruleForm.value.date.map(slot => ({
                    start_time: slot.date1,
                    end_time: slot.date2,
                    electricity_price: parseFloat(slot.electricity) || 0
                }));
                
                // 后端接口期望的参数格式
                const res = await saveBillingTemplateApi({
                    station_id: currentStationId.value,
                    name: ruleForm.value.name,
                    service: ruleForm.value.service,
                    parking: ruleForm.value.parking,
                    date: ruleForm.value.date,
                    remarks: ruleForm.value.remarks
                });
                
                if (res.code === 200 || res.code === 201) {
                    ElMessage.success(res.message || '保存成功');
                } else {
                    ElMessage.error(res.message || '保存失败');
                }
            } catch (error: any) {
                console.error('保存计费模板失败:', error);
                ElMessage.error(error.message || '保存失败');
            }
        }
    })
}

const handleNodeClick=async (data:Tree)=>{
    if(!data.children && (data as any).id){
        title.value = data.label;
        currentStationId.value = (data as any).id;
        resetForm();
        
        // 加载该站点的计费模板
        try {
            const res = await getBillingTemplateApi((data as any).id);
            if (res.code === 200 && res.data) {
                const template = res.data;
                ruleForm.value.name = template.name || '';
                ruleForm.value.service = template.service_fee?.toString() || '';
                ruleForm.value.parking = template.parking_fee?.toString() || '';
                ruleForm.value.remarks = template.remarks || '';
                
                // 处理时间段数据
                if (template.time_slots && Array.isArray(template.time_slots)) {
                    ruleForm.value.date = template.time_slots.map((slot: any) => ({
                        date1: slot.start_time || '',
                        date2: slot.end_time || '',
                        electricity: slot.electricity_price?.toString() || ''
                    }));
                } else {
                    ruleForm.value.date = [{ date1: "", date2: "", electricity: "" }];
                }
            } else if (res.code === 404) {
                // 没有模板，使用空表单
                resetForm();
            } else {
                ElMessage.warning(res.message || '获取计费模板失败');
            }
        } catch (error: any) {
            console.error('加载计费模板失败:', error);
            ElMessage.error(error.message || '加载计费模板失败');
        }
    }
}

const resetForm=()=>{
    ruleForm.value={
    name: "",
    service: "",
    parking: "",
    remarks: "",
    date: [
        { date1: "", date2: "", electricity: "" }
    ]
}
}
</script>