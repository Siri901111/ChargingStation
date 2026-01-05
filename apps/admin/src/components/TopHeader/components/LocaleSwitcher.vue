<template>
    <el-popover placement="bottom" :width="180" trigger="click">
        <template #reference>
            <div class="header-action" :title="t('header.language')">
                <span class="lang-text">{{ currentLocaleName }}</span>
            </div>
        </template>
        <div class="lang-panel">
            <div
                v-for="loc in localeOptions"
                :key="loc.value"
                class="lang-item"
                :class="{ active: currentLocale === loc.value }"
                @click="handleLocaleChange(loc.value)"
            >
                {{ loc.label }}
                <el-icon v-if="currentLocale === loc.value" :size="14"><Check /></el-icon>
            </div>
        </div>
    </el-popover>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { localeOptions, setLocale, getLocale, type LocaleType } from '@/locales'
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

const currentLocale = ref<LocaleType>(getLocale())
const currentLocaleName = computed(() => {
    const loc = localeOptions.find(l => l.value === currentLocale.value)
    return loc?.label.slice(0, 2) || '中'
})

const handleLocaleChange = (loc: LocaleType) => {
    currentLocale.value = loc
    setLocale(loc)
    locale.value = loc
    ElMessage.success(t('common.success'))
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
    color: rgba(0, 0, 0, 0.65);
    transition: all 0.2s ease;

    &:hover {
        background-color: #f0f0f0;
        color: var(--el-color-primary);
    }
}

.lang-text {
    font-size: 14px;
    font-weight: 500;
}

.lang-panel {
    padding: 4px;
}

.lang-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    transition: all 0.2s ease;

    &:hover {
        background-color: #f0f0f0;
        color: rgba(0, 0, 0, 0.88);
    }

    &.active {
        background-color: #ecf5ff;
        color: var(--el-color-primary);
    }
}
</style>

