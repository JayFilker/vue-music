<script setup>
import { ref } from 'vue'
const isSmall = ref(false)
const logo = [
  {
    className: 'button minimize codicon codicon-chrome-minimize',
    methodName: 'minimize'
  },
  {
    className: 'button max-restore codicon codicon-chrome-maximize',
    methodName: 'maximizeOrUnmaximize'
  },
  {
    className: 'button close codicon codicon-chrome-close',
    methodName: 'close'
  }
]
const handleWindowControl = (methodName, index) => {
  if (index === 1) {
    isSmall.value = !isSmall.value
  }
  try {
    const ipcRenderer = window.require?.('electron')?.ipcRenderer
    ipcRenderer?.send(methodName)
  } catch (e) {
    console.log('此功能为Electron专属，浏览器环境不可用')
  }
}
</script>
<template>
  <div class="win32-titlebar">
    <div class="title">MyYesPlayMusic</div>
    <div class="controls" style="padding: 0">
      <div
        v-for="(item, index) in logo"
        :key="index"
        :class="[item.className, { 'codicon-chrome-restore': index === 1 && isSmall, 'codicon-chrome-maximize': index === 1 && !isSmall }]"
        @click="handleWindowControl(item.methodName, index)"
      />
    </div>
  </div>
</template>
<style scoped>
.win32-titlebar {
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  -webkit-app-region: drag;
}
.title {
  margin-left: 8px;
  font-size: 12px;
  color: var(--color-text);
}
.controls {
  display: flex;
  -webkit-app-region: no-drag;
}
.button {
  width: 46px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
}
.button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.button.close:hover {
  background-color: #e81123;
  color: white;
}
</style>
