<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useMusicStore } from '@/stores/music'
import { searchMusic, getLyricsByUrl } from '@/api/lyrics'
import ButtonIcon from '../common/ButtonIcon.vue'
import SvgIcon from '../common/SvgIcon.vue'
const musicStore = useMusicStore()
const currentSong = computed(() => {
  const list = musicStore.currentSongList
  const count = musicStore.countDemo
  return list?.items?.[count] || null
})
const progress = computed(() => musicStore.playerDemo.progress)
const duration = computed(() => musicStore.playerDemo.currentTrackDuration)
const settings = computed(() => musicStore.setDemo)
// 歌词相关状态
const currentLyricIndex = ref(0)
const lyricsContainer = ref(null)
// 关闭歌词
const closeLyrics = () => {
  musicStore.toggleLyrics()
}
// 背景渐变
const backgroundGradient = ref('linear-gradient(to left top, rgb(100, 50, 150), rgb(50, 100, 200))')
// 生成随机渐变背景
const generateRandomGradient = () => {
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 200) + 30
    const g = Math.floor(Math.random() * 200) + 30
    const b = Math.floor(Math.random() * 200) + 30
    return `rgb(${r}, ${g}, ${b})`
  }
  const color1 = getRandomColor()
  const color2 = getRandomColor()
  backgroundGradient.value = `linear-gradient(to left top, ${color1}, ${color2})`
}
// 获取歌曲名称用于搜索
const songName = computed(() => currentSong.value?.name || '')
// 使用 Vue Query 搜索歌曲
const { data: musicData } = useQuery({
  queryKey: ['searchMusic', songName],
  queryFn: () => searchMusic(songName.value),
  enabled: computed(() => !!songName.value),
  staleTime: 5 * 60 * 1000, // 5分钟缓存
})
// 获取歌词URL
const lyricsUrl = computed(() => musicData.value?.result?.[0]?.api_lyrics || '')
// 使用 Vue Query 获取歌词
const { data: lyricsData } = useQuery({
  queryKey: ['lyricsByUrl', lyricsUrl],
  queryFn: () => getLyricsByUrl(lyricsUrl.value),
  enabled: computed(() => !!lyricsUrl.value),
  staleTime: 5 * 60 * 1000, // 5分钟缓存
})
// 解析歌词
const lyrics = computed(() => {
  if (!lyricsData.value?.result?.lyrics) return []
  return lyricsData.value.result.lyrics
    .split('\n')
    .filter(line => line.trim() !== '')
})
// 监听歌曲变化
watch(currentSong, () => {
  generateRandomGradient()
  currentLyricIndex.value = 0
})
// 监听播放进度，更新当前歌词行
watch([progress, duration, lyrics], () => {
  if (lyrics.value.length > 0 && duration.value > 0) {
    const progressPercent = progress.value / duration.value
    const newIndex = Math.min(
      Math.floor(progressPercent * lyrics.value.length),
      lyrics.value.length - 1
    )
    if (newIndex !== currentLyricIndex.value) {
      currentLyricIndex.value = newIndex
      // 滚动到当前歌词行
      nextTick(() => {
        const highlightedElement = document.querySelector('.lyrics-line.highlight')
        if (highlightedElement) {
          highlightedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
    }
  }
})
onMounted(() => {
  generateRandomGradient()
})
// 背景样式
const backgroundStyle = computed(() => {
  const showBackground = settings.value.showBackGround
  const imageUrl = currentSong.value?.album?.images?.[0]?.url || ''
  if (showBackground === 'true') {
    return { background: backgroundGradient.value }
  } else if (showBackground === 'blur' || showBackground === 'dynamic') {
    return {
      backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
      filter: 'blur(16px) opacity(.6)',
    }
  }
  return {}
})
// 封面图片URL
const coverImage = computed(() => {
  return currentSong.value?.album?.images?.[0]?.url || ''
})
// 歌曲标题
const songTitle = computed(() => currentSong.value?.name || '未播放')
// 歌手名称
const artistName = computed(() => {
  return currentSong.value?.artists?.map(a => a.name).join(', ') || '未知艺术家'
})
// 字体大小
const fontSize = computed(() => {
  return settings.value.songFontSize ? `${settings.value.songFontSize}px` : '28px'
})
</script>
<template>
  <div class="lyrics-page">
    <!-- 背景 -->
    <div class="gradient-background" :style="backgroundStyle" />
    <div class="lyrics-content">
      <!-- 左侧：封面 -->
      <div class="left-side">
        <div class="album-info">
          <div class="cover-container">
            <img
              v-if="coverImage"
              :src="coverImage"
              :alt="songTitle"
              class="cover-image"
            >
            <div v-else class="cover-placeholder" />
            <div
              class="shadow"
              :style="{ backgroundImage: coverImage ? `url(${coverImage})` : 'none' }"
            />
          </div>
          <div class="song-info">
            <h2 class="song-title">{{ songTitle }}</h2>
            <p class="song-artist">{{ artistName }}</p>
          </div>
        </div>
      </div>
      <!-- 右侧：歌词 -->
      <div class="right-side">
        <div class="lyrics-container" ref="lyricsContainer" :style="{ fontSize }">
          <!-- 空行用于顶部留白 -->
          <div class="line" />
          <!-- 作曲作词信息 -->
          <div :class="['lyrics-line', { highlight: currentLyricIndex === 0 }]">
            <div class="content">
              <span>作曲: {{ artistName }}</span>
            </div>
          </div>
          <div :class="['lyrics-line', { highlight: currentLyricIndex === 1 }]">
            <div class="content">
              <span>作词: {{ artistName }}</span>
            </div>
          </div>
          <!-- 歌词内容 -->
          <template v-if="lyrics.length > 0">
            <div
              v-for="(line, index) in lyrics"
              :key="index"
              :class="['lyrics-line', { highlight: currentLyricIndex === index + 2 }]"
            >
              <div class="content">
                <span>{{ line }}</span>
              </div>
            </div>
            <!-- 歌词来源 -->
            <div :class="['lyrics-line', { highlight: currentLyricIndex === lyrics.length + 2 }]">
              <div class="content">
                <span>歌词来源: Happi.dev</span>
              </div>
            </div>
          </template>
          <!-- 无歌词提示 -->
          <template v-else>
            <div class="lyrics-line">
              <div class="content">
                <span>该歌曲暂未提供歌词</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- 关闭按钮 -->
    <div class="close-button" @click="closeLyrics">
      <button>
        <SvgIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
            <path
              fill="currentColor"
              d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
            />
          </svg>
        </SvgIcon>
      </button>
    </div>
  </div>
</template>
<style scoped>
.lyrics-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  overflow: hidden;
  display: flex;
  background: var(--color-body-bg);
}
.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
.lyrics-content {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.left-side {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 32px;
  margin-top: 24px;
  transition: all 0.5s;
}
.album-info {
  max-width: 54vh;
  width: 100%;
}
.cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 30px;
}
.cover-image,
.cover-placeholder {
  width: 54vh;
  height: 54vh;
  border-radius: 0.75em;
  object-fit: cover;
  user-select: none;
}
.cover-placeholder {
  background: var(--color-secondary-bg);
}
.shadow {
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  bottom: 0;
  width: 54vh;
  height: 54vh;
  background-size: cover;
  background-position: center;
  filter: blur(16px) opacity(0.6);
  transform: scale(0.92, 0.96);
  z-index: -1;
  border-radius: 0.75em;
}
.song-info {
  text-align: center;
  color: var(--color-text);
}
.song-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 8px;
  opacity: 0.88;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.song-artist {
  font-size: 1rem;
  opacity: 0.58;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: var(--color-text);
  margin-right: 24px;
  padding-left: 78px;
  max-width: 460px;
}
.lyrics-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: 0.5s;
  scrollbar-width: none;
}
.lyrics-container::-webkit-scrollbar {
  display: none;
}
.line {
  margin: 2px 0;
}
.lyrics-line {
  margin: 2px 0;
  padding: 12px 18px;
  transition: 0.5s;
  border-radius: 12px;
}
.lyrics-line:hover {
  background: var(--color-secondary-bg-for-transparent);
}
.lyrics-line .content {
  transform-origin: center left;
  transform: scale(0.95);
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  user-select: none;
}
.lyrics-line .content span {
  opacity: 0.28;
  cursor: default;
  font-size: 1em;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.lyrics-line.highlight .content {
  transform: scale(1);
}
.lyrics-line.highlight .content span {
  opacity: 0.98;
  display: inline-block;
}
.lyrics-container .line:first-child {
  margin-top: 50vh;
}
.lyrics-container .lyrics-line:last-child {
  margin-bottom: calc(50vh - 128px);
}
.close-button {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 300;
  border-radius: 0.75rem;
  height: 44px;
  width: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.28;
  transition: 0.2s;
}
.close-button:hover {
  background: var(--color-secondary-bg-for-transparent);
  opacity: 0.88;
}
.close-button button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
}
.close-button .svg-icon {
  color: var(--color-text);
  padding-top: 5px;
  height: 22px;
  width: 22px;
}
/* 响应式设计 */
@media (max-aspect-ratio: 10/9) {
  .left-side {
    display: none;
  }
  .right-side {
    max-width: 100%;
    padding-left: 24px;
  }
  .lyrics-container {
    max-width: 100%;
  }
}
@media screen and (min-width: 1200px) {
  .right-side {
    max-width: 600px;
  }
}
</style>
