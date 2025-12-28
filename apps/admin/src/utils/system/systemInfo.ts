/**
 * 系统信息工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

export interface SystemInfo {
    userAgent: string
    platform: string
    language: string
    screenWidth: number
    screenHeight: number
    windowWidth: number
    windowHeight: number
    colorDepth: number
    pixelRatio: number
    timezone: string
    cookieEnabled: boolean
    online: boolean
    memory?: {
        jsHeapSizeLimit?: number
        totalJSHeapSize?: number
        usedJSHeapSize?: number
    }
}

/**
 * 获取系统信息
 */
export function getSystemInfo(): SystemInfo {
    const info: SystemInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
    }

    // 获取内存信息（Chrome）
    if ('memory' in performance) {
        const memory = (performance as any).memory
        info.memory = {
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            totalJSHeapSize: memory.totalJSHeapSize,
            usedJSHeapSize: memory.usedJSHeapSize,
        }
    }

    return info
}

/**
 * 格式化系统信息为可读字符串
 */
export function formatSystemInfo(info: SystemInfo): string {
    let text = `用户代理: ${info.userAgent}\n`
    text += `平台: ${info.platform}\n`
    text += `语言: ${info.language}\n`
    text += `屏幕分辨率: ${info.screenWidth} x ${info.screenHeight}\n`
    text += `窗口大小: ${info.windowWidth} x ${info.windowHeight}\n`
    text += `颜色深度: ${info.colorDepth} 位\n`
    text += `像素比: ${info.pixelRatio}\n`
    text += `时区: ${info.timezone}\n`
    text += `Cookie 启用: ${info.cookieEnabled ? '是' : '否'}\n`
    text += `在线状态: ${info.online ? '在线' : '离线'}\n`

    if (info.memory) {
        text += `\n内存信息:\n`
        if (info.memory.jsHeapSizeLimit) {
            text += `  堆限制: ${(info.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB\n`
        }
        if (info.memory.totalJSHeapSize) {
            text += `  总堆大小: ${(info.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`
        }
        if (info.memory.usedJSHeapSize) {
            text += `  已用堆大小: ${(info.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`
        }
    }

    return text
}

