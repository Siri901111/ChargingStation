/**
 * 页面密度设置工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

export type DensityType = 'compact' | 'default' | 'comfortable'

const DENSITY_STORAGE_KEY = 'page-density'

/**
 * 设置页面密度
 */
export function setDensity(density: DensityType) {
    localStorage.setItem(DENSITY_STORAGE_KEY, density)
    document.documentElement.setAttribute('data-density', density)
    applyDensity(density)
}

/**
 * 获取当前密度
 */
export function getDensity(): DensityType {
    return (localStorage.getItem(DENSITY_STORAGE_KEY) as DensityType) || 'default'
}

/**
 * 应用密度样式
 */
function applyDensity(density: DensityType) {
    const root = document.documentElement
    
    switch (density) {
        case 'compact':
            root.style.setProperty('--density-padding', '8px')
            root.style.setProperty('--density-gap', '8px')
            root.style.setProperty('--density-font-size', '13px')
            root.style.setProperty('--density-line-height', '1.4')
            break
        case 'comfortable':
            root.style.setProperty('--density-padding', '24px')
            root.style.setProperty('--density-gap', '16px')
            root.style.setProperty('--density-font-size', '15px')
            root.style.setProperty('--density-line-height', '1.6')
            break
        default: // default
            root.style.setProperty('--density-padding', '16px')
            root.style.setProperty('--density-gap', '12px')
            root.style.setProperty('--density-font-size', '14px')
            root.style.setProperty('--density-line-height', '1.5')
            break
    }
}

/**
 * 初始化密度
 */
export function initDensity() {
    const density = getDensity()
    applyDensity(density)
}

