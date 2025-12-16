<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/music'
import { seekToPosition } from '@/api/system'
const musicStore = useMusicStore()
const isDragging = ref(false)
const showTooltip = ref(false)
const sliderRef = ref(null)
const lastUpdateTime = ref(Date.now())
const lastMoveTime = ref(0)
// 计算属性：当前进度
const progress = computed(() => musicStore.progress)
const currentTrackDuration = computed(() => musicStore.currentTrackDuration)
const deviceId = computed(() => musicStore.device)
// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
// 计算进度百分比
const progressPercentage = computed(() => {
  if (!currentTrackDuration.value) return 0
  return (progress.value / currentTrackDuration.value) * 100
})
// 根据客户端 X 坐标更新进度
const updateProgressFromClientX = (clientX) => {
  if (!sliderRef.value) return null
  const rect = sliderRef.value.getBoundingClientRect()
  const sliderWidth = rect.width
  const offsetX = clientX - rect.left
  // 计算百分比位置
  let percentage = (offsetX / sliderWidth) * 100
  percentage = Math.max(0, Math.min(100, percentage))
  // 更新进度值
  const newProgress = (percentage / 100) * currentTrackDuration.value
  musicStore.updateProgress(newProgress)
  return newProgress
}
// 跳转到指定位置
const seekToPositionDemo = async (positionSec) => {
  if (!deviceId.value) return
  try {
    const positionMs = Math.floor(positionSec * 1000)
    lastUpdateTime.value = Date.now()
    await seekToPosition(positionMs, deviceId.value)
    console.log('Seek successful')
  } catch (error) {
    console.error('Failed to seek:', error)
  }
}
// 处理鼠标移动（带节流优化，每16ms更新一次，约60fps）
const handleMouseMove = (e) => {
  if (!isDragging.value) return
  const now = Date.now()
  if (now - lastMoveTime.value < 16) return // 节流：约60fps
  lastMoveTime.value = now
  updateProgressFromClientX(e.clientX)
}
// 处理鼠标抬起
const handleMouseUp = (e) => {
  // 只有在真正拖拽时才执行 seek 操作
  if (!isDragging.value) {
    return
  }
  const newProgress = updateProgressFromClientX(e.clientX)
  if (newProgress !== null) {
    seekToPositionDemo(newProgress).then(() => {
      // 等待SDK处理seek请求后再解锁（短延时避免跳动）
      setTimeout(() => {
        musicStore.stopUpdateBar = false
      }, 200)
    })
  }
  isDragging.value = false
}
// 处理鼠标按下
const handleMouseDown = (e) => {
  e.preventDefault()
  if (!sliderRef.value) return
  musicStore.stopUpdateBar = true
  isDragging.value = true
  updateProgressFromClientX(e.clientX)
}
// 触摸事件处理
const handleTouchStart = (e) => {
  if (!sliderRef.value) return
  musicStore.stopUpdateBar = true
  isDragging.value = true
  const touch = e.touches[0]
  updateProgressFromClientX(touch.clientX)
}
const handleTouchMove = (e) => {
  if (!isDragging.value) return
  const now = Date.now()
  if (now - lastMoveTime.value < 16) return // 节流：约60fps
  lastMoveTime.value = now
  const touch = e.touches[0]
  updateProgressFromClientX(touch.clientX)
}
const handleTouchEnd = (e) => {
  // 只有在真正拖拽时才执行 seek 操作
  if (!isDragging.value) {
    return
  }
  const touch = e.changedTouches[0]
  const newProgress = updateProgressFromClientX(touch.clientX)
  if (newProgress !== null) {
    seekToPositionDemo(newProgress).then(() => {
      // 等待SDK处理seek请求后再解锁（短延时避免跳动）
      setTimeout(() => {
        musicStore.stopUpdateBar = false
      }, 200)
    })
  }
  isDragging.value = false
}
// 组件挂载和卸载时的事件监听
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div
    ref="sliderRef"
    class="vue-slider vue-slider-ltr"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="vue-slider-rail">
      <div
        class="vue-slider-process"
        :style="{
          width: `${progressPercentage}%`,
        }"
      />
      <div
        class="vue-slider-dot vue-slider-dot-hover"
        role="slider"
        :aria-valuenow="progressPercentage"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-orientation="horizontal"
        tabindex="0"
        :style="{
          left: `${progressPercentage}%`,
          transition: isDragging ? 'none' : 'left 0s ease 0s'
        }"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        <div class="vue-slider-dot-handle" />
        <div v-if="showTooltip" class="vue-slider-dot-tooltip">
          <div class="vue-slider-dot-tooltip-inner vue-slider-dot-tooltip-inner-top">
            <span class="vue-slider-dot-tooltip-text">
              {{ formatTime(progress) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.vue-slider {
  position: relative;
  cursor: pointer;
  padding: 6px 0;
  width: 100%;
}
.vue-slider-rail {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: hsla(0, 0%, 50.2%, 0.18);
  border-radius: 15px;
  transition: background-color 0.3s;
}
.vue-slider-process {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 15px;
  transition-property: width;
  transition-duration: 0s;
}
.vue-slider-dot {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  transform: translate(-50%, -50%);
  will-change: transform;
  cursor: pointer;
  z-index: 5;
}
.vue-slider-dot-handle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--color-text);
  box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
}
.vue-slider-dot-tooltip {
  position: absolute;
  visibility: visible;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}
.vue-slider-dot-tooltip-inner {
  position: relative;
}
.vue-slider-dot-tooltip-text {
  display: block;
}
.vue-slider-dot-tooltip-inner-top::after {
  content: "";
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 6px;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.75);
}
/* Hover effects */
.vue-slider:hover .vue-slider-rail {
  background-color: hsla(0, 0%, 50.2%, 0.28);
}
</style>
