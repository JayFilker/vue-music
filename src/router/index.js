import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/firstpage',
    },
    {
      path: '/firstpage',
      name: 'firstpage',
      component: () => import('@/pages/FirstPage/index.vue'),
    },
    {
      path: '/discover',
      name: 'discover',
      component: () => import('@/pages/Discover/index.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login/index.vue'),
    },
    {
      path: '/more',
      name: 'more',
      component: () => import('@/pages/More/index.vue'),
    },
    {
      path: '/nextTracks',
      name: 'nextTracks',
      component: () => import('@/pages/NextTracks/index.vue'),
    },
    {
      path: '/set',
      name: 'set',
      component: () => import('@/pages/Set/index.vue'),
    },
    {
      path: '/musicLibrary',
      name: 'musicLibrary',
      component: () => import('@/pages/MusicLibrary/index.vue'),
    },
    {
      path: '/artist',
      name: 'artist',
      component: () => import('@/pages/Artist/index.vue'),
    },
    {
      path: '/moviePage',
      name: 'moviePage',
      component: () => import('@/pages/MoviePage/index.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/Search/index.vue'),
    },
    {
      path: '/searchDemo',
      name: 'searchDemo',
      component: () => import('@/pages/SearchDemo/index.vue'),
    },
    {
      path: '/playsList',
      name: 'playsList',
      component: () => import('@/pages/PlaysList/index.vue'),
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('@/pages/CallbackPage/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/pages/NotFound/index.vue'),
    },
  ],
})

export default router
