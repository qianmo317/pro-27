import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { mockUsers } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const token = ref<string | null>(null)

  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isHr = computed(() => currentUser.value?.role === 'hr' || currentUser.value?.role === 'admin')

  function login(username: string, password: string): boolean {
    const user = mockUsers.find(u => u.username === username)
    if (user && password === '123456') {
      currentUser.value = user
      isLoggedIn.value = true
      token.value = `token-${user.id}-${Date.now()}`
      localStorage.setItem('hr_token', token.value)
      localStorage.setItem('hr_user', JSON.stringify(user))
      return true
    }
    return false
  }

  function logout() {
    currentUser.value = null
    isLoggedIn.value = false
    token.value = null
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_user')
  }

  function restoreSession() {
    const savedToken = localStorage.getItem('hr_token')
    const savedUser = localStorage.getItem('hr_user')
    if (savedToken && savedUser) {
      token.value = savedToken
      currentUser.value = JSON.parse(savedUser)
      isLoggedIn.value = true
    }
  }

  return {
    currentUser,
    isLoggedIn,
    token,
    isAdmin,
    isHr,
    login,
    logout,
    restoreSession
  }
})
