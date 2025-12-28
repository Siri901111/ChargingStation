import { defineStore } from "pinia"
import { ref } from "vue"

export const useAppStore = defineStore("app", () => {
    // 侧边栏折叠状态
    const sidebarCollapsed = ref(localStorage.getItem("sidebarCollapsed") === "true")

    // 水印开关
    const watermarkEnabled = ref(localStorage.getItem("watermarkEnabled") !== "false")

    // 水印文字
    const watermarkText = ref(localStorage.getItem("watermarkText") || "")

    // 切换侧边栏折叠
    const toggleSidebar = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value
        localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed.value))
    }

    // 设置侧边栏折叠状态
    const setSidebarCollapsed = (collapsed: boolean) => {
        sidebarCollapsed.value = collapsed
        localStorage.setItem("sidebarCollapsed", String(collapsed))
    }

    // 切换水印
    const toggleWatermark = () => {
        watermarkEnabled.value = !watermarkEnabled.value
        localStorage.setItem("watermarkEnabled", String(watermarkEnabled.value))
    }

    // 设置水印文字
    const setWatermarkText = (text: string) => {
        watermarkText.value = text
        localStorage.setItem("watermarkText", text)
    }

    return {
        sidebarCollapsed,
        watermarkEnabled,
        watermarkText,
        toggleSidebar,
        setSidebarCollapsed,
        toggleWatermark,
        setWatermarkText
    }
})
