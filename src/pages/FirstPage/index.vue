<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { firstFetchProfile, recommendedArtists } from '@/api/search'
import { getArtistTopTracks, getArtistAlbums } from '@/api/artist'
import { getAlbumSong } from '@/api/album'
import { playTrack } from '@/api/system'
import { getUserSavedAlbums, getUserPlaylists } from '@/api/library'
import { useMusicStore } from '@/stores/music'
import AlbumCard from '@/components/content/AlbumCard.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'
import RankFor from '@/components/content/RankFor.vue'
const { t } = useI18n()
const musicStore = useMusicStore()
// 悬停状态管理（为每个艺术家维护一个状态）
const artistHoverStates = ref([])
const deviceId = computed(() => musicStore.device)
// 获取推荐播放列表
const { data: recommendPlaylists, isLoading: isLoadingRecommend } = useQuery({
  queryKey: ['firstPage', 'recommend'],
  queryFn: () => firstFetchProfile('recommend', 12, 'playlist'),
  staleTime: 5 * 60 * 1000
})
// 获取新专辑
const { data: newAlbums, isLoading: isLoadingNew } = useQuery({
  queryKey: ['firstPage', 'new'],
  queryFn: () => firstFetchProfile('new', 12, 'album'),
  staleTime: 5 * 60 * 1000
})
// 获取推荐艺术家
const searchTerms = ['recommended', 'popular', 'top']
const randomTerm = ref(searchTerms[Math.floor(Math.random() * searchTerms.length)])
const { data: artists, isLoading: isLoadingArtists } = useQuery({
  queryKey: ['firstPage', 'artists', randomTerm],
  queryFn: () => recommendedArtists(randomTerm.value),
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
// 格式化数据
const formatPlaylists = (data) => {
  if (!data?.playlists?.items) return []
  return data.playlists.items
    .filter(item => item !== null)
    .slice(0, 12)
}
const formatAlbums = (data) => {
  if (!data?.albums?.items) return []
  return data.albums.items
    .filter(item => item !== null)
    .slice(0, 12)
}
// 使用 computed 格式化艺术家数据
const formattedArtists = computed(() => {
  if (!artists.value?.artists?.items) return []
  return artists.value.artists.items
    .filter(item => item !== null)
    .slice(0, 6)
})
// 监听艺术家数据变化，初始化悬停状态数组
watch(formattedArtists, (newArtists) => {
  artistHoverStates.value = Array.from({ length: newArtists.length }, () => false)
}, { immediate: true })
// 处理悬停状态更新
const setArtistHover = (index, value) => {
  // 使用数组替换确保响应式更新
  const newStates = [...artistHoverStates.value]
  newStates[index] = value
  artistHoverStates.value = newStates
}
// 处理艺术家播放按钮点击
const handleArtistPlay = async (e, artistId, index) => {
  e.stopPropagation() // 阻止冒泡到卡片点击事件
  try {
    if (!deviceId.value) {
      console.error('No device available')
      return
    }
    // 获取艺术家的热门歌曲
    const topTracks = await getArtistTopTracks(artistId)
    if (topTracks?.tracks && topTracks.tracks.length > 0) {
      const tracks = topTracks.tracks
      // 设置播放列表
      musicStore.setSongList(tracks)
      musicStore.setCurrentSongList({
        items: tracks,
        imgPic: tracks[0]?.album?.images?.[0]?.url
      })
      // 设置当前歌曲索引
      musicStore.setCurrentSong(0)
      musicStore.$patch({ firstPlay: false })
      // 调用Spotify API播放
      const trackUri = tracks[0].uri
      await playTrack(trackUri, deviceId.value)
      // 更新播放状态
      musicStore.$patch({
        isPlayingDemo: true,
        isPlayingDemoTwo: false,
        link: false,
        badLike: false
      })
    }
  } catch (error) {
    console.error('Failed to play artist tracks:', error)
  }
}
</script>
<template>
  <div class="first-page">
    <h1 class="page-title">{{ t('首页') }}</h1>
    <!-- 推荐歌单 -->
    <section class="section">
      <div class="section-header">
        <h2>{{ t('推荐歌单') }}</h2>
        <router-link to="/discover?key=推荐歌单" class="view-all">
          {{ t('查看全部') }}
        </router-link>
      </div>
      <div v-if="isLoadingRecommend" class="loading">{{ t('加载中') }}...</div>
      <div v-else class="grid">
        <AlbumCard
          v-for="item in formatPlaylists(recommendPlaylists)"
          :key="item.id"
          :item="item"
          type="playlist"
          :is-liked="isPlaylistLiked(item.id)"
        />
      </div>
    </section>
    <!-- 新专辑 -->
    <section class="section">
      <div class="section-header">
        <h2>{{ t('新专辑') }}</h2>
        <router-link to="/discover?key=新专辑" class="view-all">
          {{ t('查看全部') }}
        </router-link>
      </div>
      <div v-if="isLoadingNew" class="loading">{{ t('加载中') }}...</div>
      <div v-else class="grid">
        <AlbumCard
          v-for="item in formatAlbums(newAlbums)"
          :key="item.id"
          :item="item"
          type="album"
          :is-liked="isAlbumLiked(item.id)"
        />
      </div>
    </section>
    <!-- 推荐艺人 -->
    <section class="section">
      <div class="section-header">
        <h2>{{ t('推荐艺人') }}</h2>
      </div>
      <div v-if="isLoadingArtists" class="loading">{{ t('加载中') }}...</div>
      <div v-else class="artist-grid">
        <div
          v-for="(artist, index) in formattedArtists"
          :key="artist.id"
          class="artist-card"
          @mouseenter="setArtistHover(index, true)"
          @mouseleave="setArtistHover(index, false)"
          @click="$router.push(`/artist?id=${artist.id}`)"
        >
          <div class="artist-cover">
            <div class="shade">
              <button
                v-show="artistHoverStates[index]"
                class="play-button"
                @click="(e) => handleArtistPlay(e, artist.id, index)"
              >
                <SvgIcon :sty="{ width: '65%', height: '65%' }">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    viewBox="0 0 448 512"
                  >
                    <path
                      fill="currentColor"
                      d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                    />
                  </svg>
                </SvgIcon>
              </button>
            </div>
            <img
              :src="artist.images?.[0]?.url || 'http://s4.music.126.net/style/web2/img/default/default_avatar.jpg'"
              :alt="artist.name"
              loading="lazy"
            >
            <div
              class="shadow"
              :style="{ backgroundImage: `url(${artist.images?.[0]?.url})` }"
              :class="{ visible: artistHoverStates[index] }"
            />
          </div>
          <div class="artist-name">{{ artist.name }}</div>
        </div>
      </div>
    </section>
      <RankFor />
  </div>
</template>
<style scoped>
.first-page {
  padding: 20px 0;
}
.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 30px;
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
.view-all {
  font-size: 14px;
  color: var(--color-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.view-all:hover {
  color: var(--color-primary);
}
.loading {
  padding: 40px;
  text-align: center;
  color: var(--color-secondary);
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
  position: relative;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-secondary-bg);
  margin-bottom: 12px;
}
.artist-cover img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}
.shade {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  pointer-events: none;
}
.play-button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: 26%;
  width: 26%;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s;
  animation: fadeIn 0.2s ease-in;
  pointer-events: auto;
}
.play-button:hover {
  background: rgba(255, 255, 255, 0.28);
}
.play-button:active {
  transform: scale(0.94);
}
.shadow {
  position: absolute;
  top: 12px;
  height: 100%;
  width: 100%;
  filter: blur(16px) opacity(0.6);
  transform: scale(0.92, 0.96);
  z-index: -1;
  background-size: cover;
  border-radius: 50%;
  aspect-ratio: 1 / 1;
  opacity: 0;
  transition: opacity 0.3s;
}
.shadow.visible {
  opacity: 1;
}
.artist-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
