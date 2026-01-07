const fs = require('fs')
const path = require('path')

// Tabbar 图标目录
const tabbarDir = path.join(__dirname, '../src/static/tabbar')

// 确保目录存在
if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true })
}

// 使用简单的 1x1 像素 PNG 作为占位符，然后我们用 canvas 绘制
// 这里我们直接提供预制的 Base64 PNG 图标

// 简单的 48x48 PNG 图标 (Base64 编码)
// 这些是使用 Canvas 生成的简化图标

const createSimplePNG = (color) => {
  // 创建一个简单的 48x48 PNG 占位符
  // PNG 文件头 + IHDR + IDAT + IEND

  // 由于无法在 Node.js 原生环境生成复杂 PNG，
  // 我们提供一个下载脚本从公共 CDN 获取图标
  return null
}

// 从在线图标库下载图标的配置
const iconUrls = {
  // 使用 Remix Icon CDN (免费开源图标)
  home: {
    normal: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Buildings/home-4-line.svg',
    active: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Buildings/home-4-fill.svg'
  },
  map: {
    normal: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Map/map-pin-line.svg',
    active: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Map/map-pin-fill.svg'
  },
  scan: {
    normal: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Device/qr-scan-2-line.svg',
    active: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Device/qr-scan-2-fill.svg'
  },
  order: {
    normal: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Document/file-list-3-line.svg',
    active: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/Document/file-list-3-fill.svg'
  },
  mine: {
    normal: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/User/user-line.svg',
    active: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/User/user-fill.svg'
  }
}

const https = require('https')
const http = require('http')

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location).then(resolve).catch(reject)
        return
      }

      let data = ''
      response.on('data', (chunk) => { data += chunk })
      response.on('end', () => resolve(data))
      response.on('error', reject)
    }).on('error', reject)
  })
}

function colorSvg(svgContent, color) {
  // 替换 SVG 中的 currentColor 或添加 fill 属性
  let colored = svgContent
    .replace(/fill="currentColor"/g, `fill="${color}"`)
    .replace(/stroke="currentColor"/g, `stroke="${color}"`)

  // 如果没有 fill 属性，添加到 svg 标签
  if (!colored.includes('fill=')) {
    colored = colored.replace('<svg', `<svg fill="${color}"`)
  }

  // 设置尺寸
  colored = colored
    .replace(/width="[^"]*"/, 'width="81"')
    .replace(/height="[^"]*"/, 'height="81"')

  if (!colored.includes('width=')) {
    colored = colored.replace('<svg', '<svg width="81" height="81"')
  }

  return colored
}

async function generateIcons() {
  console.log('开始下载并生成 tabbar 图标...\n')

  const normalColor = '#999999'
  const activeColor = '#4CAF50'

  for (const [name, urls] of Object.entries(iconUrls)) {
    try {
      // 下载普通状态图标
      console.log(`下载 ${name} 图标...`)
      const normalSvg = await downloadFile(urls.normal)
      const coloredNormal = colorSvg(normalSvg, normalColor)
      fs.writeFileSync(path.join(tabbarDir, `${name}.svg`), coloredNormal)
      console.log(`  ✓ ${name}.svg`)

      // 下载选中状态图标
      const activeSvg = await downloadFile(urls.active)
      const coloredActive = colorSvg(activeSvg, activeColor)
      fs.writeFileSync(path.join(tabbarDir, `${name}-active.svg`), coloredActive)
      console.log(`  ✓ ${name}-active.svg`)

    } catch (error) {
      console.error(`  ✗ 下载 ${name} 失败:`, error.message)
    }
  }

  console.log('\n========================================')
  console.log('图标下载完成!')
  console.log('========================================')
  console.log('')
  console.log('接下来需要将 SVG 转换为 PNG:')
  console.log('')
  console.log('方法1 (推荐): 使用在线工具批量转换')
  console.log('  1. 打开 https://svgtopng.com/')
  console.log('  2. 上传所有 SVG 文件')
  console.log('  3. 下载 PNG 并替换同名 SVG 文件')
  console.log('')
  console.log('方法2: 安装 sharp 自动转换')
  console.log('  npm install sharp --save-dev')
  console.log('  node scripts/convert-svg-to-png.js')
  console.log('')
}

generateIcons().catch(console.error)
