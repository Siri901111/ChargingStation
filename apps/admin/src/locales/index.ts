import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import jaJP from './ja-JP'
import koKR from './ko-KR'
import frFR from './fr-FR'
import deDE from './de-DE'
import esES from './es-ES'
import ruRU from './ru-RU'
import ptBR from './pt-BR'
import thTH from './th-TH'

export type LocaleType = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES' | 'ru-RU' | 'pt-BR' | 'th-TH'

export const localeOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
    { label: '日本語', value: 'ja-JP' },
    { label: '한국어', value: 'ko-KR' },
    { label: 'Français', value: 'fr-FR' },
    { label: 'Deutsch', value: 'de-DE' },
    { label: 'Español', value: 'es-ES' },
    { label: 'Русский', value: 'ru-RU' },
    { label: 'Português', value: 'pt-BR' },
    { label: 'ไทย', value: 'th-TH' },
] as const

// 获取默认语言
const getDefaultLocale = (): LocaleType => {
    const saved = localStorage.getItem('locale') as LocaleType
    const validLocales: LocaleType[] = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES', 'ru-RU', 'pt-BR', 'th-TH']
    if (saved && validLocales.includes(saved)) {
        return saved
    }
    // 根据浏览器语言自动选择
    const browserLang = navigator.language
    if (browserLang.startsWith('zh')) return 'zh-CN'
    if (browserLang.startsWith('ja')) return 'ja-JP'
    if (browserLang.startsWith('ko')) return 'ko-KR'
    if (browserLang.startsWith('fr')) return 'fr-FR'
    if (browserLang.startsWith('de')) return 'de-DE'
    if (browserLang.startsWith('es')) return 'es-ES'
    if (browserLang.startsWith('ru')) return 'ru-RU'
    if (browserLang.startsWith('pt')) return 'pt-BR'
    if (browserLang.startsWith('th')) return 'th-TH'
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
        'ko-KR': koKR,
        'fr-FR': frFR,
        'de-DE': deDE,
        'es-ES': esES,
        'ru-RU': ruRU,
        'pt-BR': ptBR,
        'th-TH': thTH,
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
