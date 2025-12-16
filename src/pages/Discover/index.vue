<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { firstFetchProfile } from '@/api/search'
import { getUserSavedAlbums } from '@/api/library'
import AlbumCard from '@/components/content/AlbumCard.vue'
import { quickCategories, detailedCategories } from './discoverCategories'
const route = useRoute()
const { t } = useI18n()
// 状态管理
const showDetailedPanel = ref(false)
const activeCategory = ref('全部')
const offset = ref(0)
const allItems = ref([])
// 从 URL 获取分类参数
const urlCategory = computed(() => route.query.key || '')
// 监听 URL 参数变化
watch(urlCategory, (newCategory) => {
  if (newCategory && quickCategories.includes(newCategory)) {
    if (activeCategory.value === newCategory) return // 避免重复设置
    activeCategory.value = newCategory
    showDetailedPanel.value = false
    offset.value = 0
    // 不要立即清空 allItems，让 watch 在数据到达后再更新
  } else if (newCategory) {
    // 如果 URL 参数在详细分类中
    const allDetailedCats = detailedCategories.flatMap(cat => cat.content)
    if (allDetailedCats.includes(newCategory)) {
      if (activeCategory.value === newCategory) return // 避免重复设置
      activeCategory.value = newCategory
      showDetailedPanel.value = false
      offset.value = 0
      // 不要立即清空 allItems，让 watch 在数据到达后再更新
    }
  }
}, { immediate: true })
// API 查询关键字转换
const apiKeyword = computed(() => {
  if (activeCategory.value === '全部') return ''
  if (activeCategory.value === '推荐歌单') return 'recommend'
  if (activeCategory.value === '新专辑') return 'new'
  return activeCategory.value
})
// 获取数据
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['discover', apiKeyword, offset],  // 直接使用 ref，不要 .value
  queryFn: () => {
    if (!apiKeyword.value) {
      // 获取全部，使用通用搜索
      return firstFetchProfile('popular', 50, 'album')
    }
    return firstFetchProfile(apiKeyword.value, 50, 'album')
  },
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
// 检查专辑是否被收藏
const isAlbumLiked = (albumId) => {
  const albums = savedAlbums.value?.songs || []
  return Array.isArray(albums) && albums.some(a => a.id === albumId)
}
// 监听数据变化，合并到列表中
watch([data, isLoading, offset], ([newData, loading, newOffset]) => {
  // 如果正在加载中，不做任何操作，避免误清空数据
  if (loading) {
    return
  }
  // 如果没有数据
  if (!newData?.albums?.items || newData.albums.items.length === 0) {
    // 只有在首次加载（offset为0）且确实加载完成时才清空
    if (newOffset === 0 && !loading) {
      allItems.value = []
    }
    return
  }
  if (newOffset === 0) {
    // 首次加载或切换分类，直接替换
    allItems.value = newData.albums.items
  } else {
    // 追加加载，过滤重复项
    const newItems = newData.albums.items.filter(
      item => !allItems.value.some(existing => existing.id === item.id)
    )
    allItems.value = [...allItems.value, ...newItems]
  }
}, { immediate: false })
// 格式化数据
const albums = computed(() => allItems.value)
// 处理分类点击
const handleCategoryClick = (category) => {
  if (activeCategory.value === category) return // 如果是同一分类，不做任何操作
  activeCategory.value = category
  showDetailedPanel.value = false
  offset.value = 0
  // 不要立即清空 allItems，让 watch 在数据到达后再更新
  // allItems.value = []
}
// 处理详细分类点击
const handleDetailedCategoryClick = (category) => {
  if (activeCategory.value === category) return // 如果是同一分类，不做任何操作
  activeCategory.value = category
  showDetailedPanel.value = false
  offset.value = 0
  // 不要立即清空 allItems，让 watch 在数据到达后再更新
  // allItems.value = []
}
// 加载更多
const loadMore = () => {
  offset.value += 50
}
// 切换详细分类面板
const toggleDetailedPanel = () => {
  showDetailedPanel.value = !showDetailedPanel.value
}
</script>
<template>
  <div class="discover-page">
    <h1 class="page-title">{{ t('发现') }}</h1>
    <!-- 快速分类按钮 -->
    <div class="quick-categories">
      <button
        v-for="category in quickCategories"
        :key="category"
        :class="['category-btn', { active: activeCategory === category }]"
        @click="handleCategoryClick(category)"
      >
        {{ category }}
      </button>
      <button class="category-btn more-btn" @click="toggleDetailedPanel">
        <span v-if="!showDetailedPanel">展开更多</span>
        <span v-else>收起</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          :class="['arrow-icon', { rotate: showDetailedPanel }]"
        >
          <path
            fill="currentColor"
            d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
          />
        </svg>
      </button>
    </div>
    <!-- 详细分类面板 -->
    <transition name="slide-down">
      <div v-if="showDetailedPanel" class="detailed-panel">
        <div
          v-for="categoryGroup in detailedCategories"
          :key="categoryGroup.mainType"
          class="category-group"
        >
          <div class="group-title">{{ categoryGroup.mainType }}</div>
          <div class="group-items">
            <button
              v-for="item in categoryGroup.content"
              :key="item"
              :class="['detail-category-btn', { active: activeCategory === item }]"
              @click="handleDetailedCategoryClick(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- 加载状态 -->
    <div v-if="isLoading && albums.length === 0" class="loading">
      {{ t('加载中') }}...
    </div>
    <!-- 专辑网格 -->
    <div v-else-if="albums.length > 0" class="albums-section">
      <!-- 如果正在加载新分类的数据，显示半透明遮罩 -->
      <div v-if="isLoading && offset === 0" class="loading-overlay">
        <div class="loading-spinner">{{ t('加载中') }}...</div>
      </div>
      <div class="albums-grid">
        <AlbumCard
          v-for="album in albums"
          :key="album.id"
          :item="album"
          type="album"
          :is-liked="isAlbumLiked(album.id)"
        />
      </div>
      <!-- 加载更多按钮 -->
      <div class="load-more-section">
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
    <!-- 空状态 -->
    <div v-else-if="!isLoading" class="empty-state">
      <p>{{ t('暂无数据') }}</p>
    </div>
  </div>
</template>
<style scoped>
.discover-page {
  padding: 20px 0;
}
.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 30px;
}
/* 快速分类按钮 */
.quick-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.category-btn {
  padding: 8px 20px;
  background: var(--color-secondary-bg-for-transparent);
  color: var(--color-text);
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.category-btn:hover {
  background: var(--color-primary-bg-for-transparent);
  border-color: var(--color-primary);
}
.category-btn.active {
  background: var(--color-primary);
  color: white;
}
.more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
.arrow-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s;
}
.arrow-icon.rotate {
  transform: rotate(180deg);
}
/* 详细分类面板 */
.detailed-panel {
  background: var(--color-secondary-bg);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}
.category-group {
  margin-bottom: 20px;
}
.category-group:last-child {
  margin-bottom: 0;
}
.group-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
}
.group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.detail-category-btn {
  padding: 6px 16px;
  background: var(--color-secondary-bg-for-transparent);
  color: var(--color-secondary);
  border: 1px solid transparent;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.detail-category-btn:hover {
  color: var(--color-text);
  background: var(--color-primary-bg-for-transparent);
}
.detail-category-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 800px;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
}
/* 专辑网格 */
.albums-section {
  margin-top: 32px;
  position: relative;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}
.loading-spinner {
  background: var(--color-secondary-bg);
  padding: 16px 32px;
  border-radius: 24px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}
@media (max-width: 768px) {
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}
/* 加载更多 */
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
/* 加载和空状态 */
.loading,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-secondary);
  font-size: 16px;
}
/* 响应式 */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  .detailed-panel {
    padding: 16px;
  }
}
</style>
