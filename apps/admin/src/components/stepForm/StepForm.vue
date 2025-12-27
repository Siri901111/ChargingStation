<template>
    <div style="max-width: 600px;">
        <el-steps :active="currentStep" finish-status="success" align-center>
            <el-step v-for="(step, index) in steps" :key="index" :title="step.title" />
        </el-steps>

        <div v-if="currentStep === 0" class="mt">
            <slot name="step-1"></slot>
        </div>
        <div v-if="currentStep === 1" class="mt">
            <slot name="step-2"></slot>
        </div>
        <div v-if="currentStep === 2" class="mt">
            <slot name="step-3"></slot>
        </div>
        <div class="step-buttons mt">
            <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="nextStep">
                {{ currentStep === steps.length - 1 ? "提交" : "下一步" }}
            </el-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
const currentStep = ref<number>(0)
const props=defineProps(["steps","form1","form2","form3"])
const emit=defineEmits(["handleSubmit"])
const prevStep=()=>{
    if(currentStep.value>0){
        currentStep.value--
    }
}
const nextStep=()=>{
    const forms=[props.form1,props.form2,props.form3];
    const currentForm=forms[currentStep.value];
    currentForm.validate((valid:boolean)=>{
            if(valid){
                if(currentStep.value<props.steps.length-1){
                    currentStep.value++
                }else{
                    //
                    emit("handleSubmit")
                }
            }
        })    
}
</script>