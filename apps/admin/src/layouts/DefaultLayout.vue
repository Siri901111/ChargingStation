<template>
    <el-container :class="{ 'layout-dark': isDark }">
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
import { useThemeStore } from "@/store/theme"
import { storeToRefs } from "pinia"

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
</script>

<style lang="less" scoped>
.el-container {
    transition: all 0.3s;

    &.layout-dark {
        .el-aside {
            background-color: #1f1f1f;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
        }

        .el-main {
            background-color: #141414;
        }
    }
}

.el-aside {
    height: 100vh;
    background-color: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.el-header {
    padding: 0 !important;
}

.el-main {
    height: calc(100vh - 60px);
    overflow: auto;
    transition: background-color 0.3s;
}
</style>