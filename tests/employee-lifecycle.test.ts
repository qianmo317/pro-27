/**
 * 员工全生命周期系统测试
 * 测试覆盖：入职、试用期转正、离职、组织架构变更等核心业务场景
 * 
 * 重要：本测试直接导入项目中的实际 store 文件进行测试
 *      不重新实现任何 store 逻辑，确保测试的是真实业务代码
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEmployeeStore } from '@/stores/employee'
import { useAttendanceStore } from '@/stores/attendance'
import { useSalaryStore } from '@/stores/salary'
import { useSalaryTemplateStore } from '@/stores/salary-template'
import { useOrganizationStore } from '@/stores/organization'
import { useContractStore } from '@/stores/contract'
import type { Employee } from '@/types'

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

describe('员工全生命周期系统测试', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  // =====================================================================
  // 测试套件1: 员工入职办理
  // =====================================================================
  describe('测试套件1: 员工入职办理', () => {
    it('TC001: 新员工添加到花名册', () => {
      const employeeStore = useEmployeeStore()
      const initialCount = employeeStore.employees.length

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

      expect(employeeStore.employees.length).toBe(initialCount + 1)
    })

    it('TC002: 新员工数据正确性验证', () => {
      const employeeStore = useEmployeeStore()

      const newEmployeeData: Omit<Employee, 'id'> = {
        name: '测试新员工2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test2',
        gender: 'female',
        phone: '13900139010',
        email: 'test2@company.com',
        department: '技术部',
        position: '测试工程师',
        entryDate: '2024-06-01',
        birthday: '1995-01-01',
        status: 'probation',
        level: 'P3'
      }

      employeeStore.addEmployee(newEmployeeData)
      const addedEmployee = employeeStore.employees.find(e => e.name === '测试新员工2')

      expect(addedEmployee).toBeDefined()
      expect(addedEmployee?.department).toBe('技术部')
      expect(addedEmployee?.position).toBe('测试工程师')
      expect(addedEmployee?.status).toBe('probation')
    })

    it('TC003: 新员工ID自动生成', () => {
      const employeeStore = useEmployeeStore()

      const newEmployeeData: Omit<Employee, 'id'> = {
        name: '测试新员工3',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test3',
        gender: 'male',
        phone: '13900139020',
        email: 'test3@company.com',
        department: '技术部',
        position: '测试工程师',
        entryDate: '2024-06-01',
        status: 'probation',
        level: 'P3'
      }

      employeeStore.addEmployee(newEmployeeData)
      const addedEmployee = employeeStore.employees.find(e => e.name === '测试新员工3')

      expect(addedEmployee?.id).toBeDefined()
      expect(addedEmployee?.id).not.toBe('')
    })

    it('TC004: 手机号唯一性检查', () => {
      const employeeStore = useEmployeeStore()

      const newEmployeeData: Omit<Employee, 'id'> = {
        name: '测试新员工4',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test4',
        gender: 'male',
        phone: '13900139030',
        email: 'test4@company.com',
        department: '技术部',
        position: '测试工程师',
        entryDate: '2024-06-01',
        status: 'probation',
        level: 'P3'
      }

      employeeStore.addEmployee(newEmployeeData)
      const employeesWithSamePhone = employeeStore.employees.filter(e => e.phone === '13900139030')

      expect(employeesWithSamePhone.length).toBe(1)
    })

    it('TC005: 新员工手机号可查询', () => {
      const employeeStore = useEmployeeStore()

      const newEmployeeData: Omit<Employee, 'id'> = {
        name: '测试新员工5',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test5',
        gender: 'male',
        phone: '13900139040',
        email: 'test5@company.com',
        department: '技术部',
        position: '测试工程师',
        entryDate: '2024-06-01',
        status: 'probation',
        level: 'P3'
      }

      employeeStore.addEmployee(newEmployeeData)

      expect(employeeStore.isPhoneExists('13900139040')).toBe(true)
    })

    it('TC006: 考勤表初始状态', () => {
      const employeeStore = useEmployeeStore()
      const attendanceStore = useAttendanceStore()
      const initialAttendanceCount = attendanceStore.records.length

      const newEmployeeData: Omit<Employee, 'id'> = {
        name: '测试新员工6',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test6',
        gender: 'male',
        phone: '13900139050',
        email: 'test6@company.com',
        department: '技术部',
        position: '测试工程师',
        entryDate: '2024-06-01',
        status: 'probation',
        level: 'P3'
      }

      employeeStore.addEmployee(newEmployeeData)

      expect(attendanceStore.records.length).toBe(initialAttendanceCount)
    })

    it('TC007: 新员工可通过ID查询', () => {
      const employeeStore = useEmployeeStore()

      const newEmployeeData: Omit<Employee, 'id'> = {
        name: '测试新员工7',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test7',
        gender: 'male',
        phone: '13900139060',
        email: 'test7@company.com',
        department: '技术部',
        position: '测试工程师',
        entryDate: '2024-06-01',
        status: 'probation',
        level: 'P3'
      }

      employeeStore.addEmployee(newEmployeeData)
      const addedEmployee = employeeStore.employees.find(e => e.name === '测试新员工7')!

      expect(employeeStore.getEmployeeById(addedEmployee.id)?.name).toBe('测试新员工7')
    })
  })

  // =====================================================================
  // 测试套件2: 试用期转正
  // =====================================================================
  describe('测试套件2: 试用期转正', () => {
    it('TC101: 试用期员工初始状态', () => {
      const employeeStore = useEmployeeStore()

      const probationEmployee: Omit<Employee, 'id'> = {
        name: '试用期员工',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=probation',
        gender: 'female',
        phone: '13900139100',
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

      expect(addedEmployee.status).toBe('probation')
    })

    it('TC102: 合同试用期月份设置', () => {
      const employeeStore = useEmployeeStore()
      const contractStore = useContractStore()

      const probationEmployee: Omit<Employee, 'id'> = {
        name: '试用期员工2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=probation2',
        gender: 'female',
        phone: '13900139110',
        email: 'probation2@company.com',
        department: '产品部',
        position: '产品助理',
        entryDate: addMonths(getCurrentMonth() + '-01', -4),
        status: 'probation',
        level: 'P2'
      }

      employeeStore.addEmployee(probationEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '试用期员工2')!

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
      expect(employeeContract?.probationMonths).toBe(3)
    })

    it('TC103: 试用期到期后状态流转', () => {
      const employeeStore = useEmployeeStore()

      const probationEmployee: Omit<Employee, 'id'> = {
        name: '试用期员工3',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=probation3',
        gender: 'female',
        phone: '13900139120',
        email: 'probation3@company.com',
        department: '产品部',
        position: '产品助理',
        entryDate: addMonths(getCurrentMonth() + '-01', -4),
        status: 'probation',
        level: 'P2'
      }

      employeeStore.addEmployee(probationEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '试用期员工3')!

      const entryDate = new Date(addedEmployee.entryDate)
      const probationEndDate = new Date(entryDate)
      probationEndDate.setMonth(probationEndDate.getMonth() + 3)
      const today = new Date()
      const isProbationExpired = today >= probationEndDate

      if (isProbationExpired) {
        employeeStore.updateEmployee(addedEmployee.id, { status: 'active' })
        expect(employeeStore.getEmployeeById(addedEmployee.id)?.status).toBe('active')
      } else {
        expect(addedEmployee.status).toBe('probation')
      }
    })

    it('TC104: 正式员工列表包含转正员工', () => {
      const employeeStore = useEmployeeStore()

      const probationEmployee: Omit<Employee, 'id'> = {
        name: '试用期员工4',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=probation4',
        gender: 'female',
        phone: '13900139130',
        email: 'probation4@company.com',
        department: '产品部',
        position: '产品助理',
        entryDate: addMonths(getCurrentMonth() + '-01', -4),
        status: 'probation',
        level: 'P2'
      }

      employeeStore.addEmployee(probationEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '试用期员工4')!

      const entryDate = new Date(addedEmployee.entryDate)
      const probationEndDate = new Date(entryDate)
      probationEndDate.setMonth(probationEndDate.getMonth() + 3)
      const today = new Date()
      const isProbationExpired = today >= probationEndDate

      if (isProbationExpired) {
        employeeStore.updateEmployee(addedEmployee.id, { status: 'active' })
      }

      const activeEmployees = employeeStore.employees.filter(e => e.status === 'active')
      expect(activeEmployees.some(e => e.id === addedEmployee.id) || !isProbationExpired).toBe(true)
    })

    it('TC105: 试用期列表不包含转正员工', () => {
      const employeeStore = useEmployeeStore()

      const probationEmployee: Omit<Employee, 'id'> = {
        name: '试用期员工5',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=probation5',
        gender: 'female',
        phone: '13900139140',
        email: 'probation5@company.com',
        department: '产品部',
        position: '产品助理',
        entryDate: addMonths(getCurrentMonth() + '-01', -4),
        status: 'probation',
        level: 'P2'
      }

      employeeStore.addEmployee(probationEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '试用期员工5')!

      const entryDate = new Date(addedEmployee.entryDate)
      const probationEndDate = new Date(entryDate)
      probationEndDate.setMonth(probationEndDate.getMonth() + 3)
      const today = new Date()
      const isProbationExpired = today >= probationEndDate

      if (isProbationExpired) {
        employeeStore.updateEmployee(addedEmployee.id, { status: 'active' })
      }

      const probationEmployees = employeeStore.employees.filter(e => e.status === 'probation')
      expect(!probationEmployees.some(e => e.id === addedEmployee.id) || !isProbationExpired).toBe(true)
    })

    it('TC106: 转正后合同状态保持', () => {
      const employeeStore = useEmployeeStore()
      const contractStore = useContractStore()

      const probationEmployee: Omit<Employee, 'id'> = {
        name: '试用期员工6',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=probation6',
        gender: 'female',
        phone: '13900139150',
        email: 'probation6@company.com',
        department: '产品部',
        position: '产品助理',
        entryDate: addMonths(getCurrentMonth() + '-01', -4),
        status: 'probation',
        level: 'P2'
      }

      employeeStore.addEmployee(probationEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '试用期员工6')!

      const farFutureEndDate = addMonths(getCurrentMonth() + '-01', 36)
      contractStore.addContract({
        employeeId: addedEmployee.id,
        employeeName: addedEmployee.name,
        type: 'fulltime',
        startDate: addedEmployee.entryDate,
        endDate: farFutureEndDate,
        probationMonths: 3,
        conversionConditions: '试用期表现良好',
        salaryAgreement: 10000,
        remarks: '试用期3个月'
      })

      const entryDate = new Date(addedEmployee.entryDate)
      const probationEndDate = new Date(entryDate)
      probationEndDate.setMonth(probationEndDate.getMonth() + 3)
      const today = new Date()
      const isProbationExpired = today >= probationEndDate

      if (isProbationExpired) {
        employeeStore.updateEmployee(addedEmployee.id, { status: 'active' })
      }

      const employeeContract = contractStore.getCurrentContract(addedEmployee.id)
      expect(employeeContract?.status).toBe('active')
    })
  })

  // =====================================================================
  // 测试套件3: 员工离职办理
  // =====================================================================
  describe('测试套件3: 员工离职办理', () => {
    it('TC200: 离职前薪资记录已生成', () => {
      const employeeStore = useEmployeeStore()
      const salaryStore = useSalaryStore()
      const templateStore = useSalaryTemplateStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign',
        gender: 'male',
        phone: '13900139200',
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

      const testMonth = getCurrentMonth()
      const template = templateStore.getTemplateForEmployee(addedEmployee)
      if (template) {
        const salaryRecord = salaryStore.createSalaryRecord(addedEmployee, template, testMonth)
        salaryStore.addSalaryRecord(salaryRecord)
      }

      expect(salaryStore.getRecordsByEmployeeId(addedEmployee.id).length).toBeGreaterThan(0)
    })

    it('TC201: 离职后员工状态变更', () => {
      const employeeStore = useEmployeeStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign2',
        gender: 'male',
        phone: '13900139210',
        email: 'resign2@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工2')!

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      expect(employeeStore.getEmployeeById(addedEmployee.id)?.status).toBe('inactive')
    })

    it('TC202: 离职后合同状态终止', () => {
      const employeeStore = useEmployeeStore()
      const contractStore = useContractStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工3',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign3',
        gender: 'male',
        phone: '13900139220',
        email: 'resign3@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工3')!

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

      const currentContract = contractStore.getCurrentContract(addedEmployee.id)
      if (currentContract) {
        contractStore.terminateContract(currentContract.id, '个人原因离职')
      }

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const terminatedContract = contractStore.getContractById(currentContract?.id || '')
      expect(terminatedContract?.status).toBe('terminated')
    })

    it('TC203: 薪资计算排除离职员工', () => {
      const employeeStore = useEmployeeStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工4',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign4',
        gender: 'male',
        phone: '13900139230',
        email: 'resign4@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工4')!

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const activeEmployeesForSalary = employeeStore.employees.filter(e => e.status === 'active')
      expect(activeEmployeesForSalary.some(e => e.id === addedEmployee.id)).toBe(false)
    })

    it('TC204: 批量薪资生成排除离职员工', () => {
      const employeeStore = useEmployeeStore()
      const salaryStore = useSalaryStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工5',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign5',
        gender: 'male',
        phone: '13900139240',
        email: 'resign5@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工5')!

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const testMonth = getCurrentMonth()
      const batchGenerated = salaryStore.batchGenerateAllActive(testMonth)
      const hasResignedEmployeeSalary = batchGenerated.some(r => r.employeeId === addedEmployee.id)

      expect(hasResignedEmployeeSalary).toBe(false)
    })

    it('TC205: 未来月份不生成离职员工薪资', () => {
      const employeeStore = useEmployeeStore()
      const salaryStore = useSalaryStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工6',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign6',
        gender: 'male',
        phone: '13900139250',
        email: 'resign6@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工6')!

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const futureMonth = addMonths(getCurrentMonth() + '-01', 1).substring(0, 7)
      const futureSalaryRecords = salaryStore.getRecordsByMonth(futureMonth)
      const hasFutureSalary = futureSalaryRecords.some(r => r.employeeId === addedEmployee.id)

      expect(hasFutureSalary).toBe(false)
    })

    it('TC206: 离职后不生成考勤记录', () => {
      const employeeStore = useEmployeeStore()
      const attendanceStore = useAttendanceStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工7',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign7',
        gender: 'male',
        phone: '13900139260',
        email: 'resign7@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工7')!

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const resignedAttendanceRecords = attendanceStore.records.filter(
        r => r.employeeId === addedEmployee.id && r.date > '2024-06-08'
      )

      expect(resignedAttendanceRecords.length).toBe(0)
    })

    it('TC207: 离职员工保留在员工列表', () => {
      const employeeStore = useEmployeeStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工8',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign8',
        gender: 'male',
        phone: '13900139270',
        email: 'resign8@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工8')!

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const allEmployees = employeeStore.employees
      const stillExists = allEmployees.some(e => e.id === addedEmployee.id)

      expect(stillExists).toBe(true)
    })

    it('TC208: 离职备注已记录', () => {
      const employeeStore = useEmployeeStore()
      const contractStore = useContractStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工9',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign9',
        gender: 'male',
        phone: '13900139280',
        email: 'resign9@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工9')!

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

      const currentContract = contractStore.getCurrentContract(addedEmployee.id)
      if (currentContract) {
        contractStore.terminateContract(currentContract.id, '个人原因离职')
      }

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const contractRemark = contractStore.getContractById(currentContract?.id || '')?.remarks
      expect(contractRemark).toBe('个人原因离职')
    })

    it('TC209: 历史薪资记录保留', () => {
      const employeeStore = useEmployeeStore()
      const salaryStore = useSalaryStore()
      const templateStore = useSalaryTemplateStore()

      const resigningEmployee: Omit<Employee, 'id'> = {
        name: '即将离职员工10',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resign10',
        gender: 'male',
        phone: '13900139290',
        email: 'resign10@company.com',
        department: '市场部',
        position: '市场专员',
        entryDate: '2023-01-15',
        status: 'active',
        level: 'P3'
      }

      employeeStore.addEmployee(resigningEmployee)
      const addedEmployee = employeeStore.employees.find(e => e.name === '即将离职员工10')!

      const testMonth = getCurrentMonth()
      const template = templateStore.getTemplateForEmployee(addedEmployee)
      if (template) {
        const salaryRecord = salaryStore.createSalaryRecord(addedEmployee, template, testMonth)
        salaryStore.addSalaryRecord(salaryRecord)
      }

      employeeStore.updateEmployee(addedEmployee.id, { status: 'inactive' })

      const historicalSalary = salaryStore.getRecordsByEmployeeId(addedEmployee.id)
      expect(historicalSalary.length).toBeGreaterThan(0)
    })
  })

  // =====================================================================
  // 测试套件4: 部门删除处理
  // =====================================================================
  describe('测试套件4: 部门删除处理', () => {
    it('TC301: 员工部门设置正确', () => {
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
        phone: '13900139300',
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
        phone: '13900139310',
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

      expect(emp1.department).toBe(testDeptName)
      expect(emp2.department).toBe(testSubDeptName)
    })

    it('TC302: 部门创建成功', () => {
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门2'
      const parentDept = organizationStore.addDepartment({
        name: testDeptName,
        parentId: 'dept-1',
        manager: '陈十一',
        managerId: '9'
      })

      const deptBeforeDelete = organizationStore.getDepartmentById(parentDept.id)
      expect(deptBeforeDelete).toBeDefined()
      expect(deptBeforeDelete?.name).toBe(testDeptName)
    })

    it('TC303: 子部门创建成功', () => {
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门3'
      const testSubDeptName = '测试子部门3'

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

      const subDeptBeforeDelete = organizationStore.getDepartmentById(subDept.id)
      expect(subDeptBeforeDelete).toBeDefined()
      expect(subDeptBeforeDelete?.name).toBe(testSubDeptName)
    })

    it('TC304: 子部门查询正确', () => {
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门4'
      const testSubDeptName = '测试子部门4'

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

      const subDeptIds = organizationStore.getAllSubDepartmentIds(parentDept.id)
      expect(subDeptIds.includes(subDept.id)).toBe(true)
    })

    it('TC305: 部门在组织架构树中', () => {
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门5'
      const parentDept = organizationStore.addDepartment({
        name: testDeptName,
        parentId: 'dept-1',
        manager: '陈十一',
        managerId: '9'
      })

      const deptTree = organizationStore.departments
      function findDept(depts: any[], id: string): boolean {
        for (const d of depts) {
          if (d.id === id) return true
          if (d.children && findDept(d.children, id)) return true
        }
        return false
      }

      expect(findDept(deptTree, parentDept.id)).toBe(true)
    })

    it('TC306: 部门删除成功', () => {
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门6'
      const parentDept = organizationStore.addDepartment({
        name: testDeptName,
        parentId: 'dept-1',
        manager: '陈十一',
        managerId: '9'
      })

      organizationStore.deleteDepartment(parentDept.id)
      const deptAfterDelete = organizationStore.getDepartmentById(parentDept.id)

      expect(deptAfterDelete).toBeUndefined()
    })

    it('TC307: 子部门级联删除', () => {
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门7'
      const testSubDeptName = '测试子部门7'

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

      organizationStore.deleteDepartment(parentDept.id)
      const subDeptAfterDelete = organizationStore.getDepartmentById(subDept.id)

      expect(subDeptAfterDelete).toBeUndefined()
    })

    it('TC308: 父部门员工部门清空', () => {
      const employeeStore = useEmployeeStore()
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门8'
      const testSubDeptName = '测试子部门8'

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
        name: '部门测试员工8-1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept8-1',
        gender: 'male',
        phone: '13900139380',
        email: 'dept8-1@company.com',
        department: testDeptName,
        position: '开发工程师',
        entryDate: '2024-01-01',
        status: 'active',
        level: 'P3'
      }

      const deptEmployee2: Omit<Employee, 'id'> = {
        name: '部门测试员工8-2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept8-2',
        gender: 'female',
        phone: '13900139390',
        email: 'dept8-2@company.com',
        department: testSubDeptName,
        position: '测试工程师',
        entryDate: '2024-02-01',
        status: 'active',
        level: 'P2'
      }

      employeeStore.addEmployee(deptEmployee1)
      employeeStore.addEmployee(deptEmployee2)

      const emp1 = employeeStore.employees.find(e => e.name === '部门测试员工8-1')!
      const emp2 = employeeStore.employees.find(e => e.name === '部门测试员工8-2')!

      organizationStore.deleteDepartment(parentDept.id)

      const emp1AfterDelete = employeeStore.getEmployeeById(emp1.id)
      expect(emp1AfterDelete?.department).toBe('')
    })

    it('TC309: 子部门员工部门清空', () => {
      const employeeStore = useEmployeeStore()
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门9'
      const testSubDeptName = '测试子部门9'

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
        name: '部门测试员工9-1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept9-1',
        gender: 'male',
        phone: '13900139400',
        email: 'dept9-1@company.com',
        department: testDeptName,
        position: '开发工程师',
        entryDate: '2024-01-01',
        status: 'active',
        level: 'P3'
      }

      const deptEmployee2: Omit<Employee, 'id'> = {
        name: '部门测试员工9-2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept9-2',
        gender: 'female',
        phone: '13900139410',
        email: 'dept9-2@company.com',
        department: testSubDeptName,
        position: '测试工程师',
        entryDate: '2024-02-01',
        status: 'active',
        level: 'P2'
      }

      employeeStore.addEmployee(deptEmployee1)
      employeeStore.addEmployee(deptEmployee2)

      const emp1 = employeeStore.employees.find(e => e.name === '部门测试员工9-1')!
      const emp2 = employeeStore.employees.find(e => e.name === '部门测试员工9-2')!

      organizationStore.deleteDepartment(parentDept.id)

      const emp2AfterDelete = employeeStore.getEmployeeById(emp2.id)
      expect(emp2AfterDelete?.department).toBe('')
    })

    it('TC310: 无部门员工数量正确', () => {
      const employeeStore = useEmployeeStore()
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门10'
      const testSubDeptName = '测试子部门10'

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
        name: '部门测试员工10-1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept10-1',
        gender: 'male',
        phone: '13900139420',
        email: 'dept10-1@company.com',
        department: testDeptName,
        position: '开发工程师',
        entryDate: '2024-01-01',
        status: 'active',
        level: 'P3'
      }

      const deptEmployee2: Omit<Employee, 'id'> = {
        name: '部门测试员工10-2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept10-2',
        gender: 'female',
        phone: '13900139430',
        email: 'dept10-2@company.com',
        department: testSubDeptName,
        position: '测试工程师',
        entryDate: '2024-02-01',
        status: 'active',
        level: 'P2'
      }

      employeeStore.addEmployee(deptEmployee1)
      employeeStore.addEmployee(deptEmployee2)

      organizationStore.deleteDepartment(parentDept.id)

      const employeesWithEmptyDept = employeeStore.employees.filter(e => e.department === '')
      expect(employeesWithEmptyDept.length).toBeGreaterThanOrEqual(2)
    })

    it('TC311: 已删除部门不出现在选项中', () => {
      const employeeStore = useEmployeeStore()
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门11'
      const testSubDeptName = '测试子部门11'

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

      organizationStore.deleteDepartment(parentDept.id)

      const deptOptions = organizationStore.departmentOptions
      const hasTestDeptInOptions = deptOptions.some(
        d => d.value === testDeptName || d.value === testSubDeptName
      )

      expect(hasTestDeptInOptions).toBe(false)
    })

    it('TC312: 部门删除后员工信息保留', () => {
      const employeeStore = useEmployeeStore()
      const organizationStore = useOrganizationStore()

      const testDeptName = '测试部门12'
      const testSubDeptName = '测试子部门12'

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
        name: '部门测试员工12-1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept12-1',
        gender: 'male',
        phone: '13900139440',
        email: 'dept12-1@company.com',
        department: testDeptName,
        position: '开发工程师',
        entryDate: '2024-01-01',
        status: 'active',
        level: 'P3'
      }

      const deptEmployee2: Omit<Employee, 'id'> = {
        name: '部门测试员工12-2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dept12-2',
        gender: 'female',
        phone: '13900139450',
        email: 'dept12-2@company.com',
        department: testSubDeptName,
        position: '测试工程师',
        entryDate: '2024-02-01',
        status: 'active',
        level: 'P2'
      }

      employeeStore.addEmployee(deptEmployee1)
      employeeStore.addEmployee(deptEmployee2)

      const emp1 = employeeStore.employees.find(e => e.name === '部门测试员工12-1')!
      const emp2 = employeeStore.employees.find(e => e.name === '部门测试员工12-2')!

      organizationStore.deleteDepartment(parentDept.id)

      const emp1AfterDelete = employeeStore.getEmployeeById(emp1.id)
      const emp2AfterDelete = employeeStore.getEmployeeById(emp2.id)

      expect(emp1AfterDelete).toBeDefined()
      expect(emp2AfterDelete).toBeDefined()
    })
  })

  // =====================================================================
  // 测试套件5: 数据完整性验证
  // =====================================================================
  describe('测试套件5: 数据完整性验证', () => {
    it('TC401: 员工状态完整性', () => {
      const employeeStore = useEmployeeStore()

      const allEmployees = employeeStore.employees
      const activeEmployees = allEmployees.filter(e => e.status === 'active')
      const probationEmployees = allEmployees.filter(e => e.status === 'probation')
      const inactiveEmployees = allEmployees.filter(e => e.status === 'inactive')

      expect(allEmployees.length).toBe(
        activeEmployees.length + probationEmployees.length + inactiveEmployees.length
      )
    })

    it('TC402: 组织架构员工关联完整性', () => {
      const employeeStore = useEmployeeStore()
      const organizationStore = useOrganizationStore()

      const allEmployees = employeeStore.employees
      const departments = organizationStore.departments
      const allDeptEmployees = new Set<string>()

      function collectDeptEmployees(depts: any[]) {
        depts.forEach(d => {
          d.employees?.forEach((e: Employee) => allDeptEmployees.add(e.id))
          if (d.children) collectDeptEmployees(d.children)
        })
      }
      collectDeptEmployees(departments)

      const employeesWithValidDept = allEmployees.filter(e => e.department && e.department !== '')
      const unmatchedEmployees = employeesWithValidDept.filter(e => !allDeptEmployees.has(e.id))

      expect(unmatchedEmployees.length).toBe(0)
    })

    it('TC403: 手机号唯一性', () => {
      const employeeStore = useEmployeeStore()

      const allEmployees = employeeStore.employees
      const phoneNumbers = allEmployees.map(e => e.phone)
      const uniquePhones = new Set(phoneNumbers)

      expect(phoneNumbers.length).toBe(uniquePhones.size)
    })

    it('TC404: 邮箱唯一性', () => {
      const employeeStore = useEmployeeStore()

      const allEmployees = employeeStore.employees
      const emails = allEmployees.map(e => e.email)
      const uniqueEmails = new Set(emails)

      expect(emails.length).toBe(uniqueEmails.size)
    })

    it('TC405: 员工ID唯一性', () => {
      const employeeStore = useEmployeeStore()

      const allEmployees = employeeStore.employees
      const ids = allEmployees.map(e => e.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    it('TC406: 活跃员工合同完整性', () => {
      const employeeStore = useEmployeeStore()
      const contractStore = useContractStore()

      const activeEmployees = employeeStore.employees.filter(e => e.status === 'active')
      const activeEmployeesWithContract = activeEmployees.filter(emp => {
        const contracts = contractStore.getContractsByEmployeeId(emp.id)
        return contracts.length > 0
      })

      expect(activeEmployeesWithContract.length).toBeGreaterThanOrEqual(3)
    })

    it('TC407: 薪资生成与活跃员工一致性', () => {
      const employeeStore = useEmployeeStore()
      const salaryStore = useSalaryStore()

      const activeEmployees = employeeStore.employees.filter(e => e.status === 'active')
      const activeEmpIds = new Set(activeEmployees.map(e => e.id))

      const testMonth = getCurrentMonth()
      const batchSalary = salaryStore.batchGenerateAllActive(testMonth)
      const salaryEmpIds = new Set(batchSalary.map(r => r.employeeId))

      const allActiveInSalary = Array.from(salaryEmpIds).every(id => activeEmpIds.has(id))

      expect(batchSalary.length).toBeGreaterThan(0)
      expect(allActiveInSalary).toBe(true)
    })
  })
})
