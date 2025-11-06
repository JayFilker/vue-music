# Vue Music Player

这是一个基于Vue 3的Spotify音乐播放器，从React版本转换而来。

## 项目概述

本项目是 `D:\Users\LinZhiJie\Downloads\777\newmymusic` (React音乐播放器) 的Vue 3版本实现。

### React版本 vs Vue版本技术栈对比

| 功能 | React版本 | Vue版本 |
|------|----------|---------|
| 核心框架 | React 19 | Vue 3.5 |
| 状态管理 | Jotai | Pinia |
| 路由 | React Router v7 | Vue Router 4 |
| 数据获取 | @tanstack/react-query | @tanstack/vue-query |
| 国际化 | react-i18next | vue-i18n |
| 构建工具 | Vite | Vite |
| HTTP客户端 | Axios | Axios |
| 样式预处理 | Less | Less |

## 项目结构

```
vue-music/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API层
│   │   └── http.js        # HTTP客户端配置
│   ├── assets/            # 资源文件
│   │   └── css/
│   │       └── global.css # 全局样式
│   ├── components/        # Vue组件（待实现）
│   ├── i18n/             # 国际化配置
│   │   └── index.js      # i18n设置
│   ├── pages/            # 页面组件
│   │   ├── FirstPage/    # 首页
│   │   ├── Discover/     # 发现页
│   │   ├── Login/        # 登录页
│   │   ├── Search/       # 搜索页
│   │   ├── MusicLibrary/ # 音乐库
│   │   ├── Artist/       # 艺人页
│   │   ├── Set/          # 设置页
│   │   └── ...           # 其他页面
│   ├── router/           # 路由配置
│   │   └── index.js      # 路由定义
│   ├── stores/           # Pinia状态管理
│   │   └── music.js      # 音乐播放器状态
│   ├── utils/            # 工具函数
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口
├── package.json          # 依赖配置
├── vite.config.js        # Vite配置
└── README.md             # 项目文档
```

## 核心功能（已迁移）

### ✅ 已完成的基础设施

1. **项目配置**
   - ✅ Vite构建配置
   - ✅ Vue Router路由配置
   - ✅ Pinia状态管理
   - ✅ Vue Query数据获取
   - ✅ Vue I18n国际化
   - ✅ Axios HTTP客户端

2. **状态管理**
   - ✅ 音乐播放状态
   - ✅ 播放列表管理
   - ✅ 播放器控制（播放/暂停/上一首/下一首）
   - ✅ 音量控制
   - ✅ 歌词显示状态
   - ✅ 用户设置
   - ✅ 快捷键配置

3. **路由系统**
   - ✅ 首页 (`/firstpage`)
   - ✅ 发现页 (`/discover`)
   - ✅ 登录页 (`/login`)
   - ✅ 搜索页 (`/search`)
   - ✅ 音乐库 (`/musicLibrary`)
   - ✅ 艺人页 (`/artist`)
   - ✅ 设置页 (`/set`)
   - ✅ 其他页面（详见router/index.js）

4. **样式系统**
   - ✅ 全局CSS变量
   - ✅ 深色主题
   - ✅ 响应式布局
   - ✅ 滚动条样式

### 🚧 待实现的组件

以下核心组件需要从React版本迁移到Vue：

1. **播放器组件**
   - ⏳ `Player` - 主播放器
   - ⏳ `Middle` - 播放控制
   - ⏳ `MiddleControlButtons` - 控制按钮
   - ⏳ `Volume` - 音量控制
   - ⏳ `Bar` - 进度条

2. **UI组件**
   - ⏳ `TopList` - 导航栏
   - ⏳ `Lyrics` - 歌词显示
   - ⏳ `TrackList` - 曲目列表
   - ⏳ `SongList` - 歌曲列表
   - ⏳ `SearchList` - 搜索结果

3. **内容组件**
   - ⏳ `Foryou` - 推荐内容
   - ⏳ `RankingList` - 排行榜
   - ⏳ `Movie` - 视频内容

## 快速开始

### 环境要求

- Node.js: ^20.19.0 或 >=22.12.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:5173` 或其他可用端口启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 主要依赖

### 生产依赖

- **vue**: ^3.5.22 - Vue 3核心框架
- **vue-router**: ^4 - 路由管理
- **pinia**: 最新版 - 状态管理
- **axios**: 最新版 - HTTP客户端
- **@tanstack/vue-query**: 最新版 - 数据获取和缓存
- **vue-i18n**: ^9 - 国际化
- **lodash**: 最新版 - 工具函数库
- **mitt**: 最新版 - 事件总线

### 开发依赖

- **vite**: ^7.1.12 - 构建工具
- **@vitejs/plugin-vue**: ^6.0.1 - Vue插件
- **vite-plugin-vue-devtools**: ^8.0.3 - 开发工具
- **less**: 最新版 - CSS预处理器
- **typescript**: 最新版 - TypeScript支持

## 开发指南

### 组件开发

所有组件使用Vue 3的Composition API和`<script setup>`语法：

```vue
<script setup>
import { ref, computed } from 'vue'
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()
const isPlaying = computed(() => musicStore.isPlaying)
</script>

<template>
  <div>
    <!-- 组件模板 -->
  </div>
</template>

<style scoped>
/* 组件样式 */
</style>
```

### 状态管理

使用Pinia store来管理全局状态：

```javascript
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()

// 读取状态
const currentSong = musicStore.currentSong

// 调用actions
musicStore.togglePlay()
musicStore.nextSong()
```

### API调用

使用`@tanstack/vue-query`进行数据获取：

```javascript
import { useQuery } from '@tanstack/vue-query'
import { get } from '@/api/http'

const { data, isLoading } = useQuery({
  queryKey: ['albums'],
  queryFn: () => get('/browse/new-releases')
})
```

## Spotify集成

本项目集成了Spotify Web API，需要：

1. 在 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) 创建应用
2. 配置OAuth回调URL
3. 在localStorage中存储access token

## IDE推荐设置

### VS Code

推荐扩展：
- Vue - Official (Vue.volar)
- ESLint
- Prettier

### 浏览器

推荐安装Vue DevTools：
- Chrome: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## 后续开发计划

1. **核心组件迁移**
   - 将React Player组件转换为Vue组件
   - 实现Spotify Web Playback SDK集成
   - 迁移歌词显示功能

2. **页面完善**
   - 完善首页内容
   - 实现搜索功能
   - 添加播放列表管理

3. **功能增强**
   - 添加快捷键支持
   - 实现离线缓存
   - 优化性能

## 技术文档

- [Vue 3 文档](https://vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)

## 许可证

此项目仅供学习和研究使用。

## 贡献

欢迎提交问题和Pull Request！

---

**注意**: 这是一个正在开发中的项目，许多功能还在实现过程中。当前版本已经完成了基础架构设置，包括路由、状态管理、API层和基础页面框架。
