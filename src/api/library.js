import { get } from './http.js'
import axios from 'axios'

// 自定义后端服务器 URL（与 React 版本相同）
const CUSTOM_API_BASE = 'https://musicplayernodejs-production.up.railway.app'

// 创建带认证的 axios 实例用于自定义后端
const customClient = axios.create({
  baseURL: CUSTOM_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 添加请求拦截器，确保每次请求都获取最新的token
customClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ==================== 自定义后端 API ====================

// 获取用户收藏的歌曲（自定义后端）
export function getUserSavedTracks() {
  return customClient.get('/my-songs').then(res => res.data)
}

// 获取用户收藏的专辑（自定义后端）
export function getUserSavedAlbums() {
  return customClient.get('/my-playList-or-albums', {
    params: { type: 'albums' }
  }).then(res => res.data)
}

// 获取用户的播放列表（自定义后端）
export function getUserPlaylists() {
  return customClient.get('/my-playList-or-albums', {
    params: { type: 'playlists' }
  }).then(res => res.data)
}

// 获取用户关注的艺术家（自定义后端）
export function getUserFollowedArtists() {
  return customClient.get('/my-artist').then(res => res.data)
}

// ==================== 添加收藏 ====================

// 添加收藏歌曲
export function addFavoriteSong(track) {
  return customClient.post('/add-like-song', track)
}

// 删除收藏歌曲
export function removeFavoriteSong(track) {
  return customClient.post('/remove-like-song', track)
}

// 添加收藏专辑/播放列表
export function addFavoriteListOrAlbum(item) {
  return customClient.post('/add-like-playList-or-albums', item)
}

// 删除收藏专辑/播放列表
export function removeFavoriteListOrAlbum(item) {
  return customClient.post('/remove-like-playList-or-albums', item)
}

// 添加收藏艺术家
export function addFavoriteArtist(artist) {
  return customClient.post('/add-artist', artist)
}

// 删除收藏艺术家
export function removeFavoriteArtist(artist) {
  return customClient.post('/remove-artist', artist)
}

// ==================== Spotify 官方 API (备用) ====================

// 获取 Spotify 官方收藏的歌曲
export function getSpotifySavedTracks(limit = 50, offset = 0) {
  return get(`/me/tracks?limit=${limit}&offset=${offset}`)
}

// 获取 Spotify 官方收藏的专辑
export function getSpotifySavedAlbums(limit = 50, offset = 0) {
  return get(`/me/albums?limit=${limit}&offset=${offset}`)
}

// 获取 Spotify 官方播放列表
export function getSpotifyPlaylists(limit = 50, offset = 0) {
  return get(`/me/playlists?limit=${limit}&offset=${offset}`)
}

// 获取 Spotify 官方关注的艺术家
export function getSpotifyFollowedArtists(limit = 50) {
  return get(`/me/following?type=artist&limit=${limit}`)
}
