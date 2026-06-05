<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme, createTheme } from 'naive-ui'
import { computed } from 'vue'

const isDark = false

const theme = computed(() => (isDark ? darkTheme : null))

const themeOverrides = {
  common: {
    primaryColor: '#7C3AED',
    primaryColorHover: '#8B5CF6',
    primaryColorPressed: '#6D28D9',
    primaryColorSuppl: '#A78BFA',
    infoColor: '#7C3AED',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    borderRadius: '8px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif'
  },
  Layout: {
    siderColor: '#1E1B4B',
    headerColor: '#FFFFFF'
  },
  Menu: {
    itemTextColor: '#E9D5FF',
    itemTextColorHover: '#FFFFFF',
    itemTextColorActive: '#FFFFFF',
    itemTextColorActiveHover: '#FFFFFF',
    itemTextColorChildActive: '#FFFFFF',
    itemIconColor: '#E9D5FF',
    itemIconColorHover: '#FFFFFF',
    itemIconColorActive: '#FFFFFF',
    itemIconColorActiveHover: '#FFFFFF',
    itemIconColorChildActive: '#FFFFFF',
    color: '#1E1B4B',
    itemColorHover: '#312E81',
    itemColorActive: '#7C3AED',
    itemColorActiveHover: '#8B5CF6',
    itemColorActiveCollapsed: '#7C3AED',
    arrowColor: '#E9D5FF',
    arrowColorHover: '#FFFFFF',
    arrowColorActive: '#FFFFFF'
  },
  Card: {
    borderRadius: '12px'
  },
  Button: {
    borderRadius: '8px',
    heightMedium: '40px'
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

.page-container {
  padding: 24px;
  background: #F5F3FF;
  min-height: calc(100vh - 64px);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 24px;
}

.card-gradient {
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
  color: white;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(124, 58, 237, 0.15);
}
</style>
