import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EmployeeTransfer, TransferType } from '@/types'
import { mockEmployeeTransfers } from '@/mock/data'
import { useEmployeeStore } from './employee'

export const useEmployeeTransferStore = defineStore('employeeTransfer', () => {
  const transfers = ref<EmployeeTransfer[]>([...mockEmployeeTransfers])
  const searchKeyword = ref('')
  const filterType = ref<TransferType | ''>('')
  const filterDepartment = ref('')
  const filterStatus = ref<EmployeeTransfer['status'] | ''>('')
  const filterStartDate = ref('')
  const filterEndDate = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const employeeStore = useEmployeeStore()

  const filteredTransfers = computed(() => {
    return transfers.value.filter(transfer => {
      const matchKeyword = !searchKeyword.value ||
        transfer.employeeName.includes(searchKeyword.value) ||
        transfer.reason.includes(searchKeyword.value)
      const matchType = !filterType.value || transfer.type === filterType.value
      const matchDepartment = !filterDepartment.value ||
        transfer.beforeDepartment === filterDepartment.value ||
        transfer.afterDepartment === filterDepartment.value
      const matchStatus = !filterStatus.value || transfer.status === filterStatus.value
      const matchStartDate = !filterStartDate.value || transfer.effectiveDate >= filterStartDate.value
      const matchEndDate = !filterEndDate.value || transfer.effectiveDate <= filterEndDate.value
      return matchKeyword && matchType && matchDepartment && matchStatus && matchStartDate && matchEndDate
    }).sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
  })

  const paginatedTransfers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredTransfers.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => filteredTransfers.value.length)

  function getTransfersByEmployeeId(employeeId: string): EmployeeTransfer[] {
    return transfers.value
      .filter(t => t.employeeId === employeeId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
  }

  function addTransfer(transfer: Omit<EmployeeTransfer, 'id'>) {
    const maxId = transfers.value.length > 0
      ? Math.max(...transfers.value.map(t => Number(t.id.replace('trans-', ''))))
      : 0
    const newId = `trans-${maxId + 1}`
    const newTransfer = { ...transfer, id: newId }
    transfers.value.unshift(newTransfer)
    if (transfer.status === 'effective') {
      applyTransferEffect(newTransfer)
    }
    return newTransfer
  }

  function updateTransfer(id: string, data: Partial<EmployeeTransfer>) {
    const index = transfers.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const oldStatus = transfers.value[index].status
      transfers.value[index] = { ...transfers.value[index], ...data }
      if (oldStatus !== 'effective' && data.status === 'effective') {
        applyTransferEffect(transfers.value[index])
      }
    }
  }

  function deleteTransfer(id: string) {
    const index = transfers.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transfers.value.splice(index, 1)
    }
  }

  function applyTransferEffect(transfer: EmployeeTransfer) {
    const employee = employeeStore.getEmployeeById(transfer.employeeId)
    if (employee) {
      employeeStore.updateEmployee(transfer.employeeId, {
        department: transfer.afterDepartment,
        position: transfer.afterPosition
      })
    }
  }

  function processPendingTransfers() {
    const today = new Date().toISOString().split('T')[0]
    transfers.value.forEach(transfer => {
      if (transfer.status === 'pending' && transfer.effectiveDate <= today) {
        updateTransfer(transfer.id, { status: 'effective' })
      }
    })
  }

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
    currentPage.value = 1
  }

  function setFilterType(type: TransferType | '') {
    filterType.value = type
    currentPage.value = 1
  }

  function setFilterDepartment(dept: string) {
    filterDepartment.value = dept
    currentPage.value = 1
  }

  function setFilterStatus(status: EmployeeTransfer['status'] | '') {
    filterStatus.value = status
    currentPage.value = 1
  }

  function setFilterStartDate(date: string) {
    filterStartDate.value = date
    currentPage.value = 1
  }

  function setFilterEndDate(date: string) {
    filterEndDate.value = date
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function getStatistics() {
    const totalCount = transfers.value.length
    const effectiveCount = transfers.value.filter(t => t.status === 'effective').length
    const pendingCount = transfers.value.filter(t => t.status === 'pending').length
    const typeStats: Record<TransferType, number> = {
      department_change: 0,
      promotion: 0,
      demotion: 0,
      salary_adjustment: 0,
      transfer_in: 0,
      transfer_out: 0
    }
    transfers.value.forEach(t => {
      typeStats[t.type]++
    })
    return {
      totalCount,
      effectiveCount,
      pendingCount,
      typeStats
    }
  }

  return {
    transfers,
    searchKeyword,
    filterType,
    filterDepartment,
    filterStatus,
    filterStartDate,
    filterEndDate,
    currentPage,
    pageSize,
    filteredTransfers,
    paginatedTransfers,
    total,
    getTransfersByEmployeeId,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    applyTransferEffect,
    processPendingTransfers,
    setSearchKeyword,
    setFilterType,
    setFilterDepartment,
    setFilterStatus,
    setFilterStartDate,
    setFilterEndDate,
    setCurrentPage,
    getStatistics
  }
})
