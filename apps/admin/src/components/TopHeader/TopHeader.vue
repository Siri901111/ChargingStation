<template>
    <header class="top-header">
        <!-- 左侧功能区 -->
        <div class="header-left">
            <HeaderActions />
        </div>

        <!-- 右侧功能区 -->
        <div class="header-right">
            <!-- 主题切换 -->
            <ThemeToggle />

            <!-- 语言切换 -->
            <LocaleSwitcher />

            <!-- 消息通知 -->
            <NotificationBell />

            <!-- 分隔线 -->
            <div class="divider"></div>

            <!-- 用户信息 -->
            <UserMenu />
        </div>
    </header>
</template>

<script setup lang="ts">
import HeaderActions from './components/HeaderActions.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import LocaleSwitcher from './components/LocaleSwitcher.vue'
import NotificationBell from './components/NotificationBell.vue'
import UserMenu from './components/UserMenu.vue'
</script>

<style lang="less" scoped>
.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
    padding: 0 16px;
    background-color: var(--bg-container);
    border-bottom: 1px solid var(--border-color-light);
    transition: all 0.3s ease;
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
    background-color: var(--border-color);
    margin: 0 12px;
}
</style>
