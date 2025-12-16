<script setup>
import { ref, computed, watch } from 'vue'
import { useMusicStore } from '@/stores/music'
import { playTrack } from '@/api/system'
import TrackListItem from './TrackListItem.vue'
const props = defineProps({
  tracks: {
    type: Array,
    default: () => []
  },
  albumInfo: {
    type: Object,
    default: null
  },
  highlightPlayingTrack: {
    type: Boolean,
    default: true
  },
  likedTracks: {
    type: Array,
    default: () => []
  }
})
const musicStore = useMusicStore()
const playingTrackIndex = ref(-1)
const deviceId = computed(() => musicStore.device)
// 检查曲目是否被收藏
const isTrackLiked = (trackId) => {
  return props.likedTracks.some(track => track.id === trackId)
}
// 监听当前播放的歌曲索引
watch(() => musicStore.countDemo, (newIndex) => {
  playingTrackIndex.value = newIndex
}, { immediate: true })
// 处理曲目点击播放
const handleTrackClick = async (track, index) => {
  try {
    if (!deviceId.value) {
      console.error('No device available')
      return
    }
    // 设置当前播放列表
    musicStore.setSongList(props.tracks)
    musicStore.setCurrentSongList({
      items: props.tracks,
      imgPic: props.albumInfo?.images?.[0]?.url || track.album?.images?.[0]?.url
    })
    // 设置当前播放索引
    musicStore.setCurrentSong(index)
    playingTrackIndex.value = index
    // 调用 Spotify API 播放
    const trackUri = track.uri
    await playTrack(trackUri, deviceId.value)
    // 更新播放状态
    musicStore.$patch({
      isPlayingDemo: true,
      firstPlay: false,
      isPlayingDemoTwo: false,
      link: false,
      badLike: false
    })
    // 更新 playingTrack 数组
    const newPlayingTrack = Array.from({ length: 100 }, () => false)
    newPlayingTrack[index] = true
    musicStore.$patch({ playingTrack: newPlayingTrack })
  } catch (error) {
    console.error('Failed to play track:', error)
  }
}
</script>
<template>
  <div class="track-list">
    <div class="tracks">
      <TrackListItem
        v-for="(track, index) in tracks"
        :key="track.id || index"
        :track="track"
        :index="index"
        :is-playing="highlightPlayingTrack && playingTrackIndex === index"
        :album-info="albumInfo"
        :is-liked="isTrackLiked(track.id)"
        @click="handleTrackClick(track, index)"
      />
    </div>
  </div>
</template>
<style scoped>
.track-list {
  width: 100%;
}
.tracks {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
