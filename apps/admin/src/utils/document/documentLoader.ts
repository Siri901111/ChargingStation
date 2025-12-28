/**
 * 文档加载工具
 * 使用 markdown-it 和 highlight.js 来渲染美观的 Markdown 文档
 */

import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// 根据主题模式动态导入样式
import 'highlight.js/styles/github.css'

// 配置 markdown-it
const md = new MarkdownIt({
    html: true, // 启用HTML标签
    linkify: true, // 自动将URL转换为链接
    typographer: true, // 启用一些语言中性的替换 + 引号美化
    highlight: function (str: string, lang?: string) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) {
                // 忽略错误，使用默认渲染
            }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
})

/**
 * 将Markdown转换为HTML
 */
export function markdownToHtml(markdown: string): string {
    return md.render(markdown)
}

/**
 * 加载文档内容
 */
export async function getDocumentContent(files: string[]): Promise<string> {
    try {
        const contents = await Promise.all(
            files.map(async (file) => {
                try {
                    // 从public/docs目录加载文档
                    const response = await fetch(`/docs/${file}`)
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                    }
                    
                    const text = await response.text()
                    return { file, content: text }
                } catch (error) {
                    console.error(`Error loading ${file}:`, error)
                    const errorMsg = error instanceof Error ? error.message : '未知错误'
                    return { 
                        file, 
                        content: `# ${file}\n\n## 文档加载失败\n\n**错误信息:** ${errorMsg}\n\n**解决方案：**\n\n1. 运行 \`npm run copy-docs\` 将docs文件夹复制到public目录\n2. 或者手动将项目根目录的 \`docs\` 文件夹复制到 \`apps/admin/public/docs\`\n3. 确保文件路径正确：\`${file}\`\n\n**提示：** 文档会在开发服务器启动时自动复制，如果未自动复制，请手动运行复制命令。` 
                    }
                }
            })
        )

        // 将Markdown转换为HTML
        const htmlContents = contents.map(({ file, content }) => {
            const html = markdownToHtml(content)
            return `
                <div class="doc-section">
                    <h2 class="doc-section-title">${file}</h2>
                    <div class="doc-body">${html}</div>
                </div>
            `
        })

        return htmlContents.join('<hr class="doc-divider">')
    } catch (error) {
        console.error('Error loading documents:', error)
        throw error
    }
}

/**
 * 获取单个文档内容
 */
export async function getSingleDocument(file: string): Promise<string> {
    const content = await getDocumentContent([file])
    return content
}
