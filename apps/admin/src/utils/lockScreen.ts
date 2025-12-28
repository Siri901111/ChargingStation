/**
 * 锁屏工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

const LOCK_SCREEN_STORAGE_KEY = 'lock-screen-enabled'
const LOCK_SCREEN_PASSWORD_KEY = 'lock-screen-password'

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

    // 保存密码到localStorage
    if (options.password) {
        localStorage.setItem(LOCK_SCREEN_PASSWORD_KEY, options.password)
    }

    isLocked = true
    localStorage.setItem(LOCK_SCREEN_STORAGE_KEY, 'true')

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

    // 使用国际化文本（这里先用占位符，实际使用时需要传入i18n函数）
    const lockText = '屏幕已锁定'
    const unlockText = '请输入密码解锁'
    const placeholderText = '请输入密码'
    const unlockBtnText = '解锁'
    const errorText = '密码错误'
    const emptyText = '请输入密码'

    lockScreen.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
            <h2 style="font-size: 24px; margin: 0 0 8px 0;">${lockText}</h2>
            <p style="font-size: 14px; opacity: 0.8; margin: 0;">${unlockText}</p>
        </div>
        <div style="width: 320px;">
            <input 
                id="lock-password-input" 
                type="password" 
                placeholder="${placeholderText}" 
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
            >${unlockBtnText}</button>
            <div id="lock-error-msg" style="color: #ff4d4f; font-size: 12px; margin-top: 8px; text-align: center; display: none;"></div>
        </div>
    `

    document.body.appendChild(lockScreen)
    lockScreenElement = lockScreen

    const input = lockScreen.querySelector('#lock-password-input') as HTMLInputElement
    const btn = lockScreen.querySelector('#lock-unlock-btn') as HTMLButtonElement
    const errorMsg = lockScreen.querySelector('#lock-error-msg') as HTMLDivElement

    const handleUnlock = async () => {
        const password = input.value
        if (!password) {
            errorMsg.textContent = emptyText
            errorMsg.style.display = 'block'
            return
        }

        errorMsg.style.display = 'none'

        // 从localStorage获取保存的密码
        const savedPassword = localStorage.getItem(LOCK_SCREEN_PASSWORD_KEY)

        if (options.onUnlock) {
            const result = await options.onUnlock(password)
            if (result) {
                unlockScreen()
            } else {
                errorMsg.textContent = errorText
                errorMsg.style.display = 'block'
                input.value = ''
            }
        } else if (savedPassword) {
            if (password === savedPassword) {
                unlockScreen()
            } else {
                errorMsg.textContent = errorText
                errorMsg.style.display = 'block'
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
    input.addEventListener('input', () => {
        errorMsg.style.display = 'none'
    })

    input.focus()
}

/**
 * 解锁屏幕
 */
export function unlockScreen() {
    if (!isLocked) return

    isLocked = false
    localStorage.setItem(LOCK_SCREEN_STORAGE_KEY, 'false')
    if (lockScreenElement) {
        lockScreenElement.remove()
        lockScreenElement = null
    }
}

/**
 * 检查是否已锁定
 */
export function checkLocked(): boolean {
    return isLocked || localStorage.getItem(LOCK_SCREEN_STORAGE_KEY) === 'true'
}

/**
 * 初始化锁屏（页面加载时调用）
 */
export function initLockScreen() {
    const locked = localStorage.getItem(LOCK_SCREEN_STORAGE_KEY) === 'true'
    if (locked) {
        isLocked = true
        const savedPassword = localStorage.getItem(LOCK_SCREEN_PASSWORD_KEY)
        if (savedPassword) {
            lockScreen({ password: savedPassword })
        }
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

