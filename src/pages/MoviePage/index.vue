<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { getMovies, getMovieInfo } from '@/api/movie'
import MovieList from '@/components/content/MovieList.vue'
import ButtonIcon from '@/components/common/ButtonIcon.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'

const route = useRoute()
const { t } = useI18n()

const videoRef = ref(null)
const showPlayButton = ref(true)
const videoTitle = ref(route.query.title || '')
const searchKey = ref(route.query.q || '')

// 监听路由变化
watch(() => route.query.title, (newTitle) => {
  if (newTitle) {
    videoTitle.value = newTitle
  }
}, { immediate: true })

// 获取所有视频
const { data: allMovies } = useQuery({
  queryKey: ['movies'],
  queryFn: getMovies,
  staleTime: 5 * 60 * 1000,
  retry: false
})

// 当前视频信息
const currentMovie = computed(() => {
  if (!allMovies.value || !videoTitle.value) return null

  const movie = allMovies.value.find(v => v.title === videoTitle.value)
  if (!movie) return null

  const parts = movie.title.split('-')
  return {
    ...movie,
    name: parts[1] || movie.title,
    artist: parts[0] || '',
    fullTitle: movie.title
  }
})

// 获取当前视频详细信息
const { data: movieInfo } = useQuery({
  queryKey: ['movieInfo', computed(() => currentMovie.value?.key)],
  queryFn: () => getMovieInfo(currentMovie.value.key),
  enabled: computed(() => !!currentMovie.value?.key),
  staleTime: 5 * 60 * 1000,
  retry: false
})

// 其他视频（排除当前视频）
const otherMovies = computed(() => {
  if (!allMovies.value || !videoTitle.value) return []
  return allMovies.value.filter(v => v.title !== videoTitle.value)
})

// 视频 URL
const videoUrl = computed(() => {
  if (!currentMovie.value?.videoUrl) return ''
  return `http://${encodeURI(currentMovie.value.videoUrl)}`
})

// 处理播放按钮点击
const handlePlay = () => {
  if (videoRef.value) {
    videoRef.value.play()
  }
}

// 监听视频播放状态
const handleVideoPlay = () => {
  showPlayButton.value = false
}

const handleVideoPause = () => {
  showPlayButton.value = true
}
</script>

<template>
  <div class="movie-page">
    <div v-if="currentMovie" class="content">
      <!-- 视频播放器 -->
      <div class="video-container">
        <div class="video-wrapper">
          <video
            ref="videoRef"
            class="video-player"
            controls
            crossorigin="anonymous"
            :src="videoUrl"
            @play="handleVideoPlay"
            @pause="handleVideoPause"
          >
            您的浏览器不支持视频播放
          </video>

          <!-- 自定义播放按钮 -->
          <button
            v-show="showPlayButton"
            class="play-overlay-button"
            @click="handlePlay"
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
        </div>

        <!-- 视频信息 -->
        <div class="video-info">
          <div class="title-section">
            <h1 class="video-title">
              <span class="artist">{{ currentMovie.artist }}</span>
              <span class="separator"> - </span>
              <span class="name">{{ currentMovie.name }}</span>
            </h1>
            <div class="action-buttons">
              <ButtonIcon>
                <SvgIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path
                      fill="currentColor"
                      d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"
                    />
                  </svg>
                </SvgIcon>
              </ButtonIcon>
            </div>
          </div>

          <div class="meta-info">
            <span v-if="movieInfo?.['x-qn-meta']?.views" class="views">
              {{ movieInfo['x-qn-meta'].views }} {{ t('观看次数') }}
            </span>
            <span v-if="movieInfo?.['x-qn-meta']?.time" class="date">
              · {{ movieInfo['x-qn-meta'].time }}
            </span>
          </div>
        </div>
      </div>

      <!-- 更多视频 -->
      <div v-if="otherMovies.length > 0" class="more-videos">
        <h2 class="section-title">{{ t('更多视频') }}</h2>
        <MovieList :movies="otherMovies" :search-key="searchKey" :limit="0" />
      </div>
    </div>

    <!-- 未找到视频 -->
    <div v-else class="not-found">
      <p>{{ t('页面未找到，请返回上一页') }}</p>
    </div>
  </div>
</template>

<style scoped>
.movie-page {
  padding: 20px 0;
  color: var(--color-text);
}

.content {
  max-width: 1400px;
  margin: 0 auto;
}

.video-container {
  margin-bottom: 50px;
}

.video-wrapper {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.video-player {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
}

.play-overlay-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s;
  z-index: 10;
}

.play-overlay-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
  background: var(--color-primary);
  filter: brightness(1.1);
}

.play-overlay-button :deep(.svg-icon) {
  width: 32px;
  height: 32px;
  margin-left: 4px;
}

.video-info {
  padding: 0 10px;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 20px;
}

.video-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.4;
}

.artist {
  color: var(--color-text);
  cursor: pointer;
  transition: color 0.2s;
}

.artist:hover {
  color: var(--color-primary);
}

.separator {
  color: var(--color-secondary);
  margin: 0 8px;
}

.name {
  color: var(--color-text);
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.meta-info {
  font-size: 14px;
  color: var(--color-secondary);
}

.views,
.date {
  margin-right: 8px;
}

.more-videos {
  margin-top: 60px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 24px;
}

.not-found {
  text-align: center;
  padding: 100px 20px;
  font-size: 20px;
  color: var(--color-secondary);
}

@media (max-width: 768px) {
  .title-section {
    flex-direction: column;
  }

  .video-title {
    font-size: 20px;
  }

  .play-overlay-button {
    width: 60px;
    height: 60px;
  }

  .play-overlay-button :deep(.svg-icon) {
    width: 24px;
    height: 24px;
  }
}
</style>
