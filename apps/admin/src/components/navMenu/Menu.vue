<template>
    <div class="menu-wrapper">
        <div class="logo" @click="handleClick">
            <img :src="logo" width="34" height="34" alt="Logo">
            <h1 class="logo-title" >动力港</h1>
        </div>
        <el-scrollbar class="menu-scroll">
            <el-menu
                :default-active="currentMenuName"
                :router="false"
                class="menu-nav"
                :collapse="false"
            >
                <menu-item v-for="item in menuitems" :item="item" :key="item.name" />
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { computed , ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/auth'
import MenuItem from "./MenuItem.vue"
import logo from "@/assets/logo.png"

const route = useRoute()
const userStore = useUserStore()
const menuitems = userStore.menu
const isCollapse = ref(true)
const handleClick = ()=> {
    isCollapse.value = !isCollapse.value
}
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
    background-color: #ffffff;
}

.logo {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 56px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    .logo-title {
        font-size: 18px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.88);
        margin-left: 8px;
    }
}

.menu-nav {
    border-right: none;
    background-color: transparent;

    :deep(.el-menu-item) {
        color: rgba(0, 0, 0, 0.65);

        &:hover {
            background-color: #f0f0f0;
            color: rgba(0, 0, 0, 0.88);
        }

        &.is-active {
            color: var(--el-color-primary);
            background-color: #ecf5ff;
        }
    }

    :deep(.el-sub-menu__title) {
        color: rgba(0, 0, 0, 0.65);

        &:hover {
            background-color: #f0f0f0;
            color: rgba(0, 0, 0, 0.88);
        }
    }

    :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
        color: var(--el-color-primary);
    }
}
</style>
