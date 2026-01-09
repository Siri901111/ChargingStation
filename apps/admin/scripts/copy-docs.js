/**
 * 复制docs文件夹到public目录的脚本
 * 运行: node scripts/copy-docs.js
 */
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// ESM中手动定义__dirname（替代CommonJS的全局__dirname）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 从 scripts/copy-docs.js 到项目根目录的 docs 文件夹
// scripts/ -> apps/admin/ -> apps/ -> 项目根目录/
const docsSource = path.resolve(__dirname, '../../../docs')
const docsTarget = path.resolve(__dirname, '../public/docs')

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true })
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
            console.log(`已复制: ${entry.name}`)
        }
    }
}

if (fs.existsSync(docsSource)) {
    console.log('正在复制docs文件夹到public目录...')
    copyDir(docsSource, docsTarget)
    console.log('✅ docs文件夹复制完成！')
} else {
    // 如果docs文件夹不存在，创建目标目录但不报错，避免阻塞启动
    if (!fs.existsSync(docsTarget)) {
        fs.mkdirSync(docsTarget, { recursive: true })
    }
    console.warn('⚠️  未找到docs文件夹，已创建public/docs目录，启动将继续')
}