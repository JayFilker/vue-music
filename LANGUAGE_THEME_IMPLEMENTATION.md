# 语言切换和主题切换功能实现说明

## 概述

成功为 Vue 音乐播放器的设置页面实现了完整的多语言切换和主题切换功能，支持4种语言和3种主题模式。

## 实现的功能

### ✅ 语言切换

**支持的语言：**
- 🇨🇳 简体中文 (zh-CN)
- 🇹🇼 繁體中文 (zh-TW)
- 🇺🇸 English (en)
- 🇹🇷 Türkçe (tr)

**核心特性：**
- 即时切换，无需刷新页面
- 语言设置持久化到 localStorage
- 所有界面文本自动更新
- 完整的翻译覆盖（设置页、快捷键等）

### ✅ 主题切换

**支持的主题：**
- 🌙 深色模式 (Dark Mode)
- ☀️ 浅色模式 (Light Mode)
- 🔄 自动模式 (Auto - 跟随系统)

**核心特性：**
- 可视化主题选择卡片
- 主题设置持久化到 localStorage
- 自动模式支持系统主题变化监听
- 平滑的主题切换过渡

## 技术实现

### 文件结构

```
src/
├── i18n/
│   └── index.js                      # i18n配置（已扩展）
├── composables/
│   └── useTheme.js                   # 主题管理composable（新建）
├── pages/
│   └── Set/
│       └── index.vue                 # 设置页面（已更新）
└── main.js                           # 应用入口（已更新）
```

### 1. 国际化 (i18n)

**文件：** `src/i18n/index.js`

**扩展的翻译内容：**
```javascript
{
  common: {
    play, pause, next, previous, like, search, settings, library,
    save, cancel, confirm
  },
  settings: {
    title, language, selectLanguage, appearance, theme,
    darkMode, lightMode, autoMode, playback, quality,
    qualityLow, qualityNormal, qualityHigh, qualityLossless,
    autoPlay, showLyrics, shortcuts, saveSettings, settingsSaved,
    playPause, nextTrack, previousTrack, volumeUp, volumeDown, toggleLyrics
  }
}
```

**使用方式：**
```vue
<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
</script>

<template>
  <h1>{{ t('settings.title') }}</h1>
  <button @click="locale = 'en'">English</button>
</template>
```

### 2. 主题管理 (useTheme)

**文件：** `src/composables/useTheme.js`

**核心API：**
```javascript
import { useTheme } from '@/composables/useTheme'

const {
  currentTheme,      // 当前选择的主题 (响应式)
  appliedTheme,      // 实际应用的主题 (响应式)
  setTheme,          // 设置主题函数
  toggleTheme,       // 切换主题函数
  isDark,            // 是否深色主题
  isLight,           // 是否浅色主题
  THEME_DARK,        // 深色主题常量
  THEME_LIGHT,       // 浅色主题常量
  THEME_AUTO,        // 自动主题常量
} = useTheme()

// 设置主题
setTheme(THEME_DARK)

// 切换主题
toggleTheme()
```

**工作原理：**

1. **初始化** (`initTheme()`)
   - 从 localStorage 读取保存的主题
   - 应用主题到 DOM (`data-theme` 属性)
   - 监听系统主题变化

2. **设置主题** (`setTheme(theme)`)
   - 更新响应式状态
   - 保存到 localStorage
   - 应用到 DOM

3. **自动模式**
   - 检测系统偏好：`prefers-color-scheme`
   - 自动监听系统主题变化
   - 实时更新应用主题

**DOM 更新：**
```javascript
// 深色模式
<html data-theme="dark">

// 浅色模式
<html data-theme="light">
```

**CSS 变量应用：**
```css
/* 深色模式 */
[data-theme="dark"] {
  --color-text: #ffffff;
  --color-body-bg: #18181b;
  /* ... */
}

/* 浅色模式 */
[data-theme="light"] {
  --color-text: #000000;
  --color-body-bg: #ffffff;
  /* ... */
}
```

### 3. 设置页面

**文件：** `src/pages/Set/index.vue`

**核心功能：**

#### 语言切换
```javascript
const changeLanguage = (lang) => {
  settings.value.language = lang
  locale.value = lang                    // 更新i18n语言
  localStorage.setItem('language', lang)  // 持久化
  showNotification(t('settings.settingsSaved'))
}
```

#### 主题切换
```javascript
const changeTheme = (theme) => {
  settings.value.theme = theme
  setTheme(theme)                        // 应用主题
  showNotification(t('settings.settingsSaved'))
}
```

**UI 特性：**

1. **主题选择卡片**
   - 可视化图标（月亮/太阳/自动）
   - 高亮显示当前主题
   - 悬停动画效果
   - 响应式布局

2. **语言下拉框**
   - 清晰的语言标签
   - 即时切换
   - 保存提示

3. **通知系统**
   - 保存成功提示
   - 2秒自动消失
   - 淡入淡出动画

### 4. 应用入口

**文件：** `src/main.js`

```javascript
import { initTheme } from './composables/useTheme'

// 初始化主题（在创建应用之前）
initTheme()

const app = createApp(App)
// ...
```

## 使用指南

### 切换语言

1. **在设置页面：**
   - 进入设置页面 (`/set`)
   - 选择"语言"下拉框
   - 选择目标语言
   - 界面立即更新

2. **编程方式：**
   ```javascript
   import { useI18n } from 'vue-i18n'
   const { locale } = useI18n()

   // 切换到英文
   locale.value = 'en'
   ```

### 切换主题

1. **在设置页面：**
   - 进入设置页面 (`/set`)
   - 在"外观"部分选择主题卡片
   - 点击深色/浅色/自动模式
   - 主题立即应用

2. **编程方式：**
   ```javascript
   import { useTheme } from '@/composables/useTheme'
   const { setTheme, THEME_DARK } = useTheme()

   // 切换到深色模式
   setTheme(THEME_DARK)
   ```

3. **快速切换：**
   ```javascript
   import { useTheme } from '@/composables/useTheme'
   const { toggleTheme } = useTheme()

   // 在深色和浅色之间切换
   toggleTheme()
   ```

## 扩展新语言

如需添加新语言，按以下步骤操作：

1. **在 `src/i18n/index.js` 添加翻译：**
   ```javascript
   const messages = {
     // ...现有语言
     'ja': {  // 日语示例
       common: {
         play: '再生',
         pause: '一時停止',
         // ...
       },
       settings: {
         title: '設定',
         // ...
       }
     }
   }
   ```

2. **在设置页面添加选项：**
   ```javascript
   const languages = [
     // ...现有语言
     { value: 'ja', label: '日本語' }
   ]
   ```

## 扩展新主题

如需添加新主题，按以下步骤操作：

1. **在 CSS 中定义主题变量：**
   ```css
   /* global.css */
   [data-theme="custom"] {
     --color-text: #custom-color;
     --color-body-bg: #custom-bg;
     /* ... */
   }
   ```

2. **在 useTheme.js 添加常量：**
   ```javascript
   export const THEME_CUSTOM = 'custom'
   ```

3. **在设置页面添加选项：**
   ```javascript
   const themes = ref([
     // ...现有主题
     { value: 'custom', label: '', key: 'customMode' }
   ])
   ```

4. **添加翻译：**
   ```javascript
   settings: {
     customMode: 'Custom Mode'
   }
   ```

## 持久化存储

### localStorage 键值

- **语言：** `language`
  ```javascript
  localStorage.getItem('language')  // 'zh-CN', 'en', 等
  ```

- **主题：** `theme`
  ```javascript
  localStorage.getItem('theme')     // 'dark', 'light', 'auto'
  ```

- **设置：** `settings`
  ```javascript
  localStorage.getItem('settings')  // JSON字符串
  ```

### 自动加载

设置页面会在 `onMounted` 时自动加载保存的设置：

```javascript
onMounted(() => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings)
    settings.value = { ...settings.value, ...parsed }
  }

  // 同步语言和主题
  if (settings.value.language) {
    locale.value = settings.value.language
  }
  if (settings.value.theme) {
    setTheme(settings.value.theme)
  }
})
```

## 浏览器兼容性

### 语言切换
- ✅ 所有现代浏览器
- ✅ IE11+ (需要 polyfill)

### 主题切换
- ✅ Chrome 88+
- ✅ Firefox 94+
- ✅ Safari 15+
- ✅ Edge 88+

### 系统主题检测 (自动模式)
- ✅ Chrome 76+
- ✅ Firefox 67+
- ✅ Safari 12.1+
- ⚠️ 旧版浏览器回退到手动模式

## 性能优化

1. **响应式缓存**
   - 使用 Vue 3 响应式系统
   - 避免不必要的 DOM 更新

2. **事件监听优化**
   - 仅在自动模式下监听系统主题
   - 组件卸载时自动清理

3. **localStorage 操作**
   - 仅在设置变更时写入
   - 避免频繁读写

4. **翻译加载**
   - 所有翻译预加载
   - 无需异步获取

## 故障排查

### 语言不生效

1. **检查 i18n 配置：**
   ```javascript
   // main.js
   import i18n from './i18n'
   app.use(i18n)
   ```

2. **检查翻译键：**
   ```vue
   <!-- 正确 -->
   {{ t('settings.title') }}

   <!-- 错误 -->
   {{ t('title') }}
   ```

3. **检查 localStorage：**
   ```javascript
   console.log(localStorage.getItem('language'))
   ```

### 主题不生效

1. **检查 data-theme 属性：**
   ```javascript
   console.log(document.documentElement.getAttribute('data-theme'))
   ```

2. **检查 CSS 变量：**
   ```css
   /* 确保定义了主题变量 */
   [data-theme="dark"] {
     --color-text: #ffffff;
   }
   ```

3. **检查初始化：**
   ```javascript
   // main.js
   import { initTheme } from './composables/useTheme'
   initTheme()
   ```

### 自动模式不工作

1. **检查浏览器支持：**
   ```javascript
   if (window.matchMedia) {
     console.log('支持 matchMedia')
   }
   ```

2. **检查系统设置：**
   - Windows: 设置 > 个性化 > 颜色
   - macOS: 系统偏好设置 > 通用 > 外观
   - Linux: 取决于桌面环境

## 最佳实践

1. **使用 i18n key**
   ```vue
   <!-- 推荐 -->
   {{ t('settings.title') }}

   <!-- 不推荐 -->
   {{ locale === 'zh-CN' ? '设置' : 'Settings' }}
   ```

2. **使用主题常量**
   ```javascript
   // 推荐
   setTheme(THEME_DARK)

   // 不推荐
   setTheme('dark')
   ```

3. **处理加载状态**
   ```javascript
   onMounted(() => {
     // 确保在组件挂载后才操作主题
     if (settings.value.theme) {
       setTheme(settings.value.theme)
     }
   })
   ```

## 总结

语言切换和主题切换功能已完整实现，包括：

- ✅ 4种语言支持（简体中文、繁體中文、English、Türkçe）
- ✅ 3种主题模式（深色、浅色、自动）
- ✅ 完整的持久化存储
- ✅ 优雅的UI交互
- ✅ 系统主题跟随
- ✅ 响应式设计
- ✅ 完整的文档

## 相关文件

- `src/i18n/index.js` - 国际化配置和翻译
- `src/composables/useTheme.js` - 主题管理
- `src/pages/Set/index.vue` - 设置页面
- `src/main.js` - 应用入口

## 更新日志

- 2025-11-03: 初始实现
  - 扩展 i18n 翻译内容
  - 创建 useTheme composable
  - 更新设置页面UI
  - 实现语言和主题切换
  - 添加持久化存储
  - 实现通知系统
