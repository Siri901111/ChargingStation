/**
 * 快捷键帮助工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

export interface Shortcut {
    key: string
    description: string
    category: string
}

export const shortcuts: Shortcut[] = [
    { key: 'Ctrl + K / Cmd + K', description: '全局搜索', category: '导航' },
    { key: 'Ctrl + /', description: '显示快捷键帮助', category: '帮助' },
    { key: 'F11', description: '全屏切换', category: '视图' },
    { key: 'Ctrl + R / Cmd + R', description: '刷新页面', category: '操作' },
    { key: 'Ctrl + L / Cmd + L', description: '锁定屏幕', category: '安全' },
    { key: 'Ctrl + +', description: '放大页面', category: '视图' },
    { key: 'Ctrl + -', description: '缩小页面', category: '视图' },
    { key: 'Ctrl + 0', description: '重置页面缩放', category: '视图' },
    { key: 'Esc', description: '关闭弹窗/取消操作', category: '操作' },
    { key: 'Ctrl + Shift + D', description: '切换暗黑模式', category: '视图' },
]

/**
 * 获取按分类分组的快捷键
 */
export function getShortcutsByCategory(): Record<string, Shortcut[]> {
    const grouped: Record<string, Shortcut[]> = {}
    shortcuts.forEach((shortcut) => {
        if (!grouped[shortcut.category]) {
            grouped[shortcut.category] = []
        }
        grouped[shortcut.category].push(shortcut)
    })
    return grouped
}

