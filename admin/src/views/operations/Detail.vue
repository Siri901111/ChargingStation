<template>
    <el-card>
        <el-descriptions :title="`订单编号：${$route.query.orderNo}`">
            <el-descriptions-item label="订单编号">{{$route.query.orderNo}}</el-descriptions-item>
            <el-descriptions-item label="设备编号">C2274</el-descriptions-item>
            <el-descriptions-item label="订单日期">2024-10-01</el-descriptions-item>
            <el-descriptions-item label="站点名称">
                <el-tag size="small">北京西单充电站</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
               08:00:23
            </el-descriptions-item>
            <el-descriptions-item label="结束时间">09:10:11</el-descriptions-item>
            <el-descriptions-item label="订单金额(元)">66.5</el-descriptions-item>
            <el-descriptions-item label="支付方式">支付宝</el-descriptions-item>
            <el-descriptions-item label="所属城市">北京</el-descriptions-item>
            <el-descriptions-item label="充电量(度)">86</el-descriptions-item>
            <el-descriptions-item label="充电设备">充电桩(快充)</el-descriptions-item>
            <el-descriptions-item label="充电总时长(小时)">2</el-descriptions-item>
            <el-descriptions-item label="负责人姓名">王科</el-descriptions-item>
            <el-descriptions-item label="负责人电话">18888888888</el-descriptions-item>
            <el-descriptions-item label="维保人员姓名">刘来</el-descriptions-item>
            <el-descriptions-item label="维保人员电话">17777777777</el-descriptions-item>
            <el-descriptions-item label="订单状态">已完成</el-descriptions-item>
            <el-descriptions-item label="服务费(元)">8.0</el-descriptions-item>
            <el-descriptions-item label="停车费(元)">4.0</el-descriptions-item>
            <el-descriptions-item label="电费(元)">54.0</el-descriptions-item>
            <el-descriptions-item label="收费信息">
                电费+服务费+停车费，高峰时段费用位2.3元1度，停车费2元/小时，服务费5元/次
            </el-descriptions-item>
            <el-descriptions-item label="备注">暂无</el-descriptions-item>
        </el-descriptions>
    </el-card>
    
</template>