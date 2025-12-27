<template>
    <div class="logo">
        <img :src="logo" width="34px" height="34px">
        <h1>动力港</h1>
    </div>
    <el-menu :default-active="currentMenuName" :router="false">
       <menu-item v-for="item in menuitems" :item="item" :key="item.name"></menu-item>
    </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/auth';
import MenuItem from "./MenuItem.vue"
import logo from "@/assets/logo.png"

const route = useRoute();
const userStore = useUserStore();
const menuitems = userStore.menu;

// 根据当前路由路径找到对应的菜单名称
const currentMenuName = computed(() => {
    const findMenuName = (items: any[], path: string): string => {
        for (const item of items) {
            if (item.url === path) {
                return item.name;
            }
            if (item.children) {
                const found = findMenuName(item.children, path);
                if (found) return found;
            }
        }
        return '';
    };
    return findMenuName(menuitems, route.path);
});
</script>

<style scoped lang="less">
    .logo{
        display: flex;justify-content: center;align-items: center;height: 50px;padding: 10px 0;
       img{margin-left: -10px;}
       h1{color: #333; margin-left: 10px; font-size: 22px;}
    }
    .el-menu{border-right: none;}
</style>
