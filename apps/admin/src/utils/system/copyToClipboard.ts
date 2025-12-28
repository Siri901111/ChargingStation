/**
 * 复制到剪贴板工具函数
 */

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        } else {
            // 降级方案
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            try {
                document.execCommand('copy')
                document.body.removeChild(textArea)
                return true
            } catch (err) {
                document.body.removeChild(textArea)
                return false
            }
        }
    } catch (err) {
        return false
    }
}

