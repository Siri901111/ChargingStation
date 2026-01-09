const fs = require('fs')
const path = require('path')

// Tabbar 图标目录
const tabbarDir = path.join(__dirname, '../src/static/tabbar')

// 确保目录存在
if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true })
}

// 使用设计系统的颜色，更协调高级
const normalColor = '#A6A6A6'  // 未选中：浅灰
const activeColor = '#5A8F7B'  // 选中：翡翠绿（主题色）

// SVG 图标定义 - 使用清晰的线性图标路径，优化设计
const svgIcons = {
  home: {
    // 首页 - 房子图标（优化版，更清晰）
    path: `<path d="M9 21V13.6c0-.56 0-.84.109-1.054a1 1 0 01.437-.437C9.76 12 10.04 12 10.6 12h2.8c.56 0 .84 0 1.054.109a1 1 0 01.437.437C15 12.76 15 13.04 15 13.6V21M11.018 2.764L4.235 8.039c-.453.353-.68.529-.843.75a2 2 0 00-.318.65C3 9.704 3 9.991 3 10.565V17.8c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874C4.52 21 5.08 21 6.2 21h11.6c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C21 19.48 21 18.92 21 17.8v-7.235c0-.574 0-.861-.074-1.126a2.002 2.002 0 00-.318-.65c-.163-.221-.39-.397-.843-.75l-6.783-5.275c-.351-.273-.527-.41-.72-.462a1 1 0 00-.523 0c-.194.052-.37.189-.721.462z"/>`,
  },
  map: {
    // 地图 - 定位图标（优化版）
    path: `<circle cx="12" cy="10" r="3"/><path d="M12 22c4-4 8-7.582 8-12a8 8 0 10-16 0c0 4.418 4 8 8 12z"/>`,
  },
  scan: {
    // 扫码 - 二维码扫描图标（优化版）
    path: `<path d="M3 7V5a2 2 0 012-2h2M7 21H5a2 2 0 01-2-2v-2M21 17v2a2 2 0 01-2 2h-2M17 3h2a2 2 0 012 2v2"/><line x1="12" y1="4" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="4" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="20" y2="12"/>`,
  },
  order: {
    // 订单 - 文件列表图标（优化版）
    path: `<path d="M8 6h8M8 10h8M8 14h4M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>`,
  },
  mine: {
    // 我的 - 用户图标（优化版）
    path: `<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>`,
  }
}

function createSvg(iconName, color, isActive = false) {
  const icon = svgIcons[iconName]
  const strokeWidth = isActive ? '2.5' : '2'
  // 优化SVG，使用stroke而不是fill，更清晰
  return `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${icon.path}</svg>`
}

async function generatePngIcons() {
  let sharp
  try {
    sharp = require('sharp')
  } catch (e) {
    console.log('sharp 库未安装，将只生成 SVG 文件')
    console.log('如需生成 PNG，请运行: npm install sharp --save-dev')
    console.log('')

    // 只生成 SVG
    for (const name of Object.keys(svgIcons)) {
      const normalSvg = createSvg(name, normalColor, false)
      const activeSvg = createSvg(name, activeColor, true)

      fs.writeFileSync(path.join(tabbarDir, `${name}.svg`), normalSvg)
      fs.writeFileSync(path.join(tabbarDir, `${name}-active.svg`), activeSvg)
      console.log(`✓ 已生成 ${name}.svg 和 ${name}-active.svg`)
    }

    console.log('\n请手动将 SVG 转换为 PNG 或安装 sharp 后重新运行')
    return
  }

  console.log('开始生成 PNG 图标...\n')

  for (const name of Object.keys(svgIcons)) {
    try {
      // 生成普通状态 PNG（更大尺寸，更高清晰度）
      const normalSvg = createSvg(name, normalColor, false)
      await sharp(Buffer.from(normalSvg))
        .resize(162, 162) // 2x尺寸，保证清晰度
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(path.join(tabbarDir, `${name}.png`))
      console.log(`✓ ${name}.png`)

      // 生成选中状态 PNG
      const activeSvg = createSvg(name, activeColor, true)
      await sharp(Buffer.from(activeSvg))
        .resize(162, 162) // 2x尺寸，保证清晰度
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(path.join(tabbarDir, `${name}-active.png`))
      console.log(`✓ ${name}-active.png`)

    } catch (error) {
      console.error(`✗ 生成 ${name} 失败:`, error.message)
    }
  }

  // 删除 README.md 占位文件
  const readmePath = path.join(tabbarDir, 'README.md')
  if (fs.existsSync(readmePath)) {
    fs.unlinkSync(readmePath)
    console.log('\n已删除占位文件 README.md')
  }

  console.log('\n========================================')
  console.log('✓ 所有 PNG 图标生成完成!')
  console.log('========================================')
  console.log(`\n图标目录: ${tabbarDir}`)
}

generatePngIcons().catch(console.error)
