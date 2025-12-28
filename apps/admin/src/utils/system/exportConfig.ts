/**
 * 导出配置工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

import { useThemeStore } from '@/store/theme'
import { getLocale } from '@/locales'
import { useUserStore } from '@/store/auth'

export interface SystemConfig {
    theme: {
        mode: string
        color: string
    }
    locale: string
    user: {
        username: string
        userId: string
    }
    timestamp: string
}

/**
 * 导出系统配置为JSON
 */
export function exportConfig(): string {
    const themeStore = useThemeStore()
    const userStore = useUserStore()
    
    const config: SystemConfig = {
        theme: {
            mode: themeStore.themeMode,
            color: themeStore.themeColor,
        },
        locale: getLocale(),
        user: {
            username: userStore.username,
            userId: userStore.userId,
        },
        timestamp: new Date().toISOString(),
    }
    
    return JSON.stringify(config, null, 2)
}

/**
 * 下载配置为文件
 */
export function downloadConfig() {
    const config = exportConfig()
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system-config-${new Date().getTime()}.json`
    link.click()
    URL.revokeObjectURL(url)
}

