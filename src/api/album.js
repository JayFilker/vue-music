import { get } from './http.js'

// 获取专辑列表
export function getAlbumList(key, offset = 0) {
  return get(`/search?q=${key}&type=album&limit=50&offset=${offset}`)
}

// 获取单个专辑
export function getAlbum(randomLetter) {
  return get(`/search?q=${randomLetter}&type=album&limit=1`)
}

// 获取专辑歌曲
export function getAlbumSong(albumId) {
  return get(`/albums/${albumId}/tracks?limit=10`)
}

// 获取专辑详情
export function getAlbumDetail(albumId) {
  return get(`/albums/${albumId}`)
}
