<script setup>
import { computed } from 'vue'
import { useMusicStore } from '@/stores/music'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import TopList from '@/components/navigation/TopList.vue'
import Player from '@/components/player/Player.vue'
import Lyrics from '@/components/player/Lyrics.vue'

const musicStore = useMusicStore()
const showLyrics = computed(() => musicStore.showLyrics)

// 初始化全局快捷键
useKeyboardShortcuts()
</script>

<template>
  <div id="app">
    <TopList />
    <main>
      <router-view />
    </main>
    <Lyrics v-if="showLyrics" />
  </div>
  <Player />
</template>

<style>
#app {
  width: 100%;
  transition: all 0.4s;
}

/* 主题切换过渡效果 */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

main {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: auto;
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
  scrollbar-width: none; /* firefox */
}

@media (max-width: 1336px) {
  main {
    padding: 64px 5vw 96px 5vw;
  }
}

main::-webkit-scrollbar {
  width: 0px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

:root {
  /* 默认使用浅色主题 */
  --color-body-bg: #ffffff;
  --color-text: #000000;
  --color-primary: #335eea;
  --color-primary-bg: #eaeffd;
  --color-secondary: #7a7a7b;
  --color-secondary-bg: #f5f5f7;
  --color-navbar-bg: rgba(255, 255, 255, 0.86);
  --color-primary-bg-for-transparent: rgba(189, 207, 255, 0.28);
  --color-secondary-bg-for-transparent: rgba(209, 209, 214, 0.28);
  --html-overflow-y: overlay;
}

/* 浅色主题 */
[data-theme='light'] {
  --color-body-bg: #ffffff;
  --color-text: #000000;
  --color-primary: #335eea;
  --color-primary-bg: #eaeffd;
  --color-secondary: #7a7a7b;
  --color-secondary-bg: #f5f5f7;
  --color-navbar-bg: rgba(255, 255, 255, 0.86);
  --color-primary-bg-for-transparent: rgba(189, 207, 255, 0.28);
  --color-secondary-bg-for-transparent: rgba(209, 209, 214, 0.28);
}

/* 深色主题 */
[data-theme='dark'] {
  --color-body-bg: #222222;
  --color-text: #ffffff;
  --color-primary: #335eea;
  --color-primary-bg: #bbcdff;
  --color-secondary: #7a7a7b;
  --color-secondary-bg: #323232;
  --color-navbar-bg: rgba(34, 34, 34, 0.86);
  --color-primary-bg-for-transparent: rgba(255, 255, 255, 0.12);
  --color-secondary-bg-for-transparent: rgba(255, 255, 255, 0.08);
}
</style>


