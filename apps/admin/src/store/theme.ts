import { defineStore } from "pinia"
import { ref, watch } from "vue"

export type ThemeMode = 'light' | 'dark' | 'auto'
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red'

// 主题色配置
export const themeColorMap: Record<ThemeColor, { primary: string; light: string; dark: string }> = {
    blue: { primary: '#409eff', light: '#ecf5ff', dark: '#337ecc' },
    green: { primary: '#67c23a', light: '#f0f9eb', dark: '#529b2e' },
    purple: { primary: '#9c27b0', light: '#f3e5f5', dark: '#7b1fa2' },
    orange: { primary: '#e6a23c', light: '#fdf6ec', dark: '#b88230' },
    red: { primary: '#f56c6c', light: '#fef0f0', dark: '#c45656' },
}

export const useThemeStore = defineStore("theme", () => {
    // 主题模式
    const themeMode = ref<ThemeMode>(
        (localStorage.getItem("themeMode") as ThemeMode) || 'light'
    )
    // 主题色
    const themeColor = ref<ThemeColor>(
        (localStorage.getItem("themeColor") as ThemeColor) || 'blue'
    )
    // 实际应用的主题（考虑 auto 模式）
    const isDark = ref(false)

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateDarkMode = () => {
        if (themeMode.value === 'auto') {
            isDark.value = mediaQuery.matches
        } else {
            isDark.value = themeMode.value === 'dark'
        }
        applyTheme()
    }
    mediaQuery.addEventListener('change', updateDarkMode)

    // 应用主题
    const applyTheme = () => {
        const html = document.documentElement
        const colorConfig = themeColorMap[themeColor.value]

        // 设置暗黑模式
        if (isDark.value) {
            html.classList.add('dark')
            document.body.style.backgroundColor = '#1a1a2e'
        } else {
            html.classList.remove('dark')
            document.body.style.backgroundColor = 'rgb(241, 242, 246)'
        }

        // 设置 Element Plus 主题色 CSS 变量
        html.style.setProperty('--el-color-primary', colorConfig.primary)
        html.style.setProperty('--el-color-primary-light-3', colorConfig.light)
        html.style.setProperty('--el-color-primary-dark-2', colorConfig.dark)
        html.style.setProperty('--el-color-primary-light-9', colorConfig.light)

        // 自定义主题变量
        html.style.setProperty('--theme-primary', colorConfig.primary)
        html.style.setProperty('--theme-primary-light', colorConfig.light)
        html.style.setProperty('--theme-primary-dark', colorConfig.dark)
    }

    // 切换主题模式
    const setThemeMode = (mode: ThemeMode) => {
        themeMode.value = mode
        localStorage.setItem("themeMode", mode)
        updateDarkMode()
    }

    // 切换主题色
    const setThemeColor = (color: ThemeColor) => {
        themeColor.value = color
        localStorage.setItem("themeColor", color)
        applyTheme()
    }

    // 初始化主题
    const initTheme = () => {
        updateDarkMode()
    }

    // 监听变化
    watch([themeMode, themeColor], () => {
        updateDarkMode()
    })

    return {
        themeMode,
        themeColor,
        isDark,
        setThemeMode,
        setThemeColor,
        initTheme,
        themeColorMap,
    }
})
