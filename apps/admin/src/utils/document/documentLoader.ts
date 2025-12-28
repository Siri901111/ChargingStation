/**
 * 文档加载工具 - Typora 风格 Markdown 渲染
 * 支持完整的 Markdown 特性，包括：
 * - 代码高亮
 * - 任务列表
 * - 表格增强
 * - 脚注
 * - 目录生成
 * - 自定义容器 (提示、警告等)
 */

import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// @ts-ignore
import anchor from 'markdown-it-anchor'
// @ts-ignore
import tocDoneRight from 'markdown-it-toc-done-right'
// @ts-ignore
import taskLists from 'markdown-it-task-lists'
// @ts-ignore
import footnote from 'markdown-it-footnote'
// @ts-ignore
import container from 'markdown-it-container'
// @ts-ignore
import mark from 'markdown-it-mark'
// @ts-ignore
import sub from 'markdown-it-sub'
// @ts-ignore
import sup from 'markdown-it-sup'

// 导入代码高亮样式
import 'highlight.js/styles/github.css'

// 创建自定义容器渲染器
const createContainer = (name: string, defaultTitle: string) => {
    return {
        validate: (params: string) => params.trim().match(new RegExp(`^${name}\\s*(.*)$`)),
        render: (tokens: any[], idx: number) => {
            const m = tokens[idx].info.trim().match(new RegExp(`^${name}\\s*(.*)$`))
            if (tokens[idx].nesting === 1) {
                const title = m && m[1] ? m[1] : defaultTitle
                return `<div class="custom-container ${name}"><p class="custom-container-title">${title}</p>\n`
            } else {
                return '</div>\n'
            }
        }
    }
}

// 配置 markdown-it，启用所有增强功能
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: (str: string, lang?: string) => {
        // 语言别名映射
        const langMap: Record<string, string> = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'yml': 'yaml',
            'sh': 'bash',
            'shell': 'bash',
            'zsh': 'bash'
        }

        const actualLang = lang ? (langMap[lang.toLowerCase()] || lang) : ''

        if (actualLang && hljs.getLanguage(actualLang)) {
            try {
                const highlighted = hljs.highlight(str, {
                    language: actualLang,
                    ignoreIllegals: true
                }).value
                return `<pre class="hljs-code-block"><div class="code-header"><span class="code-lang">${actualLang}</span><button class="copy-btn" onclick="window.copyCodeToClipboard(this)">复制</button></div><code class="hljs language-${actualLang}">${highlighted}</code></pre>`
            } catch (e) {
                console.warn('Highlight error:', e)
            }
        }

        // 无语言或语言不支持时的默认处理
        const escaped = md.utils.escapeHtml(str)
        return `<pre class="hljs-code-block"><div class="code-header"><span class="code-lang">${actualLang || 'text'}</span><button class="copy-btn" onclick="window.copyCodeToClipboard(this)">复制</button></div><code class="hljs">${escaped}</code></pre>`
    }
})
    // 锚点和目录
    .use(anchor, {
        permalink: anchor.permalink.ariaHidden({
            placement: 'before',
            symbol: '#',
            class: 'header-anchor'
        }),
        slugify: (s: string) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'))
    })
    .use(tocDoneRight, {
        containerClass: 'toc-container',
        listClass: 'toc-list',
        itemClass: 'toc-item',
        linkClass: 'toc-link',
        level: [1, 2, 3]
    })
    // 任务列表
    .use(taskLists, { enabled: true, label: true, labelAfter: true })
    // 脚注
    .use(footnote)
    // 高亮标记 ==text==
    .use(mark)
    // 下标 ~text~
    .use(sub)
    // 上标 ^text^
    .use(sup)
    // 自定义容器
    .use(container, 'tip', createContainer('tip', '提示'))
    .use(container, 'warning', createContainer('warning', '警告'))
    .use(container, 'danger', createContainer('danger', '危险'))
    .use(container, 'info', createContainer('info', '信息'))
    .use(container, 'success', createContainer('success', '成功'))
    .use(container, 'details', {
        validate: (params: string) => params.trim().match(/^details\s*(.*)$/),
        render: (tokens: any[], idx: number) => {
            const m = tokens[idx].info.trim().match(/^details\s*(.*)$/)
            if (tokens[idx].nesting === 1) {
                const summary = m && m[1] ? m[1] : '详情'
                return `<details class="custom-details"><summary>${summary}</summary>\n`
            } else {
                return '</details>\n'
            }
        }
    })

// 自定义渲染规则：优化表格
md.renderer.rules.table_open = () => {
    return '<div class="table-wrapper"><table class="typora-table">'
}
md.renderer.rules.table_close = () => '</table></div>'

// 自定义渲染规则：优化图片
md.renderer.rules.image = (tokens: any, idx: any) => {
    const token = tokens[idx]
    const src = token.attrGet('src') || ''
    const alt = token.content || ''
    const title = token.attrGet('title') || ''

    return `<figure class="typora-image">
        <img src="${src}" alt="${alt}" title="${title}" loading="lazy" />
        ${alt ? `<figcaption>${alt}</figcaption>` : ''}
    </figure>`
}

// 自定义渲染规则：为链接添加属性
const defaultLinkRender = md.renderer.rules.link_open || function(tokens: any, idx: any, options: any, _env: any, self: any) {
    return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = (tokens: any, idx: any, options: any, env: any, self: any) => {
    const token = tokens[idx]
    const href = token.attrGet('href') || ''

    // 外部链接添加 target="_blank"
    if (href.startsWith('http://') || href.startsWith('https://')) {
        token.attrSet('target', '_blank')
        token.attrSet('rel', 'noopener noreferrer')
    }

    return defaultLinkRender(tokens, idx, options, env, self)
}

// 注册全局复制函数
if (typeof window !== 'undefined') {
    (window as any).copyCodeToClipboard = function(btn: HTMLElement) {
        const code = btn.parentElement?.nextElementSibling?.textContent || ''
        navigator.clipboard.writeText(code).then(() => {
            const originalText = btn.textContent
            btn.textContent = '已复制!'
            btn.classList.add('copied')
            setTimeout(() => {
                btn.textContent = originalText
                btn.classList.remove('copied')
            }, 2000)
        }).catch(err => {
            console.error('复制失败:', err)
        })
    }
}

/**
 * 将 Markdown 转换为 HTML
 */
export function markdownToHtml(markdown: string): string {
    // 预处理：处理一些特殊语法
    let processed = markdown

    // 处理 Typora 风格的高亮语法
    processed = processed.replace(/==([^=]+)==/g, '<mark>$1</mark>')

    return md.render(processed)
}

/**
 * 加载文档内容
 */
export async function getDocumentContent(files: string[]): Promise<string> {
    try {
        const contents = await Promise.all(
            files.map(async (file) => {
                try {
                    const response = await fetch(`/docs/${file}`)

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                    }

                    const text = await response.text()
                    return { file, content: text, success: true }
                } catch (error) {
                    console.error(`Error loading ${file}:`, error)
                    const errorMsg = error instanceof Error ? error.message : '未知错误'
                    return {
                        file,
                        content: `# ${file}\n\n:::danger 文档加载失败\n**错误信息:** ${errorMsg}\n\n**解决方案：**\n1. 运行 \`npm run copy-docs\` 将docs文件夹复制到public目录\n2. 或者手动将项目根目录的 \`docs\` 文件夹复制到 \`apps/admin/public/docs\`\n3. 确保文件路径正确：\`${file}\`\n:::`,
                        success: false
                    }
                }
            })
        )

        // 将 Markdown 转换为 HTML
        const htmlContents = contents.map(({ file, content }) => {
            const html = markdownToHtml(content)
            // 提取文件名作为标题
            const fileName = file.split('/').pop()?.replace('.md', '') || file
            return `
                <article class="doc-article">
                    <header class="doc-article-header">
                        <h1 class="doc-article-title">${fileName}</h1>
                        <div class="doc-article-meta">
                            <span class="doc-file-path">${file}</span>
                        </div>
                    </header>
                    <div class="doc-article-content typora-content">${html}</div>
                </article>
            `
        })

        return htmlContents.join('<hr class="doc-separator">')
    } catch (error) {
        console.error('Error loading documents:', error)
        throw error
    }
}

/**
 * 获取单个文档内容
 */
export async function getSingleDocument(file: string): Promise<string> {
    return getDocumentContent([file])
}

/**
 * 从 HTML 内容中提取目录
 */
export function extractToc(html: string): { id: string; text: string; level: number }[] {
    const toc: { id: string; text: string; level: number }[] = []
    const regex = /<h([1-3])[^>]*id="([^"]*)"[^>]*>.*?<\/h\1>/g
    let match

    while ((match = regex.exec(html)) !== null) {
        // 提取标题文本（去除锚点链接）
        const fullMatch = match[0]
        const textMatch = fullMatch.match(/>([^<]+)<\/h/)
        if (textMatch) {
            toc.push({
                level: parseInt(match[1]),
                id: match[2],
                text: textMatch[1].trim()
            })
        }
    }

    return toc
}
