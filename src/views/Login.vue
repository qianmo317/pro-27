<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <Users :size="32" color="#fff" />
          </div>
          <h1 class="title">HR 管理系统</h1>
        </div>
        <p class="subtitle">企业人力资源管理平台</p>
      </div>
      
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        class="login-form"
        @submit="handleLogin"
      >
        <n-form-item path="username">
          <n-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            size="large"
            class="login-input"
          >
            <template #prefix>
              <User :size="18" class="input-icon" />
            </template>
          </n-input>
        </n-form-item>
        
        <n-form-item path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password-on="click"
            class="login-input"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <Lock :size="18" class="input-icon" />
            </template>
          </n-input>
        </n-form-item>
        
        <n-space justify="space-between" class="login-options">
          <n-checkbox v-model:checked="rememberMe">
            <span class="text-sm">记住登录</span>
          </n-checkbox>
          <a href="#" class="forgot-link">忘记密码？</a>
        </n-space>
        
        <n-button
          type="primary"
          size="large"
          block
          :loading="loading"
          class="login-btn"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </n-button>
      </n-form>
      
      <div class="login-tips">
        <p class="tip-title">测试账号：</p>
        <p class="tip-item">管理员：admin / 123456</p>
        <p class="tip-item">HR：hr / 123456</p>
        <p class="tip-item">员工：employee / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Users, User, Lock } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const rememberMe = ref(false)

const formData = ref({
  username: 'admin',
  password: '123456'
})

onMounted(() => {
  const savedUsername = localStorage.getItem('hr_remember_username')
  if (savedUsername) {
    formData.value.username = savedUsername
    rememberMe.value = true
  }
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

function handleLogin() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      setTimeout(() => {
        const success = userStore.login(formData.value.username, formData.value.password)
        if (success) {
          if (rememberMe.value) {
            localStorage.setItem('hr_remember_username', formData.value.username)
          } else {
            localStorage.removeItem('hr_remember_username')
          }
          message.success('登录成功！')
          router.push('/dashboard')
        } else {
          message.error('用户名或密码错误！')
        }
        loading.value = false
      }, 800)
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #7C3AED 100%);
  z-index: 0;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1E1B4B;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-input {
  border-radius: 12px;
}

.input-icon {
  color: #9CA3AF;
}

.login-options {
  margin-bottom: 24px;
  width: 100%;
}

.forgot-link {
  font-size: 14px;
  color: #7C3AED;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #6D28D9;
}

.login-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
}

.login-tips {
  padding: 16px;
  background: #F5F3FF;
  border-radius: 12px;
  border: 1px solid #DDD6FE;
}

.tip-title {
  font-size: 13px;
  font-weight: 600;
  color: #5B21B6;
  margin: 0 0 8px 0;
}

.tip-item {
  font-size: 12px;
  color: #7C3AED;
  margin: 4px 0;
}
</style>
