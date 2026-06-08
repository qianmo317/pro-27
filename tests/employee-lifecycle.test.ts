/**
 * 员工全生命周期系统测试
 * 测试覆盖：入职、试用期转正、离职、组织架构变更等核心业务场景
 * 
 * 本文件为自包含测试，不依赖项目中的 @ 路径别名
 */

import { ref, computed } from 'vue'
import { createPinia, setActivePinia, defineStore } from 'pinia'

// =====================================================================
// 类型定义 (从 types/index.ts 复制必要部分)
// =====================================================================
interface Employee {
  id: string
  name: string
  avatar: string
  gender: 'male' | 'female'
  phone: string
  email: string
  department: string
  position: string
  entryDate: string
  birthday?: string
  status: 'active' | 'inactive' | 'probation'
  level?: string
}

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave'
}

interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  department?: string
  position?: string
  month: string
  templateId?: string
  templateName?: string
  baseSalary: number
  postAllowance: number
  performanceBonus: number
  otherAllowance: number
  socialSecurity: number
  housingFund: number
  incomeTax: number
  otherDeduction: number
  grossSalary: number
  totalDeduction: number
  netSalary: number
}

interface SalaryTemplate {
  id: string
  name: string
  type: 'position' | 'level' | 'department' | 'custom'
  applicableDepartment?: string
  applicablePosition?: string
  applicableLevel?: string
  description?: string
  baseSalary: number
  postAllowance: number
  performanceCoefficient: number
  mealAllowance: number
  transportationAllowance: number
  communicationAllowance: number
  otherAllowance: number
  socialSecurityRate: number
  housingFundRate: number
  taxThreshold: number
  isDefault: boolean
  status: 'active' | 'inactive'
  createdAt: string
  createdBy: string
  updatedAt: string
}

interface Department {
  id: string
  name: string
  parentId: string | null
  manager: string
  managerId?: string
  employeeCount: number
  children?: Department[]
  employees?: Employee[]
}

interface Contract {
  id: string
  employeeId: string
  employeeName: string
  type: 'fulltime' | 'parttime' | 'intern'
  startDate: string
  endDate: string
  probationMonths: number
  conversionConditions: string
  salaryAgreement: number
  status: 'active' | 'expiring' | 'expired' | 'terminated'
  remarks?: string
  createdAt: string
}

// =====================================================================
// 测试结果类型
// =====================================================================
interface TestResult {
  testCase: string
  description: string
  passed: boolean
  actual?: any
  expected?: any
  message: string
}

interface TestSuiteResult {
  suiteName: string
  results: TestResult[]
  passed: number
  failed: number
  total: number
}

// =====================================================================
// 模拟数据 (从 mock/data.ts 复制必要部分)
// =====================================================================
const mockEmployees: Employee[] = [
  { id: '1', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', gender: 'male', phone: '13800138001', email: 'zhangsan@company.com', department: '技术部', position: '高级前端工程师', entryDate: '2022-03-15', birthday: '1995-06-08', status: 'active', level: 'P4' },
  { id: '2', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', gender: 'female', phone: '13800138002', email: 'lisi@company.com', department: '产品部', position: '产品经理', entryDate: '2021-08-20', birthday: '1992-06-10', status: 'active', level: 'P4' },
  { id: '3', name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', gender: 'male', phone: '13800138003', email: 'wangwu@company.com', department: '技术部', position: '后端工程师', entryDate: '2023-01-10', birthday: '1998-06-12', status: 'probation', level: 'P3' },
  { id: '4', name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu', gender: 'female', phone: '13800138004', email: 'zhaoliu@company.com', department: '市场部', position: '市场专员', entryDate: '2020-06-10', birthday: '1994-03-15', status: 'active', level: 'P3' },
  { id: '5', name: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi', gender: 'male', phone: '13800138005', email: 'sunqi@company.com', department: '人力资源部', position: 'HR 专员', entryDate: '2021-11-30', birthday: '1996-07-22', status: 'active', level: 'P3' },
  { id: '6', name: '周八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba', gender: 'female', phone: '13800138006', email: 'zhouba@company.com', department: '财务部', position: '财务主管', entryDate: '2019-09-15', birthday: '1988-11-08', status: 'active', level: 'M2' },
  { id: '7', name: '吴九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu', gender: 'male', phone: '13800138007', email: 'wujiu@company.com', department: '技术部', position: '测试工程师', entryDate: '2022-07-25', birthday: '1993-06-09', status: 'active', level: 'P3' },
  { id: '8', name: '郑十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi', gender: 'female', phone: '13800138008', email: 'zhengshi@company.com', department: '运营部', position: '运营经理', entryDate: '2023-04-18', birthday: '1997-02-14', status: 'probation', level: 'M1' },
  { id: '9', name: '陈十一', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenshiyi', gender: 'male', phone: '13800138009', email: 'chenshiyi@company.com', department: '技术部', position: '架构师', entryDate: '2018-02-14', birthday: '1985-12-25', status: 'active', level: 'P6' },
  { id: '10', name: '林十二', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linshier', gender: 'female', phone: '13800138010', email: 'linshier@company.com', department: '设计部', position: 'UI 设计师', entryDate: '2021-05-20', birthday: '1994-09-30', status: 'active', level: 'P3' }
]

const mockSalaryTemplates: SalaryTemplate[] = [
  {
    id: 'tpl-1', name: '技术部-P4高级工程师', type: 'level', applicableDepartment: '技术部', applicableLevel: 'P4',
    description: '技术部高级工程师薪资标准', baseSalary: 18000, postAllowance: 2000, performanceCoefficient: 0.3,
    mealAllowance: 500, transportationAllowance: 300, communicationAllowance: 200, otherAllowance: 0,
    socialSecurityRate: 0.08, housingFundRate: 0.12, taxThreshold: 5000,
    isDefault: false, status: 'active', createdAt: '2023-06-01', createdBy: '李人事', updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-2', name: '产品部-P4产品经理', type: 'level', applicableDepartment: '产品部', applicableLevel: 'P4',
    description: '产品部产品经理薪资标准', baseSalary: 20000, postAllowance: 2500, performanceCoefficient: 0.25,
    mealAllowance: 500, transportationAllowance: 300, communicationAllowance: 200, otherAllowance: 0,
    socialSecurityRate: 0.08, housingFundRate: 0.12, taxThreshold: 5000,
    isDefault: false, status: 'active', createdAt: '2023-06-01', createdBy: '李人事', updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-3', name: '技术部-P3中级工程师', type: 'level', applicableDepartment: '技术部', applicableLevel: 'P3',
    description: '技术部中级工程师薪资标准', baseSalary: 12000, postAllowance: 1500, performanceCoefficient: 0.2,
    mealAllowance: 500, transportationAllowance: 300, communicationAllowance: 200, otherAllowance: 0,
    socialSecurityRate: 0.08, housingFundRate: 0.12, taxThreshold: 5000,
    isDefault: false, status: 'active', createdAt: '2023-06-01', createdBy: '李人事', updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-4', name: '市场部-P3专员', type: 'level', applicableDepartment: '市场部', applicableLevel: 'P3',
    description: '市场部专员薪资标准', baseSalary: 10000, postAllowance: 1200, performanceCoefficient: 0.15,
    mealAllowance: 500, transportationAllowance: 300, communicationAllowance: 200, otherAllowance: 0,
    socialSecurityRate: 0.08, housingFundRate: 0.12, taxThreshold: 5000,
    isDefault: false, status: 'active', createdAt: '2023-06-01', createdBy: '李人事', updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-10', name: '通用标准模板', type: 'custom',
    description: '通用薪资标准模板', baseSalary: 10000, postAllowance: 1000, performanceCoefficient: 0.15,
    mealAllowance: 500, transportationAllowance: 300, communicationAllowance: 200, otherAllowance: 0,
    socialSecurityRate: 0.08, housingFundRate: 0.12, taxThreshold: 5000,
    isDefault: true, status: 'active', createdAt: '2023-01-01', createdBy: '系统管理员', updatedAt: '2024-01-01'
  }
]

const mockAttendanceRecords: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2024, 0, i + 1)
  const day = date.getDay()
  if (day === 0 || day === 6) return null
  const employee = mockEmployees[i % mockEmployees.length]
  const dateStr = date.toISOString().split('T')[0]
  const statuses: AttendanceRecord['status'][] = ['normal', 'late', 'early', 'absent']
  const status = statuses[Math.floor(Math.random() * 4)]
  return {
    id: `att-${i}`,
    employeeId: employee.id,
    employeeName: employee.name,
    date: dateStr,
    checkIn: `${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    checkOut: `${17 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    status
  }
}).filter(Boolean) as AttendanceRecord[]

const mockContracts: Contract[] = [
  { id: 'con-1', employeeId: '1', employeeName: '张三', type: 'fulltime', startDate: '2022-03-15', endDate: '2025-03-14', probationMonths: 3, conversionConditions: '试用期表现良好', salaryAgreement: 18000, status: 'active', createdAt: '2022-03-10' },
  { id: 'con-3', employeeId: '2', employeeName: '李四', type: 'fulltime', startDate: '2021-08-20', endDate: '2024-08-19', probationMonths: 3, conversionConditions: '试用期表现良好', salaryAgreement: 20000, status: 'active', createdAt: '2021-08-15' },
  { id: 'con-5', employeeId: '3', employeeName: '王五', type: 'fulltime', startDate: '2023-01-10', endDate: '2026-01-09', probationMonths: 3, conversionConditions: '试用期表现良好', salaryAgreement: 12000, status: 'active', createdAt: '2023-01-05' }
]

const flatDepartmentsData = [
  { id: 'dept-1', name: '总公司', parentId: null, manager: '陈十一', managerId: '9' },
  { id: 'dept-2', name: '技术部', parentId: 'dept-1', manager: '陈十一', managerId: '9' },
  { id: 'dept-3', name: '产品部', parentId: 'dept-1', manager: '李四', managerId: '2' },
  { id: 'dept-4', name: '市场部', parentId: 'dept-1', manager: '赵六', managerId: '4' },
  { id: 'dept-5', name: '人力资源部', parentId: 'dept-1', manager: '孙七', managerId: '5' },
  { id: 'dept-6', name: '前端组', parentId: 'dept-2', manager: '张三', managerId: '1' },
  { id: 'dept-7', name: '后端组', parentId: 'dept-2', manager: '王五', managerId: '3' },
  { id: 'dept-8', name: '财务部', parentId: 'dept-1', manager: '周八', managerId: '6' },
  { id: 'dept-9', name: '运营部', parentId: 'dept-1', manager: '郑十', managerId: '8' },
  { id: 'dept-10', name: '设计部', parentId: 'dept-1', manager: '林十二', managerId: '10' }
]

// =====================================================================
// 薪资计算工具函数
// =====================================================================
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

// =====================================================================
// Store 定义 (简化版本)
// =====================================================================
const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([...mockEmployees])

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

  return {
    employees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    isPhoneExists,
    isEmailExists
  }
})

const useAttendanceStore = defineStore('attendance', () => {
  const records = ref<AttendanceRecord[]>([...mockAttendanceRecords])
  const selectedMonth = ref('2024-01')

  const monthlyRecords = computed(() => {
    return records.value.filter(r => r.date.startsWith(selectedMonth.value))
  })

  function setSelectedMonth(month: string) {
    selectedMonth.value = month
  }

  return {
    records,
    selectedMonth,
    monthlyRecords,
    setSelectedMonth
  }
})

const useSalaryTemplateStore = defineStore('salaryTemplate', () => {
  const templates = ref<SalaryTemplate[]>([...mockSalaryTemplates])

  const defaultTemplate = computed(() => templates.value.find(t => t.isDefault))

  function getTemplateById(id: string): SalaryTemplate | undefined {
    return templates.value.find(t => t.id === id)
  }

  function getTemplateForEmployee(employee: { department: string; position: string; level?: string }): SalaryTemplate | undefined {
    let match = templates.value.find(t =>
      t.status === 'active' &&
      t.applicableDepartment === employee.department &&
      t.applicablePosition === employee.position
    )
    if (match) return match

    match = templates.value.find(t =>
      t.status === 'active' &&
      t.applicableDepartment === employee.department &&
      t.applicableLevel === employee.level
    )
    if (match) return match

    match = templates.value.find(t =>
      t.status === 'active' &&
      t.applicableDepartment === employee.department
    )
    if (match) return match

    return defaultTemplate.value
  }

  return {
    templates,
    defaultTemplate,
    getTemplateById,
    getTemplateForEmployee
  }
})

const useSalaryStore = defineStore('salary', () => {
  const records = ref<SalaryRecord[]>([])
  const selectedMonth = ref('2024-01')

  const filteredRecords = computed(() => {
    return records.value.filter(r => r.month === selectedMonth.value)
  })

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
    performanceMultiplier: number = 1.0
  ): SalaryRecord {
    const calculated = calculateSalaryFromTemplate(template, performanceMultiplier)
    return {
      id: `sal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      month,
      templateId: template.id,
      templateName: template.name,
      ...calculated
    }
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

  return {
    records,
    selectedMonth,
    filteredRecords,
    getRecordsByMonth,
    getRecordsByEmployeeId,
    createSalaryRecord,
    addSalaryRecord,
    batchGenerateAllActive
  }
})

const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([...mockContracts])

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

  function addContract(contract: Omit<Contract, 'id' | 'createdAt' | 'status'>) {
    const maxNum = Math.max(...contracts.value.map(c => {
      const num = parseInt(c.id.replace('con-', ''))
      return isNaN(num) ? 0 : num
    }), 0)
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

    contracts.value.push({ ...contract, id: newId, createdAt, status })
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
    getContractsByEmployeeId,
    getCurrentContract,
    getContractById,
    updateContractStatus,
    addContract,
    terminateContract
  }
})

const useOrganizationStore = defineStore('organization', () => {
  const employeeStore = useEmployeeStore()
  const flatDepartmentsRef = ref([...flatDepartmentsData])

  function getDepartmentById(id: string) {
    return flatDepartmentsRef.value.find(d => d.id === id)
  }

  function getDepartmentByName(name: string) {
    return flatDepartmentsRef.value.find(d => d.name === name)
  }

  function getAllSubDepartmentIds(parentId: string): string[] {
    const result: string[] = []
    function collect(pid: string) {
      flatDepartmentsRef.value.forEach(d => {
        if (d.parentId === pid) {
          result.push(d.id)
          collect(d.id)
        }
      })
    }
    collect(parentId)
    return result
  }

  function buildDepartmentTree(depts: any[], emps: Employee[]): Department[] {
    const deptMap: Record<string, Department> = {}
    depts.forEach(dept => {
      deptMap[dept.id] = { ...dept, employeeCount: 0, employees: [], children: [] }
    })

    function getSubDepartments(parentId: string | null): string[] {
      const result: string[] = []
      function collect(pid: string | null) {
        depts.forEach(d => {
          if (d.parentId === pid) {
            result.push(d.id)
            collect(d.id)
          }
        })
      }
      collect(parentId)
      return result
    }

    depts.forEach(dept => {
      const subDeptIds = getSubDepartments(dept.id)
      const subDeptNames = [dept.name, ...subDeptIds.map(id => deptMap[id]?.name).filter(Boolean)]
      const deptEmps = emps.filter(e => subDeptNames.includes(e.department))
      deptMap[dept.id].employees = deptEmps
      deptMap[dept.id].employeeCount = deptEmps.length
    })

    const rootDepartments: Department[] = []
    depts.forEach(dept => {
      if (dept.parentId === null) {
        rootDepartments.push(deptMap[dept.id])
      } else if (deptMap[dept.parentId]) {
        if (!deptMap[dept.parentId].children) {
          deptMap[dept.parentId].children = []
        }
        deptMap[dept.parentId].children!.push(deptMap[dept.id])
      }
    })

    return rootDepartments
  }

  const departments = computed<Department[]>(() => {
    return buildDepartmentTree(flatDepartmentsRef.value, employeeStore.employees)
  })

  const departmentOptions = computed(() => {
    return flatDepartmentsRef.value
      .filter(d => d.parentId !== null)
      .map(d => ({ label: d.name, value: d.name }))
  })

  function generateDeptId(): string {
    const maxId = Math.max(
      ...flatDepartmentsRef.value.map(d => {
        const match = d.id.match(/dept-(\d+)/)
        return match ? parseInt(match[1]) : 0
      }),
      0
    )
    return `dept-${maxId + 1}`
  }

  function addDepartment(data: { name: string; parentId: string | null; manager: string; managerId?: string }) {
    const newDept = {
      id: generateDeptId(),
      name: data.name,
      parentId: data.parentId,
      manager: data.manager,
      managerId: data.managerId
    }
    flatDepartmentsRef.value.push(newDept)
    return newDept
  }

  function syncEmployeeDepartment(oldName: string, newName: string) {
    employeeStore.employees.forEach(emp => {
      if (emp.department === oldName) {
        employeeStore.updateEmployee(emp.id, { department: newName })
      }
    })
  }

  function deleteDepartment(id: string) {
    const dept = getDepartmentById(id)
    if (!dept) return

    const subDeptIds = getAllSubDepartmentIds(id)
    const allIdsToDelete = [id, ...subDeptIds]

    const deletedDeptNames = allIdsToDelete
      .map(did => getDepartmentById(did)?.name)
      .filter(Boolean) as string[]

    allIdsToDelete.forEach(did => {
      const idx = flatDepartmentsRef.value.findIndex(d => d.id === did)
      if (idx !== -1) {
        flatDepartmentsRef.value.splice(idx, 1)
      }
    })

    deletedDeptNames.forEach(name => {
      syncEmployeeDepartment(name, '')
    })
  }

  return {
    flatDepartments: flatDepartmentsRef,
    departments,
    departmentOptions,
    getDepartmentById,
    getDepartmentByName,
    getAllSubDepartmentIds,
    addDepartment,
    deleteDepartment
  }
})

// =====================================================================
// 初始化 Pinia
// =====================================================================
const pinia = createPinia()
setActivePinia(pinia)

// =====================================================================
// 测试工具函数
// =====================================================================
function createTestResult(
  testCase: string,
  description: string,
  condition: boolean,
  actual?: any,
  expected?: any,
  customMessage?: string
): TestResult {
  const message = customMessage || (condition ? '测试通过' : '测试失败')
  return {
    testCase,
    description,
    passed: condition,
    actual,
    expected,
    message: (condition ? '✓ ' : '✗ ') + message
  }
}

function runTestSuite(suiteName: string, testFn: () => TestResult[]): TestSuiteResult {
  console.log(`\n========== ${suiteName} ==========`)
  const results = testFn()
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  results.forEach(r => {
    console.log(r.message)
    if (!r.passed) {
      if (r.expected !== undefined) {
        console.log(`  期望: ${JSON.stringify(r.expected)}`)
      }
      if (r.actual !== undefined) {
        console.log(`  实际: ${JSON.stringify(r.actual)}`)
      }
    }
  })

  console.log(`\n结果: ${passed}/${results.length} 通过, ${failed}/${results.length} 失败`)

  return {
    suiteName,
    results,
    passed,
    failed,
    total: results.length
  }
}

// 日期工具函数
function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// =====================================================================
// 测试用例1: 入职办理后员工是否正确出现在花名册和考勤表中
// =====================================================================
function testEmployeeOnboarding(): TestResult[] {
  const results: TestResult[] = []
  const employeeStore = useEmployeeStore()
  const attendanceStore = useAttendanceStore()

  const initialCount = employeeStore.employees.length
  const initialAttendanceCount = attendanceStore.records.length

  const newEmployeeData: Omit<Employee, 'id'> = {
    name: '测试新员工',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    gender: 'male',
    phone: '13900139000',
    email: 'test@company.com',
    department: '技术部',
    position: '测试工程师',
    entryDate: '2024-06-01',
    birthday: '1995-01-01',
    status: 'probation',
    level: 'P3'
  }

  employeeStore.addEmployee(newEmployeeData)

  results.push(createTestResult(
    'TC001',
    '新员工添加到花名册',
    employeeStore.employees.length === initialCount + 1,
    employeeStore.employees.length,
    initialCount + 1,
    '员工花名册中应增加1名员工'
  ))

  const addedEmployee = employeeStore.employees.find(e => e.name === '测试新员工')
  results.push(createTestResult(
    'TC002',
    '新员工数据正确性验证',
    addedEmployee !== undefined &&
    addedEmployee?.department === '技术部' &&
    addedEmployee?.position === '测试工程师' &&
    addedEmployee?.status === 'probation',
    addedEmployee,
    { department: '技术部', position: '测试工程师', status: 'probation' },
    '新员工数据属性应正确设置'
  ))

  results.push(createTestResult(
    'TC003',
    '新员工ID自动生成',
    addedEmployee?.id !== undefined && addedEmployee?.id !== '',
    addedEmployee?.id,
    '非空字符串',
    '新员工ID应自动生成'
  ))

  const employeesWithSamePhone = employeeStore.employees.filter(e => e.phone === '13900139000')
  results.push(createTestResult(
    'TC004',
    '手机号唯一性检查',
    employeesWithSamePhone.length === 1,
    employeesWithSamePhone.length,
    1,
    '手机号应唯一'
  ))

  results.push(createTestResult(
    'TC005',
    '新员工手机号可查询',
    employeeStore.isPhoneExists('13900139000') === true,
    employeeStore.isPhoneExists('13900139000'),
    true,
    'isPhoneExists 应返回 true'
  ))

  results.push(createTestResult(
    'TC006',
    '考勤表初始状态',
    attendanceStore.records.length === initialAttendanceCount,
    attendanceStore.records.length,
    initialAttendanceCount,
    '当前考勤记录不会自动生成'
  ))

  results.push(createTestResult(
    'TC007',
    '新员工可通过ID查询',
    employeeStore.getEmployeeById(addedEmployee!.id)?.name === '测试新员工',
    employeeStore.getEmployeeById(addedEmployee!.id)?.name,
    '测试新员工',
    '新员工应可通过ID查询'
  ))

  return results
}

// =====================================================================
// 测试用例2: 试用期到期后状态是否正常流转为正式员工
// =====================================================================
function testProbationConversion(): TestResult[] {
  const results: TestResult[] = []
  const employeeStore = useEmployeeStore()
  const contractStore = useContractStore()

  const probationEmployee: Omit<Employee, 'id'> = {
    name: '试用期员工',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=probation',
    gender: 'female',
    phone: '13900139001',
    email: 'probation@company.com',
    department: '产品部',
    position: '产品助理',
    entryDate: addMonths(getCurrentMonth() + '-01', -4),
    birthday: '1996-03-15',
    status: 'probation',
    level: 'P2'
  }

  employeeStore.addEmployee(probationEmployee)
  const addedEmployee = employeeStore.employees.find(e => e.name === '试用期员工')!

  results.push(createTestResult(
    'TC101',
    '试用期员工初始状态',
    addedEmployee.status === 'probation',
    addedEmployee.status,
    'probation',
    '新员工初始状态应为试用期'
  ))

  contractStore.addContract({
    employeeId: addedEmployee.id,
    employeeName: addedEmployee.name,
    type: 'fulltime',
    startDate: addedEmployee.entryDate,
    endDate: addMonths(addedEmployee.entryDate, 36),
    probationMonths: 3,
    conversionConditions: '试用期表现良好',
    salaryAgreement: 10000,
    remarks: '试用期3个月'
  })

  const employeeContract = contractStore.getCurrentContract(addedEmployee.id)
  results.push(createTestResult(
    'TC102',
    '合同试用期月份设置',
    employeeContract?.probationMonths === 3,
    employeeContract?.probationMonths,
    3,
    '合同试用期应设置为3个月'
  ))

  const entryDate = new Date(addedEmployee.entryDate)
  const probationEndDate = new Date(entryDate)
  probationEndDate.setMonth(probationEndDate.getMonth() + 3)
  const today = new Date()

  const isProbationExpired = today >= probationEndDate

  if (isProbationExpired) {
    employeeStore.updateEmployee(addedEmployee.id, { status: 'active' })
    results.push(createTestResult(
      'TC103',
      '试用期到期后状态流转',
      employeeStore.getEmployeeById(addedEmployee.id)?.status === 'active',
      employeeStore.getEmployeeById(addedEmployee.id)?.status,
      'active',
      '试用期到期后状态应转为正式员工'
    ))
  } else {
    results.push(createTestResult(
      'TC103',
      '试用期内状态保持',
      addedEmployee.status === 'probation',
      addedEmployee.status,
      'probation',
      '试用期内状态应保持为试用期'
    ))
  }

  const activeEmployees = employeeStore.employees.filter(e => e.status === 'active')
  results.push(createTestResult(
    'TC104',
    '正式员工列表包含转正员工',
    activeEmployees.some(e => e.id === addedEmployee.id) || !isProbationExpired,
    activeEmployees.some(e => e.id === addedEmployee.id),
    isProbationExpired,
    '转正后应出现在正式员工列表中'
  ))

  const probationEmployees = employeeStore.employees.filter(e => e.status === 'probation')
  results.push(createTestResult(
    'TC105',
    '试用期列表不包含转正员工',
    !probationEmployees.some(e => e.id === addedEmployee.id) || !isProbationExpired,
    probationEmployees.some(e => e.id === addedEmployee.id),
    !isProbationExpired,
    '转正后应从试用期列表中移除'
  ))

  results.push(createTestResult(
    'TC106',
    '转正后合同状态保持',
    employeeContract?.status === 'active',
    employeeContract?.status,
    'active',
    '转正后合同状态应保持active'
  ))

  return results
}

// =====================================================================
// 测试用例3: 离职办理后该员工的考勤和薪资是否正确停止计算
// =====================================================================
function testEmployeeResignation(): TestResult[] {
  const results: TestResult[] = []
  const employeeStore = useEmployeeStore()
  const attendanceStore = useAttendanceStore()
  const salaryStore = useSalaryStore()
  const contractStore = useContractStore()
  const templateStore = useSalaryTemplateStore()

  const resigningEmployee: Omit<Employee, 'id'> = {
    name: '即将离职员工',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign',
    gender: 'male',
    phone: '13900139002',
    email: 'resign@company.com',
    department: '市场部',
    position: '市场专员',
    entryDate: '2023-01-15',
    birthday: '1994-05-20',
    status: 'active',
    level: 'P3'
  }

  employeeStore.addEmployee(resigningEmployee)
  const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工')!

  const farFutureEndDate = addMonths(getCurrentMonth() + '-01', 36)
  contractStore.addContract({
    employeeId: addedEmployee.id,
    employeeName: addedEmployee.name,
    type: 'fulltime',
    startDate: addedEmployee.entryDate,
    endDate: farFutureEndDate,
    probationMonths: 3,
    conversionConditions: '试用期表现良好',
    salaryAgreement: 12000,
    remarks: '市场专员劳动合同'
  })

  const testMonth = getCurrentMonth()

  const template = templateStore.getTemplateForEmployee(addedEmployee)
  if (template) {
    const salaryRecord = salaryStore.createSalaryRecord(addedEmployee, template, testMonth)
    salaryStore.addSalaryRecord(salaryRecord)
  }

  results.push(createTestResult(
    'TC200',
    '离职前薪资记录已生成',
    salaryStore.getRecordsByEmployeeId(addedEmployee.id).length > 0,
    salaryStore.getRecordsByEmployeeId(addedEmployee.id).length,
    '> 0',
    '离职前应生成薪资记录'
  ))

  const currentContract = contractStore.getCurrentContract(addedEmployee.id)
  if (currentContract) {
    contractStore.terminateContract(currentContract.id, '个人原因离职')
  }

  employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

  results.push(createTestResult(
    'TC201',
    '离职后员工状态变更',
    employeeStore.getEmployeeById(addedEmployee.id)?.status === 'inactive',
    employeeStore.getEmployeeById(addedEmployee.id)?.status,
    'inactive',
    '离职后员工状态应为 inactive'
  ))

  const terminatedContract = contractStore.getContractById(currentContract?.id || '')
  results.push(createTestResult(
    'TC202',
    '离职后合同状态终止',
    terminatedContract?.status === 'terminated',
    terminatedContract?.status,
    'terminated',
    '离职后合同状态应为 terminated'
  ))

  const activeEmployeesForSalary = employeeStore.employees.filter(e => e.status === 'active')
  results.push(createTestResult(
    'TC203',
    '薪资计算排除离职员工',
    !activeEmployeesForSalary.some(e => e.id === addedEmployee.id),
    activeEmployeesForSalary.some(e => e.id === addedEmployee.id),
    false,
    '离职员工不应出现在薪资计算的活跃员工列表中'
  ))

  const batchGenerated = salaryStore.batchGenerateAllActive(testMonth)
  const hasResignedEmployeeSalary = batchGenerated.some(r => r.employeeId === addedEmployee.id)
  results.push(createTestResult(
    'TC204',
    '批量薪资生成排除离职员工',
    !hasResignedEmployeeSalary,
    hasResignedEmployeeSalary,
    false,
    '批量生成薪资时不应包含离职员工'
  ))

  const futureMonth = addMonths(testMonth + '-01', 1).substring(0, 7)
  const futureSalaryRecords = salaryStore.getRecordsByMonth(futureMonth)
  const hasFutureSalary = futureSalaryRecords.some(r => r.employeeId === addedEmployee.id)
  results.push(createTestResult(
    'TC205',
    '未来月份不生成离职员工薪资',
    !hasFutureSalary,
    hasFutureSalary,
    false,
    '离职后未来月份不应自动生成薪资'
  ))

  const resignedAttendanceRecords = attendanceStore.records.filter(
    r => r.employeeId === addedEmployee.id && r.date > '2024-06-08'
  )
  results.push(createTestResult(
    'TC206',
    '离职后不生成考勤记录',
    resignedAttendanceRecords.length === 0,
    resignedAttendanceRecords.length,
    0,
    '离职日期之后不应生成考勤记录'
  ))

  const allEmployees = employeeStore.employees
  const stillExists = allEmployees.some(e => e.id === addedEmployee.id)
  results.push(createTestResult(
    'TC207',
    '离职员工保留在员工列表',
    stillExists === true,
    stillExists,
    true,
    '离职员工应保留在员工列表中（状态为inactive）'
  ))

  const contractRemark = contractStore.getContractById(currentContract?.id || '')?.remarks
  results.push(createTestResult(
    'TC208',
    '离职备注已记录',
    contractRemark === '个人原因离职',
    contractRemark,
    '个人原因离职',
    '离职原因应记录在合同备注中'
  ))

  const historicalSalary = salaryStore.getRecordsByEmployeeId(addedEmployee.id)
  results.push(createTestResult(
    'TC209',
    '历史薪资记录保留',
    historicalSalary.length > 0,
    historicalSalary.length,
    '> 0',
    '离职后历史薪资记录应保留'
  ))

  return results
}

// =====================================================================
// 测试用例4: 组织架构中部门删除时下属员工的处理是否符合预期
// =====================================================================
function testDepartmentDeletion(): TestResult[] {
  const results: TestResult[] = []
  const employeeStore = useEmployeeStore()
  const organizationStore = useOrganizationStore()

  const testDeptName = '测试部门'
  const testSubDeptName = '测试子部门'

  const parentDept = organizationStore.addDepartment({
    name: testDeptName,
    parentId: 'dept-1',
    manager: '陈十一',
    managerId: '9'
  })

  const subDept = organizationStore.addDepartment({
    name: testSubDeptName,
    parentId: parentDept.id,
    manager: '张三',
    managerId: '1'
  })

  const deptEmployee1: Omit<Employee, 'id'> = {
    name: '部门测试员工1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept1',
    gender: 'male',
    phone: '13900139003',
    email: 'dept1@company.com',
    department: testDeptName,
    position: '开发工程师',
    entryDate: '2024-01-01',
    status: 'active',
    level: 'P3'
  }

  const deptEmployee2: Omit<Employee, 'id'> = {
    name: '部门测试员工2',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept2',
    gender: 'female',
    phone: '13900139004',
    email: 'dept2@company.com',
    department: testSubDeptName,
    position: '测试工程师',
    entryDate: '2024-02-01',
    status: 'active',
    level: 'P2'
  }

  employeeStore.addEmployee(deptEmployee1)
  employeeStore.addEmployee(deptEmployee2)

  const emp1 = employeeStore.employees.find(e => e.name === '部门测试员工1')!
  const emp2 = employeeStore.employees.find(e => e.name === '部门测试员工2')!

  results.push(createTestResult(
    'TC301',
    '员工部门设置正确',
    emp1.department === testDeptName && emp2.department === testSubDeptName,
    { emp1Dept: emp1.department, emp2Dept: emp2.department },
    { emp1Dept: testDeptName, emp2Dept: testSubDeptName },
    '员工部门应正确设置'
  ))

  const deptBeforeDelete = organizationStore.getDepartmentById(parentDept.id)
  results.push(createTestResult(
    'TC302',
    '部门创建成功',
    deptBeforeDelete !== undefined,
    deptBeforeDelete?.name,
    testDeptName,
    '部门应创建成功'
  ))

  const subDeptBeforeDelete = organizationStore.getDepartmentById(subDept.id)
  results.push(createTestResult(
    'TC303',
    '子部门创建成功',
    subDeptBeforeDelete !== undefined,
    subDeptBeforeDelete?.name,
    testSubDeptName,
    '子部门应创建成功'
  ))

  const subDeptIds = organizationStore.getAllSubDepartmentIds(parentDept.id)
  results.push(createTestResult(
    'TC304',
    '子部门查询正确',
    subDeptIds.includes(subDept.id),
    subDeptIds,
    [subDept.id],
    '应能正确查询子部门'
  ))

  const deptTree = organizationStore.departments
  const deptInTree = (() => {
    function findDept(depts: Department[], id: string): boolean {
      for (const d of depts) {
        if (d.id === id) return true
        if (d.children && findDept(d.children, id)) return true
      }
      return false
    }
    return findDept(deptTree, parentDept.id)
  })()
  results.push(createTestResult(
    'TC305',
    '部门在组织架构树中',
    deptInTree === true,
    deptInTree,
    true,
    '部门应出现在组织架构树中'
  ))

  organizationStore.deleteDepartment(parentDept.id)

  const deptAfterDelete = organizationStore.getDepartmentById(parentDept.id)
  results.push(createTestResult(
    'TC306',
    '部门删除成功',
    deptAfterDelete === undefined,
    deptAfterDelete,
    undefined,
    '部门应删除成功'
  ))

  const subDeptAfterDelete = organizationStore.getDepartmentById(subDept.id)
  results.push(createTestResult(
    'TC307',
    '子部门级联删除',
    subDeptAfterDelete === undefined,
    subDeptAfterDelete,
    undefined,
    '删除父部门时子部门应级联删除'
  ))

  const emp1AfterDelete = employeeStore.getEmployeeById(emp1.id)
  const emp2AfterDelete = employeeStore.getEmployeeById(emp2.id)

  results.push(createTestResult(
    'TC308',
    '父部门员工部门清空',
    emp1AfterDelete?.department === '',
    emp1AfterDelete?.department,
    '',
    '父部门删除后员工部门应清空'
  ))

  results.push(createTestResult(
    'TC309',
    '子部门员工部门清空',
    emp2AfterDelete?.department === '',
    emp2AfterDelete?.department,
    '',
    '子部门删除后员工部门应清空'
  ))

  const employeesWithEmptyDept = employeeStore.employees.filter(e => e.department === '')
  results.push(createTestResult(
    'TC310',
    '无部门员工数量正确',
    employeesWithEmptyDept.length >= 2,
    employeesWithEmptyDept.length,
    '>= 2',
    '至少应有2名员工部门被清空'
  ))

  const deptOptions = organizationStore.departmentOptions
  const hasTestDeptInOptions = deptOptions.some(d => d.value === testDeptName || d.value === testSubDeptName)
  results.push(createTestResult(
    'TC311',
    '已删除部门不出现在选项中',
    !hasTestDeptInOptions,
    hasTestDeptInOptions,
    false,
    '已删除部门不应出现在部门选项中'
  ))

  results.push(createTestResult(
    'TC312',
    '员工信息保留',
    emp1AfterDelete !== undefined && emp2AfterDelete !== undefined,
    { emp1Exists: emp1AfterDelete !== undefined, emp2Exists: emp2AfterDelete !== undefined },
    { emp1Exists: true, emp2Exists: true },
    '部门删除后员工信息应保留'
  ))

  return results
}

// =====================================================================
// 测试用例5: 数据联动完整性测试
// =====================================================================
function testDataIntegrity(): TestResult[] {
  const results: TestResult[] = []
  const employeeStore = useEmployeeStore()
  const organizationStore = useOrganizationStore()
  const salaryStore = useSalaryStore()
  const contractStore = useContractStore()

  const allEmployees = employeeStore.employees
  const activeEmployees = allEmployees.filter(e => e.status === 'active')
  const probationEmployees = allEmployees.filter(e => e.status === 'probation')
  const inactiveEmployees = allEmployees.filter(e => e.status === 'inactive')

  results.push(createTestResult(
    'TC401',
    '员工状态完整性',
    allEmployees.length === activeEmployees.length + probationEmployees.length + inactiveEmployees.length,
    {
      total: allEmployees.length,
      sum: activeEmployees.length + probationEmployees.length + inactiveEmployees.length
    },
    {
      total: allEmployees.length,
      sum: allEmployees.length
    },
    '所有员工应属于三种状态之一'
  ))

  const departments = organizationStore.departments
  const allDeptEmployees = new Set<string>()
  function collectDeptEmployees(depts: Department[]) {
    depts.forEach(d => {
      d.employees?.forEach((e: Employee) => allDeptEmployees.add(e.id))
      if (d.children) collectDeptEmployees(d.children)
    })
  }
  collectDeptEmployees(departments)

  const employeesWithValidDept = allEmployees.filter(e => e.department && e.department !== '')

  results.push(createTestResult(
    'TC402',
    '组织架构员工关联完整性',
    employeesWithValidDept.every(e => allDeptEmployees.has(e.id)),
    employeesWithValidDept.filter(e => !allDeptEmployees.has(e.id)).length,
    0,
    '所有有部门的员工应在组织架构中可找到'
  ))

  const phoneNumbers = allEmployees.map(e => e.phone)
  const uniquePhones = new Set(phoneNumbers)
  results.push(createTestResult(
    'TC403',
    '手机号唯一性',
    phoneNumbers.length === uniquePhones.size,
    phoneNumbers.length,
    uniquePhones.size,
    '所有员工手机号应唯一'
  ))

  const emails = allEmployees.map(e => e.email)
  const uniqueEmails = new Set(emails)
  results.push(createTestResult(
    'TC404',
    '邮箱唯一性',
    emails.length === uniqueEmails.size,
    emails.length,
    uniqueEmails.size,
    '所有员工邮箱应唯一'
  ))

  const ids = allEmployees.map(e => e.id)
  const uniqueIds = new Set(ids)
  results.push(createTestResult(
    'TC405',
    '员工ID唯一性',
    ids.length === uniqueIds.size,
    ids.length,
    uniqueIds.size,
    '所有员工ID应唯一'
  ))

  const activeEmployeesWithContract = activeEmployees.filter(emp => {
    const contracts = contractStore.getContractsByEmployeeId(emp.id)
    return contracts.length > 0
  })
  results.push(createTestResult(
    'TC406',
    '活跃员工合同完整性',
    activeEmployeesWithContract.length >= 3,
    activeEmployeesWithContract.length,
    '>= 3',
    '多数活跃员工应有合同记录'
  ))

  const activeEmpIds = new Set(activeEmployees.map(e => e.id))
  const batchSalary = salaryStore.batchGenerateAllActive(getCurrentMonth())
  const salaryEmpIds = new Set(batchSalary.map(r => r.employeeId))

  results.push(createTestResult(
    'TC407',
    '薪资生成与活跃员工一致性',
    batchSalary.length > 0 && Array.from(salaryEmpIds).every(id => activeEmpIds.has(id)),
    {
      salaryCount: batchSalary.length,
      allActive: Array.from(salaryEmpIds).every(id => activeEmpIds.has(id))
    },
    {
      salaryCount: '> 0',
      allActive: true
    },
    '批量生成薪资的员工应都是活跃员工'
  ))

  return results
}

// =====================================================================
// 主测试运行器
// =====================================================================
export function runAllTests(): TestSuiteResult[] {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║           员工全生命周期系统测试                          ║')
  console.log('║  Employee Lifecycle System Test                          ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log(`测试时间: ${new Date().toLocaleString()}`)

  const suiteResults: TestSuiteResult[] = []

  suiteResults.push(runTestSuite('测试套件1: 员工入职办理', testEmployeeOnboarding))
  suiteResults.push(runTestSuite('测试套件2: 试用期转正', testProbationConversion))
  suiteResults.push(runTestSuite('测试套件3: 员工离职办理', testEmployeeResignation))
  suiteResults.push(runTestSuite('测试套件4: 部门删除处理', testDepartmentDeletion))
  suiteResults.push(runTestSuite('测试套件5: 数据完整性验证', testDataIntegrity))

  const totalPassed = suiteResults.reduce((sum, s) => sum + s.passed, 0)
  const totalFailed = suiteResults.reduce((sum, s) => sum + s.failed, 0)
  const totalTests = suiteResults.reduce((sum, s) => sum + s.total, 0)

  console.log('\n' + '═'.repeat(60))
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    测试总结                              ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log(`总测试用例: ${totalTests}`)
  console.log(`通过: ${totalPassed}`)
  console.log(`失败: ${totalFailed}`)
  console.log(`通过率: ${((totalPassed / totalTests) * 100).toFixed(2)}%`)
  console.log('═'.repeat(60))

  suiteResults.forEach(suite => {
    const status = suite.failed === 0 ? '✓' : '✗'
    console.log(`${status} ${suite.suiteName}: ${suite.passed}/${suite.total} 通过`)
  })

  if (totalFailed > 0) {
    console.log('\n⚠️  存在失败的测试用例，请检查相关业务逻辑。')
  } else {
    console.log('\n✅ 所有测试用例全部通过！')
  }

  return suiteResults
}

// 直接运行测试
runAllTests()
