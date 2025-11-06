# 核心代码片段

## 1. 路由配置 (src/router/index.js)

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/firstpage',
    },
    {
      path: '/firstpage',
      name: 'firstpage',
      component: () => import('@/pages/FirstPage/index.vue'),
    },
    {
      path: '/discover',
      name: 'discover',
      component: () => import('@/pages/Discover/index.vue'),
    },
    // ... 其他14条路由
  ],
})

export default router

---

## 2. 首页第一个"查看全部"链接 (FirstPage/index.vue, 行130-133)

<!-- 推荐歌单部分 -->
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
    />
  </div>
</section>

---

## 3. 首页第二个"查看全部"链接 (FirstPage/index.vue, 行149-152)

<!-- 新专辑部分 -->
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
    />
  </div>
</section>

---

## 4. 首页推荐艺人部分 (FirstPage/index.vue, 行166-169)

<!-- 推荐艺人部分 - 没有"查看全部"链接 -->
<section class="section">
  <div class="section-header">
    <h2>{{ t('推荐艺人') }}</h2>
    <!-- 这里缺少"查看全部"链接 -->
  </div>
  <div v-if="isLoadingArtists" class="loading">{{ t('加载中') }}...</div>
  <div v-else class="artist-grid">
    <!-- 显示6个艺人 -->
  </div>
</section>

---

## 5. 首页数据获取 (FirstPage/index.vue, 行22-43)

// 获取推荐播放列表 (12个)
const { data: recommendPlaylists, isLoading: isLoadingRecommend } = useQuery({
  queryKey: ['firstPage', 'recommend'],
  queryFn: () => firstFetchProfile('recommend', 12, 'playlist'),
  staleTime: 5 * 60 * 1000
})

// 获取新专辑 (12个)
const { data: newAlbums, isLoading: isLoadingNew } = useQuery({
  queryKey: ['firstPage', 'new'],
  queryFn: () => firstFetchProfile('new', 12, 'album'),
  staleTime: 5 * 60 * 1000
})

// 获取推荐艺术家 (随机关键词)
const { data: artists, isLoading: isLoadingArtists } = useQuery({
  queryKey: ['firstPage', 'artists', randomTerm.value],
  queryFn: () => recommendedArtists(randomTerm.value),
  staleTime: 5 * 60 * 1000
})

---

## 6. 发现页当前实现 (src/pages/Discover/index.vue - 完整)

<script setup>
</script>

<template>
  <div class="discover-page">
    <h1>Discover</h1>
    <p>发现页面</p>
  </div>
</template>

<style scoped>
.discover-page {
  padding: 20px;
  color: var(--color-text);
}
</style>

---

## 7. 搜索页参数处理参考 (src/pages/Search/index.vue, 行10-31)

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const searchQuery = ref(route.query.q || '')
const activeTab = ref('all')

// 搜索结果
const { data: searchResults, isLoading, refetch } = useQuery({
  queryKey: ['search', searchQuery.value],
  queryFn: () => fetchProfile(searchQuery.value),
  enabled: !!searchQuery.value && searchQuery.value !== '*',
  staleTime: 5 * 60 * 1000
})

// 监听路由查询变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchQuery.value = newQuery
    refetch()
  }
})

---

## 8. 艺人页参数处理参考 (src/pages/Artist/index.vue, 行10-37)

const route = useRoute()
const { t } = useI18n()

const artistId = ref(route.query.id)

// 获取艺术家信息
const { data: artist, isLoading: isLoadingArtist } = useQuery({
  queryKey: ['artist', artistId.value],
  queryFn: () => getArtist(artistId.value),
  enabled: !!artistId.value,
  staleTime: 5 * 60 * 1000
})

// 获取热门歌曲
const { data: topTracks, isLoading: isLoadingTracks } = useQuery({
  queryKey: ['artistTopTracks', artistId.value],
  queryFn: () => getArtistTopTracks(artistId.value),
  enabled: !!artistId.value,
  staleTime: 5 * 60 * 1000
})

// 获取专辑
const { data: albums, isLoading: isLoadingAlbums } = useQuery({
  queryKey: ['artistAlbums', artistId.value],
  queryFn: () => getArtistAlbums(artistId.value, 20),
  enabled: !!artistId.value,
  staleTime: 5 * 60 * 1000
})

---

## 9. 音乐库页面布局参考 (src/pages/MusicLibrary/index.vue)

<div class="grid">
  <AlbumCard
    v-for="playlist in userPlaylists"
    :key="playlist.id"
    :item="playlist"
    type="playlist"
  />
</div>

<style scoped>
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

---

## 10. 相关 API 导入

// src/api/search.js
export { firstFetchProfile, recommendedArtists, fetchProfile }

// src/components/content/AlbumCard.vue
// 接收props: item, type (playlist/album)
// 自动处理不同类型的数据

// src/stores/music.js (Pinia)
// 提供音乐播放器状态管理

