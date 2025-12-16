<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useMusicStore } from '@/stores/music'
const { t, locale } = useI18n()
const { currentTheme, setTheme, THEME_DARK, THEME_LIGHT, THEME_AUTO } = useTheme()
const musicStore = useMusicStore()
// 设置项
const settings = ref({
  language: locale.value || 'zh-CN',
  theme: currentTheme.value || THEME_DARK,
  quality: 'high',
  autoPlay: true,
  showLyrics: true,
})
// 语言选项
const languages = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' },
]
// 主题选项
const themes = ref([
  { value: THEME_DARK, label: '', key: 'darkMode' },
  { value: THEME_LIGHT, label: '', key: 'lightMode' },
  { value: THEME_AUTO, label: '', key: 'autoMode' },
])
// 音质选项
const qualities = ref([
  { value: 'low', label: '', key: 'qualityLow' },
  { value: 'normal', label: '', key: 'qualityNormal' },
  { value: 'high', label: '', key: 'qualityHigh' },
  { value: 'lossless', label: '', key: 'qualityLossless' },
])
// 更改语言
const changeLanguage = (lang) => {
  settings.value.language = lang
  locale.value = lang
  localStorage.setItem('language', lang)
  // 显示提示
  showNotification(t('settings.settingsSaved'))
}
// 更改主题
const changeTheme = (theme) => {
  settings.value.theme = theme
  setTheme(theme)
  // 显示提示
  showNotification(t('settings.settingsSaved'))
}
// 保存设置
const saveSettings = () => {
  // 保存到localStorage
  localStorage.setItem('settings', JSON.stringify(settings.value))
  // 更新store（如果需要）
  musicStore.updateSettings({
    soundQuality: settings.value.quality,
  })
  // 显示提示
  showNotification(t('settings.settingsSaved'))
}
// 通知消息
const notification = ref({
  show: false,
  message: '',
})
const showNotification = (message) => {
  notification.value.message = message
  notification.value.show = true
  setTimeout(() => {
    notification.value.show = false
  }, 2000)
}
// 快捷键列表
const shortcuts = ref([
  { key: 'Space', actionKey: 'playPause' },
  { key: '→', actionKey: 'nextTrack' },
  { key: '←', actionKey: 'previousTrack' },
  { key: '↑', actionKey: 'volumeUp' },
  { key: '↓', actionKey: 'volumeDown' },
  { key: 'L', actionKey: 'toggleLyrics' },
])
// 从localStorage加载设置
onMounted(() => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...settings.value, ...parsed }
    } catch (e) {
      console.error('Failed to parse settings:', e)
    }
  }
  // 同步语言设置
  if (settings.value.language) {
    locale.value = settings.value.language
  }
  // 同步主题设置
  if (settings.value.theme) {
    setTheme(settings.value.theme)
  }
})
</script>
<template>
  <div class="settings-page">
    <h1 class="page-title">{{ t('settings.title') }}</h1>
    <div class="settings-content">
      <!-- 语言设置 -->
      <div class="setting-section">
        <h2>{{ t('settings.language') }}</h2>
        <div class="setting-item">
          <label>{{ t('settings.selectLanguage') }}</label>
          <select
            v-model="settings.language"
            @change="changeLanguage(settings.language)"
            class="select-input"
          >
            <option v-for="lang in languages" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>
        </div>
      </div>
      <!-- 外观设置 -->
      <div class="setting-section">
        <h2>{{ t('settings.appearance') }}</h2>
        <div class="setting-item">
          <label>{{ t('settings.theme') }}</label>
          <div class="theme-options">
            <div
              v-for="theme in themes"
              :key="theme.value"
              :class="['theme-option', { active: settings.theme === theme.value }]"
              @click="changeTheme(theme.value)"
            >
              <div class="theme-icon">
                <svg
                  v-if="theme.value === THEME_DARK"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Z"
                  />
                </svg>
                <svg
                  v-else-if="theme.value === THEME_LIGHT"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12,17.5A5.5,5.5,0,1,1,17.5,12,5.51,5.51,0,0,1,12,17.5ZM12,4a1,1,0,0,0,1-1V2a1,1,0,0,0-2,0V3A1,1,0,0,0,12,4ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41L6.34,5a1,1,0,1,0-1.41,1.41ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm.64,5.65a1,1,0,0,0-.7.29L4.22,18.7a1,1,0,0,0,1.41,1.41l.71-.71a1,1,0,0,0,0-1.41A1,1,0,0,0,5.64,17.66ZM12,20a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V21A1,1,0,0,0,12,20Zm6.36-2.34a1,1,0,0,0-1.41,1.41l.71.71a1,1,0,0,0,1.41-1.41ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-2.64-3.95a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41l-.66.71a1,1,0,0,0,0,1.41A1,1,0,0,0,18.36,7.05Z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12,6a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V5A1,1,0,0,0,12,6ZM21,11H19a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2ZM6,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H5A1,1,0,0,0,6,12ZM6.22,5a1,1,0,0,0-1.39,1.47l1.44,1.39a1,1,0,0,0,.73.28,1,1,0,0,0,.72-.31,1,1,0,0,0,0-1.41ZM17,8.14a1,1,0,0,0,.73-.28l1.44-1.39A1,1,0,0,0,17.78,5l-1.44,1.42a1,1,0,0,0,0,1.41A1,1,0,0,0,17,8.14ZM12,18a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V19A1,1,0,0,0,12,18ZM17.73,16.14a1,1,0,0,0-1.39,1.44L17.78,19a1,1,0,0,0,.69.28,1,1,0,0,0,.72-.3,1,1,0,0,0,0-1.42Zm-11.46,0-1.44,1.39a1,1,0,0,0,0,1.42,1,1,0,0,0,.72.3A1,1,0,0,0,6.22,19l1.44-1.39a1,1,0,0,0-1.39-1.44ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Z"
                  />
                </svg>
              </div>
              <span class="theme-label">{{ t(`settings.${theme.key}`) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 播放设置 -->
      <div class="setting-section">
        <h2>{{ t('settings.playback') }}</h2>
        <div class="setting-item">
          <label>{{ t('settings.quality') }}</label>
          <select v-model="settings.quality" class="select-input">
            <option v-for="quality in qualities" :key="quality.value" :value="quality.value">
              {{ t(`settings.${quality.key}`) }}
            </option>
          </select>
        </div>
        <div class="setting-item checkbox-item">
          <label class="checkbox-label">
            <input v-model="settings.autoPlay" type="checkbox">
            <span>{{ t('settings.autoPlay') }}</span>
          </label>
        </div>
        <div class="setting-item checkbox-item">
          <label class="checkbox-label">
            <input v-model="settings.showLyrics" type="checkbox">
            <span>{{ t('settings.showLyrics') }}</span>
          </label>
        </div>
      </div>
      <!-- 快捷键 -->
      <div class="setting-section">
        <h2>{{ t('settings.shortcuts') }}</h2>
        <div class="shortcuts-list">
          <div v-for="shortcut in shortcuts" :key="shortcut.key" class="shortcut-item">
            <span class="key">{{ shortcut.key }}</span>
            <span class="action">{{ t(`settings.${shortcut.actionKey}`) }}</span>
          </div>
        </div>
      </div>
      <!-- 保存按钮 -->
      <div class="actions">
        <button class="save-button" @click="saveSettings">
          {{ t('settings.saveSettings') }}
        </button>
      </div>
    </div>
    <!-- 通知 -->
    <transition name="fade">
      <div v-if="notification.show" class="notification">
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>
<style scoped>
.settings-page {
  padding: 20px 0;
  max-width: 800px;
}
.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 30px;
}
.settings-content {
  background: var(--color-secondary-bg-for-transparent);
  border-radius: 12px;
  padding: 30px;
}
.setting-section {
  margin-bottom: 40px;
}
.setting-section:last-of-type {
  margin-bottom: 0;
}
.setting-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20px;
}
.setting-item {
  margin-bottom: 20px;
}
.setting-item label {
  display: block;
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 8px;
  font-weight: 500;
}
.select-input {
  width: 100%;
  max-width: 300px;
  padding: 10px 12px;
  background: var(--color-secondary-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.select-input:hover {
  border-color: rgba(255, 255, 255, 0.2);
}
.select-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
/* 主题选项 */
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  background: var(--color-secondary-bg);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.theme-option:hover {
  background: var(--color-primary-bg-for-transparent);
  transform: translateY(-2px);
}
.theme-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg-for-transparent);
}
.theme-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: var(--color-text);
}
.theme-icon svg {
  width: 32px;
  height: 32px;
}
.theme-option.active .theme-icon {
  color: var(--color-primary);
}
.theme-label {
  font-size: 13px;
  color: var(--color-text);
  text-align: center;
  opacity: 0.8;
}
.theme-option.active .theme-label {
  opacity: 1;
  font-weight: 600;
}
/* 复选框 */
.checkbox-item {
  margin-bottom: 12px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 400 !important;
}
.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  cursor: pointer;
  accent-color: var(--color-primary);
}
.checkbox-label span {
  font-size: 14px;
  color: var(--color-text);
}
/* 快捷键 */
.shortcuts-list {
    display: grid;
    gap: 12px;
}
.shortcut-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--color-secondary-bg);
  border-radius: 8px;
}
.key {
  display: inline-block;
  min-width: 60px;
  padding: 6px 12px;
  background: var(--color-primary-bg-for-transparent);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
}
.action {
  margin-left: 16px;
  font-size: 14px;
  color: var(--color-text);
}
/* 操作按钮 */
.actions {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}
.save-button {
  padding: 12px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 94, 234, 0.4);
}
.save-button:active {
  transform: translateY(0);
}
/* 通知 */
.notification {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
/* 响应式 */
@media (max-width: 768px) {
  .settings-content {
    padding: 20px;
  }
  .page-title {
    font-size: 28px;
  }
  .theme-options {
    grid-template-columns: 1fr;
  }
  .select-input {
    max-width: 100%;
  }
}
@media (max-width: 480px) {
  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .action {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>
