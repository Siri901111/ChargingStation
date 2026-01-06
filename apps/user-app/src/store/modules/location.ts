/**
 * 位置状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'
import { setStorage, getStorage } from '@/utils/storage'

export interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
}

export const useLocationStore = defineStore('location', () => {
  // State
  const currentLocation = ref<Location | null>(null)
  const isLocating = ref(false)
  const locationError = ref<string>('')

  // Getters
  const hasLocation = computed(() => !!currentLocation.value)
  const locationText = computed(() => {
    if (!currentLocation.value) return '定位中...'
    return currentLocation.value.address || currentLocation.value.city || '未知位置'
  })

  // Actions
  /**
   * 获取当前位置
   */
  async function getCurrentLocation(): Promise<Location | null> {
    isLocating.value = true
    locationError.value = ''

    try {
      // 先检查缓存
      const cached = getStorage<Location>(STORAGE_KEYS.LOCATION)
      if (cached) {
        currentLocation.value = cached
      }

      const res = await new Promise<UniApp.GetLocationSuccess>((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          success: resolve,
          fail: reject,
        })
      })

      const location: Location = {
        latitude: res.latitude,
        longitude: res.longitude,
      }

      // 逆地理编码获取地址
      try {
        const addressInfo = await reverseGeocode(res.latitude, res.longitude)
        location.address = addressInfo.address
        location.city = addressInfo.city
      } catch {
        console.error('逆地理编码失败')
      }

      currentLocation.value = location
      setStorage(STORAGE_KEYS.LOCATION, location)

      return location
    } catch (error) {
      locationError.value = '定位失败，请检查定位权限'
      uni.showToast({
        title: '定位失败，请检查权限',
        icon: 'none',
      })
      return null
    } finally {
      isLocating.value = false
    }
  }

  /**
   * 逆地理编码
   */
  async function reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ address: string; city: string }> {
    // 这里使用 uni-app 的逆地理编码能力
    // 实际项目中可以调用高德/腾讯地图 API
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      const qqmapsdk = uni.requireNativePlugin?.('qqmap-wx-jssdk')
      if (qqmapsdk) {
        qqmapsdk.reverseGeocoder({
          location: { latitude, longitude },
          success: (res: { result: { address: string; ad_info: { city: string } } }) => {
            resolve({
              address: res.result.address,
              city: res.result.ad_info.city,
            })
          },
          fail: reject,
        })
      } else {
        resolve({ address: '', city: '' })
      }
      // #endif

      // #ifdef H5
      resolve({ address: '', city: '' })
      // #endif
    })
  }

  /**
   * 打开位置设置
   */
  function openLocationSetting() {
    uni.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          getCurrentLocation()
        }
      },
    })
  }

  return {
    // State
    currentLocation,
    isLocating,
    locationError,
    // Getters
    hasLocation,
    locationText,
    // Actions
    getCurrentLocation,
    reverseGeocode,
    openLocationSetting,
  }
})
