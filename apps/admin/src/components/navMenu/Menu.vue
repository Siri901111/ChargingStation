<template>
    <div class="menu-wrapper">
        <div class="logo">
            <img :src="logo" width="34" height="34" alt="Logo">
            <h1 class="logo-title">动力港</h1>
        </div>
        <el-menu
            :default-active="currentMenuName"
            :router="false"
            class="menu-nav"
        >
            <menu-item v-for="item in menuitems" :item="item" :key="item.name" />
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/auth'
import MenuItem from "./MenuItem.vue"
import logo from "@/assets/logo.png"

const route = useRoute()
const userStore = useUserStore()
const menuitems = userStore.menu

// 根据当前路由路径找到对应的菜单名称
const currentMenuName = computed(() => {
    const findMenuName = (items: any[], path: string): string => {
        for (const item of items) {
            if (item.url === path) {
                return item.name
            }
            if (item.children) {
                const found = findMenuName(item.children, path)
                if (found) return found
            }
        }
        return ''
    }
    return findMenuName(menuitems, route.path)
})
</script>

<style scoped lang="less">
.menu-wrapper {
    height: 100%;
    background-color: var(--bg-container);
    transition: background-color 0.3s ease;
}

.logo {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 56px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color-light);

    .logo-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-left: 8px;
        transition: color 0.3s ease;
    }
}

.menu-nav {
    border-right: none;
    background-color: transparent;

    :deep(.el-menu-item) {
        color: var(--text-secondary);
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--border-color-light);
            color: var(--text-primary);
        }

        &.is-active {
            color: var(--el-color-primary);
            background-color: var(--theme-color-light);
        }
    }

    :deep(.el-sub-menu__title) {
        color: var(--text-secondary);
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--border-color-light);
            color: var(--text-primary);
        }
    }

    :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
        color: var(--el-color-primary);
    }
}
</style>
