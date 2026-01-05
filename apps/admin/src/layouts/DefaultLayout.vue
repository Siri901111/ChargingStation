<template>
    <el-container class="layout-container">
        <el-aside width="200px" class="aside-container">
            <Menu />
        </el-aside>
        <el-container class="main-wrapper">
            <el-header class="header-container">
                <TopHeader />
            </el-header>
            <el-main class="main-container">
                <TabsLayout />
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
.layout-container {
    min-height: 100vh;
}

.aside-container {
    height: 100vh;
    background-color: #ffffff;
    border-right: 1px solid #f0f0f0;
    overflow: hidden;
}

.main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.header-container {
    padding: 0 !important;
    height: 56px !important;
    line-height: 56px;
}

.main-container {
    flex: 1;
    background-color: #f0f2f5;
    overflow: auto;
    padding: 0;
}
</style>
