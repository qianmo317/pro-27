import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Contract } from '@/types'
import { mockContracts } from '@/mock/data'

let refreshTimer: number | null = null

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([...mockContracts])
  const searchKeyword = ref('')
  const filterType = ref('')
  const filterStatus = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  function updateContractStatus() {
    const now = new Date()
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    contracts.value.forEach(contract => {
      if (contract.status === 'terminated') return

      const endDate = new Date(contract.endDate)

      if (endDate < now) {
        contract.status = 'expired'
      } else if (endDate <= thirtyDaysLater) {
        contract.status = 'expiring'
      } else {
        contract.status = 'active'
      }
    })
  }

  updateContractStatus()

  const filteredContracts = computed(() => {
    return contracts.value
      .filter(con => {
        const matchKeyword = !searchKeyword.value ||
          con.employeeName.includes(searchKeyword.value) ||
          con.id.includes(searchKeyword.value)
        const matchType = !filterType.value || con.type === filterType.value
        const matchStatus = !filterStatus.value || con.status === filterStatus.value
        return matchKeyword && matchType && matchStatus
      })
      .sort((a, b) => {
        const numA = parseInt(a.id.replace('con-', '')) || 0
        const numB = parseInt(b.id.replace('con-', '')) || 0
        return numB - numA
      })
  })

  const paginatedContracts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredContracts.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => filteredContracts.value.length)

  const expiringContracts = computed(() => {
    return contracts.value.filter(con => con.status === 'expiring')
  })

  const expiringCount = computed(() => expiringContracts.value.length)

  function getContractsByEmployeeId(employeeId: string): Contract[] {
    return contracts.value
      .filter(con => con.employeeId === employeeId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  function getCurrentContract(employeeId: string): Contract | undefined {
    const employeeContracts = getContractsByEmployeeId(employeeId)
    return employeeContracts.find(con => con.status === 'active' || con.status === 'expiring')
  }

  function getContractById(id: string): Contract | undefined {
    return contracts.value.find(con => con.id === id)
  }

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
    currentPage.value = 1
  }

  function setFilterType(type: string) {
    filterType.value = type
    currentPage.value = 1
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

  function startAutoRefresh(intervalMinutes: number = 30) {
    stopAutoRefresh()
    refreshTimer = window.setInterval(() => {
      updateContractStatus()
    }, intervalMinutes * 60 * 1000)
  }

  function stopAutoRefresh() {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  function addContract(contract: Omit<Contract, 'id' | 'createdAt' | 'status'>) {
    let maxNum = 0
    if (contracts.value.length > 0) {
      const nums = contracts.value.map(c => {
        const num = parseInt(c.id.replace('con-', ''))
        return isNaN(num) ? 0 : num
      })
      maxNum = Math.max(...nums, 0)
    }
    const newId = `con-${maxNum + 1}`

    const now = new Date()
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const endDate = new Date(contract.endDate)
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let status: Contract['status'] = 'active'
    if (endDate < now) {
      status = 'expired'
    } else if (endDate <= thirtyDaysLater) {
      status = 'expiring'
    }

    contracts.value.push({
      ...contract,
      id: newId,
      createdAt,
      status
    })
  }

  function updateContract(id: string, data: Partial<Contract>) {
    const index = contracts.value.findIndex(con => con.id === id)
    if (index !== -1) {
      const updated = { ...contracts.value[index], ...data }

      const now = new Date()
      const endDate = new Date(updated.endDate)
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      if (updated.status !== 'terminated') {
        if (endDate < now) {
          updated.status = 'expired'
        } else if (endDate <= thirtyDaysLater) {
          updated.status = 'expiring'
        } else {
          updated.status = 'active'
        }
      }

      contracts.value[index] = updated
    }
  }

  function deleteContract(id: string) {
    const index = contracts.value.findIndex(con => con.id === id)
    if (index !== -1) {
      contracts.value.splice(index, 1)
    }
  }

  function terminateContract(id: string, remarks?: string) {
    const index = contracts.value.findIndex(con => con.id === id)
    if (index !== -1) {
      contracts.value[index].status = 'terminated'
      if (remarks) {
        contracts.value[index].remarks = remarks
      }
    }
  }

  return {
    contracts,
    searchKeyword,
    filterType,
    filterStatus,
    currentPage,
    pageSize,
    filteredContracts,
    paginatedContracts,
    total,
    expiringContracts,
    expiringCount,
    getContractsByEmployeeId,
    getCurrentContract,
    getContractById,
    setSearchKeyword,
    setFilterType,
    setFilterStatus,
    setCurrentPage,
    setPageSize,
    addContract,
    updateContract,
    deleteContract,
    terminateContract,
    updateContractStatus,
    startAutoRefresh,
    stopAutoRefresh
  }
})
