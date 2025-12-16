<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music.js'
import { getAlbumSong } from '@/api/album.js'
import { getPlaylistTracks } from '@/api/playlist.js'
import { playTrack } from '@/api/system.js'
import SvgIcon from '../common/SvgIcon.vue'
import LikeButton from '../common/LikeButton.vue'
const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
    type: {
        type: String,
        default: 'playlist', // 'playlist' or 'album'
    },
    isLiked: {
        type: Boolean,
        default: false,
    },
})
const router = useRouter()
const musicStore = useMusicStore()
const showPlayButton = ref(false)
const deviceId = computed(() => musicStore.device)
// 处理播放按钮点击
const handlePlayClick = async (e) => {
    e.stopPropagation() // 阻止冒泡到父元素
    try {
        if (!deviceId.value) {
            console.error('No device available')
            return
        }
        // 根据类型获取歌曲列表
        let data
        let tracks
        if (props.type === 'playlist') {
            data = await getPlaylistTracks(props.item.id, 50, 0)
            tracks = data.items?.map(item => item.track).filter(Boolean) || []
        } else {
            data = await getAlbumSong(props.item.id)
            tracks = data.items || []
        }
        if (tracks.length > 0) {
            // 设置播放列表
            musicStore.setSongList(tracks)
            musicStore.setCurrentSongList({
                items: tracks,
                imgPic: props.item.images?.[0]?.url,
            })
            // 设置当前歌曲索引
            musicStore.setCurrentSong(0)
            // 调用Spotify API播放
            const trackUri = tracks[0].uri
            await playTrack(trackUri, deviceId.value)
            // 更新播放状态
            musicStore.$patch({ isPlayingDemo: true })
        }
    } catch (error) {
        console.error('Failed to play:', error)
    }
}
// 处理卡片点击（跳转到详情页）
const handleCardClick = () => {
    const type = props.type === 'playlist' ? 'playlists' : 'albums'
    router.push(`/playsList?id=${ props.item.id }&type=${ type }`)
}
</script>
<template>
    <div
        class="album-card"
        @mouseenter="showPlayButton = true"
        @mouseleave="showPlayButton = false"
        @click="handleCardClick"
    >
        <div class="cover-container">
            <div class="shade">
                <!-- 收藏按钮 - 右上角 -->
                <div v-show="showPlayButton" class="like-button-container">
                    <LikeButton
                        :item="item"
                        :type="type"
                        :is-liked="isLiked"
                        size="medium"
                    />
                </div>
                <!-- 播放按钮 - 中心 -->
                <button
                    v-show="showPlayButton"
                    class="play-button"
                    @click="handlePlayClick"
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
                :src="item.images?.[0]?.url"
                :alt="item.name"
                loading="lazy"
            >
            <div
                class="shadow"
                :style="{ backgroundImage: `url(${item.images?.[0]?.url})` }"
                :class="{ visible: showPlayButton }"
            />
        </div>
        <div class="info">
            <div class="name">{{ item.name }}</div>
            <div v-if="item.artists" class="artist">
                {{ item.artists?.map(a => a.name).join(', ') }}
            </div>
            <div v-else-if="item.description" class="description">
                {{ item.description }}
            </div>
        </div>
    </div>
</template>
<style scoped>
.album-card {
    cursor: pointer;
    transition: transform 0.3s;
}
.album-card:hover {
    transform: translateY(-4px);
}
.cover-container {
    position: relative;
    margin-bottom: 12px;
}
img {
    border-radius: 0.75em;
    width: 100%;
    user-select: none;
    aspect-ratio: 1 / 1;
    border: 1px solid rgba(0, 0, 0, 0.04);
    object-fit: cover;
}
.shade {
    position: absolute;
    top: 0;
    height: calc(100% - 3px);
    width: 100%;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
}
.like-button-container {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 3;
}
.play-button {
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.08);
    height: 22%;
    width: 22%;
    border-radius: 50%;
    cursor: pointer;
    transition: 0.2s;
    animation: fadeIn 0.2s ease-in;
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
    border-radius: 0.75em;
    aspect-ratio: 1 / 1;
    opacity: 0;
    transition: opacity 0.3s;
}
.shadow.visible {
    opacity: 1;
}
.info {
    padding: 0 4px;
}
.name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 4px;
    line-height: 1.4;
}
.artist,
.description {
    font-size: 12px;
    color: var(--color-secondary);
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
