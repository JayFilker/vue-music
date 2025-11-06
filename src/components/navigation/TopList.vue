<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ButtonIcon from '../common/ButtonIcon.vue'
import SvgIcon from '../common/SvgIcon.vue'
import TopSpace from './TopSpace.vue'
import ContextMenu from './ContextMenu.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const act = ref(false)
const check = ref([true, false, false])
const show = ref(false)
const keywords = ref('')

const pageList = [
  {
    name: '首页',
    link: '/firstpage'
  },
  {
    name: '发现',
    link: '/discover'
  },
  {
    name: '音乐库',
    link: '/musicLibrary'
  }
]

// 监听路由变化更新选中状态
watch(() => route.path, (currentPath) => {
  const newCheckState = pageList.map(page => page.link === currentPath)

  // 如果没有匹配的路径，默认选中第一个
  if (!newCheckState.includes(true)) {
    newCheckState[0] = true
  }

  check.value = newCheckState
}, { immediate: true })

// 点击外部关闭菜单
const handleClickOutside = (e) => {
  if (show.value && !e.target.closest('.context-menu') && !e.target.closest('.avatar')) {
    show.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const goBack = () => {
  router.back()
}

const goForward = () => {
  router.forward()
}

const handleSearch = () => {
  if (keywords.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(keywords.value)}`)
  } else {
    router.push('/search?q=*')
  }
}

const handleLinkClick = (index) => {
  check.value = check.value.map((_, i) => i === index)
}
</script>

<template>
  <div>
    <nav class="has-custom-titlebar">
      <TopSpace />
      <div class="navigation-buttons">
        <ButtonIcon @click="goBack">
          <SvgIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              viewBox="0 0 256 512"
            >
              <path
                fill="currentColor"
                d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"
              />
            </svg>
          </SvgIcon>
        </ButtonIcon>
        <ButtonIcon @click="goForward">
          <SvgIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              viewBox="0 0 256 512"
            >
              <path
                fill="currentColor"
                d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"
              />
            </svg>
          </SvgIcon>
        </ButtonIcon>
      </div>

      <div class="navigation-links">
        <router-link
          v-for="(page, index) in pageList"
          :key="index"
          :to="page.link"
          :style="{ color: check[index] ? '#335eea' : '' }"
          @click="handleLinkClick(index)"
        >
          {{ t(page.name) }}
        </router-link>
      </div>

      <div class="right-part">
        <div class="search-box">
          <div :class="['container', { active: act }]">
            <SvgIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                />
              </svg>
            </SvgIcon>
            <div class="input" style="display: flex; align-items: center">
              <input
                v-model="keywords"
                type="search"
                :placeholder="act ? '' : t('搜索')"
                @focus="act = true"
                @blur="act = false"
                @keydown.enter="handleSearch"
                style="margin-top: -4px"
              >
            </div>
          </div>
        </div>
        <img
          src="http://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=60y60"
          class="avatar"
          loading="lazy"
          alt="用户头像"
          tabindex="0"
          @click="show = true"
        >
      </div>
    </nav>
    <ContextMenu
      :style="{ display: show ? 'block' : 'none', right: '25px', top: '52px' }"
      :show="show"
      @update:show="show = $event"
    />
  </div>
</template>

<style scoped>
nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding-right: 10vw;
  padding-left: 10vw;
  backdrop-filter: saturate(180%) blur(20px);
  background-color: var(--color-navbar-bg);
  z-index: 100;
  -webkit-app-region: drag;
}

@media (max-width: 1336px) {
  nav {
    padding: 0 max(5vw, 90px);
  }
}

nav.has-custom-titlebar {
  padding-top: 20px;
  -webkit-app-region: no-drag;
  color: white;
}

.navigation-buttons {
  flex: 1;
  display: flex;
  align-items: center;
}

.navigation-buttons :deep(.svg-icon) {
  height: 24px;
  width: 24px;
}

.navigation-buttons button {
  -webkit-app-region: no-drag;
}

@media (max-width: 970px) {
  .navigation-buttons {
    flex: unset;
  }
}

.navigation-links {
  flex: 1;
  display: flex;
  justify-content: center;
  text-transform: uppercase;
  user-select: none;
}

.navigation-links a {
  -webkit-app-region: no-drag;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--color-text);
  transition: 0.2s;
  -webkit-user-drag: none;
  margin-right: 12px;
  margin-left: 12px;
}

.navigation-links a:hover {
  background: var(--color-secondary-bg-for-transparent);
}

.navigation-links a:active {
  transform: scale(0.92);
  transition: 0.2s;
}

.navigation-links a.active {
  color: var(--color-primary);
}

.search-box {
  display: flex;
  justify-content: flex-end;
  -webkit-app-region: no-drag;
}

.search-box .container {
  display: flex;
  align-items: center;
  height: 32px;
  background: var(--color-secondary-bg-for-transparent);
  border-radius: 8px;
  width: 200px;
}

.search-box input {
  font-size: 16px;
  border: none;
  background: transparent;
  width: 96%;
  height: 100%;
  font-weight: 600;
  margin-top: -1px;
  color: var(--color-text);
  outline: none;
}

.search-box input::placeholder {
  position: relative;
  top: 2px;
}

.search-box :deep(.svg-icon) {
  height: 15px;
  width: 17.25px;
  color: var(--color-text);
  opacity: 0.28;
  margin-left: 8px;
  margin-right: 4px;
}

.search-box .active {
  background: var(--color-primary-bg-for-transparent);
}

.search-box .active input,
.search-box .active :deep(.svg-icon) {
  opacity: 1;
  color: var(--color-text);
}

.right-part {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.right-part .avatar {
  user-select: none;
  height: 30px;
  margin-left: 12px;
  vertical-align: -7px;
  border-radius: 50%;
  cursor: pointer;
  -webkit-app-region: no-drag;
  -webkit-user-drag: none;
}

.right-part .avatar:hover {
  filter: brightness(80%);
}
</style>
