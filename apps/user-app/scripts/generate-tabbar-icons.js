const fs = require('fs')
const path = require('path')

// Tabbar 图标目录
const tabbarDir = path.join(__dirname, '../src/static/tabbar')

// 确保目录存在
if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true })
}

// 简洁的 SVG 图标 (灰色 #999999 和 绿色 #4CAF50)
const icons = {
  // 首页图标 - 房子
  home: {
    normal: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    active: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="#4CAF50" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22" fill="#ffffff"></polyline></svg>`
  },
  // 地图图标
  map: {
    normal: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    active: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="#4CAF50" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>`
  },
  // 扫码图标
  scan: {
    normal: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="1" y1="12" x2="23" y2="12"></line></svg>`,
    active: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" fill="#4CAF50"></rect><rect x="14" y="3" width="7" height="7" fill="#4CAF50"></rect><rect x="14" y="14" width="7" height="7" fill="#4CAF50"></rect><rect x="3" y="14" width="7" height="7" fill="#4CAF50"></rect><line x1="1" y1="12" x2="23" y2="12"></line></svg>`
  },
  // 订单图标
  order: {
    normal: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    active: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="#4CAF50" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8" fill="#ffffff"></polyline><line x1="16" y1="13" x2="8" y2="13" stroke="#ffffff"></line><line x1="16" y1="17" x2="8" y2="17" stroke="#ffffff"></line><polyline points="10 9 9 9 8 9" stroke="#ffffff"></polyline></svg>`
  },
  // 我的图标 - 用户
  mine: {
    normal: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    active: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 24 24" fill="#4CAF50" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
  }
}

// 将 SVG 转换为 PNG 需要使用 sharp 或 canvas
// 由于小程序支持 SVG，我们直接保存为 SVG 格式，然后重命名为 .png
// 注意：如果小程序不支持，需要手动转换或使用在线工具

console.log('开始生成 tabbar 图标...\n')

Object.entries(icons).forEach(([name, { normal, active }]) => {
  // 保存普通状态图标
  const normalPath = path.join(tabbarDir, `${name}.svg`)
  fs.writeFileSync(normalPath, normal)
  console.log(`✓ 已生成: ${name}.svg`)

  // 保存选中状态图标
  const activePath = path.join(tabbarDir, `${name}-active.svg`)
  fs.writeFileSync(activePath, active)
  console.log(`✓ 已生成: ${name}-active.svg`)
})

console.log('\n========================================')
console.log('SVG 图标已生成完成!')
console.log('========================================')
console.log('\n注意: 微信小程序 tabBar 需要 PNG 格式图标')
console.log('请使用以下方法将 SVG 转换为 PNG:')
console.log('')
console.log('方法1: 在线转换')
console.log('  访问 https://convertio.co/svg-png/')
console.log('  或 https://svgtopng.com/')
console.log('')
console.log('方法2: 使用 Figma/Sketch 导出')
console.log('')
console.log('方法3: 安装 sharp 库自动转换')
console.log('  npm install sharp')
console.log('  然后运行: node scripts/convert-svg-to-png.js')
console.log('')
