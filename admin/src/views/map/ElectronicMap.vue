<template>
    <el-row :gutter="20">
        <el-col :span="18">
            <el-card >
                <MapContainer/>
            </el-card>
        </el-col>
        <el-col :span="6">
            <el-card class="des">
                <div>1.累计充电站数量：<el-text type="primary">34个</el-text></div>
                <div>2.单省份最多充电桩：<el-text type="primary">北京(4个)</el-text></div>
                <div>3.充电站遍及省份：<el-text type="primary">14个</el-text></div>
                <div>4.暂无充电站省份：<el-text type="primary">22个</el-text></div>
                <div>5.累计充电站：<el-text type="primary">北京(4个)</el-text></div>
                <div>6.单日营收最高：<el-text type="primary">北京西单充电站</el-text></div>
                <div>7.单日营收最低：<el-text type="primary">南宁青秀山充电站</el-text></div>
                <div>8.故障率最高：<el-text type="primary">兰州黄河桥充电站</el-text></div>
            </el-card>
            <el-card class="mt">
                <template #header>
                    <div class="card-header">
                        <h3>新增站点地图</h3>
                    </div>
                </template>
                <el-form :model="form" style="max-width: 600px;" label-width="85px">
                    <el-form-item label="站点名称：">
                        <el-input placeholder="请输入站点名称" v-model="form.name"/>
                    </el-form-item>
                    <el-form-item label="站点地址">
                        <el-input placeholder="请输入站点地址" v-model="form.region"/>
                    </el-form-item>
                    <el-form-item label="经度：">
                        <el-input placeholder="请输入经度" v-model="form.location1"/>
                    </el-form-item>
                    <el-form-item label="维度：">
                        <el-input placeholder="请输入维度" v-model="form.location2"/>
                    </el-form-item>
                    <el-form-item label="立即使用：">
                        <el-switch v-model="form.now"/>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input placeholder="请输入备注" type="textarea" v-model="form.remarks"/>
                    </el-form-item>
                    <el-form-item >
                        <el-button type="primary">创建</el-button>
                        <el-button >清空</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
    </el-row>
    <MapContainer/>
</template>
<script setup lang="ts">
    import MapContainer from "@/components/map/MapContain.vue"
    import {reactive} from "vue"
    const form=reactive({
        name:"",
        region:"",
        location1:"",
        location2:"",
        now:"",
        remarks:""
    })
</script>
<style scoped>
    .des{line-height: 35px;}
</style>