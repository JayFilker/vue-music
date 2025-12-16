<script setup>
import { ref } from 'vue'
import SvgIcon from '../common/SvgIcon.vue'
import LikeButton from '../common/LikeButton.vue'
const props = defineProps({
  track: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  albumInfo: {
    type: Object,
    default: null
  },
  isLiked: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['click'])
const showIcon = ref(false)
// 格式化时长
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
// 格式化艺术家
const formatArtists = (artists) => {
  if (!artists || !Array.isArray(artists)) return ''
  return artists.map(artist => artist.name).join(', ')
}
const handleClick = () => {
  emit('click', props.track, props.index)
}
const handlePlayButtonClick = (e) => {
  e.stopPropagation() // 阻止事件冒泡
  emit('click', props.track, props.index)
}
</script>
<template>
  <div
    :class="['track-item', { playing: isPlaying, focus: showIcon }]"
    @mouseenter="showIcon = true"
    @mouseleave="showIcon = false"
    @dblclick="handleClick"
  >
    <div class="index-col">
      <span v-if="!isPlaying && !showIcon" class="track-number">
        {{ index + 1 }}
      </span>
      <button
        v-if="showIcon && !isPlaying"
        class="play-button"
        @click="handlePlayButtonClick"
      >
        <SvgIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path
              fill="currentColor"
              d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
            />
          </svg>
        </SvgIcon>
      </button>
      <button v-if="isPlaying" class="playing-icon">
        <SvgIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
              fill="currentColor"
              d="M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"
            />
          </svg>
        </SvgIcon>
      </button>
    </div>
    <div class="title-col">
      <div class="title">{{ track.name }}</div>
      <div class="artist">{{ formatArtists(track.artists) }}</div>
    </div>

    <div v-if="albumInfo" class="album-col">
      {{ track.album?.name || albumInfo?.name }}
    </div>

    <div class="duration-col">
      {{ formatDuration(track.duration_ms) }}
    </div>
    <div class="actions-col">
      <LikeButton
        :item="track"
        type="track"
        :is-liked="isLiked"
        size="small"
      />
    </div>
  </div>
</template>
<style scoped>
.track-item {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 80px 50px;
  gap: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  align-items: center;
}
.track-item:hover,
.track-item.focus {
  background-color: var(--color-secondary-bg-for-transparent);
}
.track-item.playing {
  color: var(--color-primary);
}
.index-col {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.track-number {
  font-size: 14px;
  color: var(--color-secondary);
}
.play-button,
.playing-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.play-button :deep(.svg-icon),
.playing-icon :deep(.svg-icon) {
  width: 16px;
  height: 16px;
}
.play-button:hover {
  transform: scale(1.1);
}
.title-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.artist {
  font-size: 12px;
  color: var(--color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.album-col {
  font-size: 14px;
  color: var(--color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.duration-col {
  font-size: 14px;
  color: var(--color-secondary);
  text-align: right;
}
.actions-col {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
@media (max-width: 768px) {
  .track-item {
    grid-template-columns: 40px 1fr 60px 40px;
  }
  .album-col {
    display: none;
  }
}
</style>
