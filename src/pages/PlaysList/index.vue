<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { getPlaylist, getAlbumDetails } from '@/api/playlist'
import { playTrack } from '@/api/system'
import { getUserSavedTracks, getUserSavedAlbums, getUserPlaylists } from '@/api/library'
import { useMusicStore } from '@/stores/music'
import TrackList from '@/components/content/TrackList.vue'
import ButtonIcon from '@/components/common/ButtonIcon.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'
import LikeButton from '@/components/common/LikeButton.vue'

const route = useRoute()
const { t } = useI18n()
const musicStore = useMusicStore()

const playlistId = ref(route.query.id)
const type = ref(route.query.type) // 'playlists' or 'albums'

// 监听路由变化，更新 playlistId 和 type
watch(() => route.query.id, (newId) => {
  if (newId) {
    playlistId.value = newId
  }
}, { immediate: true })

watch(() => route.query.type, (newType) => {
  if (newType) {
    type.value = newType
  }
}, { immediate: true })

// 获取播放列表或专辑详情
const { data: details, isLoading } = useQuery({
  queryKey: [type, playlistId],
  queryFn: () => type.value === 'playlists'
    ? getPlaylist(playlistId.value)
    : getAlbumDetails(playlistId.value),
  enabled: computed(() => !!playlistId.value),
  staleTime: 5 * 60 * 1000
})

// 获取收藏的专辑
const { data: savedAlbums } = useQuery({
  queryKey: ['savedAlbums'],
  queryFn: getUserSavedAlbums,
  staleTime: 5 * 60 * 1000,
  retry: false,
  onError: (error) => {
    console.warn('Failed to load saved albums:', error)
  }
})

// 获取播放列表
const { data: userPlaylists } = useQuery({
  queryKey: ['userPlaylists'],
  queryFn: getUserPlaylists,
  staleTime: 5 * 60 * 1000,
  retry: false,
  onError: (error) => {
    console.warn('Failed to load playlists:', error)
  }
})

// 获取收藏的歌曲
const { data: savedTracks } = useQuery({
  queryKey: ['savedTracks'],
  queryFn: getUserSavedTracks,
  staleTime: 5 * 60 * 1000,
  retry: false,
  onError: (error) => {
    console.warn('Failed to load saved tracks:', error)
  }
})

// 检查当前项目是否被收藏
const isLiked = computed(() => {
  if (!details.value) return false

  if (type.value === 'playlists') {
    const playlists = userPlaylists.value?.songs || []
    return Array.isArray(playlists) && playlists.some(p => p.id === playlistId.value)
  } else {
    const albums = savedAlbums.value?.songs || []
    return Array.isArray(albums) && albums.some(a => a.id === playlistId.value)
  }
})

// 获取喜欢的曲目列表
const likedTracks = computed(() => savedTracks.value?.songs || [])

// 获取曲目列表
const tracks = computed(() => {
  if (!details.value) return []

  if (type.value === 'playlists') {
    return details.value.tracks?.items?.map(item => item.track).filter(Boolean) || []
  } else {
    return details.value.tracks?.items || []
  }
})

// 播放全部
const playAll = async () => {
  const deviceId = musicStore.device

  if (!deviceId) {
    console.error('No device available')
    return
  }

  if (tracks.value.length > 0) {
    // 设置播放列表
    musicStore.setSongList(tracks.value)
    musicStore.setCurrentSongList({
      items: tracks.value,
      imgPic: details.value.images?.[0]?.url
    })

    // 设置当前歌曲为第一首
    musicStore.setCurrentSong(0)

    // 调用Spotify API播放第一首歌
    try {
      const trackUri = tracks.value[0].uri
      await playTrack(trackUri, deviceId)
      musicStore.$patch({ isPlayingDemo: true, firstPlay: false })
    } catch (error) {
      console.error('Failed to play:', error)
    }
  }
}

// 格式化时长
const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} ${t('小时')} ${minutes} ${t('分钟')}`
  }
  return `${minutes} ${t('分钟')}`
}

// 计算总时长
const totalDuration = computed(() => {
  if (!tracks.value.length) return 0
  return tracks.value.reduce((sum, track) => sum + (track.duration_ms || 0), 0)
})
</script>

<template>
  <div class="playlist-page">
    <div v-if="isLoading" class="loading">{{ t('加载中') }}...</div>

    <div v-else-if="details" class="playlist-content">
      <!-- 播放列表头部 -->
      <div class="playlist-header">
        <div class="cover">
          <img
            :src="details.images?.[0]?.url"
            :alt="details.name"
          >
        </div>
        <div class="info">
          <div class="type">{{ type === 'playlists' ? t('播放列表') : t('专辑') }}</div>
          <h1>{{ details.name }}</h1>
          <p v-if="details.description" class="description" v-html="details.description" />
          <div class="meta">
            <span v-if="details.owner">{{ details.owner.display_name }}</span>
            <span v-if="details.artists">
              {{ details.artists.map(a => a.name).join(', ') }}
            </span>
            <span v-if="details.release_date"> · {{ details.release_date.substring(0, 4) }}</span>
            <span> · {{ tracks.length }} {{ t('首歌曲') }}</span>
            <span v-if="totalDuration"> · {{ formatDuration(totalDuration) }}</span>
          </div>
          <div class="actions">
            <button class="play-all-button" @click="playAll">
              <SvgIcon :sty="{ width: '20px', height: '20px' }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path
                    fill="currentColor"
                    d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                  />
                </svg>
              </SvgIcon>
              {{ t('播放全部') }}
            </button>
            <LikeButton
              v-if="details"
              :item="details"
              :type="type === 'playlists' ? 'playlist' : 'album'"
              :is-liked="isLiked"
              size="large"
            />
          </div>
        </div>
      </div>

      <!-- 曲目列表 -->
      <div class="tracks-section">
        <TrackList
          :tracks="tracks"
          :album-info="type === 'albums' ? details : null"
          :liked-tracks="likedTracks"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-page {
  padding: 20px 0;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  color: var(--color-secondary);
}

.playlist-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.cover {
  width: 250px;
  height: 250px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-secondary-bg);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: 8px;
}

.info h1 {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.description {
  font-size: 14px;
  color: var(--color-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
  max-width: 600px;
}

.meta {
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 24px;
}

.meta span {
  margin-right: 4px;
}

.actions {
  display: flex;
  gap: 16px;
}

.play-all-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 500px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.play-all-button:hover {
  background: var(--color-primary);
  transform: scale(1.05);
}

.play-all-button:active {
  transform: scale(0.95);
}

.tracks-section {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .cover {
    width: 200px;
    height: 200px;
  }

  .info h1 {
    font-size: 32px;
  }

  .description {
    max-width: 100%;
  }
}
</style>
