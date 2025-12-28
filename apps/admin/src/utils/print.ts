/**
 * 打印工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

/**
 * 打印当前页面
 */
export function printPage() {
    window.print()
}

/**
 * 打印指定元素
 */
export function printElement(elementId: string) {
    const element = document.getElementById(elementId)
    if (!element) {
        console.error('元素不存在')
        return
    }
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
        console.error('无法打开打印窗口')
        return
    }
    
    printWindow.document.write(`
        <html>
            <head>
                <title>打印</title>
                <style>
                    body { margin: 0; padding: 20px; }
                    @media print {
                        body { margin: 0; padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
        </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 250)
}

