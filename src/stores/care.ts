import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Employee, CareReminder, CareSettings, CareMessage } from '@/types'
import { useEmployeeStore } from '@/stores/employee'
import { useUserStore } from '@/stores/user'

const DEFAULT_SETTINGS: CareSettings = {
  birthdayReminderEnabled: true,
  birthdayAdvanceDays: 7,
  anniversaryReminderEnabled: true,
  anniversaryAdvanceDays: 7,
  autoScanEnabled: true,
  scanTime: '09:00'
}

function getDaysUntilNextAnniversary(dateStr: string, fromDate: Date = new Date()): { days: number; years: number; nextDate: Date } {
  const date = new Date(dateStr)
  const thisYear = fromDate.getFullYear()
  
  let nextDate = new Date(thisYear, date.getMonth(), date.getDate())
  
  if (nextDate < fromDate) {
    nextDate = new Date(thisYear + 1, date.getMonth(), date.getDate())
  }
  
  const diffTime = nextDate.getTime() - fromDate.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const years = nextDate.getFullYear() - date.getFullYear()
  
  return { days, years, nextDate }
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
        const { days, years, nextDate } = getDaysUntilNextAnniversary(emp.birthday!, today)
        return {
          employee: emp,
          daysRemaining: days,
          age: years,
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
        const { days, years, nextDate } = getDaysUntilNextAnniversary(emp.entryDate, today)
        return {
          employee: emp,
          daysRemaining: days,
          years,
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
        const { days, years, nextDate } = getDaysUntilNextAnniversary(emp.birthday!, today)
        return {
          employee: emp,
          daysRemaining: days,
          age: years,
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
        const { days, years, nextDate } = getDaysUntilNextAnniversary(emp.entryDate, today)
        return {
          employee: emp,
          daysRemaining: days,
          years,
          date: nextDate
        }
      })
      .filter(item => item.daysRemaining <= advanceDays)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  })
  
  function updateSettings(newSettings: Partial<CareSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    localStorage.setItem('careSettings', JSON.stringify(settings.value))
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
  
  function scanForUpcomingEvents(): CareReminder[] {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
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
            years: item.age,
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
            years: item.years,
            isRead: false,
            createdAt: todayStr
          })
        }
      })
    }
    
    reminders.value = [...reminders.value, ...newReminders]
    lastScanDate.value = todayStr
    localStorage.setItem('careReminders', JSON.stringify(reminders.value))
    localStorage.setItem('lastCareScanDate', lastScanDate.value)
    
    return newReminders
  }
  
  function shouldScanToday(): boolean {
    if (!settings.value.autoScanEnabled) return false
    const todayStr = new Date().toISOString().split('T')[0]
    return lastScanDate.value !== todayStr
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
  
  function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[d.getDay()]
    return `${month}月${day}日 ${weekDay}`
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
    activeEmployees,
    unreadReminders,
    unreadReminderCount,
    thisWeekBirthdays,
    thisWeekAnniversaries,
    upcomingBirthdays,
    upcomingAnniversaries,
    updateSettings,
    loadSettings,
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
