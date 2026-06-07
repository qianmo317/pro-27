import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SalaryRecord, SalaryTemplate, Employee } from '@/types'
import { mockSalaryRecords } from '@/mock/data'
import { useSalaryTemplateStore } from './salary-template'
import { useEmployeeStore } from './employee'

function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  let tax = 0
  if (taxableIncome <= 3000) {
    tax = taxableIncome * 0.03
  } else if (taxableIncome <= 12000) {
    tax = 3000 * 0.03 + (taxableIncome - 3000) * 0.10
  } else if (taxableIncome <= 25000) {
    tax = 3000 * 0.03 + 9000 * 0.10 + (taxableIncome - 12000) * 0.20
  } else if (taxableIncome <= 35000) {
    tax = 3000 * 0.03 + 9000 * 0.10 + 13000 * 0.20 + (taxableIncome - 25000) * 0.25
  } else if (taxableIncome <= 55000) {
    tax = 3000 * 0.03 + 9000 * 0.10 + 13000 * 0.20 + 10000 * 0.25 + (taxableIncome - 35000) * 0.30
  } else if (taxableIncome <= 80000) {
    tax = 3000 * 0.03 + 9000 * 0.10 + 13000 * 0.20 + 10000 * 0.25 + 20000 * 0.30 + (taxableIncome - 55000) * 0.35
  } else {
    tax = 3000 * 0.03 + 9000 * 0.10 + 13000 * 0.20 + 10000 * 0.25 + 20000 * 0.30 + 25000 * 0.35 + (taxableIncome - 80000) * 0.45
  }
  return Math.round(tax)
}

function calculateSalaryFromTemplate(
  template: SalaryTemplate,
  performanceMultiplier: number = 1.0
) {
  const performanceBonus = Math.round(template.baseSalary * template.performanceCoefficient * performanceMultiplier)
  const otherAllowanceTotal = template.mealAllowance + template.transportationAllowance + template.communicationAllowance + template.otherAllowance
  const grossSalary = template.baseSalary + template.postAllowance + performanceBonus + otherAllowanceTotal
  const socialSecurity = Math.round(grossSalary * template.socialSecurityRate)
  const housingFund = Math.round(grossSalary * template.housingFundRate)
  const taxableIncome = Math.max(0, grossSalary - socialSecurity - housingFund - template.taxThreshold)
  const incomeTax = calculateIncomeTax(taxableIncome)
  const otherDeduction = 0
  const totalDeduction = socialSecurity + housingFund + incomeTax + otherDeduction
  const netSalary = grossSalary - totalDeduction

  return {
    baseSalary: template.baseSalary,
    postAllowance: template.postAllowance,
    performanceBonus,
    otherAllowance: otherAllowanceTotal,
    socialSecurity,
    housingFund,
    incomeTax,
    otherDeduction,
    grossSalary,
    totalDeduction,
    netSalary
  }
}

export const useSalaryStore = defineStore('salary', () => {
  const records = ref<SalaryRecord[]>([...mockSalaryRecords])
  const selectedMonth = ref('2024-01')
  const employeeFilter = ref('')
  const departmentFilter = ref('')

  const filteredRecords = computed(() => {
    return records.value.filter(r => {
      const matchMonth = r.month === selectedMonth.value
      const matchEmployee = !employeeFilter.value || r.employeeName.includes(employeeFilter.value)
      const matchDepartment = !departmentFilter.value || r.department === departmentFilter.value
      return matchMonth && matchEmployee && matchDepartment
    })
  })

  const months = computed(() => [...new Set(records.value.map(r => r.month))].sort().reverse())

  const departments = computed(() => [...new Set(records.value.map(r => r.department).filter(Boolean))].sort())

  const totalSalary = computed(() => {
    return filteredRecords.value.reduce((sum, r) => sum + r.netSalary, 0)
  })

  const totalGrossSalary = computed(() => {
    return filteredRecords.value.reduce((sum, r) => sum + r.grossSalary, 0)
  })

  const totalDeduction = computed(() => {
    return filteredRecords.value.reduce((sum, r) => sum + r.totalDeduction, 0)
  })

  function setSelectedMonth(month: string) {
    selectedMonth.value = month
  }

  function setEmployeeFilter(name: string) {
    employeeFilter.value = name
  }

  function setDepartmentFilter(department: string) {
    departmentFilter.value = department
  }

  function getRecordById(id: string): SalaryRecord | undefined {
    return records.value.find(r => r.id === id)
  }

  function getRecordsByMonth(month: string): SalaryRecord[] {
    return records.value.filter(r => r.month === month)
  }

  function getRecordsByEmployeeId(employeeId: string): SalaryRecord[] {
    return records.value.filter(r => r.employeeId === employeeId).sort((a, b) => b.month.localeCompare(a.month))
  }

  function createSalaryRecord(
    employee: Employee,
    template: SalaryTemplate,
    month: string,
    performanceMultiplier: number = 1.0,
    overrides: Partial<SalaryRecord> = {}
  ): SalaryRecord {
    const calculated = calculateSalaryFromTemplate(template, performanceMultiplier)
    const newRecord: SalaryRecord = {
      id: `sal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      month,
      templateId: template.id,
      templateName: template.name,
      ...calculated,
      ...overrides
    }
    return newRecord
  }

  function addSalaryRecord(record: SalaryRecord) {
    const existingIndex = records.value.findIndex(
      r => r.employeeId === record.employeeId && r.month === record.month
    )
    if (existingIndex !== -1) {
      records.value[existingIndex] = record
    } else {
      records.value.push(record)
    }
    return record
  }

  function batchGenerateByTemplate(
    template: SalaryTemplate,
    month: string,
    employees: Employee[],
    performanceMultipliers: Record<string, number> = {}
  ): SalaryRecord[] {
    const newRecords: SalaryRecord[] = []
    employees.forEach(emp => {
      const multiplier = performanceMultipliers[emp.id] ?? 1.0
      const record = createSalaryRecord(emp, template, month, multiplier)
      addSalaryRecord(record)
      newRecords.push(record)
    })
    return newRecords
  }

  function batchGenerateByDepartments(
    month: string,
    departments: string[],
    performanceMultipliers: Record<string, number> = {}
  ): SalaryRecord[] {
    const templateStore = useSalaryTemplateStore()
    const employeeStore = useEmployeeStore()
    const newRecords: SalaryRecord[] = []

    const targetEmployees = employeeStore.employees.filter(
      emp => emp.status === 'active' && departments.includes(emp.department)
    )

    targetEmployees.forEach(emp => {
      const template = templateStore.getTemplateForEmployee(emp)
      if (template) {
        const multiplier = performanceMultipliers[emp.id] ?? 1.0
        const record = createSalaryRecord(emp, template, month, multiplier)
        addSalaryRecord(record)
        newRecords.push(record)
      }
    })

    return newRecords
  }

  function batchGenerateAllActive(
    month: string,
    performanceMultipliers: Record<string, number> = {}
  ): SalaryRecord[] {
    const templateStore = useSalaryTemplateStore()
    const employeeStore = useEmployeeStore()
    const newRecords: SalaryRecord[] = []

    const activeEmployees = employeeStore.employees.filter(e => e.status === 'active')

    activeEmployees.forEach(emp => {
      const template = templateStore.getTemplateForEmployee(emp)
      if (template) {
        const multiplier = performanceMultipliers[emp.id] ?? 1.0
        const record = createSalaryRecord(emp, template, month, multiplier)
        addSalaryRecord(record)
        newRecords.push(record)
      }
    })

    return newRecords
  }

  function updateSalaryRecord(id: string, updates: Partial<SalaryRecord>) {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        ...updates
      }
      return records.value[index]
    }
    return null
  }

  function deleteSalaryRecord(id: string) {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    records,
    selectedMonth,
    employeeFilter,
    departmentFilter,
    filteredRecords,
    months,
    departments,
    totalSalary,
    totalGrossSalary,
    totalDeduction,
    setSelectedMonth,
    setEmployeeFilter,
    setDepartmentFilter,
    getRecordById,
    getRecordsByMonth,
    getRecordsByEmployeeId,
    createSalaryRecord,
    addSalaryRecord,
    batchGenerateByTemplate,
    batchGenerateByDepartments,
    batchGenerateAllActive,
    updateSalaryRecord,
    deleteSalaryRecord
  }
})
