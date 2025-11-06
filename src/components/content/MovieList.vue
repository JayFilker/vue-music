<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { getMovieImages } from '@/api/movie'

const props = defineProps({
  movies: {
    type: Array,
    default: () => []
  },
  searchKey: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 5
  }
})

const router = useRouter()
const showStates = ref([])

// 获取视频缩略图
const { data: movieImages } = useQuery({
  queryKey: ['movieImages'],
  queryFn: getMovieImages,
  staleTime: 5 * 60 * 1000,
  retry: false
})

// 过滤和格式化视频列表
const filteredMovies = computed(() => {
  if (!props.movies || props.movies.length === 0) return []

  // 根据搜索关键词过滤
  let filtered = props.movies
  if (props.searchKey) {
    filtered = props.movies.filter(movie =>
      movie.title.toLowerCase().includes(props.searchKey.toLowerCase())
    )
  }

  // 限制数量
  if (props.limit > 0) {
    filtered = filtered.slice(0, props.limit)
  }

  return filtered
})

// 格式化视频数据
const formattedMovies = computed(() => {
  return filteredMovies.value.map(movie => {
    const parts = movie.title.split('-')
    return {
      title: parts[1] || movie.title,
      artist: parts[0] || '',
      fullTitle: movie.title,
      img: null
    }
  })
})

// 合并图片数据
const moviesWithImages = computed(() => {
  if (!movieImages.value) return formattedMovies.value

  return formattedMovies.value.map(movie => {
    const matchedImg = movieImages.value.find(img => img.title === movie.fullTitle)
    return {
      ...movie,
      img: matchedImg?.videoUrl || null
    }
  })
})

// 初始化显示状态
watch(filteredMovies, (newMovies) => {
  showStates.value = new Array(newMovies.length).fill(false)
}, { immediate: true })

// 处理视频点击
const handleVideoClick = (movie) => {
  router.push(`/moviePage?q=${props.searchKey || ''}&title=${movie.fullTitle}`)
}

// 处理鼠标悬停
const setShowState = (index, value) => {
  showStates.value = showStates.value.map((state, i) => i === index ? value : state)
}
</script>

<template>
  <div class="movie-list">
    <div
      v-for="(movie, index) in moviesWithImages"
      :key="index"
      class="movie-card"
    >
      <div class="cover">
        <img
          v-if="movie.img"
          :src="`http://${movie.img}`"
          :alt="movie.fullTitle"
          loading="lazy"
          @mouseenter="setShowState(index, true)"
          @mouseleave="setShowState(index, false)"
          @click="handleVideoClick(movie)"
        >
        <div
          v-else
          class="placeholder"
          @click="handleVideoClick(movie)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div
          class="shadow"
          :style="{
            backgroundImage: showStates[index] && movie.img ? `url('http://${movie.img}')` : 'none',
            opacity: showStates[index] ? 1 : 0
          }"
        />
      </div>
      <div class="info">
        <div class="title" @click="handleVideoClick(movie)">
          {{ movie.title }}
        </div>
        <div class="artist" @click="handleVideoClick(movie)">
          {{ movie.artist }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .movie-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}

.movie-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.cover {
  position: relative;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-secondary-bg);
  aspect-ratio: 16 / 9;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.placeholder svg {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.shadow {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  bottom: 0;
  filter: blur(16px) opacity(0.6);
  transform: scale(0.95);
  z-index: -1;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  transition: opacity 0.3s;
  pointer-events: none;
}

.info {
  padding: 0 4px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.title:hover {
  color: var(--color-primary);
}

.artist {
  font-size: 12px;
  color: var(--color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s;
}

.artist:hover {
  color: var(--color-text);
}
</style>
