import { get } from './http.js'

// 获取播放列表详情
export function getPlaylist(playlistId) {
  return get(`/playlists/${playlistId}`)
}

// 获取播放列表曲目
export function getPlaylistTracks(playlistId, limit = 50, offset = 0) {
  return get(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`)
}

// 获取专辑详情
export function getAlbumDetails(albumId) {
  return get(`/albums/${albumId}`)
}

// 获取专辑曲目
export function getAlbumTracks(albumId) {
  return get(`/albums/${albumId}/tracks`)
}
