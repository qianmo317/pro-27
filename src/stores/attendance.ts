import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AttendanceRecord } from '@/types'
import { mockAttendanceRecords } from '@/mock/data'

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref<AttendanceRecord[]>([...mockAttendanceRecords])
  const selectedMonth = ref('2024-01')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const monthlyRecords = computed(() => {
    return records.value.filter(r => r.date.startsWith(selectedMonth.value))
  })

  const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return monthlyRecords.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => monthlyRecords.value.length)

  const statistics = computed(() => {
    const data = monthlyRecords.value
    const total = data.length
    const normal = data.filter(r => r.status === 'normal').length
    const late = data.filter(r => r.status === 'late').length
    const early = data.filter(r => r.status === 'early').length
    const absent = data.filter(r => r.status === 'absent').length
    const leave = data.filter(r => r.status === 'leave').length
    const attendanceRate = total > 0 ? (((normal + leave) / total) * 100).toFixed(1) : '0'
    return { total, normal, late, early, absent, leave, attendanceRate }
  })

  const chartData = computed(() => {
    const days: string[] = []
    const rates: number[] = []
    for (let i = 1; i <= 31; i++) {
      const day = `${selectedMonth.value}-${String(i).padStart(2, '0')}`
      const dayRecords = records.value.filter(r => r.date === day)
      if (dayRecords.length > 0) {
        days.push(String(i))
        const normalCount = dayRecords.filter(r => r.status === 'normal').length
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

  return {
    records,
    selectedMonth,
    currentPage,
    pageSize,
    monthlyRecords,
    paginatedRecords,
    total,
    statistics,
    chartData,
    setSelectedMonth,
    setCurrentPage,
    setPageSize
  }
})
