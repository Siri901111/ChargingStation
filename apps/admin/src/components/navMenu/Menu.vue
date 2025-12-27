<template>
    <div class="menu-wrapper" :class="{ 'menu-dark': isDark }">
        <div class="logo">
            <img :src="logo" width="34px" height="34px">
            <h1>动力港</h1>
        </div>
        <el-menu
            :default-active="currentMenuName"
            :router="false"
            :background-color="isDark ? '#1f1f1f' : '#fff'"
            :text-color="isDark ? '#ffffffa6' : '#303133'"
            :active-text-color="isDark ? '#fff' : 'var(--el-color-primary)'"
        >
           <menu-item v-for="item in menuitems" :item="item" :key="item.name"></menu-item>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { storeToRefs } from 'pinia';
import MenuItem from "./MenuItem.vue"
import logo from "@/assets/logo.png"

const route = useRoute();
const userStore = useUserStore();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
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
.menu-wrapper {
    height: 100%;
    transition: all 0.3s;

    &.menu-dark {
        background-color: #1f1f1f;

        .logo h1 {
            color: #fff;
        }
    }
}

.logo {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    padding: 10px 0;

    img {
        margin-left: -10px;
    }

    h1 {
        color: #333;
        margin-left: 10px;
        font-size: 22px;
        transition: color 0.3s;
    }
}

.el-menu {
    border-right: none;
}
</style>
