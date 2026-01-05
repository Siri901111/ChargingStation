<template>
    <header class="top-header">
        <!-- 左侧功能区 -->
        <div class="header-left">
            <HeaderActions />
        </div>

        <!-- 右侧功能区 -->
        <div class="header-right">
            <!-- 语言切换 -->
            <LocaleSwitcher />

            <!-- 消息通知 -->
            <NotificationBell />

            <!-- 文档查看 -->
            <DocumentViewer />

            <!-- 分隔线 -->
            <div class="divider"></div>

            <!-- 用户信息 -->
            <UserMenu />
        </div>
    </header>
</template>

<script setup lang="ts">
import HeaderActions from './components/HeaderActions.vue'
import LocaleSwitcher from './components/LocaleSwitcher.vue'
import NotificationBell from './components/NotificationBell.vue'
import DocumentViewer from './components/DocumentViewer.vue'
import UserMenu from './components/UserMenu.vue'
</script>

<style lang="less" scoped>
.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
    padding: 0 16px;
    background-color: #ffffff;
    border-bottom: 1px solid #f0f0f0;
}

.header-left,
.header-right {
    display: flex;
    align-items: center;
    gap: 4px;
}

.divider {
    width: 1px;
    height: 24px;
    background-color: #d9d9d9;
    margin: 0 12px;
}
</style>
