<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

onMounted(async () => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
        // 这里应该处理认证逻辑
        console.log('Auth code:', code)
        const response = await axios.post('http://localhost:3000/api/exchange-token', { code })
        localStorage.setItem('spotify_access_token', response.data.access_token)
        localStorage.setItem('spotify_refresh_token', response.data.refresh_token)
        localStorage.setItem('spotify_token_expiry', (Date.now() + response.data.expires_in * 1000).toString())
        localStorage.setItem('code', code)
        // 重定向到首页
        await router.push('/firstpage')
    } else {
        alert('No Auth code found.')
    }
})
</script>

<template>
  <div class="page">
    <h1>Authenticating...</h1>
    <p>正在进行Spotify认证</p>
  </div>
</template>

<style scoped>
.page {
  padding: 20px;
  color: var(--color-text);
  text-align: center;
}
</style>
