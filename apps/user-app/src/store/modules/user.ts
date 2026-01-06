/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS, PAGE_PATH } from '@/constants'
import { setStorage, getStorage, removeStorage } from '@/utils/storage'
import { userApi } from '@/api/user'

export interface UserInfo {
  id: number
  phone: string
  name?: string
  avatar?: string
  memberCardNo?: string
  cardType?: string
  balance?: number
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const balance = computed(() => userInfo.value?.balance ?? 0)
  const phone = computed(() => userInfo.value?.phone ?? '')
  const displayName = computed(() => userInfo.value?.name || userInfo.value?.phone || '用户')

  // Actions
  /**
   * 检查登录状态
   */
  function checkLoginStatus() {
    const savedToken = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    const savedUserInfo = getStorage<UserInfo>(STORAGE_KEYS.USER_INFO)

    if (savedToken) {
      token.value = savedToken
      userInfo.value = savedUserInfo || null
    }
  }

  /**
   * 设置 Token
   */
  function setToken(newToken: string) {
    token.value = newToken
    uni.setStorageSync(STORAGE_KEYS.TOKEN, newToken)
  }

  /**
   * 设置用户信息
   */
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    setStorage(STORAGE_KEYS.USER_INFO, info)
  }

  /**
   * 手机号登录
   */
  async function loginByPhone(phone: string, code: string) {
    isLoading.value = true
    try {
      const res = await userApi.loginByPhone({ phone, code })
      setToken(res.token)
      setUserInfo(res.userInfo)
      return res
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 微信登录
   */
  async function loginByWechat() {
    isLoading.value = true
    try {
      // 获取微信 code
      const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: resolve,
          fail: reject,
        })
      })

      if (!loginRes.code) {
        throw new Error('微信登录失败')
      }

      const res = await userApi.loginByWechat({ code: loginRes.code })
      setToken(res.token)
      if (res.userInfo) {
        setUserInfo(res.userInfo)
      }
      return res
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const info = await userApi.getUserInfo()
      setUserInfo(info)
      return info
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  /**
   * 更新用户信息
   */
  async function updateUserInfo(data: Partial<UserInfo>) {
    const info = await userApi.updateUserInfo(data)
    setUserInfo({ ...userInfo.value, ...info } as UserInfo)
    return info
  }

  /**
   * 退出登录
   */
  function logout() {
    token.value = ''
    userInfo.value = null
    removeStorage(STORAGE_KEYS.TOKEN)
    removeStorage(STORAGE_KEYS.USER_INFO)
  }

  /**
   * 检查登录并跳转
   */
  function checkLoginAndNavigate(callback?: () => void): boolean {
    if (!isLoggedIn.value) {
      uni.navigateTo({ url: PAGE_PATH.LOGIN })
      return false
    }
    callback?.()
    return true
  }

  return {
    // State
    token,
    userInfo,
    isLoading,
    // Getters
    isLoggedIn,
    balance,
    phone,
    displayName,
    // Actions
    checkLoginStatus,
    setToken,
    setUserInfo,
    loginByPhone,
    loginByWechat,
    fetchUserInfo,
    updateUserInfo,
    logout,
    checkLoginAndNavigate,
  }
})
