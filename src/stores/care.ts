import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Employee, CareReminder, CareSettings, CareMessage } from '@/types'
import { useEmployeeStore } from '@/stores/employee'
import { useUserStore } from '@/stores/user'
import { getDaysUntilNextAnniversary, formatDate } from '@/lib/utils'

const DEFAULT_SETTINGS: CareSettings = {
  birthdayReminderEnabled: true,
  birthdayAdvanceDays: 7,
  anniversaryReminderEnabled: true,
  anniversaryAdvanceDays: 7,
  autoScanEnabled: true,
  scanTime: '09:00'
}

function isWithinThisWeek(date: Date, fromDate: Date = new Date()): boolean {
  const dayOfWeek = fromDate.getDay()
  const weekStart = new Date(fromDate)
  weekStart.setDate(fromDate.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  
  return date >= weekStart && date <= weekEnd
}

function generateId(): string {
  return `care-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useCareStore = defineStore('care', () => {
  const employeeStore = useEmployeeStore()
  const userStore = useUserStore()
  
  const settings = ref<CareSettings>({ ...DEFAULT_SETTINGS })
  const reminders = ref<CareReminder[]>([])
  const messages = ref<CareMessage[]>([])
  const lastScanDate = ref<string | null>(null)
  const lastScanTime = ref<string | null>(null)
  let scanTimer: ReturnType<typeof setTimeout> | null = null
  
  const activeEmployees = computed(() => 
    employeeStore.employees.filter(e => e.status !== 'inactive')
  )
  
  const unreadReminders = computed(() => 
    reminders.value.filter(r => !r.isRead)
  )
  
  const unreadReminderCount = computed(() => unreadReminders.value.length)
  
  const thisWeekBirthdays = computed(() => {
    const today = new Date()
    return activeEmployees.value
      .filter(emp => emp.birthday)
      .map(emp => {
        const { days, years, nextDate, currentAge } = getDaysUntilNextAnniversary(emp.birthday!, today)
        return {
          employee: emp,
          daysRemaining: days,
          age: currentAge,
          upcomingAge: years,
          date: nextDate
        }
      })
      .filter(item => isWithinThisWeek(item.date, today))
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  })
  
  const thisWeekAnniversaries = computed(() => {
    const today = new Date()
    return activeEmployees.value
      .map(emp => {
        const { days, years, nextDate, currentAge } = getDaysUntilNextAnniversary(emp.entryDate, today)
        return {
          employee: emp,
          daysRemaining: days,
          years: currentAge,
          upcomingYears: years,
          date: nextDate
        }
      })
      .filter(item => isWithinThisWeek(item.date, today))
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  })
  
  const upcomingBirthdays = computed(() => {
    const today = new Date()
    const advanceDays = settings.value.birthdayAdvanceDays
    return activeEmployees.value
      .filter(emp => emp.birthday)
      .map(emp => {
        const { days, years, nextDate, currentAge } = getDaysUntilNextAnniversary(emp.birthday!, today)
        return {
          employee: emp,
          daysRemaining: days,
          age: currentAge,
          upcomingAge: years,
          date: nextDate
        }
      })
      .filter(item => item.daysRemaining <= advanceDays)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  })
  
  const upcomingAnniversaries = computed(() => {
    const today = new Date()
    const advanceDays = settings.value.anniversaryAdvanceDays
    return activeEmployees.value
      .map(emp => {
        const { days, years, nextDate, currentAge } = getDaysUntilNextAnniversary(emp.entryDate, today)
        return {
          employee: emp,
          daysRemaining: days,
          years: currentAge,
          upcomingYears: years,
          date: nextDate
        }
      })
      .filter(item => item.daysRemaining <= advanceDays)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  })
  
  function updateSettings(newSettings: Partial<CareSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    localStorage.setItem('careSettings', JSON.stringify(settings.value))
    if (newSettings.scanTime || newSettings.autoScanEnabled !== undefined) {
      restartAutoScan()
    }
  }
  
  function loadSettings() {
    const saved = localStorage.getItem('careSettings')
    if (saved) {
      try {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      } catch (e) {
        console.error('Failed to load care settings:', e)
      }
    }
    const lastScan = localStorage.getItem('lastCareScanDate')
    if (lastScan) {
      lastScanDate.value = lastScan
    }
    const lastScanT = localStorage.getItem('lastCareScanTime')
    if (lastScanT) {
      lastScanTime.value = lastScanT
    }
    const savedReminders = localStorage.getItem('careReminders')
    if (savedReminders) {
      try {
        reminders.value = JSON.parse(savedReminders)
      } catch (e) {
        console.error('Failed to load care reminders:', e)
      }
    }
    const savedMessages = localStorage.getItem('careMessages')
    if (savedMessages) {
      try {
        messages.value = JSON.parse(savedMessages)
      } catch (e) {
        console.error('Failed to load care messages:', e)
      }
    }
  }
  
  function calculateNextScanTime(): number {
    const now = new Date()
    const [hours, minutes] = settings.value.scanTime.split(':').map(Number)
    const nextScan = new Date(now)
    nextScan.setHours(hours, minutes, 0, 0)
    if (nextScan <= now) {
      nextScan.setDate(nextScan.getDate() + 1)
    }
    return nextScan.getTime() - now.getTime()
  }
  
  function startAutoScan() {
    if (!settings.value.autoScanEnabled) return
    stopAutoScan()
    
    const delay = calculateNextScanTime()
    scanTimer = setTimeout(() => {
      scanForUpcomingEvents()
      startAutoScan()
    }, delay)
  }
  
  function stopAutoScan() {
    if (scanTimer) {
      clearTimeout(scanTimer)
      scanTimer = null
    }
  }
  
  function restartAutoScan() {
    stopAutoScan()
    startAutoScan()
  }
  
  function scanForUpcomingEvents(): CareReminder[] {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const timeStr = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`
    const newReminders: CareReminder[] = []
    
    if (settings.value.birthdayReminderEnabled) {
      upcomingBirthdays.value.forEach(item => {
        const existing = reminders.value.find(
          r => r.employeeId === item.employee.id && 
               r.type === 'birthday' && 
               r.date === item.date.toISOString().split('T')[0]
        )
        if (!existing) {
          newReminders.push({
            id: generateId(),
            employeeId: item.employee.id,
            employeeName: item.employee.name,
            employeeAvatar: item.employee.avatar,
            employeeDepartment: item.employee.department,
            employeePosition: item.employee.position,
            type: 'birthday',
            date: item.date.toISOString().split('T')[0],
            daysRemaining: item.daysRemaining,
            years: item.upcomingAge,
            isRead: false,
            createdAt: todayStr
          })
        }
      })
    }
    
    if (settings.value.anniversaryReminderEnabled) {
      upcomingAnniversaries.value.forEach(item => {
        const existing = reminders.value.find(
          r => r.employeeId === item.employee.id && 
               r.type === 'anniversary' && 
               r.date === item.date.toISOString().split('T')[0]
        )
        if (!existing) {
          newReminders.push({
            id: generateId(),
            employeeId: item.employee.id,
            employeeName: item.employee.name,
            employeeAvatar: item.employee.avatar,
            employeeDepartment: item.employee.department,
            employeePosition: item.employee.position,
            type: 'anniversary',
            date: item.date.toISOString().split('T')[0],
            daysRemaining: item.daysRemaining,
            years: item.upcomingYears,
            isRead: false,
            createdAt: todayStr
          })
        }
      })
    }
    
    reminders.value = [...reminders.value, ...newReminders]
    lastScanDate.value = todayStr
    lastScanTime.value = timeStr
    localStorage.setItem('careReminders', JSON.stringify(reminders.value))
    localStorage.setItem('lastCareScanDate', lastScanDate.value)
    localStorage.setItem('lastCareScanTime', lastScanTime.value)
    
    return newReminders
  }
  
  function shouldScanToday(): boolean {
    if (!settings.value.autoScanEnabled) return false
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    if (lastScanDate.value !== todayStr) {
      return currentTime >= settings.value.scanTime
    }
    
    if (lastScanDate.value === todayStr && lastScanTime.value) {
      return lastScanTime.value < settings.value.scanTime && currentTime >= settings.value.scanTime
    }
    
    return false
  }
  
  function markReminderAsRead(reminderId: string) {
    const reminder = reminders.value.find(r => r.id === reminderId)
    if (reminder) {
      reminder.isRead = true
      localStorage.setItem('careReminders', JSON.stringify(reminders.value))
    }
  }
  
  function markAllRemindersAsRead() {
    reminders.value.forEach(r => r.isRead = true)
    localStorage.setItem('careReminders', JSON.stringify(reminders.value))
  }
  
  function sendMessage(receiverId: string, type: 'birthday' | 'anniversary', content: string): CareMessage {
    const currentUser = userStore.currentUser
    const receiver = employeeStore.getEmployeeById(receiverId)
    
    const message: CareMessage = {
      id: generateId(),
      receiverId,
      receiverName: receiver?.name || '',
      senderId: currentUser?.id || 'system',
      senderName: currentUser?.name || '系统',
      type,
      content,
      createdAt: new Date().toISOString(),
      isRead: false
    }
    
    messages.value.push(message)
    localStorage.setItem('careMessages', JSON.stringify(messages.value))
    
    return message
  }
  
  function getMessagesForEmployee(employeeId: string): CareMessage[] {
    return messages.value
      .filter(m => m.receiverId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  function getDefaultBlessing(type: 'birthday' | 'anniversary', name: string, years?: number): string {
    if (type === 'birthday') {
      return `亲爱的 ${name}，在这个特别的日子里，祝你生日快乐！愿你在新的一岁里，工作顺利，生活幸福，身体健康！🎉🎂`
    } else {
      return `亲爱的 ${name}，恭喜你入职${years || 'N'}周年！感谢你${years || ''}年来为公司的辛勤付出，愿我们继续携手同行，共创美好未来！🎊🏆`
    }
  }
  
  function getDaysLabel(days: number): string {
    if (days === 0) return '今天'
    if (days === 1) return '明天'
    if (days === 2) return '后天'
    return `${days}天后`
  }
  
  return {
    settings,
    reminders,
    messages,
    lastScanDate,
    lastScanTime,
    activeEmployees,
    unreadReminders,
    unreadReminderCount,
    thisWeekBirthdays,
    thisWeekAnniversaries,
    upcomingBirthdays,
    upcomingAnniversaries,
    updateSettings,
    loadSettings,
    startAutoScan,
    stopAutoScan,
    restartAutoScan,
    scanForUpcomingEvents,
    shouldScanToday,
    markReminderAsRead,
    markAllRemindersAsRead,
    sendMessage,
    getMessagesForEmployee,
    getDefaultBlessing,
    formatDate,
    getDaysLabel
  }
})
