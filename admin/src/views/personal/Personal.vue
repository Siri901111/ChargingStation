<template>
    <el-row :gutter="20">
        <el-col :span="12">
            <el-card>
                <el-descriptions direction="vertical" border style="margin-top: 20px">
                    <el-descriptions-item :rowspan="2" :width="140" label="个人头像" align="center">
                        <el-image style="width: 100px; height: 100px"
                            src="https://api.dicebear.com/7.x/miniavs/svg?seed=9" />
                    </el-descriptions-item>
                    <el-descriptions-item label="姓名">赖军</el-descriptions-item>
                    <el-descriptions-item label="电话">18100000000</el-descriptions-item>
                    <el-descriptions-item label="地址">北京市朝阳区</el-descriptions-item>
                    <el-descriptions-item label="个人标签">
                        <el-tag type="primary" class="mr">认真</el-tag>
                        <el-tag type="success" class="mr">工作狂</el-tag>
                        <el-tag type="info" class="mr">与人和善</el-tag>
                        <el-tag type="warning" class="mr">代码洁癖</el-tag>
                    </el-descriptions-item>
                   
                </el-descriptions>
            </el-card>
            <el-card class="mt">
                <el-calendar v-model="value" />
            </el-card>
            <el-card class="mt">
                <template #header>
                    <div class="card-header">
                        <span>完善个人资料</span>
                    </div>
                </template>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <StepForm :steps="steps" :form1="form1" :form2="form2" @handle-submit="handleSubmit">
                            <template #step-1>
                                <el-form :model="formData.basicInfo" ref="form1">
                                    <el-form-item label="姓名">
                                        <el-input v-model="formData.basicInfo.name"/>
                                    </el-form-item>
                                    <el-form-item label="电话">
                                        <el-input v-model="formData.basicInfo.tel"/>
                                    </el-form-item>
                                    <el-form-item label="地址">
                                        <el-input v-model="formData.basicInfo.address"/>
                                    </el-form-item>
                                </el-form>
                            </template>
                            <template #step-2>
                                <el-form :model="formData.job" ref="form2">
                                    <el-select placeholder="请选择在职状态" v-model="formData.job.status">
                                        <el-option label="工作中" value="1"> </el-option>
                                        <el-option label="请假中" value="2"> </el-option>
                                        <el-option label="出差中" value="3"> </el-option>
                                        <el-option label="年假中" value="4"> </el-option>
                                    </el-select>
                                </el-form>
                            </template>
                        </StepForm>
                    </el-col>
                    <el-col :span="8">
                        <div style="display: flex;align-items: center;flex-direction: column;justify-content: space-around;">
                            <h1 style="margin-bottom: 40px;" class="mt">资料完善度</h1>
                            <el-progress type="circle" :percentage="85" />
                        </div>
                       
                    </el-col>
                </el-row>
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card>
                <el-badge :value="12" class="mr">
                    <el-button>待办事项</el-button>
                </el-badge>
                <el-badge :value="3" class="mr">
                    <el-button>指派给我</el-button>
                </el-badge>
                <el-badge :value="12" class="mr">
                    <el-button>部门公告</el-button>
                </el-badge>
                <el-badge :value="3" class="mr">
                    <el-button>站内信</el-button>
                </el-badge>
                <el-badge :value="1" class="mr" type="primary">
                    <el-button>我指派的</el-button>
                </el-badge>
            </el-card>
            <el-card class="mt">
                <el-collapse>
                    <el-collapse-item title="账号注销通知！" name="1">
                        <div style="display: flex;justify-content: space-between;" class="mt">
                            <h3>员工离职，账号需要注销，请及时处理！</h3>
                            <el-button type="primary" size="small" class="mr" v-permission="'admin'">去处理</el-button>
                        </div>
                    </el-collapse-item>
                    <el-collapse-item title="权限变更通知！" name="2">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>王丽丽因部门调动账号权限需调整！</h3>
                               <el-button type="primary" size="small" class="mr" v-permission="'user'">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="财务放款通知！" name="3">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>北京充电站充电桩维修放款！</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="人员调动通知！" name="4">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>李继维由行政部转为维修部，需要办理！</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="出差费用报销审批" name="5">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>运营部7人出差，报销费用8700元需审批</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="财务放款通知！" name="6">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>北京充电站充电桩维修放款！</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="人员调动通知！" name="7">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>李继维由行政部转为维修部，需要办理！</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="出差费用报销审批" name="8">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>运营部7人出差，报销费用8700元需审批</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="账号注销通知！" name="9">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>员工离职，账号需要注销，请及时处理</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="权限变更通知！" name="10">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>王丽丽因部门调动账号权限需调整！</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                        <el-collapse-item title="财务放款通知！" name="11">
                            <div style="display: flex;justify-content: space-between;">
                               <h3>北京充电站充电桩维修放款！</h3>
                               <el-button type="primary" size="small" class="mr">去处理</el-button>
                            </div>
                            
                        </el-collapse-item>
                </el-collapse>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StepForm from '@/components/stepForm/StepForm.vue';
import { FormInstance } from 'element-plus';
const value = ref(new Date())
const steps=[
    {title:"基本信息"},
    {title:"在职信息"}
]
const form1=ref<FormInstance>()
const form2=ref<FormInstance>()
const formData=ref({
    basicInfo:{
        name:"",
        address:"",
        tel:""
    },
    job:{
        status:""
    }
})

const handleSubmit=()=>{
    console.log("表单数据",formData.value)

}

</script>