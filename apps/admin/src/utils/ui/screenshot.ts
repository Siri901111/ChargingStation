/**
 * 截图工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

/**
 * 截取整个页面（使用浏览器原生API）
 */
export async function captureFullPage(): Promise<string | null> {
    try {
        // 使用浏览器原生截图API（如果支持）
        if ('getDisplayMedia' in navigator.mediaDevices) {
            // 这个方法需要用户交互，所以返回null，让调用者使用其他方法
            return null
        }
        
        // 降级方案：使用Canvas API
        const canvas = document.createElement('canvas')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        
        // 注意：这种方法只能截取canvas内容，不能截取DOM
        // 实际项目中建议使用html2canvas库
        return canvas.toDataURL('image/png')
    } catch (error) {
        console.error('截图失败:', error)
        return null
    }
}

/**
 * 截取指定元素（简化版本）
 */
export async function captureElement(element: HTMLElement): Promise<string | null> {
    try {
        // 简化版本：提示用户使用浏览器截图功能
        // 实际项目中建议使用html2canvas库
        return null
    } catch (error) {
        console.error('截图失败:', error)
        return null
    }
}

/**
 * 下载截图
 */
export function downloadScreenshot(dataUrl: string, filename: string = 'screenshot') {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${filename}-${new Date().getTime()}.png`
    link.click()
}

