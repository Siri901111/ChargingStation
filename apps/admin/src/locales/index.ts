import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import jaJP from './ja-JP'

export type LocaleType = 'zh-CN' | 'en-US' | 'ja-JP'

export const localeOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
    { label: '日本語', value: 'ja-JP' },
] as const

// 获取默认语言
const getDefaultLocale = (): LocaleType => {
    const saved = localStorage.getItem('locale') as LocaleType
    if (saved && ['zh-CN', 'en-US', 'ja-JP'].includes(saved)) {
        return saved
    }
    // 根据浏览器语言自动选择
    const browserLang = navigator.language
    if (browserLang.startsWith('zh')) return 'zh-CN'
    if (browserLang.startsWith('ja')) return 'ja-JP'
    return 'en-US'
}

const i18n = createI18n({
    legacy: false, // 使用 Composition API 模式
    locale: getDefaultLocale(),
    fallbackLocale: 'zh-CN',
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS,
        'ja-JP': jaJP,
    },
})

// 切换语言
export const setLocale = (locale: LocaleType) => {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
    document.documentElement.setAttribute('lang', locale)
}

// 获取当前语言
export const getLocale = (): LocaleType => {
    return i18n.global.locale.value as LocaleType
}

export default i18n
