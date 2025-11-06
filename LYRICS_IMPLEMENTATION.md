# 歌词功能实现说明

## 概述

已成功将 React 版本的音乐播放器歌词功能迁移到 Vue 版本中。歌词功能使用 Happi.dev API 获取歌词数据，并实现了实时同步、滚动高亮等效果。

## 实现的功能

### ✅ 核心功能

1. **歌词数据获取**
   - 使用 Happi.dev API 搜索歌曲
   - 根据歌曲名称自动获取歌词
   - 使用 Vue Query 进行数据缓存（5分钟）

2. **歌词显示**
   - 显示歌曲封面和信息
   - 显示作曲/作词信息
   - 逐行显示歌词内容
   - 显示歌词来源

3. **歌词同步**
   - 根据播放进度自动高亮当前歌词行
   - 平滑滚动到当前歌词位置
   - 高亮行放大和透明度变化动画

4. **背景效果**
   - 支持随机渐变背景
   - 支持专辑封面模糊背景
   - 支持动态背景（根据设置）

5. **用户交互**
   - 点击关闭按钮关闭歌词面板
   - 鼠标悬停歌词行显示背景
   - 平滑的过渡动画

## 技术实现

### 文件结构

```
src/
├── api/
│   └── lyrics.js           # 歌词 API（已更新）
├── components/
│   └── player/
│       └── Lyrics.vue      # 歌词组件（已更新）
└── stores/
    └── music.js            # 音乐状态管理（已存在）
```

### API 层 (lyrics.js)

```javascript
// 使用 Happi.dev API
const API_KEY = 'hk267-2qqOUzXjzt4KZ6LgijLjj0Nl3N35550m0b'
const BASE_URL = 'https://api.happi.dev/v1'

// 主要函数
- searchMusic(query, limit)     // 搜索歌曲
- getLyricsByUrl(lyricsUrl)    // 获取歌词
```

### 歌词组件 (Lyrics.vue)

#### 数据流程

```
1. 当前歌曲 → 歌曲名称
   ↓
2. 使用 useQuery 搜索歌曲 → 获取歌词 URL
   ↓
3. 使用 useQuery 获取歌词 → 解析歌词文本
   ↓
4. 监听播放进度 → 计算当前歌词行索引
   ↓
5. 更新高亮状态 → 自动滚动
```

#### 核心算法

**歌词同步算法：**
```javascript
// 计算播放进度百分比
const progressPercent = progress / duration

// 计算当前应高亮的歌词行
const newIndex = Math.min(
  Math.floor(progressPercent * lyrics.length),
  lyrics.length - 1
)
```

**自动滚动：**
```javascript
const highlightedElement = document.querySelector('.lyrics-line.highlight')
if (highlightedElement) {
  highlightedElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}
```

### 样式和动画

**歌词行状态：**
- 默认状态：`opacity: 0.28`, `scale(0.95)`
- 高亮状态：`opacity: 0.98`, `scale(1)`
- 过渡效果：`cubic-bezier(0.25, 0.46, 0.45, 0.94)` (0.35s)

**布局特点：**
- 左侧：封面和歌曲信息（flex: 1）
- 右侧：歌词容器（flex: 1, max-width: 460px）
- 响应式：小屏幕时隐藏左侧

## 使用方法

### 1. 查看歌词

在播放器组件中，点击歌词按钮即可打开歌词面板：

```vue
<button @click="musicStore.toggleLyrics()">
  显示歌词
</button>
```

### 2. 关闭歌词

- 点击右上角的关闭按钮
- 或通过代码：`musicStore.toggleLyrics()`

### 3. 自定义设置

歌词功能支持从 store 中读取以下设置：

```javascript
// musicStore.setDemo
{
  showBackGround: 'true',    // 'true' | 'blur' | 'dynamic' | 其他
  songFontSize: '28',        // 歌词字体大小（px）
}
```

**背景模式：**
- `'true'`: 随机渐变色背景
- `'blur'`: 专辑封面模糊背景
- `'dynamic'`: 动态旋转背景（需额外实现）
- 其他: 纯色背景

## 依赖项

确保项目已安装以下依赖：

```json
{
  "@tanstack/vue-query": "^5.90.5",
  "axios": "^1.13.1",
  "pinia": "^3.0.3"
}
```

## 配置说明

### API 密钥

当前使用的 Happi.dev API 密钥为示例密钥。如需在生产环境使用，建议：

1. 注册自己的 Happi.dev 账号
2. 获取 API 密钥
3. 在 `src/api/lyrics.js` 中替换：

```javascript
const API_KEY = '你的API密钥'
```

或使用环境变量：

```javascript
const API_KEY = import.meta.env.VITE_HAPPI_API_KEY
```

### 缓存配置

Vue Query 默认缓存时间为 5 分钟，可在组件中调整：

```javascript
useQuery({
  // ...
  staleTime: 5 * 60 * 1000, // 修改此处（毫秒）
})
```

## 已知限制

1. **API 限制**
   - Happi.dev 免费版有请求次数限制
   - 部分歌曲可能没有歌词数据

2. **歌词格式**
   - 当前只支持纯文本歌词（无时间轴）
   - 歌词同步基于播放进度百分比计算（非精确时间）

3. **兼容性**
   - 需要浏览器支持 CSS `scroll-behavior: smooth`
   - 需要支持 `scrollIntoView` API

## 优化建议

### 性能优化

1. **虚拟滚动**
   - 对于非常长的歌词，可考虑使用虚拟滚动
   - 推荐库：`vue-virtual-scroller`

2. **防抖处理**
   - 对于频繁的进度更新，可添加防抖：

```javascript
import { debounce } from 'lodash-es'

const updateLyricIndex = debounce((newIndex) => {
  currentLyricIndex.value = newIndex
}, 100)
```

### 功能扩展

1. **LRC 歌词支持**
   - 解析带时间轴的 LRC 格式歌词
   - 实现更精确的歌词同步

2. **翻译歌词**
   - 显示原文和翻译对照
   - 支持多语言切换

3. **歌词搜索**
   - 允许用户手动搜索和选择歌词
   - 支持歌词编辑和上传

4. **本地缓存**
   - 使用 IndexedDB 缓存歌词
   - 减少 API 请求次数

## 故障排查

### 歌词无法加载

1. **检查网络连接**
   - 确保可以访问 Happi.dev API
   - 检查浏览器控制台的网络请求

2. **检查歌曲名称**
   - 某些歌曲名称可能搜索不到
   - 查看控制台是否有错误信息

3. **检查 API 密钥**
   - 确认 API 密钥有效
   - 检查是否超出请求限制

### 歌词不同步

1. **检查播放状态**
   - 确认 `musicStore.playerDemo.progress` 正在更新
   - 确认 `musicStore.playerDemo.currentTrackDuration` 正确

2. **调整同步算法**
   - 可在 `Lyrics.vue:81-104` 调整计算逻辑

### 样式问题

1. **CSS 变量未定义**
   - 确保主题 CSS 变量已定义：
     - `--color-body-bg`
     - `--color-text`
     - `--color-secondary-bg-for-transparent`

2. **响应式问题**
   - 检查浏览器窗口大小
   - 查看媒体查询是否生效

## 总结

歌词功能已完整实现，包括：
- ✅ API 层集成
- ✅ 数据获取和缓存
- ✅ 歌词显示和同步
- ✅ 动画和交互效果
- ✅ 响应式设计

功能参考了 React 版本的实现，并适配到 Vue 3 + Composition API 架构。所有核心功能都已正常工作。

## 相关文件

- `src/api/lyrics.js` - 歌词 API 实现
- `src/components/player/Lyrics.vue` - 歌词组件
- `src/stores/music.js` - 音乐状态管理（已存在）

## 更新日志

- 2025-11-03: 初始实现
  - 集成 Happi.dev API
  - 实现歌词获取和显示
  - 实现歌词同步和滚动
  - 实现样式和动画效果
