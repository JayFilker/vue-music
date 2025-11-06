import { get } from './http.js'

// 获取艺术家信息
export function getArtist(artistId) {
  return get(`/artists/${artistId}`)
}

// 获取艺术家热门歌曲
export function getArtistTopTracks(artistId, market = 'US') {
  return get(`/artists/${artistId}/top-tracks?market=${market}`)
}

// 获取艺术家专辑
export function getArtistAlbums(artistId, limit = 20, offset = 0) {
  return get(`/artists/${artistId}/albums?limit=${limit}&offset=${offset}`)
}

// 获取相关艺术家
export function getRelatedArtists(artistId) {
  return get(`/artists/${artistId}/related-artists`)
}
