<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { getArtist, getArtistTopTracks, getArtistAlbums } from '@/api/artist'
import { getUserFollowedArtists, getUserSavedAlbums, getUserSavedTracks } from '@/api/library'
import AlbumCard from '@/components/content/AlbumCard.vue'
import TrackList from '@/components/content/TrackList.vue'
import LikeButton from '@/components/common/LikeButton.vue'

const route = useRoute()
const { t } = useI18n()

const artistId = ref(route.query.id)

// 监听路由变化，更新 artistId
watch(() => route.query.id, (newId) => {
  if (newId) {
    artistId.value = newId
  }
}, { immediate: true })

// 获取艺术家信息
const { data: artist, isLoading: isLoadingArtist } = useQuery({
  queryKey: ['artist', artistId],
  queryFn: () => getArtist(artistId.value),
  enabled: computed(() => !!artistId.value),
  staleTime: 5 * 60 * 1000
})

// 获取热门歌曲
const { data: topTracks, isLoading: isLoadingTracks } = useQuery({
  queryKey: ['artistTopTracks', artistId],
  queryFn: () => getArtistTopTracks(artistId.value),
  enabled: computed(() => !!artistId.value),
  staleTime: 5 * 60 * 1000
})

// 获取专辑
const { data: albums, isLoading: isLoadingAlbums } = useQuery({
  queryKey: ['artistAlbums', artistId],
  queryFn: () => getArtistAlbums(artistId.value, 20),
  enabled: computed(() => !!artistId.value),
  staleTime: 5 * 60 * 1000
})

// 获取关注的艺术家
const { data: followedArtists } = useQuery({
  queryKey: ['savedArtists'],
  queryFn: getUserFollowedArtists,
  staleTime: 5 * 60 * 1000,
  retry: false,
  onError: (error) => {
    console.warn('Failed to load followed artists:', error)
  }
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

// 检查当前艺术家是否已关注
const isFollowed = computed(() => {
  if (!artist.value || !followedArtists.value?.songs) return false
  return followedArtists.value.songs.some(a => a.id === artistId.value) || false
})

// 检查专辑是否被收藏
const isAlbumLiked = (albumId) => {
  if (!savedAlbums.value?.songs || !Array.isArray(savedAlbums.value.songs)) {
    return false
  }
  return savedAlbums.value.songs.some(a => a.id === albumId)
}

// 获取喜欢的曲目列表
const likedTracks = computed(() => {
  return savedTracks.value?.songs || []
})

const tracks = computed(() => topTracks.value?.tracks || [])
const artistAlbums = computed(() => albums.value?.items || [])
</script>

<template>
  <div class="artist-page">
    <div v-if="isLoadingArtist" class="loading">{{ t('加载中') }}...</div>

    <div v-else-if="artist" class="artist-content">
      <!-- 艺术家头部 -->
      <div class="artist-header">
        <div class="artist-avatar">
          <img
            :src="artist.images?.[0]?.url || 'http://s4.music.126.net/style/web2/img/default/default_avatar.jpg'"
            :alt="artist.name"
          >
        </div>
        <div class="artist-info">
          <h1>{{ artist.name }}</h1>
          <div class="stats">
            <span>{{ t('粉丝') }}: {{ artist.followers?.total?.toLocaleString() }}</span>
            <span v-if="artist.genres?.length"> · {{ artist.genres.slice(0, 3).join(', ') }}</span>
          </div>
          <div class="actions">
            <LikeButton
              v-if="artist"
              :item="artist"
              type="artist"
              :is-liked="isFollowed"
              size="large"
            />
          </div>
        </div>
      </div>

      <!-- 热门歌曲 -->
      <section v-if="tracks.length > 0" class="section">
        <h2>{{ t('热门歌曲') }}</h2>
        <TrackList :tracks="tracks.slice(0, 10)" :liked-tracks="likedTracks" />
      </section>

      <!-- 专辑 -->
      <section v-if="artistAlbums.length > 0" class="section">
        <h2>{{ t('专辑') }}</h2>
        <div class="grid">
          <AlbumCard
            v-for="album in artistAlbums"
            :key="album.id"
            :item="album"
            type="album"
            :is-liked="isAlbumLiked(album.id)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.artist-page {
  padding: 20px 0;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  color: var(--color-secondary);
}

.artist-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 50px;
}

.artist-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-secondary-bg);
  flex-shrink: 0;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-info h1 {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
}

.stats {
  font-size: 16px;
  color: var(--color-secondary);
  margin-bottom: 20px;
}

.stats span {
  margin-right: 8px;
}

.actions {
  display: flex;
  gap: 16px;
}

.section {
  margin-bottom: 50px;
}

.section h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .artist-header {
    flex-direction: column;
    text-align: center;
  }

  .artist-avatar {
    width: 150px;
    height: 150px;
  }

  .artist-info h1 {
    font-size: 32px;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
