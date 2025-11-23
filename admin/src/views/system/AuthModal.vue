<template>
    <el-dialog title="权限设置" width="600px" :model-value="visible" @open="handleOpen" @close="handleClose">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>页面权限</span>
                </div>
            </template>
            <el-tree ref="treeRef" style="max-width: 600px;" show-checkbox :data="treeData" node-key="url"></el-tree>
        </el-card>
        <el-card class="mt">
            <template #header>
                <div class="card-header">
                    <span>按钮权限</span>
                </div>
            </template>
            <el-checkbox-group v-model="initBtnAuth" class="mt">
                <el-checkbox label="全部" value="all" />
                <el-checkbox label="添加" value="add" />
                <el-checkbox label="编辑" value="edit" />
                <el-checkbox label="删除" value="delete" />
            </el-checkbox-group>
        </el-card>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="$emit('close')">取消</el-button>
                <el-button type="primary" @click="handleConfirm">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>

</template>
<script setup lang="ts">
import { useUserStore } from '@/store/auth';
import { storeToRefs } from 'pinia';
import { transformMenu } from "@/utils/transformMenu"
import {setAuthApi} from "@/api/system"
import { ref } from "vue"
import { ElMessage } from 'element-plus';
const props = defineProps<{ visible: boolean, checkedKeys: string[], btnAuth: string[],account:string }>()
const emit = defineEmits(["close","reload"])
const userStore = useUserStore();
const { menu } = storeToRefs(userStore);
const treeData = ref(transformMenu(menu.value))
const treeRef = ref()
const initBtnAuth = ref<string[]>([])
const handleOpen = () => {
    treeRef.value.setCheckedKeys(props.checkedKeys);
    initBtnAuth.value = props.btnAuth
}
const handleClose = () => {
    emit("close")
}

const handleConfirm=async ()=>{
    const res=await setAuthApi(props.account,treeRef.value.getCheckedKeys(true),initBtnAuth.value)
    if(res.code==200){
        ElMessage({
            message:res.message,
            type:"success"
        })
        emit("close");
        emit("reload")
    }
}

</script>