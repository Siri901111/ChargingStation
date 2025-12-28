import { defineStore } from "pinia"
import { ref } from "vue"

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan'

// 主题色配置
export const themeColorPresets: Record<ThemeColor, {
    name: string
    primary: string
    primaryLight: string
    primaryDark: string
}> = {
    blue: {
        name: '拂晓蓝',
        primary: '#409eff',
        primaryLight: '#ecf5ff',
        primaryDark: '#337ecc'
    },
    green: {
        name: '极光绿',
        primary: '#67c23a',
        primaryLight: '#f0f9eb',
        primaryDark: '#529b2e'
    },
    purple: {
        name: '酱紫',
        primary: '#722ed1',
        primaryLight: '#f9f0ff',
        primaryDark: '#531dab'
    },
    orange: {
        name: '日暮',
        primary: '#fa8c16',
        primaryLight: '#fff7e6',
        primaryDark: '#d46b08'
    },
    red: {
        name: '火山',
        primary: '#f5222d',
        primaryLight: '#fff1f0',
        primaryDark: '#cf1322'
    },
    cyan: {
        name: '明青',
        primary: '#13c2c2',
        primaryLight: '#e6fffb',
        primaryDark: '#08979c'
    }
}

// 暗黑模式颜色配置
const darkModeColors = {
    bgBase: '#141414',
    bgContainer: '#1f1f1f',
    bgElevated: '#262626',
    textPrimary: 'rgba(255, 255, 255, 0.85)',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    textTertiary: 'rgba(255, 255, 255, 0.45)',
    border: '#424242',
    borderLight: '#303030'
}

// 浅色模式颜色配置
const lightModeColors = {
    bgBase: '#f0f2f5',
    bgContainer: '#ffffff',
    bgElevated: '#ffffff',
    textPrimary: 'rgba(0, 0, 0, 0.88)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    border: '#d9d9d9',
    borderLight: '#f0f0f0'
}

export const useThemeStore = defineStore("theme", () => {
    // 从 localStorage 读取保存的设置
    const themeMode = ref<ThemeMode>(
        (localStorage.getItem("themeMode") as ThemeMode) || 'light'
    )
    const themeColor = ref<ThemeColor>(
        (localStorage.getItem("themeColor") as ThemeColor) || 'blue'
    )

    // 实际是否为暗黑模式
    const isDark = ref(false)

    // 系统主题媒体查询
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // 应用主题到 DOM
    const applyTheme = () => {
        const html = document.documentElement
        const colorPreset = themeColorPresets[themeColor.value]
        const colors = isDark.value ? darkModeColors : lightModeColors

        // 设置 data-theme 属性
        html.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
        
        // 设置 Element Plus 暗黑模式类名
        if (isDark.value) {
            html.classList.add('dark')
        } else {
            html.classList.remove('dark')
        }

        // 设置 Element Plus 主题色变量
        html.style.setProperty('--el-color-primary', colorPreset.primary)
        html.style.setProperty('--el-color-primary-light-3', adjustColor(colorPreset.primary, isDark.value ? -20 : 30))
        html.style.setProperty('--el-color-primary-light-5', adjustColor(colorPreset.primary, isDark.value ? -30 : 50))
        html.style.setProperty('--el-color-primary-light-7', adjustColor(colorPreset.primary, isDark.value ? -40 : 70))
        html.style.setProperty('--el-color-primary-light-8', adjustColor(colorPreset.primary, isDark.value ? -45 : 80))
        html.style.setProperty('--el-color-primary-light-9', adjustColor(colorPreset.primary, isDark.value ? -50 : 90))
        html.style.setProperty('--el-color-primary-dark-2', colorPreset.primaryDark)

        // 设置自定义主题变量
        html.style.setProperty('--theme-color', colorPreset.primary)
        html.style.setProperty('--theme-color-light', colorPreset.primaryLight)
        html.style.setProperty('--theme-color-dark', colorPreset.primaryDark)

        // 设置布局颜色变量
        html.style.setProperty('--bg-base', colors.bgBase)
        html.style.setProperty('--bg-container', colors.bgContainer)
        html.style.setProperty('--bg-elevated', colors.bgElevated)
        html.style.setProperty('--text-primary', colors.textPrimary)
        html.style.setProperty('--text-secondary', colors.textSecondary)
        html.style.setProperty('--text-tertiary', colors.textTertiary)
        html.style.setProperty('--border-color', colors.border)
        html.style.setProperty('--border-color-light', colors.borderLight)

        // Element Plus 暗黑模式变量
        if (isDark.value) {
            html.style.setProperty('--el-bg-color', colors.bgContainer)
            html.style.setProperty('--el-bg-color-page', colors.bgBase)
            html.style.setProperty('--el-bg-color-overlay', colors.bgElevated)
            html.style.setProperty('--el-text-color-primary', colors.textPrimary)
            html.style.setProperty('--el-text-color-regular', colors.textSecondary)
            html.style.setProperty('--el-text-color-secondary', colors.textTertiary)
            html.style.setProperty('--el-border-color', colors.border)
            html.style.setProperty('--el-border-color-light', colors.borderLight)
            html.style.setProperty('--el-fill-color-blank', colors.bgContainer)
        } else {
            // 重置为默认值
            html.style.removeProperty('--el-bg-color')
            html.style.removeProperty('--el-bg-color-page')
            html.style.removeProperty('--el-bg-color-overlay')
            html.style.removeProperty('--el-text-color-primary')
            html.style.removeProperty('--el-text-color-regular')
            html.style.removeProperty('--el-text-color-secondary')
            html.style.removeProperty('--el-border-color')
            html.style.removeProperty('--el-border-color-light')
            html.style.removeProperty('--el-fill-color-blank')
        }

        // 更新 body 样式
        document.body.style.backgroundColor = colors.bgBase
        document.body.style.color = colors.textPrimary
    }

    // 更新暗黑模式状态
    const updateDarkMode = () => {
        if (themeMode.value === 'system') {
            isDark.value = mediaQuery.matches
        } else {
            isDark.value = themeMode.value === 'dark'
        }
        applyTheme()
    }

    // 监听系统主题变化
    const handleSystemThemeChange = () => {
        if (themeMode.value === 'system') {
            updateDarkMode()
        }
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // 设置主题模式
    const setThemeMode = (mode: ThemeMode) => {
        themeMode.value = mode
        localStorage.setItem('themeMode', mode)
        updateDarkMode()
    }

    // 设置主题色
    const setThemeColor = (color: ThemeColor) => {
        themeColor.value = color
        localStorage.setItem('themeColor', color)
        applyTheme()
    }

    // 初始化主题
    const initTheme = () => {
        updateDarkMode()
    }

    return {
        themeMode,
        themeColor,
        isDark,
        themeColorPresets,
        setThemeMode,
        setThemeColor,
        initTheme
    }
})

// 辅助函数：调整颜色亮度
function adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, Math.max(0, (num >> 16) + amt))
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt))
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt))
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}
