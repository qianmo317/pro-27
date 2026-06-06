import type { User, Employee, AttendanceRecord, SalaryRecord, Candidate, TrainingCourse, Department, Contract, Attachment, PerformancePlan, PerformanceAppraisal, KpiIndicator, EmployeeTransfer, RecruitmentRequirement, InterviewSchedule, InterviewEvaluation, Interviewer } from '@/types'

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
  { id: '1', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', gender: 'male', phone: '13800138001', email: 'zhangsan@company.com', department: '技术部', position: '高级前端工程师', entryDate: '2022-03-15', status: 'active' },
  { id: '2', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', gender: 'female', phone: '13800138002', email: 'lisi@company.com', department: '产品部', position: '产品经理', entryDate: '2021-08-20', status: 'active' },
  { id: '3', name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', gender: 'male', phone: '13800138003', email: 'wangwu@company.com', department: '技术部', position: '后端工程师', entryDate: '2023-01-10', status: 'probation' },
  { id: '4', name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu', gender: 'female', phone: '13800138004', email: 'zhaoliu@company.com', department: '市场部', position: '市场专员', entryDate: '2020-06-01', status: 'active' },
  { id: '5', name: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi', gender: 'male', phone: '13800138005', email: 'sunqi@company.com', department: '人力资源部', position: 'HR 专员', entryDate: '2021-11-30', status: 'active' },
  { id: '6', name: '周八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba', gender: 'female', phone: '13800138006', email: 'zhouba@company.com', department: '财务部', position: '财务主管', entryDate: '2019-09-15', status: 'active' },
  { id: '7', name: '吴九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu', gender: 'male', phone: '13800138007', email: 'wujiu@company.com', department: '技术部', position: '测试工程师', entryDate: '2022-07-25', status: 'active' },
  { id: '8', name: '郑十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi', gender: 'female', phone: '13800138008', email: 'zhengshi@company.com', department: '运营部', position: '运营经理', entryDate: '2023-04-18', status: 'probation' },
  { id: '9', name: '陈十一', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenshiyi', gender: 'male', phone: '13800138009', email: 'chenshiyi@company.com', department: '技术部', position: '架构师', entryDate: '2018-02-14', status: 'active' },
  { id: '10', name: '林十二', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linshier', gender: 'female', phone: '13800138010', email: 'linshier@company.com', department: '设计部', position: 'UI 设计师', entryDate: '2021-05-20', status: 'active' }
]

export const mockAttendanceRecords: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2024, 0, i + 1)
  const day = date.getDay()
  if (day === 0 || day === 6) return null
  return {
    id: `att-${i}`,
    employeeId: mockEmployees[i % mockEmployees.length].id,
    employeeName: mockEmployees[i % mockEmployees.length].name,
    date: date.toISOString().split('T')[0],
    checkIn: `${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    checkOut: `${17 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    status: ['normal', 'late', 'early', 'absent'][Math.floor(Math.random() * 4)] as AttendanceRecord['status']
  }
}).filter(Boolean) as AttendanceRecord[]

export const mockSalaryRecords: SalaryRecord[] = [
  { id: 'sal-1', employeeId: '1', employeeName: '张三', month: '2024-01', baseSalary: 18000, bonus: 3000, allowance: 500, deduction: 1500, netSalary: 20000 },
  { id: 'sal-2', employeeId: '1', employeeName: '张三', month: '2024-02', baseSalary: 18000, bonus: 2500, allowance: 500, deduction: 1500, netSalary: 19500 },
  { id: 'sal-3', employeeId: '1', employeeName: '张三', month: '2024-03', baseSalary: 18000, bonus: 4000, allowance: 500, deduction: 1500, netSalary: 21000 },
  { id: 'sal-4', employeeId: '2', employeeName: '李四', month: '2024-01', baseSalary: 20000, bonus: 3500, allowance: 500, deduction: 1800, netSalary: 22200 },
  { id: 'sal-5', employeeId: '2', employeeName: '李四', month: '2024-02', baseSalary: 20000, bonus: 3000, allowance: 500, deduction: 1800, netSalary: 21700 },
  { id: 'sal-6', employeeId: '3', employeeName: '王五', month: '2024-01', baseSalary: 12000, bonus: 1000, allowance: 500, deduction: 1000, netSalary: 12500 },
  { id: 'sal-7', employeeId: '4', employeeName: '赵六', month: '2024-01', baseSalary: 10000, bonus: 1500, allowance: 500, deduction: 800, netSalary: 11200 },
  { id: 'sal-8', employeeId: '5', employeeName: '孙七', month: '2024-01', baseSalary: 11000, bonus: 1200, allowance: 500, deduction: 900, netSalary: 11800 }
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

function buildDepartmentTree(): Department[] {
  const deptEmployees: Record<string, Employee[]> = {}
  mockEmployees.forEach(emp => {
    if (!deptEmployees[emp.department]) {
      deptEmployees[emp.department] = []
    }
    deptEmployees[emp.department].push(emp)
  })

  const departments: Department[] = [
    {
      id: 'dept-1',
      name: '总公司',
      parentId: null,
      manager: '陈十一',
      employeeCount: mockEmployees.length,
      employees: mockEmployees,
      children: [
        {
          id: 'dept-2',
          name: '技术部',
          parentId: 'dept-1',
          manager: '陈十一',
          employeeCount: (deptEmployees['技术部'] || []).length,
          employees: deptEmployees['技术部'] || [],
          children: [
            { id: 'dept-6', name: '前端组', parentId: 'dept-2', manager: '张三', employeeCount: 1, employees: deptEmployees['技术部']?.filter(e => e.position.includes('前端')) || [] },
            { id: 'dept-7', name: '后端组', parentId: 'dept-2', manager: '王五', employeeCount: 1, employees: deptEmployees['技术部']?.filter(e => e.position.includes('后端') || e.position.includes('架构')) || [] },
            { id: 'dept-8', name: '测试组', parentId: 'dept-2', manager: '吴九', employeeCount: 1, employees: deptEmployees['技术部']?.filter(e => e.position.includes('测试')) || [] }
          ]
        },
        {
          id: 'dept-3',
          name: '产品部',
          parentId: 'dept-1',
          manager: '李四',
          employeeCount: (deptEmployees['产品部'] || []).length,
          employees: deptEmployees['产品部'] || []
        },
        {
          id: 'dept-4',
          name: '市场部',
          parentId: 'dept-1',
          manager: '赵六',
          employeeCount: (deptEmployees['市场部'] || []).length,
          employees: deptEmployees['市场部'] || []
        },
        {
          id: 'dept-5',
          name: '人力资源部',
          parentId: 'dept-1',
          manager: '孙七',
          employeeCount: (deptEmployees['人力资源部'] || []).length,
          employees: deptEmployees['人力资源部'] || []
        },
        {
          id: 'dept-9',
          name: '财务部',
          parentId: 'dept-1',
          manager: '周八',
          employeeCount: (deptEmployees['财务部'] || []).length,
          employees: deptEmployees['财务部'] || []
        },
        {
          id: 'dept-10',
          name: '运营部',
          parentId: 'dept-1',
          manager: '郑十',
          employeeCount: (deptEmployees['运营部'] || []).length,
          employees: deptEmployees['运营部'] || []
        },
        {
          id: 'dept-11',
          name: '设计部',
          parentId: 'dept-1',
          manager: '林十二',
          employeeCount: (deptEmployees['设计部'] || []).length,
          employees: deptEmployees['设计部'] || []
        }
      ]
    }
  ]

  return departments
}

export const mockDepartments: Department[] = buildDepartmentTree()

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
