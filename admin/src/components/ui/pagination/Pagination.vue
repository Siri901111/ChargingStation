<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

interface Props {
  page: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  showSizeChanger: true,
  pageSizeOptions: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = props.page
  const total = totalPages.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:page', page)
  }
}

const changePageSize = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:pageSize', Number(target.value))
  emit('update:page', 1)
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-4">
    <div class="text-sm text-muted-foreground">
      共 {{ total }} 条
    </div>
    <div class="flex items-center gap-2">
      <!-- Page Size Selector -->
      <select
        v-if="showSizeChanger"
        :value="pageSize"
        @change="changePageSize"
        class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }} 条/页
        </option>
      </select>

      <!-- First Page -->
      <Button
        variant="outline"
        size="icon"
        class="h-9 w-9"
        :disabled="page === 1"
        @click="goToPage(1)"
      >
        <ChevronsLeft class="h-4 w-4" />
      </Button>

      <!-- Previous Page -->
      <Button
        variant="outline"
        size="icon"
        class="h-9 w-9"
        :disabled="page === 1"
        @click="goToPage(page - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <!-- Page Numbers -->
      <template v-for="(p, index) in visiblePages" :key="index">
        <span v-if="p === '...'" class="px-2 text-muted-foreground">...</span>
        <Button
          v-else
          :variant="p === page ? 'default' : 'outline'"
          size="icon"
          class="h-9 w-9"
          @click="goToPage(p as number)"
        >
          {{ p }}
        </Button>
      </template>

      <!-- Next Page -->
      <Button
        variant="outline"
        size="icon"
        class="h-9 w-9"
        :disabled="page === totalPages"
        @click="goToPage(page + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>

      <!-- Last Page -->
      <Button
        variant="outline"
        size="icon"
        class="h-9 w-9"
        :disabled="page === totalPages"
        @click="goToPage(totalPages)"
      >
        <ChevronsRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
