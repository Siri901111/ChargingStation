<template>
   <el-card>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-input v-model.trim="searchParams.name" placeholder="请输入姓名">
                </el-input>
            </el-col>
            <el-col :span="6">
                <el-select placeholder="请选择部门" v-model="searchParams.department">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="总裁办" value="总裁办"></el-option>
                    <el-option label="技术部" value="技术部"></el-option>
                    <el-option label="市场部" value="市场部"></el-option>
                    <el-option label="维修部" value="维修部"></el-option>
                    <el-option label="运营部" value="运营部"></el-option>
                    <el-option label="客服部" value="客服部"></el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
                <el-button type="primary" @click="loadData">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
            </el-col>
        </el-row>
    </el-card>
    <el-card class="mt">
        <el-table :data="dataList" v-loading="loading">
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="account" label="账号"></el-table-column>
            <el-table-column prop="name" label="姓名"></el-table-column>
            <el-table-column prop="phone" label="电话"></el-table-column>
            <el-table-column prop="idNo" label="身份证号"></el-table-column>
            <el-table-column prop="position" label="职位">
                <template #default="scope">
                    <el-tag type="primary">{{ scope.row.position }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="department" label="部门"></el-table-column>
            <el-table-column prop="pageAuthority" label="页面权限">
                <template #default="scope">
                    <el-tag :type="scope.row.pageAuthority === 'admin' ? 'danger' : (scope.row.pageAuthority === 'manager' ? 'warning' : 'success')">
                        {{ scope.row.pageAuthority === 'admin' ? '管理员' : (scope.row.pageAuthority === 'manager' ? '运营专员' : '普通用户') }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="btnAuthority" label="按钮权限">
                <template #default="scope">
                    <el-tag type="info">{{ scope.row.btnAuthority || '-' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
                <template #default="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                        {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column  label="操作" width="280">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="settingAuth(scope.row.pageAuthority,scope.row.account)">
                        权限设置
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope.row.account)">
                        删除
                    </el-button>
                    <el-button 
                        :type="scope.row.status === 1 ? 'warning' : 'success'" 
                        size="small" 
                        @click="handleToggleStatus(scope.row.account, scope.row.status)"
                    >
                        {{ scope.row.status === 1 ? '禁用' : '启用' }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination 
            class="fr mt mb"
            v-model:current-page="pageInfo.page" 
            v-model:page-size="pageInfo.pageSize"
            :page-sizes="[10, 20, 30, 40]" 
            layout="sizes, prev, pager, next, jumper,total" 
            :total="totals" 
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange" 
            background
        />
    </el-card>
    <AuthModal :visible="visible" :checked-keys="checkedKeys" @close="visible=false" :btnAuth="btnAuth" :account="accountNo" @reload="loadData"/>
</template>
<script setup lang="ts">
import {ref} from "vue"
import { useHttp } from "@/hooks/useHttp";
import AuthModal from "./AuthModal.vue"
import {getAuthApi} from "@/api/system"
import {deleteUserApi, toggleUserStatusApi} from "@/api/user"
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MenuItem } from "@/types/user";
interface searchType{
    name:string,
    department:string
}
const searchParams=ref<searchType>({
    name:"",
    department:""
 })

 const {dataList,loading,resetPagination,loadData,totals,pageInfo,handleCurrentChange,handleSizeChange}= useHttp("/api/permissionList",searchParams)

 const visible=ref<boolean>(false)


function collectUrls(tree:MenuItem[]){
    const urls:string[]=[];
    function traverse(node:MenuItem){
        if(node.url&&!node.children){
            urls.push(node.url)
        }
        if(node.children){
            node.children.forEach((child:MenuItem)=>traverse(child))
        }
    }   
    tree.forEach((node:MenuItem)=>traverse(node));
    return urls
}
const btnAuth=ref<string[]>([])
const checkedKeys=ref<string[]>([])
const accountNo=ref<string>("")
 const settingAuth=async (pageAuthority:string,account:string)=>{
   try {
     accountNo.value=account
     const res = await getAuthApi({ pageAuthority });
     if (res.code === 200 && res.data) {
       checkedKeys.value=collectUrls(res.data.list || []);
       btnAuth.value=res.data.btn || []
       visible.value=true
     } else {
       ElMessage.error(res.message || '获取权限信息失败')
     }
   } catch (error: any) {
     console.error('获取权限信息失败:', error)
     ElMessage.error(error.message || '获取权限信息失败')
   }
 }

 const handleReset=()=>{
    searchParams.value={
        name:"",
        department:""
    }
    resetPagination()
}

// 删除用户
const handleDelete = async (account: string) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除用户 "${account}" 吗？此操作不可恢复！`,
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        
        const res = await deleteUserApi({ account });
        if (res.code === 200) {
            ElMessage.success(res.message || '删除成功');
            loadData();
        } else {
            ElMessage.error(res.message || '删除失败');
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('删除用户失败:', error);
            ElMessage.error(error.message || '删除失败');
        }
    }
}

// 禁用/启用用户
const handleToggleStatus = async (account: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 0 ? '禁用' : '启用';
    
    try {
        await ElMessageBox.confirm(
            `确定要${action}用户 "${account}" 吗？`,
            `${action}确认`,
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        
        const res = await toggleUserStatusApi({ account });
        if (res.code === 200) {
            ElMessage.success(res.message || `${action}成功`);
            loadData();
        } else {
            ElMessage.error(res.message || `${action}失败`);
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error(`${action}用户失败:`, error);
            ElMessage.error(error.message || `${action}失败`);
        }
    }
}
</script>