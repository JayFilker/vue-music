import axios from 'axios'

// 创建带认证的 axios 实例
function createClient() {
  const instance = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 添加请求拦截器，确保每次请求都获取最新的token
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('spotify_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return instance
}

const client = createClient()

// 公共请求函数
export async function get(url, params) {
  const { data } = await client.get(url, { params })
  return data
}

export async function put(url, data) {
  const response = await client.put(url, data)
  return response.data
}

export async function post(url, data) {
  const response = await client.post(url, data)
  return response.data
}

export async function del(url) {
  const response = await client.delete(url)
  return response.data
}

export default client
