/**
 * 本地存储工具
 */

/**
 * 设置存储
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch {
    console.error(`Storage set error: ${key}`)
  }
}

/**
 * 获取存储
 */
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const value = uni.getStorageSync(key)
    if (value) {
      return JSON.parse(value) as T
    }
    return defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * 移除存储
 */
export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch {
    console.error(`Storage remove error: ${key}`)
  }
}

/**
 * 清空存储
 */
export function clearStorage(): void {
  try {
    uni.clearStorageSync()
  } catch {
    console.error('Storage clear error')
  }
}
