import { ref, watch, onMounted } from 'vue'

// 主题类型
export const THEME_DARK = 'dark'
export const THEME_LIGHT = 'light'
export const THEME_AUTO = 'auto'

// 当前主题（响应式）
const currentTheme = ref(THEME_DARK)

// 实际应用的主题（当选择auto时，这个值会根据系统主题变化）
const appliedTheme = ref(THEME_DARK)

// 检查系统是否偏好深色模式
const prefersDark = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 应用主题到DOM
const applyTheme = (theme) => {
  const root = document.documentElement

  if (theme === THEME_DARK) {
    root.setAttribute('data-theme', 'dark')
    appliedTheme.value = THEME_DARK
  } else if (theme === THEME_LIGHT) {
    root.setAttribute('data-theme', 'light')
    appliedTheme.value = THEME_LIGHT
  }
}

// 更新主题
const updateTheme = () => {
  if (currentTheme.value === THEME_AUTO) {
    // 自动模式：跟随系统
    const systemTheme = prefersDark() ? THEME_DARK : THEME_LIGHT
    applyTheme(systemTheme)
  } else {
    // 手动模式：使用选择的主题
    applyTheme(currentTheme.value)
  }
}

// 设置主题
const setTheme = (theme) => {
  currentTheme.value = theme
  localStorage.setItem('theme', theme)
  updateTheme()
}

// 初始化主题
const initTheme = () => {
  // 从localStorage读取保存的主题
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme && [THEME_DARK, THEME_LIGHT, THEME_AUTO].includes(savedTheme)) {
    currentTheme.value = savedTheme
  } else {
    // 默认使用深色主题
    currentTheme.value = THEME_DARK
  }

  updateTheme()

  // 监听系统主题变化（仅在auto模式下生效）
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // 现代浏览器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', () => {
        if (currentTheme.value === THEME_AUTO) {
          updateTheme()
        }
      })
    }
    // 旧版浏览器兼容
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(() => {
        if (currentTheme.value === THEME_AUTO) {
          updateTheme()
        }
      })
    }
  }
}

// 切换主题（在dark和light之间切换）
const toggleTheme = () => {
  if (currentTheme.value === THEME_DARK) {
    setTheme(THEME_LIGHT)
  } else if (currentTheme.value === THEME_LIGHT) {
    setTheme(THEME_DARK)
  } else {
    // 如果是auto模式，切换到相反的主题
    const isDark = prefersDark()
    setTheme(isDark ? THEME_LIGHT : THEME_DARK)
  }
}

// 获取当前主题
const getTheme = () => {
  return currentTheme.value
}

// 获取实际应用的主题
const getAppliedTheme = () => {
  return appliedTheme.value
}

// 判断当前是否是深色主题
const isDark = () => {
  return appliedTheme.value === THEME_DARK
}

// 判断当前是否是浅色主题
const isLight = () => {
  return appliedTheme.value === THEME_LIGHT
}

// 使用主题的composable
export function useTheme() {
  onMounted(() => {
    // 确保主题已初始化
    if (!document.documentElement.getAttribute('data-theme')) {
      initTheme()
    }
  })

  return {
    currentTheme,
    appliedTheme,
    setTheme,
    toggleTheme,
    getTheme,
    getAppliedTheme,
    isDark,
    isLight,
    THEME_DARK,
    THEME_LIGHT,
    THEME_AUTO,
  }
}

// 导出初始化函数，供main.js调用
export { initTheme }
