import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Employee } from '@/types'
import { mockEmployees } from '@/mock/data'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([...mockEmployees])
  const searchKeyword = ref('')
  const filterDepartment = ref('')
  const filterStatus = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const filteredEmployees = computed(() => {
    return employees.value.filter(emp => {
      const matchKeyword = !searchKeyword.value || 
        emp.name.includes(searchKeyword.value) ||
        emp.email.includes(searchKeyword.value) ||
        emp.position.includes(searchKeyword.value)
      const matchDepartment = !filterDepartment.value || emp.department === filterDepartment.value
      const matchStatus = !filterStatus.value || emp.status === filterStatus.value
      return matchKeyword && matchDepartment && matchStatus
    })
  })

  const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredEmployees.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => filteredEmployees.value.length)

  const departments = computed(() => [...new Set(employees.value.map(e => e.department))])

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
    currentPage.value = 1
  }

  function setFilterDepartment(dept: string) {
    filterDepartment.value = dept
    currentPage.value = 1
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function getEmployeeById(id: string): Employee | undefined {
    return employees.value.find(e => e.id === id)
  }

  function addEmployee(employee: Omit<Employee, 'id'>) {
    const newId = String(Math.max(...employees.value.map(e => Number(e.id))) + 1)
    employees.value.push({ ...employee, id: newId })
  }

  function updateEmployee(id: string, data: Partial<Employee>) {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...data }
    }
  }

  function deleteEmployee(id: string) {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      employees.value.splice(index, 1)
    }
  }

  return {
    employees,
    searchKeyword,
    filterDepartment,
    filterStatus,
    currentPage,
    pageSize,
    filteredEmployees,
    paginatedEmployees,
    total,
    departments,
    setSearchKeyword,
    setFilterDepartment,
    setFilterStatus,
    setCurrentPage,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee
  }
})
