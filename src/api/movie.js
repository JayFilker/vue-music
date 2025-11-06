import axios from 'axios'

// 自定义后端服务器 URL
// const CUSTOM_API_BASE = 'https://musicplayernodejs-production.up.railway.app'
const CUSTOM_API_BASE = 'http://localhost:3000'

// 创建带认证的 axios 实例
const customClient = axios.create({
  baseURL: CUSTOM_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 添加请求拦截器
customClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 获取视频列表
export function getMovies() {
  return customClient.get('/api/videos').then(res => res.data.videos)
}

// 获取视频图片/缩略图
export function getMovieImages() {
  return customClient.get('/api/imgs').then(res => res.data.videos)
}

// 获取单个视频信息
export function getMovieInfo(videoKey) {
  return customClient.get('/api/videos/info', {
    params: { key: videoKey }
  }).then(res => res.data)
}
