import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import './style.css'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import type { Candidate } from './types'

function migrateLocalStorageData() {
  const DATA_VERSION_KEY = 'hrm_data_version'
  const CURRENT_VERSION = 2

  try {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY)
    
    if (storedVersion && parseInt(storedVersion) >= CURRENT_VERSION) {
      return
    }

    const candidatesKey = 'hrm_candidates'
    const storedCandidates = localStorage.getItem(candidatesKey)
    
    if (storedCandidates) {
      const parsed = JSON.parse(storedCandidates)
      if (Array.isArray(parsed)) {
        const hasAllSources = parsed.every((c: Candidate) => c.source)
        const hasAllExperience = parsed.every((c: Candidate) => c.experience)
        const hasAllEducation = parsed.every((c: Candidate) => c.education)
        
        if (!hasAllSources || !hasAllExperience || !hasAllEducation) {
          localStorage.removeItem(candidatesKey)
          localStorage.removeItem('hrm_requirements')
          localStorage.removeItem('hrm_referrals')
        }
      }
    } else {
      localStorage.removeItem('hrm_referrals')
    }

    localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION.toString())
  } catch (e) {
    console.error('Data migration failed:', e)
    localStorage.removeItem('hrm_candidates')
    localStorage.removeItem('hrm_requirements')
    localStorage.removeItem('hrm_referrals')
  }
}

migrateLocalStorageData()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(naive)
app.use(router)

const userStore = useUserStore()
userStore.restoreSession()

app.mount('#app')
