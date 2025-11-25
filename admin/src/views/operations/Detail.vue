<template>
    <el-card v-loading="loading">
        <el-descriptions :title="`订单编号：${orderDetail.orderNo || $route.query.orderNo}`" :column="2" border>
            <el-descriptions-item label="订单编号">{{orderDetail.orderNo || $route.query.orderNo}}</el-descriptions-item>
            <el-descriptions-item label="设备编号">{{orderDetail.equipmentNo || '-'}}</el-descriptions-item>
            <el-descriptions-item label="订单日期">{{orderDetail.date || '-'}}</el-descriptions-item>
            <el-descriptions-item label="站点名称">
                <el-tag size="small">{{orderDetail.stationName || '-'}}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{orderDetail.startTime || '-'}}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{orderDetail.endTime || '-'}}</el-descriptions-item>
            <el-descriptions-item label="订单金额(元)">{{orderDetail.money || '0.00'}}</el-descriptions-item>
            <el-descriptions-item label="支付方式">{{orderDetail.pay || '-'}}</el-descriptions-item>
            <el-descriptions-item label="所属城市">{{orderDetail.city || '-'}}</el-descriptions-item>
            <el-descriptions-item label="充电量(度)">{{orderDetail.electricity || '0'}}</el-descriptions-item>
            <el-descriptions-item label="充电设备">{{orderDetail.pileType || '-'}}</el-descriptions-item>
            <el-descriptions-item label="充电总时长(小时)">{{orderDetail.duration || '0'}}</el-descriptions-item>
            <el-descriptions-item label="负责人姓名">{{orderDetail.managerName || '-'}}</el-descriptions-item>
            <el-descriptions-item label="负责人电话">{{orderDetail.managerPhone || '-'}}</el-descriptions-item>
            <el-descriptions-item label="维保人员姓名">{{orderDetail.maintenanceName || '-'}}</el-descriptions-item>
            <el-descriptions-item label="维保人员电话">{{orderDetail.maintenancePhone || '-'}}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
                <el-tag :type="getStatusType(orderDetail.status)">
                    {{getStatusText(orderDetail.status)}}
                </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="服务费(元)">{{orderDetail.serviceFee || '0.00'}}</el-descriptions-item>
            <el-descriptions-item label="停车费(元)">{{orderDetail.parkingFee || '0.00'}}</el-descriptions-item>
            <el-descriptions-item label="电费(元)">{{orderDetail.electricityFee || '0.00'}}</el-descriptions-item>
            <el-descriptions-item label="收费信息" :span="2">{{orderDetail.billingInfo || '-'}}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{orderDetail.remarks || '暂无'}}</el-descriptions-item>
        </el-descriptions>
    </el-card>
    
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderDetailApi } from '@/api/operation'
import { ElMessage } from 'element-plus'

const route = useRoute()
const loading = ref<boolean>(false)
const orderDetail = ref<any>({})

const getStatusText = (status: number) => {
    const statusMap: Record<number, string> = {
        1: '全部',
        2: '进行中',
        3: '已完成',
        4: '异常'
    }
    return statusMap[status] || '未知'
}

const getStatusType = (status: number) => {
    const typeMap: Record<number, string> = {
        2: 'success',
        3: 'primary',
        4: 'warning'
    }
    return typeMap[status] || ''
}

const loadOrderDetail = async () => {
    const orderNo = route.query.orderNo as string
    if (!orderNo) {
        ElMessage.warning('订单号不能为空')
        return
    }
    
    loading.value = true
    try {
        const res = await getOrderDetailApi(orderNo)
        if (res.code === 200 && res.data) {
            orderDetail.value = res.data
        } else {
            ElMessage.error(res.message || '获取订单详情失败')
        }
    } catch (error: any) {
        console.error('获取订单详情失败:', error)
        ElMessage.error(error.message || '获取订单详情失败')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadOrderDetail()
})

watch(() => route.query.orderNo, () => {
    if (route.query.orderNo) {
        loadOrderDetail()
    }
})
</script>