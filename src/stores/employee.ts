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

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
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

  function isPhoneExists(phone: string, excludeId?: string): boolean {
    return employees.value.some(e => e.phone === phone && e.id !== excludeId)
  }

  function isEmailExists(email: string, excludeId?: string): boolean {
    return employees.value.some(e => e.email === email && e.id !== excludeId)
  }

  function batchAddEmployees(employeeList: Omit<Employee, 'id'>[]): Employee[] {
    const maxId = Math.max(...employees.value.map(e => Number(e.id)))
    const newEmployees: Employee[] = employeeList.map((emp, index) => ({
      ...emp,
      id: String(maxId + index + 1)
    }))
    employees.value.push(...newEmployees)
    return newEmployees
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
    pagination,
    departments,
    setSearchKeyword,
    setFilterDepartment,
    setFilterStatus,
    setCurrentPage,
    setPageSize,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    isPhoneExists,
    isEmailExists,
    batchAddEmployees
  }
})
