/**
 * 分页 Hook
 */
import { ref, computed } from 'vue'

interface PaginationOptions {
  page?: number
  pageSize?: number
}

export function usePagination<T>(options: PaginationOptions = {}) {
  const { page: initialPage = 1, pageSize: initialPageSize = 10 } = options

  const list = ref<T[]>([]) as { value: T[] }
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)
  const loading = ref(false)
  const refreshing = ref(false)
  const finished = ref(false)

  const hasMore = computed(() => list.value.length < total.value)

  const reset = () => {
    list.value = []
    page.value = 1
    total.value = 0
    finished.value = false
  }

  const setData = (data: T[], totalCount: number, isRefresh = false) => {
    if (isRefresh) {
      list.value = data
    } else {
      list.value = [...list.value, ...data]
    }
    total.value = totalCount
    finished.value = list.value.length >= totalCount
  }

  const nextPage = () => {
    if (!finished.value && !loading.value) {
      page.value++
    }
  }

  return {
    list,
    page,
    pageSize,
    total,
    loading,
    refreshing,
    finished,
    hasMore,
    reset,
    setData,
    nextPage,
  }
}
