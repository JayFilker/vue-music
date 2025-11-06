<script setup>
defineProps({
  sty: {
    type: Object,
    default: () => ({})
  },
  classname: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const handleClick = (e) => {
  emit('click', e)
}
</script>

<template>
  <button
    :class="['button-icon', classname]"
    :style="sty"
    :title="title"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: transparent;
  margin: 4px;
  border-radius: 25%;
  transition: 0.2s;
  border: none;
  color: white;
}

button :deep(.svg-icon) {
  color: var(--color-text);
  height: 16px;
  width: 16px;
}

button:first-child {
  margin-left: 0;
}

button:hover {
  background: var(--color-secondary-bg-for-transparent);
}

button:active {
  transform: scale(0.92);
}

.button-icon:hover {
  background-color: hsla(0, 0%, 50.2%, 0.18);
  border-radius: 25%;
}
</style>
