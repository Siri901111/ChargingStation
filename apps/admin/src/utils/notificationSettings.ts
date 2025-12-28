/**
 * 通知设置工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

const NOTIFICATION_ENABLED_KEY = 'notification-enabled'
const NOTIFICATION_SOUND_KEY = 'notification-sound'

/**
 * 启用/禁用通知
 */
export function setNotificationEnabled(enabled: boolean) {
    localStorage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled))
    
    if (enabled && 'Notification' in window) {
        Notification.requestPermission()
    }
}

/**
 * 检查通知是否启用
 */
export function isNotificationEnabled(): boolean {
    return localStorage.getItem(NOTIFICATION_ENABLED_KEY) !== 'false'
}

/**
 * 发送浏览器通知
 */
export function sendNotification(title: string, options?: NotificationOptions) {
    if (!isNotificationEnabled()) return
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options,
        })
    }
}

/**
 * 启用/禁用通知声音
 */
export function setNotificationSound(enabled: boolean) {
    localStorage.setItem(NOTIFICATION_SOUND_KEY, String(enabled))
}

/**
 * 检查通知声音是否启用
 */
export function isNotificationSoundEnabled(): boolean {
    return localStorage.getItem(NOTIFICATION_SOUND_KEY) !== 'false'
}

/**
 * 播放通知声音
 */
export function playNotificationSound() {
    if (!isNotificationSoundEnabled()) return
    
    const audio = new Audio('/notification.mp3') // 需要提供音频文件
    audio.play().catch(() => {
        // 如果播放失败，静默处理
    })
}

