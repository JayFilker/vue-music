<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { getSearchContent } from '@/api/search'
import { getUserSavedAlbums, getUserPlaylists, getUserSavedTracks } from '@/api/library'
import { getMovies } from '@/api/movie'
import AlbumCard from '@/components/content/AlbumCard.vue'
import TrackList from '@/components/content/TrackList.vue'
import MovieList from '@/components/content/MovieList.vue'
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const searchType = ref(route.query.type || '')
const searchKey = ref(route.query.key || '')
const offset = ref(0)
const allItems = ref([])
// 计算标题
const pageTitle = computed(() => {
  const typeMap = {
    artist: '艺人',
    album: '专辑',
    playlist: '歌单',
    track: '歌曲',
    movie: '视频'
  }
  return typeMap[searchType.value] || '搜索'
})
// 监听路由变化，重置数据
watch([() => route.query.type, () => route.query.key], ([newType, newKey]) => {
  if (newType && newKey) {
    searchType.value = newType
    searchKey.value = newKey
    offset.value = 0
    allItems.value = []
  }
}, { immediate: true })
// 获取搜索结果（不包括视频）
const { data: searchResults, isLoading, isFetching } = useQuery({
  queryKey: ['searchDemo', searchType, searchKey, offset],
  queryFn: () => getSearchContent(searchType.value, searchKey.value, offset.value),
  enabled: computed(() => !!searchType.value && !!searchKey.value && searchType.value !== 'movie'),
  staleTime: 5 * 60 * 1000
})
// 获取视频列表（当类型是 movie 时）
const { data: movies } = useQuery({
  queryKey: ['movies'],
  queryFn: getMovies,
  enabled: computed(() => searchType.value === 'movie'),
  staleTime: 5 * 60 * 1000,
  retry: false
})
// 获取收藏数据
const { data: savedAlbums } = useQuery({
  queryKey: ['savedAlbums'],
  queryFn: getUserSavedAlbums,
  staleTime: 5 * 60 * 1000,
  retry: false
})
const { data: userPlaylists } = useQuery({
  queryKey: ['userPlaylists'],
  queryFn: getUserPlaylists,
  staleTime: 5 * 60 * 1000,
  retry: false
})
const { data: savedTracks } = useQuery({
  queryKey: ['savedTracks'],
  queryFn: getUserSavedTracks,
  staleTime: 5 * 60 * 1000,
  retry: false
})
// 检查是否被收藏
const isAlbumLiked = (albumId) => {
  const albums = savedAlbums.value?.songs || []
  return Array.isArray(albums) && albums.some(a => a.id === albumId)
}
const isPlaylistLiked = (playlistId) => {
  const playlists = userPlaylists.value?.songs || []
  return Array.isArray(playlists) && playlists.some(p => p.id === playlistId)
}
const likedTracks = computed(() => savedTracks.value?.songs || [])
// 监听数据变化，合并结果
watch([searchResults, offset], ([newData, newOffset]) => {
  if (!newData) return
  const typeKey = `${searchType.value}s`
  const items = newData[typeKey]?.items || []
  if (newOffset === 0) {
    // 首次加载，直接替换
    allItems.value = items
  } else {
    // 追加加载，过滤重复项
    const newItems = items.filter(
      item => !allItems.value.some(existing => existing.id === item.id)
    )
    allItems.value = [...allItems.value, ...newItems]
  }
})
// 加载更多
const loadMore = () => {
  if (searchType.value !== 'movie') {
    offset.value += 50
  }
}
// 跳转到艺术家页面
const goToArtist = (artistId) => {
  router.push(`/artist?id=${artistId}`)
}
// 格式化艺术家列表
const artists = computed(() => {
  if (searchType.value !== 'artist') return []
  return allItems.value
})
// 格式化专辑列表
const albums = computed(() => {
  if (searchType.value !== 'album') return []
  return allItems.value
})
// 格式化播放列表
const playlists = computed(() => {
  if (searchType.value !== 'playlist') return []
  return allItems.value.filter(item => item !== null)
})
// 格式化歌曲列表
const tracks = computed(() => {
  if (searchType.value !== 'track') return { items: [] }
  return { items: allItems.value }
})
</script>
<template>
  <div class="search-demo-page">
    <h1 class="page-title">
      <span>{{ t('搜索') }} {{ t(pageTitle) }}</span>
      <span class="search-key">"{{ searchKey }}"</span>
    </h1>
    <!-- 加载状态 -->
    <div v-if="isLoading && allItems.length === 0" class="loading">
      {{ t('加载中') }}...
    </div>
    <!-- 艺术家 -->
    <div v-else-if="searchType === 'artist' && artists.length > 0" class="content">
      <div class="artist-grid">
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="artist-card"
          @click="goToArtist(artist.id)"
        >
          <div class="artist-cover">
            <img
              :src="artist.images?.[0]?.url || 'http://s4.music.126.net/style/web2/img/default/default_avatar.jpg'"
              :alt="artist.name"
              loading="lazy"
            >
          </div>
          <div class="artist-name">{{ artist.name }}</div>
        </div>
      </div>
    </div>
    <!-- 专辑 -->
    <div v-else-if="searchType === 'album' && albums.length > 0" class="content">
      <div class="grid">
        <AlbumCard
          v-for="album in albums"
          :key="album.id"
          :item="album"
          type="album"
          :is-liked="isAlbumLiked(album.id)"
        />
      </div>
    </div>
    <!-- 播放列表 -->
    <div v-else-if="searchType === 'playlist' && playlists.length > 0" class="content">
      <div class="grid">
        <AlbumCard
          v-for="playlist in playlists"
          :key="playlist.id"
          :item="playlist"
          type="playlist"
          :is-liked="isPlaylistLiked(playlist.id)"
        />
      </div>
    </div>
    <!-- 歌曲 -->
    <div v-else-if="searchType === 'track' && tracks.items.length > 0" class="content">
      <TrackList :tracks="tracks.items" :liked-tracks="likedTracks" />
    </div>
    <!-- 视频 -->
    <div v-else-if="searchType === 'movie' && movies && movies.length > 0" class="content">
      <MovieList :movies="movies" :search-key="searchKey" :limit="0" />
    </div>
    <!-- 没有结果 -->
    <div v-else-if="!isLoading && ((searchType !== 'movie' && allItems.length === 0) || (searchType === 'movie' && (!movies || movies.length === 0)))" class="no-results">
      <p>{{ t('没有找到相关结果') }}</p>
    </div>
    <!-- 加载更多按钮 (视频不需要) -->
    <div v-if="searchType !== 'movie' && allItems.length > 0" class="load-more-section">
      <button
        class="load-more-btn"
        :disabled="isFetching"
        @click="loadMore"
      >
        <span v-if="!isFetching">{{ t('加载更多') }}</span>
        <span v-else>{{ t('加载中') }}...</span>
      </button>
    </div>
  </div>
</template>
<style scoped>
.search-demo-page {
  padding: 20px 0;
}
.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.search-key {
  color: var(--color-secondary);
  font-size: 28px;
}
.loading {
  text-align: center;
  padding: 100px 20px;
  color: var(--color-secondary);
}
.content {
  margin-bottom: 40px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
}
@media (max-width: 768px) {
  .artist-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
.artist-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}
.artist-card:hover {
  transform: translateY(-4px);
}
.artist-cover {
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-secondary-bg);
  margin-bottom: 12px;
}
.artist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.artist-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.no-results {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-secondary);
  font-size: 16px;
}
.load-more-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.load-more-btn {
  padding: 12px 40px;
  background: var(--color-secondary-bg);
  color: var(--color-text);
  border: 1px solid var(--color-secondary-bg-for-transparent);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.load-more-btn:hover:not(:disabled) {
  background: var(--color-primary-bg-for-transparent);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}
.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
