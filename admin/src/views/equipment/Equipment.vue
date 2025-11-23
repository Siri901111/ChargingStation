<template>
    <el-card>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-input v-model="searchParams.no" placeholder="请输入会员卡号">
                </el-input>
            </el-col>
            <el-col :span="6">
                <el-input v-model="searchParams.tel" placeholder="请输入手机号">
                </el-input>
            </el-col>
            <el-col :span="6">
                <el-input v-model="searchParams.name" placeholder="请输入姓名">
                </el-input>
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
            <el-table-column prop="memberCardNumber" label="会员卡号"></el-table-column>
            <el-table-column prop="cardType" label="卡类型"></el-table-column>
            <el-table-column prop="issueDate" label="开卡日期"></el-table-column>
            <el-table-column prop="holderName" label="持有人姓名"></el-table-column>
            <el-table-column prop="holderPhone" label="持有人电话"></el-table-column>
            <el-table-column prop="cardBalance" label="卡余额"></el-table-column>
            <el-table-column prop="transactionRecords" label="消费记录">
                <template #default="scope">
                    <el-popover placement="top-start" title="消费记录" :width="200" trigger="hover"
                        content="this is content, this is content, this is content">
                        <template #reference>
                            <el-button class="m-2" >消费记录</el-button>
                        </template>
                        <el-timeline style="max-width: 600px;">
                            <el-timeline-item v-for="(item,index) in scope.row.transactionRecords" color="#0bbd87" :timestamp="item.transactionDate" :key="index">
                                <p>消费金额：{{ item.transactionAmount }}</p>
                                <p>消费类型：{{ item.transactionType }}</p>
                            </el-timeline-item>
                        </el-timeline>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column prop="validUntil" label="有效期至"></el-table-column>
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

<script lang="ts" setup>
import { ref } from "vue"
import { useHttp } from "@/hooks/useHttp";
const searchParams = ref({
    no: "",
    tel: "",
    name: ""
})
const { dataList, loading, loadData, totals, pageInfo, handleCurrentChange, handleSizeChange,resetPagination } = useHttp("/member", searchParams)

const handleReset=()=>{
    searchParams.value={
        no: "",
        tel: "",
        name: ""
    }
    resetPagination()
}
</script>