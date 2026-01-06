/**
 * 页面加载状态 Hook
 */
import { ref } from 'vue'

export function useLoading(initialState = false) {
  const loading = ref(initialState)
  const error = ref<string>('')

  const startLoading = () => {
    loading.value = true
    error.value = ''
  }

  const stopLoading = () => {
    loading.value = false
  }

  const setError = (msg: string) => {
    error.value = msg
    loading.value = false
  }

  const run = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    startLoading()
    try {
      const result = await fn()
      stopLoading()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败')
      return undefined
    }
  }

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setError,
    run,
  }
}
