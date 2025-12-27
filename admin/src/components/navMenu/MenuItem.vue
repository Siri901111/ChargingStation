<template>
    <el-sub-menu v-if="item.children" :index="item.name">
        <template #title>
            <el-icon>
                <component :is="item.icon"></component>
            </el-icon>
            <span>{{ item.name }}</span>
        </template>
        <my-menu v-for="child in item.children" :key="child.name" :item="child"></my-menu>
    </el-sub-menu>
    <el-menu-item v-else :index="item.name" @click="handleClick" v-show="!(item.name=='订单详情')">
        <el-icon>
            <component :is="item.icon"></component>
        </el-icon>
        <span>{{ item.name }}</span>
    </el-menu-item>
</template>

<script lang="ts">
import {defineComponent,PropType} from "vue"
import {MenuItem as MenuItemType} from "@/types/user"
import { useTabsStore } from "@/store/tabs";
import { useRouter } from "vue-router";

export default defineComponent({
    name:"MyMenu",
    props:{
        item:{
            type:Object as PropType<MenuItemType>,
            required:true
        }
    },
    setup(props){
        const tabsStore=useTabsStore();
        const router=useRouter();
        const {addTab,setCurrentTab}=tabsStore;

        const handleClick = () => {
            const { name, url, icon } = props.item;
            if (name && url && icon) {
                addTab(name, url, icon);
                setCurrentTab(name, url);
                router.push(url);
            }
        }

        return { handleClick }
    }
})
</script>

<style scoped lang="less">
.is-active{
    background-color: rgb(34, 136, 255);color: #fff !important;
    div{
        span{
            color: #fff;
        }
    }
}
.el-menu-item:hover{
    background-color:rgb(34, 136, 255) !important;color: #fff !important ;
}
::v-deep .el-sub-menu__title:hover{
    background-color:rgb(34, 136, 255) !important;color: #fff !important ;
}
</style>
