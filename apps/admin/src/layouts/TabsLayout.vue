<template>
    <div class="tabs-wrapper">
        <el-tabs
            v-model="activeTabName"
            type="card"
            closable
            class="tabs-nav"
            @tab-click="handleClick"
            @tab-remove="remove"
        >
            <el-tab-pane
                v-for="item in tabs"
                :key="item.url"
                :label="item.name"
                :name="item.name"
            >
                <template #label>
                    <span class="custom-tabs-label">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span>&nbsp;{{ item.name }}</span>
                    </span>
                </template>
            </el-tab-pane>
        </el-tabs>
    </div>
    <div class="content-wrapper">
        <RouterView v-slot="{ Component }">
            <KeepAlive>
                <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
            </KeepAlive>
            <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
        </RouterView>
    </div>
</template>

<script setup lang="ts">
import { useTabsStore } from "@/store/tabs"
import { useUserStore } from "@/store/auth"
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from "vue-router"
import { computed, watch } from "vue"

const tabsStore = useTabsStore()
const userStore = useUserStore()
const { menu } = storeToRefs(userStore)
const router = useRouter()
const route = useRoute()

const { tabs, currentTab } = storeToRefs(tabsStore)
const { setCurrentTab, addTab, removeTab } = tabsStore

// 计算属性用于 v-model 绑定
const activeTabName = computed({
    get: () => currentTab.value.name,
    set: (val: string) => {
        const tab = tabs.value.find(t => t.name === val)
        if (tab) {
            setCurrentTab(tab.name, tab.url)
        }
    }
})

function findObjectByUrl(arr: any[], url: string) {
    for (const item of arr) {
        if (item.url === url) {
            return item
        }
        if (item.children) {
            const found: any = findObjectByUrl(item.children, url)
            if (found) {
                return found
            }
        }
    }
    return null
}

// 在路由变化时添加tab
watch(() => route.path, (newPath) => {
    const menuItem = findObjectByUrl(menu.value, newPath)
    if (menuItem && menuItem.name && menuItem.url && menuItem.icon) {
        addTab(menuItem.name, menuItem.url, menuItem.icon)
        setCurrentTab(menuItem.name, menuItem.url)
    }
}, { immediate: true })

const handleClick = (tab: any) => {
    const index = tabs.value.findIndex(t => t.name === tab.paneName)
    if (index !== -1) {
        router.push(tabs.value[index].url)
        setCurrentTab(tabs.value[index].name, tabs.value[index].url)
    }
}

const remove = (TabPaneName: string) => {
    removeTab(TabPaneName)
    router.push(currentTab.value.url)
}
</script>

<style lang="less" scoped>
.tabs-wrapper {
    background-color: var(--bg-container);
    border-bottom: 1px solid var(--border-color-light);
    transition: all 0.3s ease;
}

.tabs-nav {
    :deep(.el-tabs__header) {
        margin: 0;
        border-bottom: none;
        background-color: transparent;
    }

    :deep(.el-tabs__nav) {
        border: none;
    }

    :deep(.el-tabs__item) {
        color: var(--text-secondary);
        border: 1px solid var(--border-color-light);
        border-bottom: none;
        background-color: transparent;
        transition: all 0.3s ease;
        margin-right: 4px;

        &:hover {
            color: var(--text-primary);
        }

        &.is-active {
            color: #fff;
            background-color: var(--el-color-primary);
            border-color: var(--el-color-primary);
        }
    }
}

.content-wrapper {
    padding: 16px;
    height: calc(100vh - 56px - 41px - 32px);
    overflow: auto;
}
</style>
