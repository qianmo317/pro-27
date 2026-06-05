import type { User, Employee, AttendanceRecord, SalaryRecord, Candidate, TrainingCourse, Department, Contract, Attachment } from '@/types'

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
