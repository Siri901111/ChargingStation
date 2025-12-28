/**
 * 锁屏工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

export interface LockScreenOptions {
    password?: string
    onUnlock?: (password: string) => boolean | Promise<boolean>
    autoLock?: boolean
    autoLockTime?: number // 毫秒
}

let lockScreenElement: HTMLDivElement | null = null
let autoLockTimer: number | null = null
let isLocked = false

/**
 * 锁定屏幕
 */
export function lockScreen(options: LockScreenOptions = {}) {
    if (isLocked) return

    isLocked = true
    const lockScreen = document.createElement('div')
    lockScreen.id = 'lock-screen'
    lockScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: white;
    `

    lockScreen.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
            <h2 style="font-size: 24px; margin: 0 0 8px 0;">屏幕已锁定</h2>
            <p style="font-size: 14px; opacity: 0.8; margin: 0;">请输入密码解锁</p>
        </div>
        <div style="width: 320px;">
            <input 
                id="lock-password-input" 
                type="password" 
                placeholder="请输入密码" 
                style="
                    width: 100%;
                    padding: 12px 16px;
                    font-size: 16px;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    backdrop-filter: blur(10px);
                    outline: none;
                "
            />
            <button 
                id="lock-unlock-btn" 
                style="
                    width: 100%;
                    margin-top: 16px;
                    padding: 12px;
                    font-size: 16px;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.3);
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                "
            >解锁</button>
        </div>
    `

    document.body.appendChild(lockScreen)
    lockScreenElement = lockScreen

    const input = lockScreen.querySelector('#lock-password-input') as HTMLInputElement
    const btn = lockScreen.querySelector('#lock-unlock-btn') as HTMLButtonElement

    const handleUnlock = async () => {
        const password = input.value
        if (!password) {
            alert('请输入密码')
            return
        }

        if (options.onUnlock) {
            const result = await options.onUnlock(password)
            if (result) {
                unlockScreen()
            } else {
                alert('密码错误')
                input.value = ''
            }
        } else if (options.password) {
            if (password === options.password) {
                unlockScreen()
            } else {
                alert('密码错误')
                input.value = ''
            }
        } else {
            unlockScreen()
        }
    }

    btn.addEventListener('click', handleUnlock)
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUnlock()
        }
    })

    input.focus()
}

/**
 * 解锁屏幕
 */
export function unlockScreen() {
    if (!isLocked) return

    isLocked = false
    if (lockScreenElement) {
        lockScreenElement.remove()
        lockScreenElement = null
    }
}

/**
 * 设置自动锁屏
 */
export function setAutoLock(time: number) {
    clearAutoLock()
    autoLockTimer = window.setTimeout(() => {
        lockScreen()
    }, time)
}

/**
 * 清除自动锁屏
 */
export function clearAutoLock() {
    if (autoLockTimer) {
        clearTimeout(autoLockTimer)
        autoLockTimer = null
    }
}

/**
 * 检查是否已锁定
 */
export function checkLocked(): boolean {
    return isLocked
}

