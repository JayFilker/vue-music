<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { getUserSavedTracks, getUserSavedAlbums, getUserPlaylists } from '@/api/library'
import AlbumCard from '@/components/content/AlbumCard.vue'
import TrackList from '@/components/content/TrackList.vue'
const { t } = useI18n()
const activeTab = ref('tracks')
// 获取收藏的歌曲
const { data: savedTracks, isLoading: isLoadingTracks } = useQuery({
  queryKey: ['savedTracks'],
  queryFn: getUserSavedTracks,
  staleTime: 5 * 60 * 1000,
  retry: false,
  onError: (error) => {
    console.error('Failed to load saved tracks:', error)
  }
})
// 获取收藏的专辑
const { data: savedAlbums, isLoading: isLoadingAlbums } = useQuery({
  queryKey: ['savedAlbums'],
  queryFn: getUserSavedAlbums,
  staleTime: 5 * 60 * 1000,
  retry: false,
  onError: (error) => {
    console.error('Failed to load saved albums:', error)
  }
})
// 获取播放列表
const { data: playlists, isLoading: isLoadingPlaylists } = useQuery({
  queryKey: ['userPlaylists'],
  queryFn: getUserPlaylists,
  staleTime: 5 * 60 * 1000,
  retry: false,
  onError: (error) => {
    console.error('Failed to load playlists:', error)
  }
})
const tracks = computed(() => {
  // 自定义后端返回的格式是 { songs: [...] }
  return savedTracks.value?.songs || []
})
const albums = computed(() => {
  // 自定义后端返回的格式是 { songs: [...] }
  return savedAlbums.value?.songs || []
})
const userPlaylists = computed(() => {
  // 自定义后端返回的格式是 { songs: [...] }
  return playlists.value?.songs || []
})
</script>
<template>
  <div class="music-library">
    <h1 class="page-title">{{ t('音乐库') }}</h1>
    <!-- 标签切换 -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'tracks' }]"
        @click="activeTab = 'tracks'"
      >
        {{ t('歌曲') }}
      </button>
      <button
        :class="['tab', { active: activeTab === 'albums' }]"
        @click="activeTab = 'albums'"
      >
        {{ t('专辑') }}
      </button>
      <button
        :class="['tab', { active: activeTab === 'playlists' }]"
        @click="activeTab = 'playlists'"
      >
        {{ t('播放列表') }}
      </button>
    </div>
    <!-- 内容区域 -->
    <div class="content">
      <!-- 歌曲 -->
      <div v-if="activeTab === 'tracks'" class="tracks-section">
        <div v-if="isLoadingTracks" class="loading">{{ t('加载中') }}...</div>
        <div v-else-if="tracks.length === 0" class="empty">
          <p>{{ t('没有收藏的歌曲') }}</p>
        </div>
        <TrackList v-else :tracks="tracks" :liked-tracks="tracks" />
      </div>
      <!-- 专辑 -->
      <div v-if="activeTab === 'albums'" class="albums-section">
        <div v-if="isLoadingAlbums" class="loading">{{ t('加载中') }}...</div>
        <div v-else-if="albums.length === 0" class="empty">
          <p>{{ t('没有收藏的专辑') }}</p>
        </div>
        <div v-else class="grid">
          <AlbumCard
            v-for="album in albums"
            :key="album.id"
            :item="album"
            type="album"
            :is-liked="true"
          />
        </div>
      </div>
      <!-- 播放列表 -->
      <div v-if="activeTab === 'playlists'" class="playlists-section">
        <div v-if="isLoadingPlaylists" class="loading">{{ t('加载中') }}...</div>
        <div v-else-if="userPlaylists.length === 0" class="empty">
          <p>{{ t('没有播放列表') }}</p>
        </div>
        <div v-else class="grid">
          <AlbumCard
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            :item="playlist"
            type="playlist"
            :is-liked="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.music-library {
  padding: 20px 0;
}
.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 30px;
}
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--color-secondary-bg);
}
.tab {
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: var(--color-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.tab:hover {
  color: var(--color-text);
}
.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-secondary);
}
.empty {
  text-align: center;
  padding: 100px 20px;
}
.empty p {
  font-size: 16px;
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
</style>
