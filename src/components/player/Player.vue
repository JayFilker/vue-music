<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMusicStore } from '@/stores/music'
import { playTrack, pausePlayback, resumePlayback } from '@/api/system'
import ButtonIcon from '../common/ButtonIcon.vue'
import SvgIcon from '../common/SvgIcon.vue'
import ProgressBar from './ProgressBar.vue'
import VolumeControl from './VolumeControl.vue'

const musicStore = useMusicStore()
const playerSdk = ref(null)
const progressInterval = ref(null)
const isTogglingPlay = ref(false) // 防抖标志
const isTransitioning = ref(false) // 过渡期标志，阻止进度更新
const lastKnownProgress = ref(0) // 记录最后已知的正确进度，用于恢复播放
const resumePlaybackTime = ref(0) // 记录恢复播放的时间戳，用于扩展保护窗口

// 获取当前歌曲信息
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.isPlaying)
const deviceId = computed(() => musicStore.device)
const currentSongList = computed(() => musicStore.currentSongList)
const count = computed(() => musicStore.countDemo)

// 获取Token
const getToken = () => localStorage.getItem('spotify_access_token')

// 停止定时器
const stopProgressInterval = () => {
  if (progressInterval.value) {
    console.log('Stopping progress interval')
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
}

// 播放指定曲目
const playTrackByUri = async (trackUri) => {
  if (!deviceId.value) {
    console.log('No device available')
    return
  }

  try {
    console.log('Playing new track')

    // 1. 进入过渡期，阻止所有进度更新
    isTransitioning.value = true

    // 2. 立即停止定时器
    stopProgressInterval()

    // 3. 重置进度为0
    musicStore.updateProgress(0)
    lastKnownProgress.value = 0 // 切换歌曲时重置
    resumePlaybackTime.value = 0 // 重置恢复播放时间

    // 4. 播放新曲目
    await playTrack(trackUri, deviceId.value)
    musicStore.$patch({ isPlayingDemo: true })

    // 5. 等待500ms让SDK稳定，然后解除过渡期
    setTimeout(() => {
      isTransitioning.value = false
      console.log('Track change transition complete')
    }, 500)
  } catch (error) {
    console.error('Play track error:', error)
    isTransitioning.value = false
  }
}

// 播放/暂停（添加防抖）
const togglePlay = async () => {
  if (!deviceId.value) {
    console.log('No device available')
    return
  }

  // 防抖：如果正在处理播放/暂停操作，直接返回
  if (isTogglingPlay.value) {
    console.log('Toggle play already in progress, ignoring')
    return
  }

  isTogglingPlay.value = true
  isTransitioning.value = true // 进入过渡期

  try {
    if (isPlaying.value) {
      console.log('Pausing playback')
      // 暂停前保存当前进度和停止定时器
      lastKnownProgress.value = musicStore.progress
      console.log(`⏸️ Pausing - Saved progress: ${lastKnownProgress.value.toFixed(2)}s (store: ${musicStore.progress.toFixed(2)}s)`)
      stopProgressInterval()
      await pausePlayback()
    } else {
      console.log('Resuming playback')

      // 检查是否真的是首次播放（没有播放过任何内容）
      // 只有在 firstPlay=true 且当前进度为 0 时才认为是首次播放
      const isReallyFirstPlay = musicStore.firstPlay && musicStore.progress === 0 && currentSongList.value?.items?.length > 0

      if (isReallyFirstPlay) {
        const trackUri = currentSongList.value.items[count.value]?.uri
        if (trackUri) {
          // 首次播放时停止定时器并重置进度
          stopProgressInterval()
          musicStore.updateProgress(0)
          lastKnownProgress.value = 0
          resumePlaybackTime.value = 0 // 重置恢复播放时间
          console.log('🎵 First play, starting from 0')
          await playTrack(trackUri, deviceId.value)
          musicStore.$patch({ firstPlay: false })
        } else {
          console.warn('First play but no trackUri available')
        }
      } else {
        // 正常恢复播放：保存当前进度并记录时间戳
        // 如果之前已经播放过（进度 > 0），则标记 firstPlay 为 false
        if (musicStore.firstPlay && musicStore.progress > 0) {
          console.log('Detected previous playback, marking firstPlay as false')
          musicStore.$patch({ firstPlay: false })
        }

        const currentProgress = musicStore.progress
        lastKnownProgress.value = currentProgress
        resumePlaybackTime.value = Date.now() // 记录恢复播放的时间
        console.log(`▶️ Resuming - Saved progress: ${lastKnownProgress.value.toFixed(2)}s (store: ${currentProgress.toFixed(2)}s) at time: ${resumePlaybackTime.value}`)
        console.log(`   firstPlay: ${musicStore.firstPlay}, has trackUri: ${!!currentSongList.value?.items?.[count.value]?.uri}`)
        await resumePlayback()
      }
    }
  } catch (error) {
    console.error('Toggle play error:', error)
  } finally {
    // 延迟解锁，避免快速连续点击，并解除过渡期
    setTimeout(() => {
      isTogglingPlay.value = false
      isTransitioning.value = false
      console.log('Toggle transition complete')
    }, 300)
  }
}

// 上一首
const previousTrack = async () => {
  if (!currentSongList.value?.items?.length) return

  const newCount = count.value > 0 ? count.value - 1 : currentSongList.value.items.length - 1
  musicStore.setCurrentSong(newCount)

  const trackUri = currentSongList.value.items[newCount]?.uri
  if (trackUri) {
    await playTrackByUri(trackUri)
  }
}

// 下一首
const nextTrack = async () => {
  if (!currentSongList.value?.items?.length) return

  const newCount = count.value < currentSongList.value.items.length - 1 ? count.value + 1 : 0
  musicStore.setCurrentSong(newCount)

  const trackUri = currentSongList.value.items[newCount]?.uri
  if (trackUri) {
    await playTrackByUri(trackUri)
  }
}

// 切换歌词显示
const toggleLyrics = () => {
  musicStore.toggleLyrics()
}

// 刷新Token
const getRefreshToken = async () => {
  const refreshToken = localStorage.getItem('spotify_refresh_token')
  const response = await fetch(`https://musicplayernodejs-production.up.railway.app/refresh_token?refresh_token=${encodeURIComponent(refreshToken)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  localStorage.setItem('spotify_refresh_token', data.refresh_token)
  localStorage.setItem('spotify_access_token', data.access_token)
}

// 重连SDK
const reconnectSdk = () => {
  if (playerSdk.value) {
    playerSdk.value.disconnect()
    setTimeout(() => playerSdk.value.connect(), 100)
  }
}

// 初始化Spotify Web Playback SDK
const initializeSpotifyPlayer = () => {
  const script = document.createElement('script')
  script.src = 'https://sdk.scdn.co/spotify-player.js'
  script.async = true
  document.body.appendChild(script)

  window.onSpotifyWebPlaybackSDKReady = () => {
    const token = getToken()
    if (!token) {
      console.log('No Spotify token found')
      return
    }

    const player = new window.Spotify.Player({
      name: 'Vue Music Player',
      getOAuthToken: cb => { cb(token) },
      volume: musicStore.volume
    })

    playerSdk.value = player

    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id)
      musicStore.setDevice(device_id)
    })

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id)
      reconnectSdk()
    })

    player.addListener('authentication_error', (e) => {
      console.error('Authentication error:', e.message)
      getRefreshToken().then(() => {
        reconnectSdk()
      })
    })

    player.addListener('player_state_changed', state => {
      if (!state) return

      const isNowPlaying = !state.paused
      const sdkProgress = state.position / 1000
      const currentProgress = musicStore.playerDemo.progress
      const timeSinceResume = Date.now() - resumePlaybackTime.value

      // 是否在恢复播放后的保护窗口内（2秒）
      const inResumeProtectionWindow = timeSinceResume < 2000 && resumePlaybackTime.value > 0

      console.log(`[State] paused:${state.paused} pos:${sdkProgress.toFixed(2)} | last:${lastKnownProgress.value.toFixed(2)} | timeSince:${timeSinceResume}ms | inProtection:${inResumeProtectionWindow} | trans:${isTransitioning.value} | stopBar:${musicStore.stopUpdateBar}`)

      // 特别标记 SDK 报告 0 的情况
      if (sdkProgress === 0 && !state.paused) {
        console.warn(`⚠️ SDK reports position:0 while playing! lastKnown:${lastKnownProgress.value.toFixed(2)}s resumeTime:${resumePlaybackTime.value}`)
      }

      // 计算 SDK 进度与最后已知进度的差异
      const progressDiff = Math.abs(sdkProgress - lastKnownProgress.value)

      // === 检测可疑的进度变化 ===
      let isSuspiciousProgress = false
      let suspiciousReason = ''

      // 情况1：在保护窗口内，检测异常的进度跳变
      if (inResumeProtectionWindow && lastKnownProgress.value > 0) {
        if (sdkProgress === 0 && lastKnownProgress.value > 1) {
          // SDK 报告 0，但上次进度大于 1 秒（降低阈值从 5 秒到 1 秒）
          isSuspiciousProgress = true
          suspiciousReason = `SDK报告0，但上次进度${lastKnownProgress.value.toFixed(1)}s`
        } else if (progressDiff > 10 && sdkProgress < lastKnownProgress.value - 5) {
          // 大幅度回退
          isSuspiciousProgress = true
          suspiciousReason = `异常回退: ${lastKnownProgress.value.toFixed(1)}→${sdkProgress.toFixed(1)}`
        } else if (progressDiff > 5 && Math.abs(sdkProgress - lastKnownProgress.value) > progressDiff * 0.8) {
          // 中等幅度但不合理的跳变（超过80%的差异）
          isSuspiciousProgress = true
          suspiciousReason = `可疑跳变: ${lastKnownProgress.value.toFixed(1)}→${sdkProgress.toFixed(1)} (diff=${progressDiff.toFixed(1)}s)`
        }
      }

      // 情况2：过渡期内的大幅度进度变化
      if (isTransitioning.value && !state.paused && progressDiff > 10) {
        isSuspiciousProgress = true
        suspiciousReason = `过渡期大幅变化: diff=${progressDiff.toFixed(1)}s`
      }

      // === 决定最终使用的进度值 ===
      let finalProgress = currentProgress
      let action = '' // 记录采取的动作

      if (isSuspiciousProgress) {
        // 🚫 拒绝可疑进度，保持不变
        finalProgress = currentProgress
        action = `🚫 REJECT (${suspiciousReason})`

      } else if (musicStore.stopUpdateBar) {
        // ⏸️ 用户正在拖拽，保持不变
        finalProgress = currentProgress
        action = '⏸️ SKIP (拖拽中)'

      } else if (isTransitioning.value) {
        // ⏸️ 过渡期，保持不变
        finalProgress = currentProgress
        action = '⏸️ SKIP (过渡期)'

      } else if (inResumeProtectionWindow) {
        // 🛡️ 保护窗口内，只接受合理的进度
        if (progressDiff < 2 || sdkProgress > lastKnownProgress.value) {
          finalProgress = sdkProgress
          lastKnownProgress.value = sdkProgress
          action = `✅ ACCEPT (窗口内合理: diff=${progressDiff.toFixed(2)}s)`
        } else {
          // 使用上次保存的正确进度，而不是当前可能已被污染的进度
          finalProgress = lastKnownProgress.value
          action = `🛡️ PROTECT (窗口内可疑: diff=${progressDiff.toFixed(2)}s) 保持: ${lastKnownProgress.value.toFixed(2)}s`

          // 如果差异超过3秒且不在拖拽中，主动修正SDK位置
          if (progressDiff > 3 && !musicStore.stopUpdateBar && isNowPlaying) {
            console.warn(`🔧 Auto-correcting SDK position from ${sdkProgress.toFixed(2)}s to ${lastKnownProgress.value.toFixed(2)}s`)
            import('@/api/system').then(({ seekToPosition }) => {
              const positionMs = Math.floor(lastKnownProgress.value * 1000)
              seekToPosition(positionMs, deviceId.value).catch(err => {
                console.error('Failed to auto-correct position:', err)
              })
            })
          }
        }

      } else {
        // ✅ 正常状态，同步 SDK 进度
        finalProgress = sdkProgress
        lastKnownProgress.value = sdkProgress
        action = '✅ SYNC'
      }

      console.log(`[Action] ${action} -> ${finalProgress.toFixed(2)}s`)

      // 更新总时长和播放状态
      musicStore.$patch({
        playerDemo: {
          ...musicStore.playerDemo,
          currentTrackDuration: state.duration / 1000,
          progress: finalProgress
        },
        isPlayingDemo: isNowPlaying
      })

      // 根据播放状态管理定时器
      if (isNowPlaying) {
        // 播放中：启动定时器（如果还没启动）
        if (!progressInterval.value) {
          console.log('Starting progress interval')
          progressInterval.value = setInterval(async () => {
            // 在过渡期或拖拽时不更新进度
            if (isTransitioning.value || musicStore.stopUpdateBar) {
              console.log('Skipping progress update (transitioning or dragging)')
              return
            }

            try {
              const currentState = await player.getCurrentState()
              if (currentState && !currentState.paused) {
                const newProgress = currentState.position / 1000
                musicStore.updateProgress(newProgress)
                lastKnownProgress.value = newProgress // 持续更新最后已知的正确进度
              }
            } catch (error) {
              console.error('Error getting current state:', error)
            }
          }, 250)
        }
      } else {
        // 暂停中：停止定时器，进度保持不变
        stopProgressInterval()
      }
    })

    player.connect()
  }
}

// 格式化艺术家
const formatArtists = (artists) => {
  if (!artists || !Array.isArray(artists)) return ''
  return artists.map(artist => artist.name).join(', ')
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 监听音量变化
watch(() => musicStore.volume, (newVolume) => {
  if (playerSdk.value) {
    playerSdk.value.setVolume(newVolume)
  }
})

onMounted(() => {
  initializeSpotifyPlayer()
})

onUnmounted(() => {
  // 清除进度更新定时器
  stopProgressInterval()

  // 断开播放器连接
  if (playerSdk.value) {
    playerSdk.value.disconnect()
  }
})
</script>

<template>
  <div class="player">
    <div class="player-content">
      <!-- 左侧：歌曲信息 -->
      <div class="song-info">
        <img
          v-if="currentSong?.album?.images?.[0]?.url"
          :src="currentSong.album.images[0].url"
          :alt="currentSong.name"
          class="album-cover"
        >
        <div v-else class="album-cover-placeholder" />
        <div class="song-details">
          <div class="song-name">{{ currentSong?.name || '未播放' }}</div>
          <div class="song-artist">
            {{ currentSong?.artists ? formatArtists(currentSong.artists) : '未知艺术家' }}
          </div>
        </div>
      </div>

      <!-- 中间：播放控制 -->
      <div class="player-controls">
        <div class="control-buttons">
          <ButtonIcon @click="previousTrack" title="上一首">
            <SvgIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  fill="currentColor"
                  d="M11.5 280.6l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2zm256 0l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2z"
                />
              </svg>
            </SvgIcon>
          </ButtonIcon>

          <ButtonIcon class="play-button" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
            <SvgIcon>
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path
                  fill="currentColor"
                  d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path
                  fill="currentColor"
                  d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
                />
              </svg>
            </SvgIcon>
          </ButtonIcon>

          <ButtonIcon @click="nextTrack" title="下一首">
            <SvgIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  fill="currentColor"
                  d="M500.5 231.4l-192-160C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2zm-256 0l-192-160C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2z"
                />
              </svg>
            </SvgIcon>
          </ButtonIcon>
        </div>

        <div class="progress-wrapper">
          <span class="time-display">{{ formatTime(musicStore.progress) }}</span>
          <ProgressBar />
          <span class="time-display">{{ formatTime(musicStore.currentTrackDuration) }}</span>
        </div>
      </div>

      <!-- 右侧：音量和其他控制 -->
      <div class="right-controls">
        <ButtonIcon @click="toggleLyrics" title="歌词">
          <SvgIcon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path
                fill="currentColor"
                d="M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"
              />
            </svg>
          </SvgIcon>
        </ButtonIcon>
        <VolumeControl />
      </div>
    </div>
  </div>
</template>

<style scoped>
.player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background-color: var(--color-navbar-bg);
  backdrop-filter: saturate(180%) blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 100;
}

.player-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10vw;
  gap: 20px;
}

@media (max-width: 1336px) {
  .player-content {
    padding: 0 5vw;
  }
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.album-cover,
.album-cover-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
}

.album-cover-placeholder {
  background: var(--color-secondary-bg);
}

.song-details {
  min-width: 0;
  flex: 1;
}

.song-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 2;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.play-button {
  width: 40px;
  height: 40px;
}

.play-button :deep(.svg-icon) {
  width: 20px;
  height: 20px;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.time-display {
  font-size: 11px;
  color: var(--color-secondary);
  min-width: 40px;
  text-align: center;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .song-info {
    flex: 0 0 auto;
  }

  .player-controls {
    flex: 1;
  }

  .right-controls {
    flex: 0 0 auto;
  }
}
</style>
