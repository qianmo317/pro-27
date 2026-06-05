export interface User {
  id: string
  username: string
  name: string
  avatar: string
  role: 'admin' | 'hr' | 'employee'
  department: string
}

export interface Employee {
  id: string
  name: string
  avatar: string
  gender: 'male' | 'female'
  phone: string
  email: string
  department: string
  position: string
  entryDate: string
  status: 'active' | 'inactive' | 'probation'
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: 'normal' | 'late' | 'early' | 'absent'
}

export interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  month: string
  baseSalary: number
  bonus: number
  allowance: number
  deduction: number
  netSalary: number
}

export interface Candidate {
  id: string
  name: string
  avatar: string
  position: string
  stage: 'screening' | 'interview1' | 'interview2' | 'offer' | 'rejected'
  appliedDate: string
  experience: string
  education: string
}

export interface TrainingCourse {
  id: string
  title: string
  description: string
  instructor: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'ongoing' | 'completed'
  participants: number
}

export interface Department {
  id: string
  name: string
  parentId: string | null
  manager: string
  employeeCount: number
  children?: Department[]
  employees?: Employee[]
}

export interface Contract {
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

export interface MenuItem {
  key: string
  label: string
  icon: string
  path: string
}
