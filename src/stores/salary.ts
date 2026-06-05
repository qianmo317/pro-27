import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SalaryRecord } from '@/types'
import { mockSalaryRecords } from '@/mock/data'

export const useSalaryStore = defineStore('salary', () => {
  const records = ref<SalaryRecord[]>([...mockSalaryRecords])
  const selectedMonth = ref('2024-01')
  const employeeFilter = ref('')

  const filteredRecords = computed(() => {
    return records.value.filter(r => {
      const matchMonth = r.month === selectedMonth.value
      const matchEmployee = !employeeFilter.value || r.employeeName.includes(employeeFilter.value)
      return matchMonth && matchEmployee
    })
  })

  const months = computed(() => [...new Set(records.value.map(r => r.month))].sort().reverse())

  const totalSalary = computed(() => {
    return filteredRecords.value.reduce((sum, r) => sum + r.netSalary, 0)
  })

  function setSelectedMonth(month: string) {
    selectedMonth.value = month
  }

  function setEmployeeFilter(name: string) {
    employeeFilter.value = name
  }

  function getRecordById(id: string): SalaryRecord | undefined {
    return records.value.find(r => r.id === id)
  }

  return {
    records,
    selectedMonth,
    employeeFilter,
    filteredRecords,
    months,
    totalSalary,
    setSelectedMonth,
    setEmployeeFilter,
    getRecordById
  }
})
