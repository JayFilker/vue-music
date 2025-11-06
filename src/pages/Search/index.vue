<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { fetchProfile } from '@/api/search'
import { getUserSavedAlbums, getUserPlaylists, getUserSavedTracks } from '@/api/library'
import { getMovies } from '@/api/movie'
import AlbumCard from '@/components/content/AlbumCard.vue'
import TrackList from '@/components/content/TrackList.vue'
import MovieList from '@/components/content/MovieList.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const searchQuery = ref(route.query.q || '')

// 搜索结果
const { data: searchResults, isLoading } = useQuery({
  queryKey: ['search', searchQuery],
  queryFn: () => fetchProfile(searchQuery.value),
  enabled: computed(() => !!searchQuery.value && searchQuery.value !== '*'),
  staleTime: 5 * 60 * 1000
})

// 获取视频列表
const { data: movies } = useQuery({
  queryKey: ['movies'],
  queryFn: getMovies,
  staleTime: 5 * 60 * 1000,
  retry: false
})

// 获取收藏的专辑
const { data: savedAlbums } = useQuery({
  queryKey: ['savedAlbums'],
  queryFn: getUserSavedAlbums,
  staleTime: 5 * 60 * 1000,
  retry: false
})

// 获取播放列表
const { data: userPlaylists } = useQuery({
  queryKey: ['userPlaylists'],
  queryFn: getUserPlaylists,
  staleTime: 5 * 60 * 1000,
  retry: false
})

// 获取收藏的歌曲
const { data: savedTracks } = useQuery({
  queryKey: ['savedTracks'],
  queryFn: getUserSavedTracks,
  staleTime: 5 * 60 * 1000,
  retry: false
})

// 检查专辑是否被收藏
const isAlbumLiked = (albumId) => {
  const albums = savedAlbums.value?.songs || []
  return Array.isArray(albums) && albums.some(a => a.id === albumId)
}

// 检查播放列表是否被收藏
const isPlaylistLiked = (playlistId) => {
  const playlists = userPlaylists.value?.songs || []
  return Array.isArray(playlists) && playlists.some(p => p.id === playlistId)
}

// 获取喜欢的曲目列表
const likedTracks = computed(() => savedTracks.value?.songs || [])

// 监听路由查询变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchQuery.value = newQuery
  }
}, { immediate: true })

// 计算各类型结果（过滤掉 null 值）
const tracks = computed(() => {
  const items = searchResults.value?.tracks?.items || []
  return items.filter(item => item !== null)
})

const artists = computed(() => {
  const items = searchResults.value?.artists?.items || []
  return items.filter(item => item !== null)
})

const albums = computed(() => {
  const items = searchResults.value?.albums?.items || []
  return items.filter(item => item !== null)
})

const playlists = computed(() => {
  const items = searchResults.value?.playlists?.items || []
  return items.filter(item => item !== null)
})

// 跳转到艺术家页面
const goToArtist = (artistId) => {
  router.push(`/artist?id=${artistId}`)
}

// 跳转到查看全部页面
const goToViewAll = (type) => {
  router.push(`/searchDemo?type=${type}&key=${searchQuery.value}`)
}

</script>

<template>
  <div class="search-page">
    <div v-if="!searchQuery || searchQuery === '*'" class="empty-state">
      <h2>{{ t('搜索') }}</h2>
      <p>{{ t('在顶部搜索框输入关键词开始搜索') }}</p>
    </div>

    <div v-else-if="isLoading" class="loading">
      <p>{{ t('搜索中') }}...</p>
    </div>

    <div v-else-if="searchResults" class="search-results">
      <h1 class="search-title">
        {{ t('搜索结果') }}: "{{ searchQuery }}"
      </h1>

      <!-- 艺术家和专辑行 -->
      <div class="row">
        <!-- 艺术家 -->
        <section v-if="artists.length > 0" class="section artists-section">
          <div class="section-header">
            <h2>{{ t('艺人') }}</h2>
            <button class="view-all-btn" @click="goToViewAll('artist')">
              {{ t('查看全部') }}
            </button>
          </div>
          <div class="artist-grid-row">
            <div
              v-for="artist in artists.slice(0, 3)"
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
        </section>

        <!-- 专辑 -->
        <section v-if="albums.length > 0" class="section albums-section">
          <div class="section-header">
            <h2>{{ t('专辑') }}</h2>
            <button class="view-all-btn" @click="goToViewAll('album')">
              {{ t('查看全部') }}
            </button>
          </div>
          <div class="grid-row">
            <AlbumCard
              v-for="album in albums.slice(0, 3)"
              :key="album.id"
              :item="album"
              type="album"
              :is-liked="isAlbumLiked(album.id)"
            />
          </div>
        </section>
      </div>

      <!-- 歌曲 -->
      <section v-if="tracks.length > 0" class="section tracks-section">
        <div class="section-header">
          <h2>{{ t('歌曲') }}</h2>
          <button class="view-all-btn" @click="goToViewAll('track')">
            {{ t('查看全部') }}
          </button>
        </div>
        <TrackList :tracks="tracks" :liked-tracks="likedTracks" />
      </section>

      <!-- 视频 -->
      <section v-if="movies && movies.length > 0" class="section videos-section">
        <div class="section-header">
          <h2>{{ t('视频') }}</h2>
          <button class="view-all-btn" @click="goToViewAll('movie')">
            {{ t('查看全部') }}
          </button>
        </div>
        <MovieList :movies="movies" :search-key="searchQuery" :limit="5" />
      </section>

      <!-- 播放列表 -->
      <section v-if="playlists.length > 0" class="section playlists-section">
        <div class="section-header">
          <h2>{{ t('歌单') }}</h2>
          <button class="view-all-btn" @click="goToViewAll('playlist')">
            {{ t('查看全部') }}
          </button>
        </div>
        <div class="playlists-grid">
          <AlbumCard
            v-for="playlist in playlists.slice(0, 12)"
            :key="playlist.id"
            :item="playlist"
            type="playlist"
            :is-liked="isPlaylistLiked(playlist.id)"
          />
        </div>
      </section>

      <!-- 没有结果 -->
      <div v-if="tracks.length === 0 && artists.length === 0 && albums.length === 0 && playlists.length === 0 && (!movies || movies.length === 0)" class="no-results">
        <p>{{ t('没有找到相关结果') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  padding: 20px 0;
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
}

.empty-state h2 {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: var(--color-secondary);
}

.loading {
  text-align: center;
  padding: 100px 20px;
  color: var(--color-secondary);
}

.search-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 40px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 50px;
}

@media (max-width: 1024px) {
  .row {
    grid-template-columns: 1fr;
  }
}

.section {
  margin-bottom: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

.view-all-btn {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid var(--color-secondary-bg);
  color: var(--color-secondary);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: var(--color-primary-bg-for-transparent);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  max-width: 100%;
}

@media (max-width: 1400px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 16px;
  }
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .grid-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

.artist-grid-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .artist-grid-row {
    grid-template-columns: repeat(2, 1fr);
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
</style>
