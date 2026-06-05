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

export type AttachmentCategory = 
  | 'id_card'
  | 'education_certificate'
  | 'medical_report'
  | 'resignation_proof'
  | 'labor_contract'
  | 'training_material'
  | 'other'

export interface Attachment {
  id: string
  name: string
  originalName: string
  category: AttachmentCategory
  fileType: string
  fileSize: number
  url: string
  thumbnail?: string
  uploaderId: string
  uploaderName: string
  uploadDate: string
  description?: string
  isSensitive: boolean
  watermarkText?: string
  ownerType: 'employee' | 'training' | 'other'
  ownerId: string
}

export const ATTACHMENT_CATEGORY_OPTIONS: { label: string; value: AttachmentCategory; isSensitive?: boolean }[] = [
  { label: '身份证', value: 'id_card', isSensitive: true },
  { label: '学历证书', value: 'education_certificate', isSensitive: true },
  { label: '体检报告', value: 'medical_report', isSensitive: true },
  { label: '离职证明', value: 'resignation_proof' },
  { label: '劳动合同', value: 'labor_contract', isSensitive: true },
  { label: '培训资料', value: 'training_material' },
  { label: '其他', value: 'other' }
]

export const ATTACHMENT_CATEGORY_LABELS: Record<AttachmentCategory, string> = {
  id_card: '身份证',
  education_certificate: '学历证书',
  medical_report: '体检报告',
  resignation_proof: '离职证明',
  labor_contract: '劳动合同',
  training_material: '培训资料',
  other: '其他'
}
