<template>
    <el-card>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-input placeholder="请输入订单号" v-model="searchParams.orderNo"/>
            </el-col>
            <el-col :span="6">
                <el-select placeholder="订单状态"  v-model="searchParams.status">
                    <el-option label="全部" :value="1"></el-option>
                    <el-option label="进行中" :value="2"></el-option>
                    <el-option label="已完成" :value="3"></el-option>
                    <el-option label="异常" :value="4"></el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
                <el-input placeholder="设备编号"  v-model="searchParams.no"/>
            </el-col>
            <el-col :span="6">
                <el-button type="primary" @click="loadData">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
            </el-col>
            <el-col :span="6" class="mt">
                <el-input placeholder="请输入站点名称"  v-model="searchParams.name"/>
            </el-col>
            <el-col :span="6" class="mt">
                <el-date-picker
                    v-model="date"
                    type="daterange"
                    range-separator="/"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    @change="handleChange"
                    value-format="YYYY-MM-DD"
                />
            </el-col>
        </el-row>
    </el-card>
    <el-card class="mt">
        <el-button type="danger" :disabled="!selectionList.length" @click="handleBatchDelete">批量删除</el-button>
        <el-button type="primary" icon="Download" :disabled="!selectionList.length" @click="exportToExcel">导出订单数据到Excel</el-button>
    </el-card>
    <el-card class="mt">
        <el-table :data="dataList" v-loading="loading" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" label="序号" width="80"></el-table-column>
            <el-table-column label="订单号" prop="orderNo"></el-table-column>
            <el-table-column label="设备编号" prop="equipmentNo"></el-table-column>
            <el-table-column label="订单日期" prop="date"></el-table-column>
            <el-table-column label="开始时间" prop="startTime"></el-table-column>
            <el-table-column label="结束时间" prop="endTime"></el-table-column>
            <el-table-column label="金额" prop="money"></el-table-column>
            <el-table-column label="支付方式" prop="pay"></el-table-column>
            <el-table-column label="订单状态" prop="status">
                <template #default="scope">
                    <el-tag type="success" v-if="scope.row.status==2">进行中</el-tag>
                    <el-tag type="primary" v-else-if="scope.row.status==3">已完成</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.status==4">异常</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="handleDetail(scope.row.orderNo)">详情</el-button>
                    <el-button type="danger" size="small">删除</el-button>
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
</template>
<script setup lang="ts">
import {useHttp} from "@/hooks/useHttp"
import {ref,watch} from "vue"
import {batchDeleteApi} from "@/api/operation"
import  {ElMessage} from "element-plus"
import { useRouter,useRoute } from "vue-router"
import { useTabsStore } from "@/store/tabs"
import * as XLSX from "xlsx";
import {saveAs} from "file-saver"
interface SearchType{
    orderNo:string,
    status:number,
    no:string,
    name:string,
    startDate:string,
    endDate:string
}

interface SelectionListType{
    orderNo:string,
    equipmentNo:string,
    date:string,
    startTime:string,
    endTime:string,
    money:string,
    pay:string,
    status:number
}

const date=ref()
const searchParams=ref<SearchType>({
    orderNo:"",
    status:1,
    no:"",
    name:"",
    startDate:"",
    endDate:""
})
const handleChange=(val:string[])=>{
    searchParams.value.startDate=val[0]
    searchParams.value.endDate=val[1]
}
const { 
        dataList,
        loading,
        totals,
        pageInfo,
        loadData,
        handleSizeChange,
        handleCurrentChange,
        resetPagination
    }= useHttp<SelectionListType>("/orderList",searchParams);
const handleReset=()=>{
    date.value=""
    searchParams.value={
        orderNo:"",
        status:1,
        no:"",
        name:"",
        startDate:"",
        endDate:""
    }
    resetPagination()
}

const selectionList=ref<SelectionListType[]>([])
const handleSelectionChange=(selection:SelectionListType[])=>{
    selectionList.value=selection
}

const handleBatchDelete=async ()=>{
  try {
    const res= await batchDeleteApi(selectionList.value.map((item:SelectionListType)=>item.orderNo));
    if(res.code){
        ElMessage({
            message:res.data,
            type:"success"
        });
        loadData();
    }
  } catch (error) {
    console.log(error)
  }  

}
const router=useRouter()
const tabsStore=useTabsStore()
const {addTab,setCurrentTab}=tabsStore
const handleDetail=(orderNo:string)=>{
    addTab("订单详情","/operations/detail","Share")
    setCurrentTab("订单详情","/operations/detail")
    router.push("/operations/detail?orderNo="+orderNo);
}

const route=useRoute();
watch(()=>route.name,(to,from)=>{
    console.log(to,from);
    if(to=="orders"&&from!="detail"){
        loadData()
    }
})

const exportToExcel=()=>{
    const ws=XLSX.utils.json_to_sheet(selectionList.value);//把数据转成工作表格式
    const wb=XLSX.utils.book_new();//创建新的工作簿
    XLSX.utils.book_append_sheet(wb,ws,"Sheet1");//工作簿加到工作表中
    const wbout=XLSX.write(wb,{bookType:"xlsx",type:"array"})
    const blob=new Blob([wbout],{type:"application/octet-stream"});
    saveAs(blob,"导入的数据.xlsx")
}
</script>


