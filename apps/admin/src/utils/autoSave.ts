/**
 * 自动保存工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

const AUTO_SAVE_STORAGE_KEY = 'auto-save-enabled'
const AUTO_SAVE_INTERVAL_KEY = 'auto-save-interval'

/**
 * 启用/禁用自动保存
 */
export function setAutoSave(enabled: boolean) {
    localStorage.setItem(AUTO_SAVE_STORAGE_KEY, String(enabled))
}

/**
 * 检查自动保存是否启用
 */
export function isAutoSaveEnabled(): boolean {
    return localStorage.getItem(AUTO_SAVE_STORAGE_KEY) === 'true'
}

/**
 * 设置自动保存间隔（分钟）
 */
export function setAutoSaveInterval(minutes: number) {
    localStorage.setItem(AUTO_SAVE_INTERVAL_KEY, String(minutes))
}

/**
 * 获取自动保存间隔
 */
export function getAutoSaveInterval(): number {
    return parseInt(localStorage.getItem(AUTO_SAVE_INTERVAL_KEY) || '5')
}

