import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SalaryTemplate, TemplateType, SalaryRecord } from '@/types'
import { mockSalaryTemplates } from '@/mock/data'

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
): Omit<SalaryRecord, 'id' | 'employeeId' | 'employeeName' | 'department' | 'position' | 'month' | 'templateId' | 'templateName'> {
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

export const useSalaryTemplateStore = defineStore('salaryTemplate', () => {
  const templates = ref<SalaryTemplate[]>([...mockSalaryTemplates])
  const keywordFilter = ref('')
  const typeFilter = ref<TemplateType | ''>('')
  const statusFilter = ref<SalaryTemplate['status'] | ''>('')

  const activeTemplates = computed(() => templates.value.filter(t => t.status === 'active'))

  const filteredTemplates = computed(() => {
    return templates.value.filter(t => {
      const matchKeyword = !keywordFilter.value ||
        t.name.includes(keywordFilter.value) ||
        (t.description && t.description.includes(keywordFilter.value))
      const matchType = !typeFilter.value || t.type === typeFilter.value
      const matchStatus = !statusFilter.value || t.status === statusFilter.value
      return matchKeyword && matchType && matchStatus
    })
  })

  const defaultTemplate = computed(() => templates.value.find(t => t.isDefault))

  function getTemplateById(id: string): SalaryTemplate | undefined {
    return templates.value.find(t => t.id === id)
  }

  function getTemplateForEmployee(employee: { department: string; position: string }): SalaryTemplate | undefined {
    let match = templates.value.find(t =>
      t.status === 'active' &&
      t.applicableDepartment === employee.department &&
      t.applicablePosition === employee.position
    )
    if (match) return match

    match = templates.value.find(t =>
      t.status === 'active' &&
      t.applicableDepartment === employee.department
    )
    if (match) return match

    return defaultTemplate.value
  }

  function calculateSalary(
    template: SalaryTemplate,
    performanceMultiplier: number = 1.0
  ) {
    return calculateSalaryFromTemplate(template, performanceMultiplier)
  }

  function addTemplate(template: Omit<SalaryTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) {
    const now = new Date().toISOString().split('T')[0]
    const newTemplate: SalaryTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      createdBy: '当前用户'
    }
    if (newTemplate.isDefault) {
      templates.value.forEach(t => { t.isDefault = false })
    }
    templates.value.unshift(newTemplate)
    return newTemplate
  }

  function updateTemplate(id: string, updates: Partial<SalaryTemplate>) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      if (updates.isDefault) {
        templates.value.forEach(t => { t.isDefault = false })
      }
      templates.value[index] = {
        ...templates.value[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      return templates.value[index]
    }
    return null
  }

  function copyTemplate(id: string): SalaryTemplate | null {
    const template = getTemplateById(id)
    if (template) {
      return addTemplate({
        ...template,
        name: `${template.name} - 副本`,
        isDefault: false,
        status: 'inactive'
      })
    }
    return null
  }

  function deleteTemplate(id: string) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      templates.value.splice(index, 1)
      return true
    }
    return false
  }

  function setKeywordFilter(keyword: string) {
    keywordFilter.value = keyword
  }

  function setTypeFilter(type: TemplateType | '') {
    typeFilter.value = type
  }

  function setStatusFilter(status: SalaryTemplate['status'] | '') {
    statusFilter.value = status
  }

  return {
    templates,
    activeTemplates,
    filteredTemplates,
    defaultTemplate,
    keywordFilter,
    typeFilter,
    statusFilter,
    getTemplateById,
    getTemplateForEmployee,
    calculateSalary,
    addTemplate,
    updateTemplate,
    copyTemplate,
    deleteTemplate,
    setKeywordFilter,
    setTypeFilter,
    setStatusFilter
  }
})
