<script setup>
import { ref, watch } from 'vue'
import { useMusicStore } from '@/stores/music'
import SvgIcon from '../common/SvgIcon.vue'
import ButtonIcon from '../common/ButtonIcon.vue'

const musicStore = useMusicStore()
const localVolume = ref(musicStore.volume)
const previousVolume = ref(0.7)

// 监听store中的音量变化
watch(() => musicStore.volume, (newVolume) => {
  localVolume.value = newVolume
})

// 处理音量改变
const handleVolumeChange = (e) => {
  const newVolume = parseFloat(e.target.value)
  localVolume.value = newVolume
  musicStore.setVolume(newVolume)
}

// 切换静音
const toggleMute = () => {
  if (localVolume.value > 0) {
    previousVolume.value = localVolume.value
    musicStore.setVolume(0)
  } else {
    musicStore.setVolume(previousVolume.value || 0.7)
  }
}

// 计算音量百分比
const volumePercentage = () => {
  return localVolume.value * 100
}
</script>

<template>
  <div class="volume-control">
    <ButtonIcon @click="toggleMute" title="音量">
      <SvgIcon>
        <svg v-if="localVolume === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            fill="currentColor"
            d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM461.64 256l45.64-45.64c6.3-6.3 6.3-16.52 0-22.82l-22.82-22.82c-6.3-6.3-16.52-6.3-22.82 0L416 210.36l-45.64-45.64c-6.3-6.3-16.52-6.3-22.82 0l-22.82 22.82c-6.3 6.3-6.3 16.52 0 22.82L370.36 256l-45.63 45.63c-6.3 6.3-6.3 16.52 0 22.82l22.82 22.82c6.3 6.3 16.52 6.3 22.82 0L416 301.64l45.64 45.64c6.3 6.3 16.52 6.3 22.82 0l22.82-22.82c6.3-6.3 6.3-16.52 0-22.82L461.64 256z"
          />
        </svg>
        <svg v-else-if="localVolume < 0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <path
            fill="currentColor"
            d="M215.03 72.04L126.06 161H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V89.02c0-21.47-25.96-31.98-40.97-16.98zm123.2 108.08c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 229.28 336 242.62 336 257c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.87z"
          />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
          <path
            fill="currentColor"
            d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 229.28 336 242.62 336 257c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.87z"
          />
        </svg>
      </SvgIcon>
    </ButtonIcon>
    <div class="slider-container">
      <input
        v-model="localVolume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        class="slider"
        :style="{ backgroundSize: `${volumePercentage()}% 100%` }"
        @input="handleVolumeChange"
      >
    </div>
  </div>
</template>

<style scoped>
.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slider-container {
  width: 100px;
}

.slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  outline: none;
  background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) 0%, var(--color-secondary-bg) 0%, var(--color-secondary-bg) 100%);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.slider:hover::-webkit-slider-thumb {
  opacity: 1;
}

.slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.slider:hover::-moz-range-thumb {
  opacity: 1;
}
</style>
