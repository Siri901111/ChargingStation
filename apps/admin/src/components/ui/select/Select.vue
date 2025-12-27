<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import {
  SelectRoot,
  type SelectRootEmits,
  type SelectRootProps,
  useForwardPropsEmits,
} from 'radix-vue'

const props = defineProps<SelectRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<SelectRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <slot />
  </SelectRoot>
</template>
