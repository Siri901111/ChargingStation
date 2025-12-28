/**
 * 缓存管理工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

/**
 * 清除所有缓存
 */
export function clearAllCache() {
    // 清除 localStorage
    localStorage.clear()
    
    // 清除 sessionStorage
    sessionStorage.clear()
    
    // 清除 IndexedDB (如果使用)
    if ('indexedDB' in window) {
        indexedDB.databases().then((databases) => {
            databases.forEach((db) => {
                if (db.name) {
                    indexedDB.deleteDatabase(db.name)
                }
            })
        })
    }
    
    // 清除 Service Worker 缓存 (如果使用)
    if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then((names) => {
            names.forEach((name) => {
                caches.delete(name)
            })
        })
    }
}

/**
 * 清除指定前缀的缓存
 */
export function clearCacheByPrefix(prefix: string) {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
        if (key.startsWith(prefix)) {
            localStorage.removeItem(key)
        }
    })
}

/**
 * 获取缓存大小（估算）
 */
export function getCacheSize(): number {
    let total = 0
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length
        }
    }
    for (const key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
            total += sessionStorage[key].length + key.length
        }
    }
    return total
}

/**
 * 格式化缓存大小
 */
export function formatCacheSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

