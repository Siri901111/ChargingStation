<template>
    <el-tabs v-model="activeTabName" class="demo-tabs" @tab-click="handleClick" type="card" closable @tab-remove="remove">
        <el-tab-pane
            v-for="item in tabs"
            :key="item.url"
            :label="item.name"
            :name="item.name"
        >
            <template #label>
                <span class="custom-tabs-label">
                    <el-icon>
                        <component :is="item.icon"></component>
                    </el-icon>
                    <span>&nbsp;{{ item.name }}</span>
                </span>
            </template>

        </el-tab-pane>
    </el-tabs>
    <RouterView v-slot="{Component}">
        <KeepAlive>
            <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive"></component>
        </KeepAlive>
        <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive"></component>
    </RouterView>

    <!-- <RouterView/> -->
</template>
<script setup lang="ts">
import {useTabsStore} from "@/store/tabs.ts"
import { useUserStore } from "@/store/auth";
import { storeToRefs } from 'pinia';
import { useRouter,useRoute } from "vue-router";
import { computed, watch } from "vue";
const tabsStore=useTabsStore();
const userStore=useUserStore();
const {menu}=storeToRefs(userStore)
const router=useRouter()
const route=useRoute();

const {tabs,currentTab}=storeToRefs(tabsStore)
const {setCurrentTab,addTab,removeTab}=tabsStore;

// 计算属性用于 v-model 绑定
const activeTabName = computed({
    get: () => currentTab.value.name,
    set: (val: string) => {
        const tab = tabs.value.find(t => t.name === val);
        if (tab) {
            setCurrentTab(tab.name, tab.url);
        }
    }
});

function findObjectByUrl(arr:any[],url:string){
    for(const item of arr){
        if(item.url===url){
            return item
        }
        if(item.children){
            const found:any=findObjectByUrl(item.children,url);
            if(found){
                return found
            }
        }
    }
    return null
}

// 在路由变化时添加tab
watch(() => route.path, (newPath) => {
    const menuItem = findObjectByUrl(menu.value, newPath);
    if(menuItem && menuItem.name && menuItem.url && menuItem.icon){
        addTab(menuItem.name, menuItem.url, menuItem.icon);
        setCurrentTab(menuItem.name, menuItem.url);
    }
}, { immediate: true });

const handleClick = (tab: any) => {
    const index = tabs.value.findIndex(t => t.name === tab.paneName);
    if (index !== -1) {
        router.push(tabs.value[index].url)
        setCurrentTab(tabs.value[index].name, tabs.value[index].url);//设置当前高亮
    }
}
const remove = (TabPaneName: string) => {
    removeTab(TabPaneName);
    router.push(currentTab.value.url)
}
</script>
<style lang="less" scoped>
    .demo-tabs{
      ::v-deep .is-active{background-color: rgb(34, 136, 255) !important; color: #fff !important;}
    }
</style>
