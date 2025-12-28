<template>
    <el-popover placement="bottom" :width="300" trigger="click">
        <template #reference>
            <div class="header-action" :title="t('header.theme')">
                <el-icon :size="18"><Brush /></el-icon>
            </div>
        </template>
        <div class="theme-panel">
            <!-- 主题模式 -->
            <div class="theme-section">
                <div class="theme-title">{{ t('header.themeMode') }}</div>
                <div class="theme-modes">
                    <div
                        v-for="mode in themeModes"
                        :key="mode.value"
                        class="theme-mode-item"
                        :class="{ active: themeMode === mode.value }"
                        @click="handleThemeModeChange(mode.value)"
                    >
                        <el-icon :size="20"><component :is="mode.icon" /></el-icon>
                        <span>{{ t(mode.label) }}</span>
                    </div>
                </div>
            </div>
            <!-- 主题色 -->
            <div class="theme-section">
                <div class="theme-title">{{ t('header.themeColor') }}</div>
                <div class="theme-colors">
                    <div
                        v-for="(preset, key) in themeColorPresets"
                        :key="key"
                        class="theme-color-item"
                        :class="{ active: themeColor === key }"
                        :style="{ backgroundColor: preset.primary }"
                        :title="preset.name"
                        @click="handleThemeColorChange(key as ThemeColor)"
                    >
                        <el-icon v-if="themeColor === key" :size="14" color="#fff"><Check /></el-icon>
                    </div>
                </div>
            </div>
        </div>
    </el-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useThemeStore, themeColorPresets, type ThemeMode, type ThemeColor } from '@/store/theme'
import { Brush, Check, Sunny, Moon, Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const themeStore = useThemeStore()
const { themeMode, themeColor } = storeToRefs(themeStore)
const { setThemeMode, setThemeColor } = themeStore

const themeModes = [
    { value: 'light' as ThemeMode, label: 'header.light', icon: Sunny },
    { value: 'dark' as ThemeMode, label: 'header.dark', icon: Moon },
    { value: 'system' as ThemeMode, label: 'header.system', icon: Monitor },
]

const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    ElMessage.success(t('common.success'))
}

const handleThemeColorChange = (color: ThemeColor) => {
    setThemeColor(color)
}
</script>

<style lang="less" scoped>
.header-action {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--border-color-light);
        color: var(--el-color-primary);
    }
}

.theme-panel {
    padding: 4px;
}

.theme-section {
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
}

.theme-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.theme-modes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.theme-mode-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
    }

    &.active {
        border-color: var(--el-color-primary);
        background-color: var(--theme-color-light);
        color: var(--el-color-primary);
    }
}

.theme-colors {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.theme-color-item {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
    }

    &.active {
        border-color: var(--text-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
}
</style>

