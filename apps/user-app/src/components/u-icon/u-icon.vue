/**
 * 图标组件 - 基于 SVG 背景图
 *
 * 使用方式:
 * <u-icon name="home" />
 * <u-icon name="home" size="48" />
 * <u-icon name="home" color="#5A8F7B" />
 * <u-icon name="home-filled" />
 */
<template>
  <view
    class="u-icon"
    :class="[iconClass, { 'is-spinning': spinning }]"
    :style="iconStyle"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: number | string
  color?: string
  spinning?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  color: '',
  spinning: false,
})

const emit = defineEmits<{
  click: [e: Event]
}>()

const iconClass = computed(() => `icon icon-${props.name}`)

const iconStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}rpx` : props.size
  return {
    fontSize: size,
    ...(props.color ? { '--icon-color': props.color } : {}),
  }
})

function handleClick(e: Event) {
  emit('click', e)
}
</script>

<style lang="scss" scoped>
.u-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
  vertical-align: middle;

  &.is-spinning {
    animation: icon-spin 1s linear infinite;
  }
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
