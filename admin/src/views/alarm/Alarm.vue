<template>
    <el-card>
        <el-radio-group v-model="radio1" size="large" class="mt">
            <el-radio-button label="严重告警" :value="1"> </el-radio-button>
            <el-radio-button label="紧急告警" :value="2"> </el-radio-button>
            <el-radio-button label="重要告警" :value="3"> </el-radio-button>
            <el-radio-button label="一般告警" :value="4"> </el-radio-button>
        </el-radio-group>
    </el-card>
    <el-card class="mt" v-for="item in alarmList" :key="item.id" v-loading="loading">
        <el-alert :title="`${item.address}充电桩充电异常`" type="warning" show-icon />
        <el-descriptions :border="true" :column="2" class="mt alarm-descriptions">
            <el-descriptions-item label="故障描述">
                {{ item.description || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="设备地址">
                {{ item.address || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="设备号">
                {{ item.equNo || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="告警级别">
                <el-tag :type="item.level==1?'danger':(item.level==2?'warning':(item.level==3?'info':'success'))">
                    {{ item.level==1?'严重':(item.level==2?'紧急':(item.level==3?'重要':'一般')) }}
                </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="故障时间">
                {{ item.time || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="故障代码">
                {{ item.code || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="当前状态">
                <el-text :type="item.status==1?'danger':(item.status==2?'warning':(item.status==3?'success':'danger'))">
                    {{ item.status==1?"待指派":(item.status==2?"处理中":(item.status==3?"已处理":"处理异常")) }}
                </el-text>
            </el-descriptions-item>
            <el-descriptions-item label="操作">
                <el-button 
                    @click="handleAction(item)" 
                    :type="item.status==2?'warning':'primary'"
                    :disabled="item.status==3"
                    size="small"
                > 
                    {{ item.status==1?"指派":(item.status==2?"催办":"查看") }} 
                </el-button>
            </el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-drawer
        v-model="drawer"
        title="报警任务指派"
  >
    <StepForm :steps="steps" :form1="form1" :form2="form2" :form3="form3" @handle-submit="handleSubmit">
        <template #step-1>
            <el-form :model="formData.basicInfo" :rules="basicRules" ref="form1">
                <el-form-item label="姓名：" prop="name">
                    <el-input  v-model="formData.basicInfo.name"/>
                </el-form-item>
                <el-form-item label="邮箱：" prop="email">
                    <el-input  v-model="formData.basicInfo.email"/>
                </el-form-item>
                <el-form-item label="电话：" prop="tel">
                    <el-input  v-model="formData.basicInfo.tel"/>
                </el-form-item>
                <el-form-item label="工号：" prop="no">
                    <el-input  v-model="formData.basicInfo.no"/>
                </el-form-item>
                <el-form-item label="是否加急：">
                    <el-switch v-model="formData.basicInfo.urgent"></el-switch>
                </el-form-item>
                <el-form-item label="其他选项：">
                    <el-checkbox-group v-model="formData.basicInfo.other">
                        <el-checkbox value="1">更换设备</el-checkbox>
                        <el-checkbox value="2">仅维修</el-checkbox>
                        <el-checkbox value="3">需拍照片</el-checkbox>
                        <el-checkbox value="4">需报备</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="其他备注信息：">
                    <el-input  v-model="formData.basicInfo.remarks" type="textarea"/>
                </el-form-item>
            </el-form>
        </template>
        <template #step-2>
            <el-form :model="formData.shenpi" ref="form2" :rules="shenpiRules">
                <el-form-item label="审批部门" prop="a">
                    <el-select placeholder="请选择审批部门" v-model="formData.shenpi.a">
                        <el-option label="总裁办" value="1"></el-option>
                        <el-option label="运营部" value="2"></el-option>
                        <el-option label="维修部" value="3"></el-option>
                        <el-option label="市场部" value="4"></el-option>
                        <el-option label="财务部" value="5"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item  label="抄送部门" prop="b">
                    <el-select placeholder="请选择抄送部门" v-model="formData.shenpi.b">
                        <el-option label="总裁办" value="1"></el-option>
                        <el-option label="运营部" value="2"></el-option>
                        <el-option label="维修部" value="3"></el-option>
                        <el-option label="市场部" value="4"></el-option>
                        <el-option label="财务部" value="5"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </template>
        <template #step-3>
            <el-form :model="formData.info" :rules="infoRules" ref="form3">
                <el-form-item label="负责人姓名：" prop="person">
                    <el-input  v-model="formData.info.person"/>
                </el-form-item>
                <el-form-item label="负责人电话：" prop="tel">
                    <el-input  v-model="formData.info.tel"/>
                </el-form-item>
                
            </el-form>
        </template>
    </StepForm>
    <el-result
        v-if="currentAlarmId && urgeCount > 0"
        icon="warning"
        :title="`设备编号：${alarmList.find(a => a.id === currentAlarmId)?.equNo || ''}`"
        :sub-title="`该任务已催促${urgeCount}次，请抓紧处理`"
      >
        <template #extra>
          <el-button type="primary" @click="drawer=false">我已知晓</el-button>
        </template>
      </el-result>
  </el-drawer>
</template>
<script setup lang="ts">
import {ref, watch} from "vue"
import {getAlarmListApi, assignAlarmTaskApi, urgeAlarmTaskApi, getAlarmUrgeCountApi} from "@/api/alarm"
import { onMounted } from "vue";
import StepForm from "@/components/stepForm/StepForm.vue"
import { FormInstance } from "element-plus";
import { ElMessage } from 'element-plus'
const radio1=ref<number>(1);
const loading = ref<boolean>(false);
const currentAlarmId = ref<number | null>(null);
const urgeCount = ref<number>(0);

interface AlarmListType{
    id: number,
    description: string,
    address: string,
    equNo: string,
    level: number,//1严重 2紧急 3重要 4一般
    time: string,
    code: number,//故障代码
    status: number,//1待指派 2处理中 3已处理 4处理异常
}
const alarmList=ref<AlarmListType[]>([])

const loadAlarmList = async () => {
    loading.value = true;
    try {
        const res = await getAlarmListApi({
            level: radio1.value,
            page: 1,
            pageSize: 100 // 获取所有数据，前端不做分页
        });
        if (res.code === 200 && res.data) {
            alarmList.value = res.data.list || [];
        } else {
            ElMessage.error(res.message || '获取报警列表失败');
        }
    } catch (error: any) {
        console.error('加载报警列表失败:', error);
        ElMessage.error(error.message || '加载报警列表失败');
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadAlarmList();
})

// 监听级别变化，重新加载数据
watch(radio1, () => {
    loadAlarmList();
})

const drawer=ref<boolean>(false)
const steps=[
    {title:"基本信息"},
    {title:"审批信息"},
    {title:"负责人信息"},
]

const formData=ref({
    basicInfo:{
        name:"",
        email:"",
        tel:"",
        no:"",
        urgent:true,
        other:[],
        remarks:""
    },
    shenpi:{
        a:"",
        b:""
    },
    info:{
        person:"",
        tel:""
    }
})

const basicRules={
    name:[
        {required:true,message:"请输入姓名",trigger:"blur"}
    ],
    email:[
        {required:true,message:"请输入邮箱",trigger:"blur"}
    ],
    tel:[
        {required:true,message:"请输入电话",trigger:"blur"}
    ],
    no:[
        {required:true,message:"请输入工号",trigger:"blur"}
    ]
}

const shenpiRules={
    a:[
        {required:true,message:"不能为空",trigger:"blur"}
    ],
    b:[
        {required:true,message:"不能为空",trigger:"blur"}
    ],
}

const infoRules={
    person:[
        {required:true,message:"不能为空",trigger:"blur"}
    ],
    tel:[
        {required:true,message:"不能为空",trigger:"blur"}
    ],
}
const form1=ref<FormInstance>()
const form2=ref<FormInstance>()
const form3=ref<FormInstance>()

const handleAction = async (alarm: AlarmListType) => {
    currentAlarmId.value = alarm.id;
    
    if (alarm.status === 1) {
        // 待指派，打开指派表单
        drawer.value = true;
        // 重置表单
        formData.value = {
            basicInfo: {
                name: "",
                email: "",
                tel: "",
                no: "",
                urgent: false,
                other: [],
                remarks: ""
            },
            shenpi: {
                a: "",
                b: ""
            },
            info: {
                person: "",
                tel: ""
            }
        };
        urgeCount.value = 0;
    } else if (alarm.status === 2) {
        // 处理中，催办
        try {
            const res = await urgeAlarmTaskApi(alarm.id);
            if (res.code === 200) {
                ElMessage.success(res.message || '催办成功');
                // 重新加载催办次数
                await loadUrgeCount(alarm.id);
                drawer.value = true;
            } else {
                ElMessage.error(res.message || '催办失败');
            }
        } catch (error: any) {
            console.error('催办失败:', error);
            ElMessage.error(error.message || '催办失败');
        }
    } else {
        // 已处理或处理异常，只查看
        drawer.value = true;
        await loadUrgeCount(alarm.id);
    }
}

const loadUrgeCount = async (alarmId: number) => {
    try {
        const res = await getAlarmUrgeCountApi(alarmId);
        if (res.code === 200 && res.data) {
            urgeCount.value = res.data.urgeCount || 0;
        }
    } catch (error) {
        console.error('获取催办次数失败:', error);
    }
}

const handleSubmit=async ()=>{
    if (!currentAlarmId.value) {
        ElMessage.warning('请先选择报警任务');
        return;
    }
    
    // 验证表单
    try {
        await form1.value?.validate();
        await form2.value?.validate();
        await form3.value?.validate();
    } catch (error) {
        ElMessage.warning('请填写完整的表单信息');
        return;
    }
    
    try {
        const res = await assignAlarmTaskApi(currentAlarmId.value, {
            handler: formData.value.info.person,
            handle_note: formData.value.basicInfo.remarks || `指派给${formData.value.info.person}，电话：${formData.value.info.tel}`
        });
        
        if (res.code === 200) {
            ElMessage.success(res.message || '指派成功');
            drawer.value = false;
            // 重新加载报警列表
            loadAlarmList();
        } else {
            ElMessage.error(res.message || '指派失败');
        }
    } catch (error: any) {
        console.error('指派失败:', error);
        ElMessage.error(error.message || '指派失败');
    }
}
</script>
<style scoped lang="less">
.alarm-descriptions {
    :deep(.el-descriptions__table) {
        table-layout: fixed;
        width: 100%;
    }
    
    :deep(.el-descriptions__cell) {
        width: 50%;
        word-break: break-word;
    }
    
    :deep(.el-descriptions__label) {
        width: 120px;
        font-weight: 500;
    }
}
</style>