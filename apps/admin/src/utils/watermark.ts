/**
 * 水印工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

export interface WatermarkOptions {
    text?: string
    fontSize?: number
    fontFamily?: string
    color?: string
    opacity?: number
    angle?: number
    zIndex?: number
    gap?: [number, number] // [x, y]
}

const defaultOptions: Required<WatermarkOptions> = {
    text: '充电站管理系统',
    fontSize: 16,
    fontFamily: 'Microsoft YaHei, Arial, sans-serif',
    color: '#000000',
    opacity: 0.15,
    angle: -22,
    zIndex: 9999,
    gap: [100, 100],
}

let watermarkInstance: HTMLDivElement | null = null

/**
 * 创建水印
 */
export function createWatermark(options: WatermarkOptions = {}) {
    // 移除旧的水印
    removeWatermark()

    const opts = { ...defaultOptions, ...options }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // 设置canvas尺寸
    const gapX = opts.gap[0]
    const gapY = opts.gap[1]
    const canvasWidth = gapX * 2
    const canvasHeight = gapY * 2

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // 设置文字样式
    ctx.font = `${opts.fontSize}px ${opts.fontFamily}`
    ctx.fillStyle = opts.color
    ctx.globalAlpha = opts.opacity
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 旋转画布
    ctx.translate(canvasWidth / 2, canvasHeight / 2)
    ctx.rotate((opts.angle * Math.PI) / 180)
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2)

    // 绘制文字
    ctx.fillText(opts.text, canvasWidth / 2, canvasHeight / 2)

    // 创建水印容器
    const watermark = document.createElement('div')
    watermark.id = 'watermark-container'
    watermark.style.position = 'fixed'
    watermark.style.top = '0'
    watermark.style.left = '0'
    watermark.style.width = '100%'
    watermark.style.height = '100%'
    watermark.style.pointerEvents = 'none'
    watermark.style.zIndex = String(opts.zIndex)
    watermark.style.backgroundImage = `url(${canvas.toDataURL()})`
    watermark.style.backgroundRepeat = 'repeat'

    document.body.appendChild(watermark)
    watermarkInstance = watermark

    // 防止通过开发者工具删除水印
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.removedNodes.length) {
                mutation.removedNodes.forEach((node) => {
                    if (node === watermark) {
                        document.body.appendChild(watermark)
                    }
                })
            }
        })
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    })

    return watermark
}

/**
 * 移除水印
 */
export function removeWatermark() {
    if (watermarkInstance) {
        watermarkInstance.remove()
        watermarkInstance = null
    }
}

/**
 * 更新水印
 */
export function updateWatermark(options: WatermarkOptions) {
    createWatermark(options)
}

