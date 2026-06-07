import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LeaveApplication, EmployeeLeaveBalance, LeaveType } from '@/types'
import { mockLeaveApplications, mockLeaveBalances } from '@/mock/data'
import { useAttendanceStore } from '@/stores/attendance'
import { useEmployeeStore } from '@/stores/employee'

export const useLeaveStore = defineStore('leave', () => {
  const applications = ref<LeaveApplication[]>([...mockLeaveApplications])
  const balances = ref<EmployeeLeaveBalance[]>([...mockLeaveBalances])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const filterStatus = ref('')
  const filterType = ref('')

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
    if (filterType.value) {
      data = data.filter(a => a.leaveType === filterType.value)
    }
    const start = (currentPage.value - 1) * pageSize.value
    return data.slice(start, start + pageSize.value)
  })

  const total = computed(() => {
    let data = applications.value
    if (filterStatus.value) {
      data = data.filter(a => a.status === filterStatus.value)
    }
    if (filterType.value) {
      data = data.filter(a => a.leaveType === filterType.value)
    }
    return data.length
  })

  function calculateTotalDays(startDate: string, endDate: string, startTime: string, endTime: string): number {
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return Math.round(diffDays * 10) / 10
  }

  function getLeaveBalance(employeeId: string): EmployeeLeaveBalance | undefined {
    return balances.value.find(b => b.employeeId === employeeId)
  }

  function getApplicationsByEmployeeId(employeeId: string): LeaveApplication[] {
    return applications.value.filter(a => a.employeeId === employeeId)
  }

  function getApprovedAnnualLeaveDays(employeeId: string): number {
    return applications.value
      .filter(a => a.employeeId === employeeId && a.status === 'approved' && a.leaveType === 'annual')
      .reduce((sum, a) => sum + a.totalDays, 0)
  }

  function getApprovedCompensatoryLeaveDays(employeeId: string): number {
    return applications.value
      .filter(a => a.employeeId === employeeId && a.status === 'approved' && a.leaveType === 'compensatory')
      .reduce((sum, a) => sum + a.totalDays, 0)
  }

  function addApplication(application: Omit<LeaveApplication, 'id' | 'createdAt' | 'status'>) {
    const employeeStore = useEmployeeStore()
    const employee = employeeStore.getEmployeeById(application.employeeId)
    
    const newApplication: LeaveApplication = {
      ...application,
      id: `leave-${Date.now()}`,
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
      
      markAttendanceAsLeave(applications.value[index])
      
      updateLeaveBalance(applications.value[index])
      
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

  function markAttendanceAsLeave(application: LeaveApplication) {
    const attendanceStore = useAttendanceStore()
    const startDate = new Date(application.startDate)
    const endDate = new Date(application.endDate)
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const existingRecord = attendanceStore.records.find(
        r => r.employeeId === application.employeeId && r.date === dateStr
      )
      
      if (existingRecord) {
        existingRecord.status = 'leave'
        existingRecord.leaveType = application.leaveType
        existingRecord.leaveApplicationId = application.id
        existingRecord.checkIn = ''
        existingRecord.checkOut = ''
      } else {
        attendanceStore.records.push({
          id: `att-leave-${application.id}-${dateStr}`,
          employeeId: application.employeeId,
          employeeName: application.employeeName,
          date: dateStr,
          checkIn: '',
          checkOut: '',
          status: 'leave',
          leaveType: application.leaveType,
          leaveApplicationId: application.id
        })
      }
    }
  }

  function updateLeaveBalance(application: LeaveApplication) {
    const balance = balances.value.find(b => b.employeeId === application.employeeId)
    if (balance) {
      if (application.leaveType === 'annual') {
        balance.annualLeaveUsed += application.totalDays
        balance.annualLeaveRemaining = balance.annualLeaveTotal - balance.annualLeaveUsed
      } else if (application.leaveType === 'compensatory') {
        balance.compensatoryLeaveUsed += application.totalDays
        balance.compensatoryLeaveRemaining = balance.compensatoryLeaveTotal - balance.compensatoryLeaveUsed
      }
    }
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status
    currentPage.value = 1
  }

  function setFilterType(type: string) {
    filterType.value = type
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  return {
    applications,
    balances,
    currentPage,
    pageSize,
    filterStatus,
    filterType,
    myApplications,
    pendingApprovals,
    paginatedApplications,
    total,
    calculateTotalDays,
    getLeaveBalance,
    getApplicationsByEmployeeId,
    getApprovedAnnualLeaveDays,
    getApprovedCompensatoryLeaveDays,
    addApplication,
    approveApplication,
    rejectApplication,
    markAttendanceAsLeave,
    updateLeaveBalance,
    setFilterStatus,
    setFilterType,
    setCurrentPage,
    setPageSize
  }
})
