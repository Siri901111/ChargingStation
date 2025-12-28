/**
 * 页面缩放工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

const ZOOM_STORAGE_KEY = 'page-zoom-level'
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2.0
const ZOOM_STEP = 0.1
const DEFAULT_ZOOM = 1.0

/**
 * 获取当前缩放级别
 */
export function getZoomLevel(): number {
    const saved = localStorage.getItem(ZOOM_STORAGE_KEY)
    return saved ? parseFloat(saved) : DEFAULT_ZOOM
}

/**
 * 设置缩放级别
 */
export function setZoomLevel(level: number) {
    const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level))
    localStorage.setItem(ZOOM_STORAGE_KEY, String(zoom))
    document.documentElement.style.zoom = String(zoom)
    return zoom
}

/**
 * 增加缩放
 */
export function zoomIn(step: number = ZOOM_STEP): number {
    const current = getZoomLevel()
    return setZoomLevel(current + step)
}

/**
 * 减少缩放
 */
export function zoomOut(step: number = ZOOM_STEP): number {
    const current = getZoomLevel()
    return setZoomLevel(current - step)
}

/**
 * 重置缩放
 */
export function resetZoom(): number {
    return setZoomLevel(DEFAULT_ZOOM)
}

/**
 * 初始化缩放
 */
export function initZoom() {
    const level = getZoomLevel()
    setZoomLevel(level)
}

