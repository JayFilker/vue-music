import { onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/music'
import { playTrack, pausePlayback, resumePlayback } from '@/api/system'

export function useKeyboardShortcuts() {
  const musicStore = useMusicStore()

  const playTrackByUri = async (trackUri) => {
    const deviceId = musicStore.device
    if (!deviceId) return

    try {
      await playTrack(trackUri, deviceId)
      musicStore.$patch({ isPlayingDemo: true })
    } catch (error) {
      console.error('Play track error:', error)
    }
  }

  const handleKeyPress = async (event) => {
    // 如果用户正在输入框中输入，不触发快捷键
    const target = event.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    const deviceId = musicStore.device
    if (!deviceId) return

    try {
      switch (event.code) {
        case 'Space':
          // 空格键：播放/暂停
          event.preventDefault()
          if (musicStore.isPlayingDemo) {
            await pausePlayback()
          } else {
            // 如果是首次播放且有歌曲列表
            if (musicStore.firstPlay && musicStore.currentSongList?.items?.length > 0) {
              const trackUri = musicStore.currentSongList.items[musicStore.countDemo]?.uri
              if (trackUri) {
                await playTrack(trackUri, deviceId)
                musicStore.$patch({ firstPlay: false })
              }
            } else {
              await resumePlayback()
            }
          }
          musicStore.togglePlay()
          break

        case 'ArrowRight':
          // 右箭头：下一首
          event.preventDefault()
          if (musicStore.currentSongList?.items?.length > 0) {
            const newCount = musicStore.countDemo < musicStore.currentSongList.items.length - 1
              ? musicStore.countDemo + 1
              : 0
            musicStore.setCurrentSong(newCount)

            const trackUri = musicStore.currentSongList.items[newCount]?.uri
            if (trackUri) {
              await playTrackByUri(trackUri)
            }
          }
          break

        case 'ArrowLeft':
          // 左箭头：上一首
          event.preventDefault()
          if (musicStore.currentSongList?.items?.length > 0) {
            const newCount = musicStore.countDemo > 0
              ? musicStore.countDemo - 1
              : musicStore.currentSongList.items.length - 1
            musicStore.setCurrentSong(newCount)

            const trackUri = musicStore.currentSongList.items[newCount]?.uri
            if (trackUri) {
              await playTrackByUri(trackUri)
            }
          }
          break

        case 'ArrowUp':
          // 上箭头：增加音量
          event.preventDefault()
          const newVolumeUp = Math.min(musicStore.volume + 0.1, 1)
          musicStore.setVolume(newVolumeUp)
          break

        case 'ArrowDown':
          // 下箭头：减少音量
          event.preventDefault()
          const newVolumeDown = Math.max(musicStore.volume - 0.1, 0)
          musicStore.setVolume(newVolumeDown)
          break

        case 'KeyL':
          // L键：显示/隐藏歌词
          event.preventDefault()
          musicStore.toggleLyrics()
          break
      }
    } catch (error) {
      console.error('Keyboard shortcut error:', error)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
  })
}
