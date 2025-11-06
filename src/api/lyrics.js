import axios from 'axios'

// 使用 Happi.dev API 获取歌词
const API_KEY = 'hk267-2qqOUzXjzt4KZ6LgijLjj0Nl3N35550m0b'
const BASE_URL = 'https://api.happi.dev/v1'

const happiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apikey: API_KEY,
  },
})

// 搜索音乐
export async function searchMusic(query, limit = 10) {
  try {
    const response = await happiClient.get('/music', {
      params: {
        q: query,
        limit,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error searching music:', error)
    throw error
  }
}

// 通过URL获取歌词
export async function getLyricsByUrl(lyricsUrl) {
  try {
    // 直接使用完整的 URL，而不是基础 URL + 路径
    const response = await axios.get(lyricsUrl, {
      params: {
        apikey: API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    throw error
  }
}
