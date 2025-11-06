import { get } from './http.js'

// 搜索（综合搜索）
export function fetchProfile(key) {
  const types = 'artist,album,track,playlist'
  const query = encodeURIComponent(key)
  return get(`/search?q=${query}&type=${types}&limit=20`)
}

// 搜索详情（单一类型，支持分页）
export function getSearchContent(type, key, offset = 0) {
  return get(`/search?q=${encodeURIComponent(key)}&type=${type}&limit=50&offset=${offset}`)
}

// 首页搜索
export function firstFetchProfile(key, limit, type) {
  return get(`/search?q=label:"${key}"&type=${type}&limit=${limit}&market=JP`)
}

// 推荐艺术家
export function recommendedArtists(randomTerm) {
  return get(`/search?q=${encodeURIComponent(randomTerm)}&type=artist&limit=6`)
}

// 搜索艺术家
export function searchArtists(query, limit = 20) {
  return get(`/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`)
}

// 搜索歌曲
export function searchTracks(query, limit = 20) {
  return get(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`)
}

// 搜索播放列表
export function searchPlaylists(query, limit = 20) {
  return get(`/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`)
}
