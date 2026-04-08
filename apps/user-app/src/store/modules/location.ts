/**
 * 位置状态管理
 * 使用高德地图 API 进行定位和逆地理编码
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'
import { setStorage, getStorage } from '@/utils/storage'
import config from '@/config'

export interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
  district?: string  // 区县
  street?: string    // 街道
}

// 默认位置：长沙市中心（用于开发测试）
const DEFAULT_LOCATION: Location = {
  latitude: 39.11198,
  longitude: 117.35002,
  address: '天津市中国民航大学',
  city: '天津市',
  district: '东丽区',
}

export const useLocationStore = defineStore('location', () => {
  // State
  const currentLocation = ref<Location | null>(null)
  const isLocating = ref(false)
  const locationError = ref<string>('')
  const pendingSearchKeyword = ref<string>('')  // 待处理的搜索关键词（用于跨页面传递）

  // Getters
  const hasLocation = computed(() => !!currentLocation.value)

  // 显示在左上角的位置文本（优先显示区县）
  const locationText = computed(() => {
    if (isLocating.value) return '定位中...'
    if (!currentLocation.value) return '定位中...'

    const loc = currentLocation.value
    // 优先显示：区县 > 城市 > 完整地址
    if (loc.district) return loc.district
    if (loc.city) return loc.city
    if (loc.address) return loc.address.slice(0, 10)
    return '未知位置'
  })

  // Actions
  /**
   * 获取当前位置（使用高德地图 API）
   */
  async function getCurrentLocation(): Promise<Location | null> {
    isLocating.value = true
    locationError.value = ''

    try {
      // 先使用缓存显示
      // const cached = getStorage<Location>(STORAGE_KEYS.LOCATION)
      // if (cached && cached.latitude) {
      //   currentLocation.value = cached
      // }

      // #ifdef H5
      // H5 环境：先获取浏览器定位坐标，再用高德逆地理编码
      const coords = await getBrowserLocation()
      if (coords) {
        console.log('📍 浏览器定位坐标:', coords)
        // 使用高德逆地理编码获取详细地址
        const addressInfo = await reverseGeocodeByAmap(coords.latitude, coords.longitude)
        const location: Location = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          ...addressInfo,
        }
        currentLocation.value = location
        setStorage(STORAGE_KEYS.LOCATION, location)
        console.log('📍 高德逆地理编码结果:', location)
        return location
      }
      // #endif

      // 定位失败，使用默认位置
      throw new Error('定位失败')

    } catch (error) {
      console.warn('定位失败，使用默认位置（长沙）', error)
      locationError.value = '定位失败'

      // 使用默认位置（长沙）
      currentLocation.value = DEFAULT_LOCATION
      setStorage(STORAGE_KEYS.LOCATION, DEFAULT_LOCATION)

      return DEFAULT_LOCATION
    } finally {
      isLocating.value = false
    }
  }

  /**
   * 获取浏览器原生定位坐标
   */
  function getBrowserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('浏览器不支持定位')
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.warn('浏览器定位失败:', error.message)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5分钟缓存
        }
      )
    })
  }

  /**
   * 使用高德 Web API 逆地理编码
   */
  async function reverseGeocodeByAmap(
    latitude: number,
    longitude: number
  ): Promise<{ address: string; city: string; district: string; street: string }> {
    const defaultResult = { address: '', city: '', district: '', street: '' }

    try {
      // 使用高德逆地理编码 API
      const url = `https://restapi.amap.com/v3/geocode/regeo?key=${config.amapKey}&location=${longitude},${latitude}&extensions=base`

      const response = await fetch(url)
      const data = await response.json()

      console.log('📍 高德逆地理编码响应:', data)

      if (data.status === '1' && data.regeocode) {
        const regeocode = data.regeocode
        const addressComponent = regeocode.addressComponent || {}

        return {
          address: regeocode.formatted_address || '',
          city: addressComponent.city || addressComponent.province || '',
          district: addressComponent.district || '',
          street: addressComponent.street || addressComponent.township || '',
        }
      }

      return defaultResult
    } catch (error) {
      console.error('高德逆地理编码失败:', error)
      return defaultResult
    }
  }

  /**
   * 逆地理编码（兼容多平台）
   */
  async function reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ address: string; city: string }> {
    const result = await reverseGeocodeByAmap(latitude, longitude)
    return {
      address: result.address,
      city: result.city,
    }
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

  /**
   * 设置待处理的搜索关键词
   */
  function setPendingSearch(keyword: string) {
    pendingSearchKeyword.value = keyword
  }

  /**
   * 消费待处理的搜索关键词（获取后清空）
   */
  function consumePendingSearch(): string {
    const keyword = pendingSearchKeyword.value
    pendingSearchKeyword.value = ''
    return keyword
  }

  return {
    // State
    currentLocation,
    isLocating,
    locationError,
    pendingSearchKeyword,
    // Getters
    hasLocation,
    locationText,
    // Actions
    getCurrentLocation,
    reverseGeocode,
    reverseGeocodeByAmap,
    openLocationSetting,
    setPendingSearch,
    consumePendingSearch,
  }
})
