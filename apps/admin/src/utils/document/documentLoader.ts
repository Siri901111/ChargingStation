/**
 * 文档加载工具
 * 从docs文件夹加载Markdown文档并转换为HTML
 */

/**
 * 简单的Markdown转HTML转换器
 */
function markdownToHtml(markdown: string): string {
    let html = markdown
    
    // 标题转换
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // 粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
    
    // 代码块
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>')
    
    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    
    // 列表
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>')
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    
    // 段落
    html = html.split('\n\n').map(para => {
        if (!para.trim()) return ''
        if (para.startsWith('<')) return para
        return `<p>${para}</p>`
    }).join('\n')
    
    // 表格处理（更完善的表格解析）
    const lines = html.split('\n')
    let inTable = false
    let tableRows: string[] = []
    let processedLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.startsWith('|') && line.endsWith('|')) {
            if (!inTable) {
                inTable = true
                tableRows = []
            }
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell)
            // 跳过分隔行（如 |---|---|）
            if (cells.every(cell => /^[-:]+$/.test(cell))) {
                continue
            }
            const isHeader = tableRows.length === 0
            const tag = isHeader ? 'th' : 'td'
            const row = '<tr>' + cells.map(cell => `<${tag}>${cell}</${tag}>`).join('') + '</tr>'
            tableRows.push(row)
        } else {
            if (inTable && tableRows.length > 0) {
                processedLines.push('<table>' + tableRows.join('') + '</table>')
                tableRows = []
                inTable = false
            }
            processedLines.push(line)
        }
    }
    
    if (inTable && tableRows.length > 0) {
        processedLines.push('<table>' + tableRows.join('') + '</table>')
    }
    
    html = processedLines.join('\n')
    
    // 处理列表（需要包装在ul/ol中）
    html = html.replace(/(<li>.*?<\/li>)/gim, (match) => {
        if (!match.includes('<ul>') && !match.includes('<ol>')) {
            return `<ul>${match}</ul>`
        }
        return match
    })
    
    // 换行
    html = html.replace(/\n/gim, '<br>')
    
    return html
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
                    // 文档应该在构建时或开发时通过脚本复制到public/docs
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
                    <h2>${file}</h2>
                    <div class="doc-body">${html}</div>
                </div>
            `
        })

        return htmlContents.join('<hr style="margin: 32px 0; border: none; border-top: 1px solid var(--border-color-light);">')
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

