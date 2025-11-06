<script setup>
import { ref, computed, watch } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  addFavoriteSong,
  removeFavoriteSong,
  addFavoriteListOrAlbum,
  removeFavoriteListOrAlbum,
  addFavoriteArtist,
  removeFavoriteArtist
} from '@/api/library'
import SvgIcon from './SvgIcon.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['track', 'album', 'playlist', 'artist'].includes(value)
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const emit = defineEmits(['update:isLiked', 'liked', 'unliked'])

const queryClient = useQueryClient()
const isLikedState = ref(props.isLiked)
const isLoading = ref(false)

// 监听外部 isLiked 变化
watch(() => props.isLiked, (newVal) => {
  isLikedState.value = newVal
})

// 按钮尺寸
const buttonSize = computed(() => {
  const sizes = {
    small: { width: '16px', height: '16px' },
    medium: { width: '20px', height: '20px' },
    large: { width: '24px', height: '24px' }
  }
  return sizes[props.size]
})

// 处理收藏/取消收藏
const handleLike = async (e) => {
  e.stopPropagation() // 防止触发父元素的点击事件

  if (isLoading.value) return

  isLoading.value = true
  const wasLiked = isLikedState.value

  // 乐观更新
  isLikedState.value = !wasLiked

  try {
    // 根据类型和状态调用不同的 API
    if (props.type === 'track') {
      if (wasLiked) {
        await removeFavoriteSong(props.item)
        emit('unliked', props.item)
      } else {
        await addFavoriteSong(props.item)
        emit('liked', props.item)
      }
      // 刷新收藏歌曲列表
      queryClient.invalidateQueries({ queryKey: ['savedTracks'] })
    }
    else if (props.type === 'album' || props.type === 'playlist') {
      if (wasLiked) {
        await removeFavoriteListOrAlbum(props.item)
        emit('unliked', props.item)
      } else {
        await addFavoriteListOrAlbum(props.item)
        emit('liked', props.item)
      }
      // 刷新收藏专辑/播放列表
      queryClient.invalidateQueries({ queryKey: ['savedAlbums'] })
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] })
    }
    else if (props.type === 'artist') {
      if (wasLiked) {
        await removeFavoriteArtist(props.item)
        emit('unliked', props.item)
      } else {
        await addFavoriteArtist(props.item)
        emit('liked', props.item)
      }
      // 刷新收藏艺术家列表
      queryClient.invalidateQueries({ queryKey: ['savedArtists'] })
    }

    emit('update:isLiked', isLikedState.value)
  } catch (error) {
    console.error('Failed to update like status:', error)
    // 失败时回滚
    isLikedState.value = wasLiked
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <button
    :class="['like-button', { liked: isLikedState, loading: isLoading }]"
    :disabled="isLoading"
    @click="handleLike"
    :title="isLikedState ? '取消收藏' : '收藏'"
  >
    <SvgIcon :sty="buttonSize">
      <!-- 已收藏 - 实心心形 -->
      <svg v-if="isLikedState" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      <!-- 未收藏 - 空心心形 -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
        />
      </svg>
    </SvgIcon>
  </button>
</template>

<style scoped>
.like-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 50%;
}

.like-button:hover {
  color: var(--color-text);
  background: var(--color-secondary-bg-for-transparent);
  transform: scale(1.1);
}

.like-button.liked {
  color: var(--color-primary);
}

.like-button.liked:hover {
  color: var(--color-primary);
  opacity: 0.8;
}

.like-button.loading {
  opacity: 0.5;
  cursor: not-allowed;
}

.like-button:disabled {
  cursor: not-allowed;
}

.like-button:active:not(:disabled) {
  transform: scale(0.95);
}
</style>
