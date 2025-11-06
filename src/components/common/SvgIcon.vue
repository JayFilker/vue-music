<script setup>
defineProps({
  sty: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <svg class="svg-icon" aria-hidden="true" :style="sty">
    <slot></slot>
  </svg>
</template>

<style scoped>
.svg-icon {
  fill: currentColor;
}
</style>
