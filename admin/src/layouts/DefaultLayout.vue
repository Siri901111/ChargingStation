<template>
    <el-container>
        <el-aside width="200px">
            <Menu></Menu>
        </el-aside>
        <el-container>
            <el-header>
                <TopHeader/>
            </el-header>
            <el-main>
                <TabsLayout/>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">

import Menu from "@/components/navMenu/Menu.vue"
import TopHeader from "@/components/TopHeader/TopHeader.vue"
import TabsLayout from "@/layouts/TabsLayout.vue"

</script>

<style lang="less" scoped>
.el-aside{
    height: 100vh;
    background-color: white;
    box-shadow: 10px 0 8px -2px rgba(0, 0, 0, 0.2);
}
.el-header{
    padding: 0 !important;
}
.el-main{
    height: 80vh;
    overflow: auto;
}
</style>