import type { User, Employee, AttendanceRecord, SalaryRecord, Candidate, TrainingCourse, Department, Contract, Attachment, PerformancePlan, PerformanceAppraisal, KpiIndicator, EmployeeTransfer, RecruitmentRequirement, InterviewSchedule, InterviewEvaluation, Interviewer, LeaveApplication, EmployeeLeaveBalance, OvertimeApplication, SalaryTemplate, AttendanceCorrection } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    name: '系统管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    department: '技术部'
  },
  {
    id: '2',
    username: 'hr',
    name: '李人事',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hr',
    role: 'hr',
    department: '人力资源部'
  },
  {
    id: '3',
    username: 'employee',
    name: '王员工',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=employee',
    role: 'employee',
    department: '市场部'
  }
]

export const mockEmployees: Employee[] = [
  { id: '1', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', gender: 'male', phone: '13800138001', email: 'zhangsan@company.com', department: '技术部', position: '高级前端工程师', entryDate: '2022-03-15', birthday: '1995-06-08', status: 'active' },
  { id: '2', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', gender: 'female', phone: '13800138002', email: 'lisi@company.com', department: '产品部', position: '产品经理', entryDate: '2021-08-20', birthday: '1992-06-10', status: 'active' },
  { id: '3', name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', gender: 'male', phone: '13800138003', email: 'wangwu@company.com', department: '技术部', position: '后端工程师', entryDate: '2023-01-10', birthday: '1998-06-12', status: 'probation' },
  { id: '4', name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu', gender: 'female', phone: '13800138004', email: 'zhaoliu@company.com', department: '市场部', position: '市场专员', entryDate: '2020-06-10', birthday: '1994-03-15', status: 'active' },
  { id: '5', name: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi', gender: 'male', phone: '13800138005', email: 'sunqi@company.com', department: '人力资源部', position: 'HR 专员', entryDate: '2021-11-30', birthday: '1996-07-22', status: 'active' },
  { id: '6', name: '周八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba', gender: 'female', phone: '13800138006', email: 'zhouba@company.com', department: '财务部', position: '财务主管', entryDate: '2019-09-15', birthday: '1988-11-08', status: 'active' },
  { id: '7', name: '吴九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu', gender: 'male', phone: '13800138007', email: 'wujiu@company.com', department: '技术部', position: '测试工程师', entryDate: '2022-07-25', birthday: '1993-06-09', status: 'active' },
  { id: '8', name: '郑十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi', gender: 'female', phone: '13800138008', email: 'zhengshi@company.com', department: '运营部', position: '运营经理', entryDate: '2023-04-18', birthday: '1997-02-14', status: 'probation' },
  { id: '9', name: '陈十一', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenshiyi', gender: 'male', phone: '13800138009', email: 'chenshiyi@company.com', department: '技术部', position: '架构师', entryDate: '2018-02-14', birthday: '1985-12-25', status: 'active' },
  { id: '10', name: '林十二', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linshier', gender: 'female', phone: '13800138010', email: 'linshier@company.com', department: '设计部', position: 'UI 设计师', entryDate: '2021-05-20', birthday: '1994-09-30', status: 'active' },
  { id: '11', name: '黄十三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huangshisan', gender: 'male', phone: '13800138011', email: 'huangshisan@company.com', department: '技术部', position: '前端工程师', entryDate: '2022-01-10', birthday: '1996-06-11', status: 'active' },
  { id: '12', name: '杨十四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yangshisi', gender: 'female', phone: '13800138012', email: 'yangshisi@company.com', department: '产品部', position: '产品助理', entryDate: '2023-03-15', birthday: '1999-04-05', status: 'active' },
  { id: '13', name: '刘十五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liushiwu', gender: 'male', phone: '13800138013', email: 'liushiwu@company.com', department: '技术部', position: '后端工程师', entryDate: '2021-06-08', birthday: '1993-08-18', status: 'active' },
  { id: '14', name: '朱十六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhushiliu', gender: 'female', phone: '13800138014', email: 'zhushiliu@company.com', department: '市场部', position: '市场经理', entryDate: '2020-08-01', birthday: '1991-01-23', status: 'active' },
  { id: '15', name: '秦十七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qinshiqi', gender: 'male', phone: '13800138015', email: 'qinshiqi@company.com', department: '人力资源部', position: 'HR 经理', entryDate: '2019-11-30', birthday: '1987-06-13', status: 'active' },
  { id: '16', name: '尤十八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=youshiba', gender: 'female', phone: '13800138016', email: 'youshiba@company.com', department: '财务部', position: '会计', entryDate: '2022-02-15', birthday: '1995-10-10', status: 'active' },
  { id: '17', name: '许十九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xushijiu', gender: 'male', phone: '13800138017', email: 'xushijiu@company.com', department: '技术部', position: '测试工程师', entryDate: '2023-05-25', birthday: '1998-07-07', status: 'probation' },
  { id: '18', name: '何二十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=heershi', gender: 'female', phone: '13800138018', email: 'heershi@company.com', department: '运营部', position: '运营专员', entryDate: '2022-04-18', birthday: '1996-05-05', status: 'active' },
  { id: '19', name: '吕廿一', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lveryi', gender: 'male', phone: '13800138019', email: 'lveryi@company.com', department: '技术部', position: '运维工程师', entryDate: '2021-09-14', birthday: '1992-12-12', status: 'active' },
  { id: '20', name: '施廿二', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shierer', gender: 'female', phone: '13800138020', email: 'shierer@company.com', department: '设计部', position: '平面设计师', entryDate: '2022-12-20', birthday: '1994-06-07', status: 'active' },
  { id: '21', name: '张廿三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangniansan', gender: 'male', phone: '13800138021', email: 'zhangniansan@company.com', department: '技术部', position: '全栈工程师', entryDate: '2022-05-15', birthday: '1995-03-03', status: 'active' },
  { id: '22', name: '李廿四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liniansi', gender: 'female', phone: '13800138022', email: 'liniansi@company.com', department: '产品部', position: '高级产品经理', entryDate: '2020-10-20', birthday: '1990-08-15', status: 'active' },
  { id: '23', name: '王廿五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangnianwu', gender: 'male', phone: '13800138023', email: 'wangnianwu@company.com', department: '技术部', position: '后端架构师', entryDate: '2019-11-10', birthday: '1986-06-14', status: 'active' },
  { id: '24', name: '赵廿六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaonianliu', gender: 'female', phone: '13800138024', email: 'zhaonianliu@company.com', department: '市场部', position: '品牌专员', entryDate: '2023-01-05', birthday: '1997-09-09', status: 'active' },
  { id: '25', name: '孙廿七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunnianqi', gender: 'male', phone: '13800138025', email: 'sunnianqi@company.com', department: '人力资源部', position: '招聘专员', entryDate: '2022-03-30', birthday: '1994-11-11', status: 'active' }
]

function generateCorrection(
  recordId: string,
  status: 'pending' | 'approved' | 'rejected',
  type: 'makeup' | 'explain',
  employee: Employee,
  date: string
): any {
  const correctionBase = {
    id: `corr-${recordId}`,
    type,
    reason: type === 'makeup'
      ? '因地铁故障导致迟到，实际已在8:50到达公司'
      : '因处理紧急客户问题，提前下班并已完成工作交接',
    applicantId: employee.id,
    applicantName: employee.name,
    applicationTime: `${date} 09:30:00`,
    status
  }

  if (type === 'makeup') {
    ;(correctionBase as any).makeupCheckIn = '08:50'
    ;(correctionBase as any).makeupCheckOut = '18:00'
  }

  if (status !== 'pending') {
    const approver = mockEmployees.find(e => e.department === employee.department && e.position.includes('经理')) || mockEmployees[0]
    ;(correctionBase as any).approverId = approver.id
    ;(correctionBase as any).approverName = approver.name
    ;(correctionBase as any).approvalComment = status === 'approved' ? '情况属实，同意修正' : '理由不充分，请提供更多证明材料'
    ;(correctionBase as any).approvalTime = `${date} 14:00:00`
  }

  return correctionBase
}

export const mockAttendanceRecords: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2024, 0, i + 1)
  const day = date.getDay()
  if (day === 0 || day === 6) return null

  const employee = mockEmployees[i % mockEmployees.length]
  const dateStr = date.toISOString().split('T')[0]
  const statuses: AttendanceRecord['status'][] = ['normal', 'late', 'early', 'absent']
  const status = statuses[Math.floor(Math.random() * 4)]

  const record: AttendanceRecord = {
    id: `att-${i}`,
    employeeId: employee.id,
    employeeName: employee.name,
    date: dateStr,
    checkIn: `${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    checkOut: `${17 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    status
  }

  if (status !== 'normal' && status !== 'leave') {
    const rand = Math.random()
    if (rand < 0.3) {
      record.correction = generateCorrection(record.id, 'approved', rand < 0.15 ? 'makeup' : 'explain', employee, dateStr)
    } else if (rand < 0.5) {
      record.correction = generateCorrection(record.id, 'pending', rand < 0.4 ? 'makeup' : 'explain', employee, dateStr)
    } else if (rand < 0.6) {
      record.correction = generateCorrection(record.id, 'rejected', rand < 0.55 ? 'makeup' : 'explain', employee, dateStr)
    }
  }

  return record
}).filter(Boolean) as AttendanceRecord[]

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

function calculateSalaryFromTemplate(baseSalary: number, postAllowance: number, performanceCoefficient: number, mealAllowance: number, transportationAllowance: number, communicationAllowance: number, otherAllowance: number, socialSecurityRate: number, housingFundRate: number, taxThreshold: number, bonusMultiplier: number = 1) {
  const performanceBonus = Math.round(baseSalary * performanceCoefficient * bonusMultiplier)
  const grossSalary = baseSalary + postAllowance + performanceBonus + mealAllowance + transportationAllowance + communicationAllowance + otherAllowance
  const socialSecurity = Math.round(grossSalary * socialSecurityRate)
  const housingFund = Math.round(grossSalary * housingFundRate)
  const taxableIncome = Math.max(0, grossSalary - socialSecurity - housingFund - taxThreshold)
  const incomeTax = calculateIncomeTax(taxableIncome)
  const otherDeduction = 0
  const totalDeduction = socialSecurity + housingFund + incomeTax + otherDeduction
  const netSalary = grossSalary - totalDeduction
  return {
    baseSalary,
    postAllowance,
    performanceBonus,
    otherAllowance: mealAllowance + transportationAllowance + communicationAllowance + otherAllowance,
    socialSecurity,
    housingFund,
    incomeTax,
    otherDeduction,
    grossSalary,
    totalDeduction,
    netSalary
  }
}

export const mockSalaryRecords: SalaryRecord[] = [
  { id: 'sal-1', employeeId: '1', employeeName: '张三', department: '技术部', position: '高级前端工程师', month: '2024-01', templateId: 'tpl-1', templateName: '技术部-P4高级工程师', ...calculateSalaryFromTemplate(18000, 2000, 0.3, 500, 300, 200, 0, 0.08, 0.12, 5000, 1.2) },
  { id: 'sal-2', employeeId: '1', employeeName: '张三', department: '技术部', position: '高级前端工程师', month: '2024-02', templateId: 'tpl-1', templateName: '技术部-P4高级工程师', ...calculateSalaryFromTemplate(18000, 2000, 0.3, 500, 300, 200, 0, 0.08, 0.12, 5000, 1.0) },
  { id: 'sal-3', employeeId: '1', employeeName: '张三', department: '技术部', position: '高级前端工程师', month: '2024-03', templateId: 'tpl-1', templateName: '技术部-P4高级工程师', ...calculateSalaryFromTemplate(18000, 2000, 0.3, 500, 300, 200, 0, 0.08, 0.12, 5000, 1.5) },
  { id: 'sal-4', employeeId: '2', employeeName: '李四', department: '产品部', position: '产品经理', month: '2024-01', templateId: 'tpl-2', templateName: '产品部-P4产品经理', ...calculateSalaryFromTemplate(20000, 2500, 0.25, 500, 300, 200, 0, 0.08, 0.12, 5000, 1.1) },
  { id: 'sal-5', employeeId: '2', employeeName: '李四', department: '产品部', position: '产品经理', month: '2024-02', templateId: 'tpl-2', templateName: '产品部-P4产品经理', ...calculateSalaryFromTemplate(20000, 2500, 0.25, 500, 300, 200, 0, 0.08, 0.12, 5000, 1.0) },
  { id: 'sal-6', employeeId: '3', employeeName: '王五', department: '技术部', position: '后端工程师', month: '2024-01', templateId: 'tpl-3', templateName: '技术部-P3中级工程师', ...calculateSalaryFromTemplate(12000, 1500, 0.2, 500, 300, 200, 0, 0.08, 0.12, 5000, 0.8) },
  { id: 'sal-7', employeeId: '4', employeeName: '赵六', department: '市场部', position: '市场专员', month: '2024-01', templateId: 'tpl-4', templateName: '市场部-P3专员', ...calculateSalaryFromTemplate(10000, 1200, 0.15, 500, 300, 200, 0, 0.08, 0.12, 5000, 1.0) },
  { id: 'sal-8', employeeId: '5', employeeName: '孙七', department: '人力资源部', position: 'HR 专员', month: '2024-01', templateId: 'tpl-5', templateName: 'HR部门-P3专员', ...calculateSalaryFromTemplate(11000, 1300, 0.15, 500, 300, 200, 0, 0.08, 0.12, 5000, 0.9) }
]

export const mockSalaryTemplates: SalaryTemplate[] = [
  {
    id: 'tpl-1',
    name: '技术部-P4高级工程师',
    type: 'level',
    applicableDepartment: '技术部',
    applicableLevel: 'P4',
    description: '技术部高级工程师薪资标准，适用于P4职级',
    baseSalary: 18000,
    postAllowance: 2000,
    performanceCoefficient: 0.3,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-06-01',
    createdBy: '李人事',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-2',
    name: '产品部-P4产品经理',
    type: 'level',
    applicableDepartment: '产品部',
    applicableLevel: 'P4',
    description: '产品部产品经理薪资标准，适用于P4职级',
    baseSalary: 20000,
    postAllowance: 2500,
    performanceCoefficient: 0.25,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-06-01',
    createdBy: '李人事',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-3',
    name: '技术部-P3中级工程师',
    type: 'level',
    applicableDepartment: '技术部',
    applicableLevel: 'P3',
    description: '技术部中级工程师薪资标准，适用于P3职级',
    baseSalary: 12000,
    postAllowance: 1500,
    performanceCoefficient: 0.2,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-06-01',
    createdBy: '李人事',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-4',
    name: '市场部-P3专员',
    type: 'level',
    applicableDepartment: '市场部',
    applicableLevel: 'P3',
    description: '市场部专员薪资标准，适用于P3职级',
    baseSalary: 10000,
    postAllowance: 1200,
    performanceCoefficient: 0.15,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-06-01',
    createdBy: '李人事',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-5',
    name: 'HR部门-P3专员',
    type: 'level',
    applicableDepartment: '人力资源部',
    applicableLevel: 'P3',
    description: '人力资源部专员薪资标准，适用于P3职级',
    baseSalary: 11000,
    postAllowance: 1300,
    performanceCoefficient: 0.15,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-06-01',
    createdBy: '李人事',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-6',
    name: '技术部-P5专家',
    type: 'level',
    applicableDepartment: '技术部',
    applicableLevel: 'P5',
    description: '技术部专家薪资标准，适用于P5职级',
    baseSalary: 30000,
    postAllowance: 4000,
    performanceCoefficient: 0.35,
    mealAllowance: 500,
    transportationAllowance: 500,
    communicationAllowance: 300,
    otherAllowance: 1000,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-06-01',
    createdBy: '李人事',
    updatedAt: '2024-02-20'
  },
  {
    id: 'tpl-7',
    name: '财务部-P3会计',
    type: 'position',
    applicableDepartment: '财务部',
    applicablePosition: '会计',
    description: '财务部会计岗位薪资标准',
    baseSalary: 12000,
    postAllowance: 1500,
    performanceCoefficient: 0.15,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-07-10',
    createdBy: '李人事',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-8',
    name: '设计部-P3设计师',
    type: 'position',
    applicableDepartment: '设计部',
    applicablePosition: 'UI 设计师',
    description: '设计部UI设计师岗位薪资标准',
    baseSalary: 15000,
    postAllowance: 1800,
    performanceCoefficient: 0.2,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 500,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-08-05',
    createdBy: '李人事',
    updatedAt: '2024-03-10'
  },
  {
    id: 'tpl-9',
    name: '技术部-P2初级工程师',
    type: 'level',
    applicableDepartment: '技术部',
    applicableLevel: 'P2',
    description: '技术部初级工程师薪资标准，适用于P2职级',
    baseSalary: 8000,
    postAllowance: 1000,
    performanceCoefficient: 0.1,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active',
    createdAt: '2023-06-01',
    createdBy: '李人事',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tpl-10',
    name: '通用标准模板',
    type: 'custom',
    description: '通用薪资标准模板，适用于未定义特殊模板的岗位',
    baseSalary: 10000,
    postAllowance: 1000,
    performanceCoefficient: 0.15,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: true,
    status: 'active',
    createdAt: '2023-01-01',
    createdBy: '系统管理员',
    updatedAt: '2024-01-01'
  }
]

export const mockCandidates: Candidate[] = [
  { id: 'can-1', name: '刘小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liuxiaoming', position: '前端工程师', stage: 'screening', appliedDate: '2024-01-10', experience: '3年', education: '本科' },
  { id: 'can-2', name: '陈小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenxiaohong', position: '产品经理', stage: 'screening', appliedDate: '2024-01-12', experience: '5年', education: '硕士' },
  { id: 'can-3', name: '杨小华', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yangxiaohua', position: '后端工程师', stage: 'interview1', appliedDate: '2024-01-08', experience: '4年', education: '本科' },
  { id: 'can-4', name: '黄小丽', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huangxiaoli', position: 'UI 设计师', stage: 'interview1', appliedDate: '2024-01-09', experience: '2年', education: '本科' },
  { id: 'can-5', name: '周小强', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouxiaoqiang', position: '测试工程师', stage: 'interview2', appliedDate: '2024-01-05', experience: '3年', education: '本科' },
  { id: 'can-6', name: '吴小燕', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wuxiaoyan', position: '运营专员', stage: 'interview2', appliedDate: '2024-01-06', experience: '2年', education: '大专' },
  { id: 'can-7', name: '郑小军', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengxiaojun', position: 'Java 开发', stage: 'offer', appliedDate: '2024-01-03', experience: '6年', education: '硕士' },
  { id: 'can-8', name: '孙小芳', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunxiaofang', position: 'HR 专员', stage: 'offer', appliedDate: '2024-01-04', experience: '3年', education: '本科' },
  { id: 'can-9', name: '马小波', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maxiaobo', position: '数据分析师', stage: 'rejected', appliedDate: '2024-01-02', experience: '1年', education: '本科' },
  { id: 'can-10', name: '林小燕', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linxiaoyan', position: '市场专员', stage: 'rejected', appliedDate: '2024-01-01', experience: '1年', education: '大专' }
]

export const mockTrainingCourses: TrainingCourse[] = [
  { id: 'tc-1', title: 'Vue 3 进阶开发', description: '深入学习 Vue 3 Composition API、Pinia 状态管理等高级特性', instructor: '张老师', startDate: '2024-02-01', endDate: '2024-02-15', status: 'upcoming', participants: 25 },
  { id: 'tc-2', title: '项目管理实战', description: '学习敏捷开发、Scrum 流程、项目风险管理等', instructor: '李老师', startDate: '2024-01-15', endDate: '2024-01-30', status: 'ongoing', participants: 18 },
  { id: 'tc-3', title: '沟通技巧提升', description: '提升职场沟通能力、团队协作技巧', instructor: '王老师', startDate: '2024-01-01', endDate: '2024-01-10', status: 'completed', participants: 32 },
  { id: 'tc-4', title: 'TypeScript 高级编程', description: '深入理解 TypeScript 类型系统、泛型、装饰器等', instructor: '赵老师', startDate: '2024-02-10', endDate: '2024-02-25', status: 'upcoming', participants: 20 },
  { id: 'tc-5', title: '领导力培训', description: '培养团队管理能力、决策能力、激励技巧', instructor: '孙老师', startDate: '2024-01-20', endDate: '2024-02-05', status: 'ongoing', participants: 12 },
  { id: 'tc-6', title: '新员工入职培训', description: '公司文化、规章制度、办公软件使用等', instructor: 'HR 部', startDate: '2024-01-05', endDate: '2024-01-07', status: 'completed', participants: 15 }
]

const nameToIdMap: Record<string, string> = {}
mockEmployees.forEach(emp => {
  nameToIdMap[emp.name] = emp.id
})

export const flatDepartments: Omit<Department, 'children' | 'employees' | 'employeeCount'>[] = [
  { id: 'dept-1', name: '总公司', parentId: null, manager: '陈十一', managerId: nameToIdMap['陈十一'] },
  { id: 'dept-2', name: '技术部', parentId: 'dept-1', manager: '陈十一', managerId: nameToIdMap['陈十一'] },
  { id: 'dept-3', name: '产品部', parentId: 'dept-1', manager: '李四', managerId: nameToIdMap['李四'] },
  { id: 'dept-4', name: '市场部', parentId: 'dept-1', manager: '赵六', managerId: nameToIdMap['赵六'] },
  { id: 'dept-5', name: '人力资源部', parentId: 'dept-1', manager: '孙七', managerId: nameToIdMap['孙七'] },
  { id: 'dept-6', name: '前端组', parentId: 'dept-2', manager: '张三', managerId: nameToIdMap['张三'] },
  { id: 'dept-7', name: '后端组', parentId: 'dept-2', manager: '王五', managerId: nameToIdMap['王五'] },
  { id: 'dept-8', name: '测试组', parentId: 'dept-2', manager: '吴九', managerId: nameToIdMap['吴九'] },
  { id: 'dept-9', name: '财务部', parentId: 'dept-1', manager: '周八', managerId: nameToIdMap['周八'] },
  { id: 'dept-10', name: '运营部', parentId: 'dept-1', manager: '郑十', managerId: nameToIdMap['郑十'] },
  { id: 'dept-11', name: '设计部', parentId: 'dept-1', manager: '林十二', managerId: nameToIdMap['林十二'] }
]

function buildDepartmentTree(
  depts: Omit<Department, 'children' | 'employees' | 'employeeCount'>[],
  emps: Employee[]
): Department[] {
  const deptMap: Record<string, Department> = {}
  const deptEmployees: Record<string, Employee[]> = {}

  emps.forEach(emp => {
    if (!deptEmployees[emp.department]) {
      deptEmployees[emp.department] = []
    }
    deptEmployees[emp.department].push(emp)
  })

  depts.forEach(dept => {
    deptMap[dept.id] = {
      ...dept,
      employeeCount: 0,
      employees: [],
      children: []
    }
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

export const mockDepartments: Department[] = buildDepartmentTree(flatDepartments, mockEmployees)

export const mockContracts: Contract[] = [
  {
    id: 'con-1',
    employeeId: '1',
    employeeName: '张三',
    type: 'fulltime',
    startDate: '2022-03-15',
    endDate: '2025-03-14',
    probationMonths: 3,
    conversionConditions: '试用期表现良好，通过试用期考核',
    salaryAgreement: 18000,
    status: 'expired',
    remarks: '第一份劳动合同',
    createdAt: '2022-03-10'
  },
  {
    id: 'con-2',
    employeeId: '1',
    employeeName: '张三',
    type: 'fulltime',
    startDate: '2025-03-15',
    endDate: '2026-06-20',
    probationMonths: 0,
    conversionConditions: '续签合同，无试用期',
    salaryAgreement: 22000,
    status: 'expiring',
    remarks: '第二份劳动合同，即将到期',
    createdAt: '2025-03-01'
  },
  {
    id: 'con-3',
    employeeId: '2',
    employeeName: '李四',
    type: 'fulltime',
    startDate: '2021-08-20',
    endDate: '2024-08-19',
    probationMonths: 3,
    conversionConditions: '试用期表现良好，通过试用期考核',
    salaryAgreement: 20000,
    status: 'expired',
    remarks: '第一份劳动合同',
    createdAt: '2021-08-15'
  },
  {
    id: 'con-4',
    employeeId: '2',
    employeeName: '李四',
    type: 'fulltime',
    startDate: '2024-08-20',
    endDate: '2027-08-19',
    probationMonths: 0,
    conversionConditions: '续签无固定期限合同',
    salaryAgreement: 25000,
    status: 'active',
    remarks: '无固定期限劳动合同',
    createdAt: '2024-08-01'
  },
  {
    id: 'con-5',
    employeeId: '3',
    employeeName: '王五',
    type: 'fulltime',
    startDate: '2023-01-10',
    endDate: '2026-07-05',
    probationMonths: 3,
    conversionConditions: '试用期表现良好，通过技术考核',
    salaryAgreement: 15000,
    status: 'expiring',
    remarks: '即将到期，需提前续签',
    createdAt: '2023-01-05'
  },
  {
    id: 'con-6',
    employeeId: '4',
    employeeName: '赵六',
    type: 'fulltime',
    startDate: '2020-06-01',
    endDate: '2023-05-31',
    probationMonths: 3,
    conversionConditions: '试用期表现良好',
    salaryAgreement: 10000,
    status: 'expired',
    createdAt: '2020-05-25'
  },
  {
    id: 'con-7',
    employeeId: '4',
    employeeName: '赵六',
    type: 'fulltime',
    startDate: '2023-06-01',
    endDate: '2026-05-31',
    probationMonths: 0,
    conversionConditions: '续签合同',
    salaryAgreement: 13000,
    status: 'expiring',
    remarks: '本月底到期，需尽快处理续签',
    createdAt: '2023-05-15'
  },
  {
    id: 'con-8',
    employeeId: '5',
    employeeName: '孙七',
    type: 'fulltime',
    startDate: '2021-11-30',
    endDate: '2024-11-29',
    probationMonths: 3,
    conversionConditions: '试用期表现良好',
    salaryAgreement: 11000,
    status: 'expired',
    createdAt: '2021-11-25'
  },
  {
    id: 'con-9',
    employeeId: '5',
    employeeName: '孙七',
    type: 'fulltime',
    startDate: '2024-11-30',
    endDate: '2027-11-29',
    probationMonths: 0,
    conversionConditions: '续签合同',
    salaryAgreement: 14000,
    status: 'active',
    createdAt: '2024-11-15'
  },
  {
    id: 'con-10',
    employeeId: '6',
    employeeName: '周八',
    type: 'fulltime',
    startDate: '2019-09-15',
    endDate: '2022-09-14',
    probationMonths: 3,
    conversionConditions: '试用期表现良好',
    salaryAgreement: 20000,
    status: 'expired',
    createdAt: '2019-09-10'
  },
  {
    id: 'con-11',
    employeeId: '6',
    employeeName: '周八',
    type: 'fulltime',
    startDate: '2022-09-15',
    endDate: '2025-09-14',
    probationMonths: 0,
    conversionConditions: '续签合同',
    salaryAgreement: 25000,
    status: 'expiring',
    remarks: '三个月后到期',
    createdAt: '2022-09-01'
  },
  {
    id: 'con-12',
    employeeId: '7',
    employeeName: '吴九',
    type: 'fulltime',
    startDate: '2022-07-25',
    endDate: '2025-07-24',
    probationMonths: 3,
    conversionConditions: '试用期表现良好',
    salaryAgreement: 12000,
    status: 'expired',
    createdAt: '2022-07-20'
  },
  {
    id: 'con-13',
    employeeId: '7',
    employeeName: '吴九',
    type: 'fulltime',
    startDate: '2025-07-25',
    endDate: '2028-07-24',
    probationMonths: 0,
    conversionConditions: '续签合同',
    salaryAgreement: 16000,
    status: 'active',
    createdAt: '2025-07-10'
  },
  {
    id: 'con-14',
    employeeId: '8',
    employeeName: '郑十',
    type: 'intern',
    startDate: '2023-04-18',
    endDate: '2026-06-30',
    probationMonths: 0,
    conversionConditions: '实习期满，考核通过可转正',
    salaryAgreement: 8000,
    status: 'expiring',
    remarks: '实习期即将结束，需评估是否转正',
    createdAt: '2023-04-15'
  },
  {
    id: 'con-15',
    employeeId: '9',
    employeeName: '陈十一',
    type: 'fulltime',
    startDate: '2018-02-14',
    endDate: '2021-02-13',
    probationMonths: 3,
    conversionConditions: '试用期表现优秀',
    salaryAgreement: 35000,
    status: 'expired',
    createdAt: '2018-02-10'
  },
  {
    id: 'con-16',
    employeeId: '9',
    employeeName: '陈十一',
    type: 'fulltime',
    startDate: '2021-02-14',
    endDate: '2024-02-13',
    probationMonths: 0,
    conversionConditions: '续签合同',
    salaryAgreement: 45000,
    status: 'expired',
    createdAt: '2021-02-01'
  },
  {
    id: 'con-17',
    employeeId: '9',
    employeeName: '陈十一',
    type: 'fulltime',
    startDate: '2024-02-14',
    endDate: '2029-02-13',
    probationMonths: 0,
    conversionConditions: '无固定期限合同',
    salaryAgreement: 55000,
    status: 'active',
    remarks: '核心员工，无固定期限合同',
    createdAt: '2024-02-01'
  },
  {
    id: 'con-18',
    employeeId: '10',
    employeeName: '林十二',
    type: 'parttime',
    startDate: '2021-05-20',
    endDate: '2024-05-19',
    probationMonths: 1,
    conversionConditions: '试用期表现良好',
    salaryAgreement: 8000,
    status: 'expired',
    remarks: '兼职合同',
    createdAt: '2021-05-15'
  },
  {
    id: 'con-19',
    employeeId: '10',
    employeeName: '林十二',
    type: 'fulltime',
    startDate: '2024-05-20',
    endDate: '2027-05-19',
    probationMonths: 0,
    conversionConditions: '转为全职',
    salaryAgreement: 15000,
    status: 'active',
    remarks: '兼职转全职',
    createdAt: '2024-05-10'
  }
]

const defaultKpiIndicators: KpiIndicator[] = [
  { id: 'kpi-1', name: '工作业绩', description: '完成工作目标和任务的质量与数量', weight: 40, maxScore: 100 },
  { id: 'kpi-2', name: '工作能力', description: '专业技能、解决问题能力和创新能力', weight: 25, maxScore: 100 },
  { id: 'kpi-3', name: '工作态度', description: '责任心、积极性和团队协作精神', weight: 20, maxScore: 100 },
  { id: 'kpi-4', name: '学习成长', description: '学习新知识、技能提升和自我发展', weight: 15, maxScore: 100 }
]

export const mockPerformancePlans: PerformancePlan[] = [
  {
    id: 'plan-1',
    name: '2024年Q1绩效考核',
    cycleType: 'quarterly',
    period: '2024-Q1',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    department: '全公司',
    kpiIndicators: defaultKpiIndicators,
    status: 'completed',
    createdAt: '2024-01-05',
    createdBy: '李人事'
  },
  {
    id: 'plan-2',
    name: '2024年Q2绩效考核',
    cycleType: 'quarterly',
    period: '2024-Q2',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    department: '全公司',
    kpiIndicators: defaultKpiIndicators,
    status: 'completed',
    createdAt: '2024-04-01',
    createdBy: '李人事'
  },
  {
    id: 'plan-3',
    name: '2024年Q3绩效考核',
    cycleType: 'quarterly',
    period: '2024-Q3',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    department: '全公司',
    kpiIndicators: defaultKpiIndicators,
    status: 'completed',
    createdAt: '2024-07-01',
    createdBy: '李人事'
  },
  {
    id: 'plan-4',
    name: '2024年Q4绩效考核',
    cycleType: 'quarterly',
    period: '2024-Q4',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    department: '全公司',
    kpiIndicators: defaultKpiIndicators,
    status: 'active',
    createdAt: '2024-10-01',
    createdBy: '李人事'
  },
  {
    id: 'plan-5',
    name: '技术部1月绩效考核',
    cycleType: 'monthly',
    period: '2024-01',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    department: '技术部',
    kpiIndicators: [
      { id: 'kpi-tech-1', name: '代码质量', description: '代码规范、Bug率、可维护性', weight: 35, maxScore: 100 },
      { id: 'kpi-tech-2', name: '开发效率', description: '任务完成进度、交付及时性', weight: 30, maxScore: 100 },
      { id: 'kpi-tech-3', name: '技术贡献', description: '技术分享、架构优化、工具建设', weight: 20, maxScore: 100 },
      { id: 'kpi-tech-4', name: '团队协作', description: '沟通配合、知识传递', weight: 15, maxScore: 100 }
    ],
    status: 'completed',
    createdAt: '2024-01-02',
    createdBy: '陈十一'
  }
]

function generateScores(plan: PerformancePlan, totalScore: number): { scores: any[], total: number, grade: string } {
  const kpis = plan.kpiIndicators
  const scores: any[] = []
  let remaining = totalScore
  const totalWeight = kpis.reduce((sum, kpi) => sum + kpi.weight, 0)
  
  for (let i = 0; i < kpis.length; i++) {
    const kpi = kpis[i]
    let score: number
    
    if (i === kpis.length - 1) {
      score = Math.round(remaining / (kpi.weight / totalWeight))
    } else {
      const baseScore = Math.round((totalScore * (kpi.weight / totalWeight)) * (0.9 + Math.random() * 0.2))
      score = Math.max(0, Math.min(100, baseScore))
      remaining -= score * (kpi.weight / totalWeight)
    }
    
    const weightedScore = Math.round(score * (kpi.weight / 100) * 10) / 10
    scores.push({
      kpiId: kpi.id,
      kpiName: kpi.name,
      score,
      weight: kpi.weight,
      weightedScore
    })
  }
  
  const calculatedTotal = Math.round(scores.reduce((sum, s) => sum + s.weightedScore, 0))
  let grade: string
  if (calculatedTotal >= 90) grade = 'excellent'
  else if (calculatedTotal >= 75) grade = 'good'
  else if (calculatedTotal >= 60) grade = 'qualified'
  else grade = 'needs_improvement'
  
  return { scores, total: calculatedTotal, grade }
}

function generateAppraisals(): PerformanceAppraisal[] {
  const appraisals: PerformanceAppraisal[] = []
  const employees = mockEmployees.filter(e => e.status !== 'inactive')
  const comments = [
    '工作表现非常出色，超额完成各项任务指标，展现了优秀的专业能力和领导力。',
    '工作认真负责，按时完成各项任务，团队协作良好，专业能力有待进一步提升。',
    '基本完成工作任务，但在主动性和创新性方面需要加强，期待下一周期有更好表现。',
    '工作态度积极，学习能力强，成长迅速，是团队的中坚力量。',
    '能够胜任本职工作，但需要提升工作效率和质量，加强与团队成员的沟通协作。'
  ]
  
  let id = 1
  
  employees.forEach(emp => {
    const deptManager = mockDepartments[0].children?.find(d => d.name === emp.department)?.manager || '陈十一'
    const supervisor = mockEmployees.find(e => e.name === deptManager) || mockEmployees[0]
    
    const performanceScores = [
      { plan: mockPerformancePlans[0], total: 78 + Math.floor(Math.random() * 20) },
      { plan: mockPerformancePlans[1], total: 82 + Math.floor(Math.random() * 15) },
      { plan: mockPerformancePlans[2], total: 85 + Math.floor(Math.random() * 12) }
    ]
    
    performanceScores.forEach(({ plan, total }) => {
      const result = generateScores(plan, total)
      const grade = result.grade as any
      
      let salaryAdjustment = 0
      if (grade === 'excellent') salaryAdjustment = 2000 + Math.floor(Math.random() * 1500)
      else if (grade === 'good') salaryAdjustment = 1000 + Math.floor(Math.random() * 1000)
      else if (grade === 'qualified') salaryAdjustment = 300 + Math.floor(Math.random() * 500)
      
      const commentIndex = grade === 'excellent' ? 0 : grade === 'good' ? 3 : grade === 'qualified' ? 1 : 2
      
      appraisals.push({
        id: `appr-${id++}`,
        planId: plan.id,
        planName: plan.name,
        period: plan.period,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
        scores: result.scores,
        totalScore: result.total,
        grade,
        comments: comments[commentIndex],
        salaryAdjustmentSuggestion: [
          '建议调薪 15%-20%，优先考虑晋升',
          '建议调薪 8%-12%',
          '建议调薪 3%-5% 或保持不变',
          '建议不调薪，制定绩效改进计划'
        ][['excellent', 'good', 'qualified', 'needs_improvement'].indexOf(grade)],
        salaryAdjustmentAmount: salaryAdjustment,
        status: 'approved',
        submittedAt: `${plan.endDate}`,
        approvedAt: `${plan.endDate}`,
        createdAt: `${plan.endDate}`
      })
    })
    
    const activePlan = mockPerformancePlans[3]
    const activeResult = generateScores(activePlan, 75 + Math.floor(Math.random() * 20))
    appraisals.push({
      id: `appr-${id++}`,
      planId: activePlan.id,
      planName: activePlan.name,
      period: activePlan.period,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      supervisorId: supervisor.id,
      supervisorName: supervisor.name,
      scores: activeResult.scores,
      totalScore: activeResult.total,
      grade: activeResult.grade as any,
      comments: '',
      salaryAdjustmentSuggestion: '',
      salaryAdjustmentAmount: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    })
  })
  
  return appraisals
}

export const mockPerformanceAppraisals: PerformanceAppraisal[] = generateAppraisals()

export const mockEmployeeTransfers: EmployeeTransfer[] = [
  {
    id: 'trans-1',
    employeeId: '1',
    employeeName: '张三',
    type: 'promotion',
    beforeDepartment: '技术部',
    beforePosition: '前端工程师',
    afterDepartment: '技术部',
    afterPosition: '高级前端工程师',
    reason: '工作表现突出，技术能力较强，符合晋升条件',
    effectiveDate: '2023-06-01',
    status: 'effective',
    createdAt: '2023-05-20',
    createdBy: '李人事',
    remarks: '晋升后薪资上调20%'
  },
  {
    id: 'trans-2',
    employeeId: '1',
    employeeName: '张三',
    type: 'salary_adjustment',
    beforeDepartment: '技术部',
    beforePosition: '高级前端工程师',
    afterDepartment: '技术部',
    afterPosition: '高级前端工程师',
    reason: '年度绩效考核优秀，建议调薪',
    effectiveDate: '2024-01-01',
    status: 'effective',
    createdAt: '2023-12-15',
    createdBy: '李人事',
    remarks: '薪资从18K调整至22K'
  },
  {
    id: 'trans-3',
    employeeId: '2',
    employeeName: '李四',
    type: 'promotion',
    beforeDepartment: '产品部',
    beforePosition: '产品专员',
    afterDepartment: '产品部',
    afterPosition: '产品经理',
    reason: '负责产品项目表现优异，具备产品管理能力',
    effectiveDate: '2022-12-01',
    status: 'effective',
    createdAt: '2022-11-20',
    createdBy: '李人事'
  },
  {
    id: 'trans-4',
    employeeId: '3',
    employeeName: '王五',
    type: 'department_change',
    beforeDepartment: '技术部',
    beforePosition: '后端开发工程师',
    afterDepartment: '技术部',
    afterPosition: '后端工程师',
    reason: '后端组架构调整，优化人员配置',
    effectiveDate: '2023-09-01',
    status: 'effective',
    createdAt: '2023-08-25',
    createdBy: '李人事'
  },
  {
    id: 'trans-5',
    employeeId: '4',
    employeeName: '赵六',
    type: 'promotion',
    beforeDepartment: '市场部',
    beforePosition: '市场助理',
    afterDepartment: '市场部',
    afterPosition: '市场专员',
    reason: '试用期表现良好，顺利转正并晋升',
    effectiveDate: '2020-09-01',
    status: 'effective',
    createdAt: '2020-08-20',
    createdBy: '李人事'
  },
  {
    id: 'trans-6',
    employeeId: '5',
    employeeName: '孙七',
    type: 'transfer_in',
    beforeDepartment: '人力资源部',
    beforePosition: '招聘专员',
    afterDepartment: '人力资源部',
    afterPosition: 'HR 专员',
    reason: '从子公司调入总部人力资源部',
    effectiveDate: '2022-03-01',
    status: 'effective',
    createdAt: '2022-02-15',
    createdBy: '李人事'
  },
  {
    id: 'trans-7',
    employeeId: '7',
    employeeName: '吴九',
    type: 'salary_adjustment',
    beforeDepartment: '技术部',
    beforePosition: '测试工程师',
    afterDepartment: '技术部',
    afterPosition: '测试工程师',
    reason: '年度考核良好，工作认真负责',
    effectiveDate: '2024-01-01',
    status: 'effective',
    createdAt: '2023-12-20',
    createdBy: '李人事',
    remarks: '薪资从12K调整至16K'
  },
  {
    id: 'trans-8',
    employeeId: '9',
    employeeName: '陈十一',
    type: 'promotion',
    beforeDepartment: '技术部',
    beforePosition: '技术总监',
    afterDepartment: '技术部',
    afterPosition: '架构师',
    reason: '公司技术架构升级，任命为首席架构师',
    effectiveDate: '2021-01-01',
    status: 'effective',
    createdAt: '2020-12-15',
    createdBy: '李人事'
  },
  {
    id: 'trans-9',
    employeeId: '10',
    employeeName: '林十二',
    type: 'transfer_in',
    beforeDepartment: '设计部',
    beforePosition: 'UI设计师（兼职）',
    afterDepartment: '设计部',
    afterPosition: 'UI 设计师',
    reason: '兼职转全职，表现优秀',
    effectiveDate: '2024-05-20',
    status: 'effective',
    createdAt: '2024-05-10',
    createdBy: '李人事'
  },
  {
    id: 'trans-10',
    employeeId: '2',
    employeeName: '李四',
    type: 'salary_adjustment',
    beforeDepartment: '产品部',
    beforePosition: '产品经理',
    afterDepartment: '产品部',
    afterPosition: '产品经理',
    reason: '续签无固定期限合同，薪资调整',
    effectiveDate: '2024-08-20',
    status: 'effective',
    createdAt: '2024-08-01',
    createdBy: '李人事',
    remarks: '薪资从20K调整至25K'
  },
  {
    id: 'trans-11',
    employeeId: '3',
    employeeName: '王五',
    type: 'department_change',
    beforeDepartment: '技术部',
    beforePosition: '后端工程师',
    afterDepartment: '产品部',
    afterPosition: '产品经理（技术背景）',
    reason: '个人发展意愿，转岗产品方向，具备技术优势',
    effectiveDate: '2024-07-01',
    status: 'pending',
    createdAt: '2024-06-15',
    createdBy: '李人事',
    remarks: '待生效，需完成工作交接'
  },
  {
    id: 'trans-12',
    employeeId: '6',
    employeeName: '周八',
    type: 'promotion',
    beforeDepartment: '财务部',
    beforePosition: '财务会计',
    afterDepartment: '财务部',
    afterPosition: '财务主管',
    reason: '老员工，工作认真负责，管理能力突出',
    effectiveDate: '2021-03-01',
    status: 'effective',
    createdAt: '2021-02-20',
    createdBy: '李人事'
  }
]

export const mockRecruitmentRequirements: RecruitmentRequirement[] = [
  {
    id: 'req-1',
    positionName: '高级前端工程师',
    headcount: 2,
    urgency: 'high',
    requirements: '1. 5年以上前端开发经验\n2. 精通 Vue 3 和 TypeScript\n3. 有大型项目架构经验\n4. 熟悉性能优化和工程化',
    department: '技术部',
    applicantId: '9',
    applicantName: '陈十一',
    status: 'published',
    actualHiredCount: 1,
    reviewerId: '2',
    reviewerName: '李人事',
    reviewComment: '需求合理，同意发布',
    createdAt: '2024-01-10',
    reviewedAt: '2024-01-12',
    publishedAt: '2024-01-12'
  },
  {
    id: 'req-2',
    positionName: '产品经理',
    headcount: 1,
    urgency: 'urgent',
    requirements: '1. 3年以上To B产品经验\n2. 熟悉HR SaaS产品优先\n3. 具备良好的需求分析和文档能力\n4. 能够独立推动项目落地',
    department: '产品部',
    applicantId: '2',
    applicantName: '李四',
    status: 'pending',
    createdAt: '2024-01-15'
  },
  {
    id: 'req-3',
    positionName: '后端工程师',
    headcount: 3,
    urgency: 'medium',
    requirements: '1. 4年以上Java后端开发经验\n2. 熟练掌握 Spring Boot、MyBatis\n3. 熟悉 MySQL、Redis 等数据库\n4. 有微服务架构经验优先',
    department: '技术部',
    applicantId: '9',
    applicantName: '陈十一',
    status: 'approved',
    reviewerId: '2',
    reviewerName: '李人事',
    reviewComment: '审批通过，待发布',
    createdAt: '2024-01-08',
    reviewedAt: '2024-01-10'
  },
  {
    id: 'req-4',
    positionName: 'UI设计师',
    headcount: 1,
    urgency: 'low',
    requirements: '1. 2年以上UI设计经验\n2. 熟练使用 Figma、Sketch\n3. 有移动端和Web端设计经验\n4. 具备良好的审美和交互理解',
    department: '设计部',
    applicantId: '10',
    applicantName: '林十二',
    status: 'closed',
    actualHiredCount: 1,
    closeReason: '已完成招聘，候选人林十二已入职',
    reviewerId: '2',
    reviewerName: '李人事',
    reviewComment: '同意发布',
    createdAt: '2023-10-15',
    reviewedAt: '2023-10-18',
    publishedAt: '2023-10-18',
    closedAt: '2024-05-20'
  },
  {
    id: 'req-5',
    positionName: '市场专员',
    headcount: 2,
    urgency: 'high',
    requirements: '1. 2年以上B2B市场推广经验\n2. 熟悉线上线下营销渠道\n3. 具备文案撰写和活动策划能力\n4. 有行业资源优先',
    department: '市场部',
    applicantId: '4',
    applicantName: '赵六',
    status: 'rejected',
    reviewerId: '2',
    reviewerName: '李人事',
    reviewComment: '当前编制紧张，建议先优化现有人员配置，Q2后再考虑',
    createdAt: '2024-01-05',
    reviewedAt: '2024-01-07'
  },
  {
    id: 'req-6',
    positionName: '运营经理',
    headcount: 1,
    urgency: 'medium',
    requirements: '1. 5年以上互联网运营经验\n2. 有用户运营和活动运营经验\n3. 具备数据分析能力\n4. 带过团队优先',
    department: '运营部',
    applicantId: '8',
    applicantName: '郑十',
    status: 'published',
    reviewerId: '2',
    reviewerName: '李人事',
    reviewComment: '需求合理，尽快发布',
    createdAt: '2024-01-12',
    reviewedAt: '2024-01-14',
    publishedAt: '2024-01-14'
  }
]

export const mockAttachments: Attachment[] = [
  {
    id: 'att-1',
    name: '张三-身份证正面',
    originalName: '身份证正面.jpg',
    category: 'id_card',
    fileType: 'image/jpeg',
    fileSize: 2048000,
    url: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=800&h=500&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=200&h=150&fit=crop',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-01-15',
    description: '第二代居民身份证正面',
    isSensitive: true,
    watermarkText: '仅供公司人事档案使用 - 张三',
    ownerType: 'employee',
    ownerId: '1'
  },
  {
    id: 'att-2',
    name: '张三-身份证反面',
    originalName: '身份证反面.jpg',
    category: 'id_card',
    fileType: 'image/jpeg',
    fileSize: 1987000,
    url: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=800&h=500&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=200&h=150&fit=crop',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-01-15',
    description: '第二代居民身份证反面',
    isSensitive: true,
    watermarkText: '仅供公司人事档案使用 - 张三',
    ownerType: 'employee',
    ownerId: '1'
  },
  {
    id: 'att-3',
    name: '张三-本科毕业证书',
    originalName: '本科毕业证.pdf',
    category: 'education_certificate',
    fileType: 'application/pdf',
    fileSize: 3145728,
    url: '#',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-01-15',
    description: '北京大学计算机科学与技术专业本科毕业证书',
    isSensitive: true,
    watermarkText: '仅供公司人事档案使用 - 张三',
    ownerType: 'employee',
    ownerId: '1'
  },
  {
    id: 'att-4',
    name: '张三-2024年度体检报告',
    originalName: '2024体检报告.pdf',
    category: 'medical_report',
    fileType: 'application/pdf',
    fileSize: 5242880,
    url: '#',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-03-20',
    description: '年度入职体检报告，各项指标正常',
    isSensitive: true,
    watermarkText: '仅供公司人事档案使用 - 张三',
    ownerType: 'employee',
    ownerId: '1'
  },
  {
    id: 'att-5',
    name: '张三-学历学位证书',
    originalName: '学位证书.jpg',
    category: 'education_certificate',
    fileType: 'image/jpeg',
    fileSize: 2560000,
    url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=150&fit=crop',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-01-15',
    description: '学士学位证书',
    isSensitive: true,
    watermarkText: '仅供公司人事档案使用 - 张三',
    ownerType: 'employee',
    ownerId: '1'
  },
  {
    id: 'att-6',
    name: '李四-身份证正面',
    originalName: '身份证.jpg',
    category: 'id_card',
    fileType: 'image/jpeg',
    fileSize: 1890000,
    url: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=800&h=500&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=200&h=150&fit=crop',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-02-10',
    description: '身份证复印件',
    isSensitive: true,
    watermarkText: '仅供公司人事档案使用 - 李四',
    ownerType: 'employee',
    ownerId: '2'
  },
  {
    id: 'att-7',
    name: '李四-硕士毕业证书',
    originalName: '硕士毕业证.pdf',
    category: 'education_certificate',
    fileType: 'application/pdf',
    fileSize: 2834000,
    url: '#',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-02-10',
    description: '清华大学产品设计专业硕士毕业证书',
    isSensitive: true,
    watermarkText: '仅供公司人事档案使用 - 李四',
    ownerType: 'employee',
    ownerId: '2'
  },
  {
    id: 'att-8',
    name: 'Vue3进阶开发-课程大纲',
    originalName: 'Vue3课程大纲.docx',
    category: 'training_material',
    fileType: 'application/msword',
    fileSize: 1024000,
    url: '#',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-01-20',
    description: 'Vue 3 进阶开发课程详细大纲',
    isSensitive: false,
    ownerType: 'training',
    ownerId: 'tc-1'
  },
  {
    id: 'att-9',
    name: 'Vue3进阶开发-课件PPT',
    originalName: 'Vue3进阶开发.pptx',
    category: 'training_material',
    fileType: 'application/vnd.ms-powerpoint',
    fileSize: 10485760,
    url: '#',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-01-25',
    description: '课程培训PPT',
    isSensitive: false,
    ownerType: 'training',
    ownerId: 'tc-1'
  },
  {
    id: 'att-10',
    name: '项目管理实战-参考资料',
    originalName: 'PMBOK指南.pdf',
    category: 'training_material',
    fileType: 'application/pdf',
    fileSize: 8388608,
    url: '#',
    uploaderId: '2',
    uploaderName: '李人事',
    uploadDate: '2024-01-10',
    description: '项目管理知识体系指南',
    isSensitive: false,
    ownerType: 'training',
    ownerId: 'tc-2'
  }
]

export const mockInterviewers: Interviewer[] = mockEmployees
  .filter(e => e.status === 'active')
  .map(e => ({
    id: e.id,
    name: e.name,
    avatar: e.avatar,
    department: e.department,
    position: e.position
  }))

function generateMockInterviews(): InterviewSchedule[] {
  const today = new Date()
  const interviews: InterviewSchedule[] = []
  
  const interviewData = [
    { candidate: mockCandidates[2], round: 'first' as const, interviewer: mockInterviewers[0 % mockInterviewers.length], dateOffset: 1, status: 'scheduled' as const },
    { candidate: mockCandidates[3], round: 'first' as const, interviewer: mockInterviewers[1 % mockInterviewers.length], dateOffset: 1, status: 'scheduled' as const },
    { candidate: mockCandidates[4], round: 'second' as const, interviewer: mockInterviewers[2 % mockInterviewers.length], dateOffset: 2, status: 'scheduled' as const },
    { candidate: mockCandidates[5], round: 'second' as const, interviewer: mockInterviewers[3 % mockInterviewers.length], dateOffset: 2, status: 'scheduled' as const },
    { candidate: mockCandidates[6], round: 'final' as const, interviewer: mockInterviewers[4 % mockInterviewers.length], dateOffset: -1, status: 'completed' as const },
    { candidate: mockCandidates[7], round: 'final' as const, interviewer: mockInterviewers[5 % mockInterviewers.length], dateOffset: -2, status: 'completed' as const },
    { candidate: mockCandidates[0], round: 'first' as const, interviewer: mockInterviewers[6 % mockInterviewers.length], dateOffset: 3, status: 'scheduled' as const },
    { candidate: mockCandidates[1], round: 'first' as const, interviewer: mockInterviewers[7 % mockInterviewers.length], dateOffset: 4, status: 'scheduled' as const },
  ]
  
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  const locations = ['3楼会议室A', '3楼会议室B', '2楼小会议室', '线上会议']
  
  interviewData.forEach((data, index) => {
    const interviewDate = new Date(today)
    interviewDate.setDate(today.getDate() + data.dateOffset)
    
    const startTime = timeSlots[index % timeSlots.length]
    const [startHour, startMin] = startTime.split(':').map(Number)
    const endTime = `${String(startHour + 1).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`
    
    const result = data.status === 'completed' ? (index % 2 === 0 ? 'pass' : 'pending') : undefined
    
    interviews.push({
      id: `int-${index + 1}`,
      candidateId: data.candidate.id,
      candidateName: data.candidate.name,
      candidateAvatar: data.candidate.avatar,
      position: data.candidate.position,
      round: data.round,
      interviewerId: data.interviewer.id,
      interviewerName: data.interviewer.name,
      interviewerAvatar: data.interviewer.avatar,
      date: interviewDate.toISOString().split('T')[0],
      startTime,
      endTime,
      location: locations[index % locations.length],
      meetingLink: index % 3 === 0 ? 'https://meeting.example.com/room/123' : undefined,
      status: data.status,
      result,
      remarks: '请提前准备好简历和相关资料',
      createdAt: new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: '李人事'
    })
  })
  
  return interviews
}

export const mockInterviewSchedules: InterviewSchedule[] = generateMockInterviews()

export const mockInterviewEvaluations: InterviewEvaluation[] = [
  {
    id: 'eval-1',
    scheduleId: 'int-5',
    candidateId: 'can-7',
    candidateName: '郑小军',
    interviewerId: '9',
    interviewerName: '陈十一',
    overallScore: 88,
    technicalAbility: 90,
    communicationSkill: 85,
    problemSolving: 88,
    teamFit: 90,
    strengths: '技术功底扎实，有丰富的微服务架构经验，沟通表达清晰，能够主动承担责任',
    weaknesses: '对新技术的探索可以更深入一些',
    overallComment: '候选人具备扎实的Java基础和丰富的项目经验，对微服务架构有深入理解。沟通能力良好，能够清晰地表达自己的想法。团队协作能力强，有过带领小团队的经验。整体表现优秀，建议录用。',
    result: 'pass',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'eval-2',
    scheduleId: 'int-6',
    candidateId: 'can-8',
    candidateName: '孙小芳',
    interviewerId: '5',
    interviewerName: '孙七',
    overallScore: 82,
    technicalAbility: 75,
    communicationSkill: 88,
    problemSolving: 80,
    teamFit: 85,
    strengths: 'HR专业知识扎实，沟通能力强，有亲和力，善于处理人际关系',
    weaknesses: '对劳动法的某些细节理解不够深入',
    overallComment: '候选人有3年HR相关工作经验，熟悉招聘流程和员工关系管理。沟通表达能力优秀，有良好的服务意识。对人力资源管理有自己的理解和想法。建议进一步考察其处理复杂问题的能力。',
    result: 'pending',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
]

export const mockLeaveBalances: EmployeeLeaveBalance[] = mockEmployees.map(emp => {
  const totalAnnual = 10
  const usedAnnual = Math.floor(Math.random() * 5)
  return {
    employeeId: emp.id,
    employeeName: emp.name,
    annualLeaveTotal: totalAnnual,
    annualLeaveUsed: usedAnnual,
    annualLeaveRemaining: totalAnnual - usedAnnual,
    compensatoryLeaveTotal: 0,
    compensatoryLeaveUsed: 0,
    compensatoryLeaveRemaining: 0
  }
})

export const mockLeaveApplications: LeaveApplication[] = [
  {
    id: 'leave-1',
    employeeId: '1',
    employeeName: '张三',
    department: '技术部',
    leaveType: 'annual',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    startTime: '09:00',
    endTime: '18:00',
    totalDays: 2,
    reason: '家里有事需要处理',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '同意，请安排好工作交接',
    createdAt: '2024-01-10',
    approvedAt: '2024-01-11'
  },
  {
    id: 'leave-2',
    employeeId: '1',
    employeeName: '张三',
    department: '技术部',
    leaveType: 'sick',
    startDate: '2024-01-20',
    endDate: '2024-01-20',
    startTime: '09:00',
    endTime: '18:00',
    totalDays: 1,
    reason: '感冒发烧，需要休息',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '同意，注意身体',
    createdAt: '2024-01-19',
    approvedAt: '2024-01-19'
  },
  {
    id: 'leave-3',
    employeeId: '3',
    employeeName: '王五',
    department: '技术部',
    leaveType: 'personal',
    startDate: '2024-01-22',
    endDate: '2024-01-23',
    startTime: '09:00',
    endTime: '18:00',
    totalDays: 2,
    reason: '需要处理个人事务',
    status: 'pending',
    createdAt: '2024-01-18'
  },
  {
    id: 'leave-4',
    employeeId: '4',
    employeeName: '赵六',
    department: '市场部',
    leaveType: 'compensatory',
    startDate: '2024-01-25',
    endDate: '2024-01-25',
    startTime: '13:00',
    endTime: '18:00',
    totalDays: 0.5,
    reason: '上周加班调休半天',
    status: 'pending',
    createdAt: '2024-01-20'
  },
  {
    id: 'leave-5',
    employeeId: '2',
    employeeName: '李四',
    department: '产品部',
    leaveType: 'annual',
    startDate: '2024-02-01',
    endDate: '2024-02-05',
    startTime: '09:00',
    endTime: '18:00',
    totalDays: 5,
    reason: '春节提前回家',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '同意，假期愉快',
    createdAt: '2024-01-15',
    approvedAt: '2024-01-16'
  },
  {
    id: 'leave-6',
    employeeId: '10',
    employeeName: '林十二',
    department: '设计部',
    leaveType: 'marriage',
    startDate: '2024-02-10',
    endDate: '2024-02-20',
    startTime: '09:00',
    endTime: '18:00',
    totalDays: 11,
    reason: '结婚，请婚假',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '恭喜！新婚快乐！',
    createdAt: '2024-01-20',
    approvedAt: '2024-01-21'
  },
  {
    id: 'leave-7',
    employeeId: '7',
    employeeName: '吴九',
    department: '技术部',
    leaveType: 'sick',
    startDate: '2024-01-21',
    endDate: '2024-01-21',
    startTime: '09:00',
    endTime: '12:00',
    totalDays: 0.5,
    reason: '早上身体不适，下午再去上班',
    status: 'rejected',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '今天有重要项目上线，请坚持一下，或改请明天',
    createdAt: '2024-01-21',
    approvedAt: '2024-01-21'
  },
  {
    id: 'leave-8',
    employeeId: '8',
    employeeName: '郑十',
    department: '运营部',
    leaveType: 'annual',
    startDate: '2024-02-08',
    endDate: '2024-02-10',
    startTime: '09:00',
    endTime: '18:00',
    totalDays: 3,
    reason: '出去旅游放松一下',
    status: 'pending',
    createdAt: '2024-01-22'
  }
]

export const mockOvertimeApplications: OvertimeApplication[] = [
  {
    id: 'overtime-1',
    employeeId: '1',
    employeeName: '张三',
    department: '技术部',
    overtimeDate: '2026-06-02',
    startTime: '18:00',
    endTime: '21:00',
    totalHours: 3,
    reason: '项目上线紧急修复Bug',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '同意，辛苦了',
    createdAt: '2026-06-02',
    approvedAt: '2026-06-03'
  },
  {
    id: 'overtime-2',
    employeeId: '1',
    employeeName: '张三',
    department: '技术部',
    overtimeDate: '2026-06-05',
    startTime: '18:00',
    endTime: '22:00',
    totalHours: 4,
    reason: '新版本发布加班',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '同意，注意休息',
    createdAt: '2026-06-05',
    approvedAt: '2026-06-06'
  },
  {
    id: 'overtime-3',
    employeeId: '3',
    employeeName: '王五',
    department: '技术部',
    overtimeDate: '2026-06-01',
    startTime: '18:00',
    endTime: '20:00',
    totalHours: 2,
    reason: '配合测试团队完成功能验收',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '同意',
    createdAt: '2026-06-01',
    approvedAt: '2026-06-02'
  },
  {
    id: 'overtime-4',
    employeeId: '3',
    employeeName: '王五',
    department: '技术部',
    overtimeDate: '2026-06-07',
    startTime: '09:00',
    endTime: '18:00',
    totalHours: 8,
    reason: '周末加班赶项目进度',
    status: 'pending',
    createdAt: '2026-06-07'
  },
  {
    id: 'overtime-5',
    employeeId: '2',
    employeeName: '李四',
    department: '产品部',
    overtimeDate: '2026-06-03',
    startTime: '18:00',
    endTime: '20:30',
    totalHours: 2.5,
    reason: '准备产品评审会议材料',
    status: 'approved',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '同意',
    createdAt: '2026-06-03',
    approvedAt: '2026-06-04'
  },
  {
    id: 'overtime-6',
    employeeId: '7',
    employeeName: '吴九',
    department: '技术部',
    overtimeDate: '2026-06-04',
    startTime: '18:00',
    endTime: '21:30',
    totalHours: 3.5,
    reason: '回归测试，确保上线质量',
    status: 'rejected',
    approverId: '9',
    approverName: '陈十一',
    approvalComment: '测试工作应在工作时间内完成，建议优化测试计划',
    createdAt: '2026-06-04',
    approvedAt: '2026-06-05'
  },
  {
    id: 'overtime-7',
    employeeId: '4',
    employeeName: '赵六',
    department: '市场部',
    overtimeDate: '2026-06-06',
    startTime: '18:00',
    endTime: '20:00',
    totalHours: 2,
    reason: '准备市场活动方案',
    status: 'pending',
    createdAt: '2026-06-06'
  }
]
