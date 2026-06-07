import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AttendanceRecord, AttendanceCorrection, AttendanceAbnormalFilter, AttendanceCorrectionType, AttendanceCorrectionStatus } from '@/types'
import { mockAttendanceRecords, mockUsers } from '@/mock/data'

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref<AttendanceRecord[]>([...mockAttendanceRecords])
  const selectedMonth = ref('2024-01')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const abnormalFilter = ref<AttendanceAbnormalFilter>('all')

  const monthlyRecords = computed(() => {
    return records.value.filter(r => r.date.startsWith(selectedMonth.value))
  })

  const filteredRecords = computed(() => {
    const data = monthlyRecords.value
    switch (abnormalFilter.value) {
      case 'normal':
        return data.filter(r => r.status === 'normal' || r.correction?.status === 'approved')
      case 'late':
        return data.filter(r => r.status === 'late' && (!r.correction || r.correction.status !== 'approved'))
      case 'early':
        return data.filter(r => r.status === 'early' && (!r.correction || r.correction.status !== 'approved'))
      case 'absent':
        return data.filter(r => r.status === 'absent' && (!r.correction || r.correction.status !== 'approved'))
      case 'pending':
        return data.filter(r => r.correction?.status === 'pending')
      case 'corrected':
        return data.filter(r => r.correction?.status === 'approved')
      default:
        return data
    }
  })

  const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredRecords.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => filteredRecords.value.length)

  const pagination = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    itemCount: total.value,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
    onUpdatePage: (page: number) => setCurrentPage(page),
    onUpdatePageSize: (size: number) => setPageSize(size)
  }))

  const statistics = computed(() => {
    const data = monthlyRecords.value
    const total = data.length
    const normal = data.filter(r => r.status === 'normal' || r.correction?.status === 'approved').length
    const late = data.filter(r => r.status === 'late' && (!r.correction || r.correction.status !== 'approved')).length
    const early = data.filter(r => r.status === 'early' && (!r.correction || r.correction.status !== 'approved')).length
    const absent = data.filter(r => r.status === 'absent' && (!r.correction || r.correction.status !== 'approved')).length
    const leave = data.filter(r => r.status === 'leave').length
    const pending = data.filter(r => r.correction?.status === 'pending').length
    const corrected = data.filter(r => r.correction?.status === 'approved').length
    const attendanceRate = total > 0 ? (((normal + leave) / total) * 100).toFixed(1) : '0'
    return { total, normal, late, early, absent, leave, pending, corrected, attendanceRate }
  })

  const chartData = computed(() => {
    const days: string[] = []
    const rates: number[] = []
    for (let i = 1; i <= 31; i++) {
      const day = `${selectedMonth.value}-${String(i).padStart(2, '0')}`
      const dayRecords = records.value.filter(r => r.date === day)
      if (dayRecords.length > 0) {
        days.push(String(i))
        const normalCount = dayRecords.filter(r => r.status === 'normal' || r.correction?.status === 'approved').length
        rates.push(Math.round((normalCount / dayRecords.length) * 100))
      }
    }
    return { days, rates }
  })

  function setSelectedMonth(month: string) {
    selectedMonth.value = month
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  function setAbnormalFilter(filter: AttendanceAbnormalFilter) {
    abnormalFilter.value = filter
    currentPage.value = 1
  }

  function submitCorrection(
    recordId: string,
    type: AttendanceCorrectionType,
    reason: string,
    makeupCheckIn?: string,
    makeupCheckOut?: string
  ) {
    const record = records.value.find(r => r.id === recordId)
    if (!record) return false

    const currentUser = mockUsers[2]
    const employee = mockUsers.find(u => u.id === record.employeeId) || currentUser

    const correction: AttendanceCorrection = {
      id: `corr-${Date.now()}`,
      type,
      reason,
      makeupCheckIn,
      makeupCheckOut,
      status: 'pending',
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicationTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    record.correction = correction
    return true
  }

  function approveCorrection(recordId: string, comment: string) {
    const record = records.value.find(r => r.id === recordId)
    if (!record || !record.correction) return false

    const approver = mockUsers[0]

    record.correction.status = 'approved'
    record.correction.approverId = approver.id
    record.correction.approverName = approver.name
    record.correction.approvalComment = comment
    record.correction.approvalTime = new Date().toISOString().replace('T', ' ').substring(0, 19)

    return true
  }

  function rejectCorrection(recordId: string, comment: string) {
    const record = records.value.find(r => r.id === recordId)
    if (!record || !record.correction) return false

    const approver = mockUsers[0]

    record.correction.status = 'rejected'
    record.correction.approverId = approver.id
    record.correction.approverName = approver.name
    record.correction.approvalComment = comment
    record.correction.approvalTime = new Date().toISOString().replace('T', ' ').substring(0, 19)

    return true
  }

  return {
    records,
    selectedMonth,
    currentPage,
    pageSize,
    abnormalFilter,
    monthlyRecords,
    filteredRecords,
    paginatedRecords,
    total,
    pagination,
    statistics,
    chartData,
    setSelectedMonth,
    setCurrentPage,
    setPageSize,
    setAbnormalFilter,
    submitCorrection,
    approveCorrection,
    rejectCorrection
  }
})
