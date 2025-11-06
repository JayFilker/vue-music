import { get, put } from './http.js'

// 播放歌曲
export function playTrack(trackUri, deviceId) {
  return put(`/me/player/play?device_id=${deviceId}`, {
    uris: [trackUri]
  })
}

// 暂停播放
export function pausePlayback() {
  return put('/me/player/pause')
}

// 继续播放
export function resumePlayback() {
  return put('/me/player/play')
}

// 下一首
export function skipToNext() {
  return put('/me/player/next')
}

// 上一首
export function skipToPrevious() {
  return put('/me/player/previous')
}

// 设置音量
export function setVolume(volumePercent) {
  return put(`/me/player/volume?volume_percent=${volumePercent}`)
}

// 获取当前播放状态
export function getCurrentPlayback() {
  return get('/me/player')
}

// 获取用户设备
export function getUserDevices() {
  return get('/me/player/devices')
}

// 跳转到指定位置
export function seekToPosition(positionMs, deviceId) {
  return put(`/me/player/seek?position_ms=${positionMs}&device_id=${deviceId}`)
}
