<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SvgIcon from '../common/SvgIcon.vue'
const props = defineProps({
  style: {
    type: Object,
    default: () => ({})
  },
  show: {
    type: Boolean,
    default: false
  },
  list: {
    type: Array,
    default: null
  }
})
const emit = defineEmits(['update:show'])
const router = useRouter()
const { t } = useI18n()
const menuItems = [
  {
    name: '设置',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 512 512">
      <path fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path>
    </svg>`,
    route: '/set'
  },
  {
    name: '登陆',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 512 512">
      <path fill="currentColor" d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"></path>
    </svg>`,
    route: '/login'
  }
]
const handleItemClick = (index) => {
  if (props.list) {
    // 自定义列表处理
    return
  }
  const item = menuItems[index]
  if (item && item.route) {
    router.push(item.route)
  }
  emit('update:show', false)
}
</script>
<template>
  <div class="context-menu" style="width: 100px">
    <div class="menu" :style="style">
      <template v-if="list">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="item"
          @click="handleItemClick(index)"
        >
          {{ t(item) }}
        </div>
      </template>
      <template v-else>
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="item"
          @click="handleItemClick(index)"
        >
          <SvgIcon>
            <g v-html="item.svg" />
          </SvgIcon>
          {{ t(item.name) }}
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped>
.context-menu {
  width: 100%;
  height: 100%;
  user-select: none;
}
.menu {
  position: fixed;
  min-width: 136px;
  max-width: 240px;
  list-style: none;
  background: rgba(36, 36, 36, 0.78);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px) contrast(120%) brightness(60%);
  border-radius: 12px;
  box-sizing: border-box;
  padding: 6px;
  z-index: 1000;
  -webkit-app-region: no-drag;
  transition: background 125ms ease-out, opacity 125ms ease-out, transform 125ms ease-out;
}
.menu:focus {
  outline: none;
}
.menu .item {
  font-weight: 600;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: default;
  color: var(--color-text);
  display: flex;
  align-items: center;
}
.menu .item:hover {
  color: var(--color-text);
  background: var(--color-primary-bg-for-transparent);
  transition: opacity 125ms ease-out, transform 125ms ease-out;
}
.menu .item:active {
  opacity: 0.75;
  transform: scale(0.95);
}
.menu .item :deep(.svg-icon) {
  height: 16px;
  width: 16px;
  margin-right: 5px;
}
</style>
