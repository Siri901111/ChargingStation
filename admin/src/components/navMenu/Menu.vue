<template>
    <div class="logo">
        <img :src="logo" width="34px" height="34px">
        <h1>动力港</h1>
    </div>
    <el-menu :default-active="$route.path" @select="handleMenuSelect">
       <menu-item v-for="item in menuitems" :item="item" :key="item.url"></menu-item>
    </el-menu>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/auth';
import { useTabsStore } from '@/store/tabs';
import MenuItem from "./MenuItem.vue"
import logo from "@/assets/logo.png"
import { useRouter } from 'vue-router';

const userStore=useUserStore();
const tabsStore=useTabsStore();
const router=useRouter();
const menuitems=userStore.menu

// 处理菜单选择事件（用于添加tab）
const handleMenuSelect = (index: string) => {
    // 递归查找菜单项
    function findMenuItem(items: any[], url: string): any {
        for (const item of items) {
            if (item.url === url) {
                return item;
            }
            if (item.children) {
                const found = findMenuItem(item.children, url);
                if (found) return found;
            }
        }
        return null;
    }
    
    const menuItem = findMenuItem(menuitems, index);
    if (menuItem && menuItem.name && menuItem.url && menuItem.icon) {
        tabsStore.addTab(menuItem.name, menuItem.url, menuItem.icon);
        tabsStore.setCurrentTab(menuItem.name, menuItem.url);
    }
}

</script>

<style scoped lang="less">
    .logo{
        display: flex;justify-content: center;align-items: center;height: 50px;padding: 10px 0;
       img{margin-left: -10px;}
       h1{color: #333; margin-left: 10px; font-size: 22px;}
    }
    .el-menu{border-right: none;}
    
</style>