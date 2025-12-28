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

const docsSource = path.resolve(__dirname, '../../docs')
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
    console.warn('⚠️  未找到docs文件夹，请确保项目根目录存在docs文件夹')
}