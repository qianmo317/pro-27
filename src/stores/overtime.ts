import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OvertimeApplication } from '@/types'
import { mockOvertimeApplications } from '@/mock/data'
import { useLeaveStore } from '@/stores/leave'
import { useEmployeeStore } from '@/stores/employee'

export const useOvertimeStore = defineStore('overtime', () => {
  const applications = ref<OvertimeApplication[]>([...mockOvertimeApplications])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const filterStatus = ref('')

  const myApplications = computed(() => {
    return applications.value.filter(a => a.employeeId === '3')
  })

  const pendingApprovals = computed(() => {
    return applications.value.filter(a => a.status === 'pending')
  })

  const paginatedApplications = computed(() => {
    let data = applications.value
    if (filterStatus.value) {
      data = data.filter(a => a.status === filterStatus.value)
    }
    const start = (currentPage.value - 1) * pageSize.value
    return data.slice(start, start + pageSize.value)
  })

  const total = computed(() => {
    let data = applications.value
    if (filterStatus.value) {
      data = data.filter(a => a.status === filterStatus.value)
    }
    return data.length
  })

  function calculateTotalHours(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const diffMinutes = endMinutes - startMinutes
    return Math.round((diffMinutes / 60) * 10) / 10
  }

  function getOvertimeHoursByEmployeeId(employeeId: string): number {
    return applications.value
      .filter(a => a.employeeId === employeeId && a.status === 'approved')
      .reduce((sum, a) => sum + a.totalHours, 0)
  }

  function getMonthlyOvertimeHours(employeeId: string, year: number, month: number): number {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    return applications.value
      .filter(a => 
        a.employeeId === employeeId && 
        a.status === 'approved' && 
        a.overtimeDate.startsWith(monthStr)
      )
      .reduce((sum, a) => sum + a.totalHours, 0)
  }

  function getCurrentMonthOvertimeHours(employeeId: string): number {
    const now = new Date()
    return getMonthlyOvertimeHours(employeeId, now.getFullYear(), now.getMonth() + 1)
  }

  function getCompensatoryLeaveDays(employeeId: string): number {
    const totalHours = getOvertimeHoursByEmployeeId(employeeId)
    return Math.round((totalHours / 8) * 10) / 10
  }

  function getApplicationsByEmployeeId(employeeId: string): OvertimeApplication[] {
    return applications.value.filter(a => a.employeeId === employeeId)
  }

  function addApplication(application: Omit<OvertimeApplication, 'id' | 'createdAt' | 'status'>) {
    const employeeStore = useEmployeeStore()
    const employee = employeeStore.getEmployeeById(application.employeeId)
    
    const newApplication: OvertimeApplication = {
      ...application,
      id: `overtime-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    }
    applications.value.unshift(newApplication)
    return newApplication
  }

  function approveApplication(applicationId: string, approverId: string, approverName: string, comment: string) {
    const index = applications.value.findIndex(a => a.id === applicationId)
    if (index !== -1) {
      applications.value[index].status = 'approved'
      applications.value[index].approverId = approverId
      applications.value[index].approverName = approverName
      applications.value[index].approvalComment = comment
      applications.value[index].approvedAt = new Date().toISOString().split('T')[0]
      
      updateCompensatoryLeaveBalance(applications.value[index])
      
      return applications.value[index]
    }
    return null
  }

  function rejectApplication(applicationId: string, approverId: string, approverName: string, comment: string) {
    const index = applications.value.findIndex(a => a.id === applicationId)
    if (index !== -1) {
      applications.value[index].status = 'rejected'
      applications.value[index].approverId = approverId
      applications.value[index].approverName = approverName
      applications.value[index].approvalComment = comment
      applications.value[index].approvedAt = new Date().toISOString().split('T')[0]
      return applications.value[index]
    }
    return null
  }

  function updateCompensatoryLeaveBalance(application: OvertimeApplication) {
    const leaveStore = useLeaveStore()
    const balance = leaveStore.balances.find(b => b.employeeId === application.employeeId)
    if (balance) {
      const newLeaveDays = Math.round((application.totalHours / 8) * 10) / 10
      balance.compensatoryLeaveTotal += newLeaveDays
      balance.compensatoryLeaveRemaining += newLeaveDays
    }
  }

  function deductCompensatoryLeave(employeeId: string, days: number): boolean {
    const leaveStore = useLeaveStore()
    const balance = leaveStore.balances.find(b => b.employeeId === employeeId)
    if (balance && balance.compensatoryLeaveRemaining >= days) {
      balance.compensatoryLeaveUsed += days
      balance.compensatoryLeaveRemaining = Math.round((balance.compensatoryLeaveTotal - balance.compensatoryLeaveUsed) * 10) / 10
      return true
    }
    return false
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  function initializeCompensatoryLeaveBalances() {
    const leaveStore = useLeaveStore()
    applications.value
      .filter(a => a.status === 'approved')
      .forEach(application => {
        updateCompensatoryLeaveBalance(application)
      })
  }

  initializeCompensatoryLeaveBalances()

  return {
    applications,
    currentPage,
    pageSize,
    filterStatus,
    myApplications,
    pendingApprovals,
    paginatedApplications,
    total,
    calculateTotalHours,
    getOvertimeHoursByEmployeeId,
    getMonthlyOvertimeHours,
    getCurrentMonthOvertimeHours,
    getCompensatoryLeaveDays,
    getApplicationsByEmployeeId,
    addApplication,
    approveApplication,
    rejectApplication,
    updateCompensatoryLeaveBalance,
    deductCompensatoryLeave,
    setFilterStatus,
    setCurrentPage,
    setPageSize,
    initializeCompensatoryLeaveBalances
  }
})
