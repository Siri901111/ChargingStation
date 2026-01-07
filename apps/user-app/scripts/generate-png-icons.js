const fs = require('fs')
const path = require('path')

// Tabbar 图标目录
const tabbarDir = path.join(__dirname, '../src/static/tabbar')

// 确保目录存在
if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true })
}

const normalColor = '#999999'
const activeColor = '#4CAF50'

// SVG 图标定义 - 使用简洁的路径
const svgIcons = {
  home: {
    // 首页 - 房子图标
    path: `<path d="M12 2L2 12h3v9h6v-6h2v6h6v-9h3L12 2z"/>`,
  },
  map: {
    // 地图 - 定位图标
    path: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>`,
  },
  scan: {
    // 扫码 - 二维码扫描图标
    path: `<path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h2v3h-3v-2h1v-1zm-3 0h2v2h-2v-2zm0 3h2v3h-2v-3zm3 1h2v2h-2v-2z"/>`,
  },
  order: {
    // 订单 - 文件列表图标
    path: `<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-3h8v2H8v-2z"/>`,
  },
  mine: {
    // 我的 - 用户图标
    path: `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>`,
  }
}

function createSvg(iconName, color) {
  const icon = svgIcons[iconName]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="${color}">${icon.path}</svg>`
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
      const normalSvg = createSvg(name, normalColor)
      const activeSvg = createSvg(name, activeColor)

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
      // 生成普通状态 PNG
      const normalSvg = createSvg(name, normalColor)
      await sharp(Buffer.from(normalSvg))
        .resize(81, 81)
        .png()
        .toFile(path.join(tabbarDir, `${name}.png`))
      console.log(`✓ ${name}.png`)

      // 生成选中状态 PNG
      const activeSvg = createSvg(name, activeColor)
      await sharp(Buffer.from(activeSvg))
        .resize(81, 81)
        .png()
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
