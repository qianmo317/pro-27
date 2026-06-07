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
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave'
  leaveType?: LeaveType
  leaveApplicationId?: string
}

export type LeaveType = 'personal' | 'sick' | 'annual' | 'compensatory' | 'marriage' | 'maternity' | 'other'

export const LEAVE_TYPE_OPTIONS: { label: string; value: LeaveType }[] = [
  { label: '事假', value: 'personal' },
  { label: '病假', value: 'sick' },
  { label: '年假', value: 'annual' },
  { label: '调休', value: 'compensatory' },
  { label: '婚假', value: 'marriage' },
  { label: '产假/陪产假', value: 'maternity' },
  { label: '其他', value: 'other' }
]

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  personal: '事假',
  sick: '病假',
  annual: '年假',
  compensatory: '调休',
  marriage: '婚假',
  maternity: '产假/陪产假',
  other: '其他'
}

export const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  personal: '#F59E0B',
  sick: '#EF4444',
  annual: '#10B981',
  compensatory: '#3B82F6',
  marriage: '#EC4899',
  maternity: '#8B5CF6',
  other: '#6B7280'
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export const LEAVE_STATUS_OPTIONS: { label: string; value: LeaveStatus }[] = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回'
}

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444'
}

export interface LeaveApplication {
  id: string
  employeeId: string
  employeeName: string
  department: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  totalDays: number
  reason: string
  status: LeaveStatus
  approverId?: string
  approverName?: string
  approvalComment?: string
  createdAt: string
  approvedAt?: string
}

export interface EmployeeLeaveBalance {
  employeeId: string
  employeeName: string
  annualLeaveTotal: number
  annualLeaveUsed: number
  annualLeaveRemaining: number
  compensatoryLeaveTotal: number
  compensatoryLeaveUsed: number
  compensatoryLeaveRemaining: number
}

export interface SalaryRecord {
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

export type TemplateType = 'position' | 'level' | 'department' | 'custom'

export const TEMPLATE_TYPE_OPTIONS: { label: string; value: TemplateType }[] = [
  { label: '岗位类型', value: 'position' },
  { label: '职级', value: 'level' },
  { label: '部门', value: 'department' },
  { label: '自定义', value: 'custom' }
]

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  position: '岗位类型',
  level: '职级',
  department: '部门',
  custom: '自定义'
}

export const TEMPLATE_TYPE_COLORS: Record<TemplateType, string> = {
  position: '#3B82F6',
  level: '#10B981',
  department: '#F59E0B',
  custom: '#8B5CF6'
}

export interface SalaryTemplate {
  id: string
  name: string
  type: TemplateType
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

export const TEMPLATE_STATUS_OPTIONS: { label: string; value: SalaryTemplate['status'] }[] = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
]

export const TEMPLATE_STATUS_LABELS: Record<SalaryTemplate['status'], string> = {
  active: '启用',
  inactive: '停用'
}

export const TEMPLATE_STATUS_COLORS: Record<SalaryTemplate['status'], string> = {
  active: '#10B981',
  inactive: '#6B7280'
}

export const POSITION_LEVEL_OPTIONS = [
  { label: 'P1 - 实习生', value: 'P1' },
  { label: 'P2 - 初级', value: 'P2' },
  { label: 'P3 - 中级', value: 'P3' },
  { label: 'P4 - 高级', value: 'P4' },
  { label: 'P5 - 专家', value: 'P5' },
  { label: 'P6 - 资深专家', value: 'P6' },
  { label: 'M1 - 主管', value: 'M1' },
  { label: 'M2 - 经理', value: 'M2' },
  { label: 'M3 - 总监', value: 'M3' },
  { label: 'M4 - 副总裁', value: 'M4' }
]

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

export type PerformanceCycleType = 'quarterly' | 'monthly'

export type PerformanceResultGrade = 'excellent' | 'good' | 'qualified' | 'needs_improvement'

export interface KpiIndicator {
  id: string
  name: string
  description: string
  weight: number
  maxScore: number
}

export interface PerformancePlan {
  id: string
  name: string
  cycleType: PerformanceCycleType
  period: string
  startDate: string
  endDate: string
  department: string
  kpiIndicators: KpiIndicator[]
  status: 'draft' | 'active' | 'completed'
  createdAt: string
  createdBy: string
}

export interface EmployeePerformanceScore {
  kpiId: string
  kpiName: string
  score: number
  weight: number
  weightedScore: number
}

export interface PerformanceAppraisal {
  id: string
  planId: string
  planName: string
  period: string
  employeeId: string
  employeeName: string
  department: string
  supervisorId: string
  supervisorName: string
  scores: EmployeePerformanceScore[]
  totalScore: number
  grade: PerformanceResultGrade
  comments: string
  salaryAdjustmentSuggestion: string
  salaryAdjustmentAmount: number
  status: 'pending' | 'submitted' | 'approved'
  submittedAt?: string
  approvedAt?: string
  createdAt: string
}

export const PERFORMANCE_GRADE_LABELS: Record<PerformanceResultGrade, string> = {
  excellent: '优秀',
  good: '良好',
  qualified: '合格',
  needs_improvement: '待改进'
}

export const PERFORMANCE_GRADE_COLORS: Record<PerformanceResultGrade, string> = {
  excellent: '#10B981',
  good: '#3B82F6',
  qualified: '#F59E0B',
  needs_improvement: '#EF4444'
}

export const PERFORMANCE_CYCLE_LABELS: Record<PerformanceCycleType, string> = {
  quarterly: '季度',
  monthly: '月度'
}

export const PERFORMANCE_GRADE_SALARY_SUGGESTION: Record<PerformanceResultGrade, string> = {
  excellent: '建议调薪 15%-20%，优先考虑晋升',
  good: '建议调薪 8%-12%',
  qualified: '建议调薪 3%-5% 或保持不变',
  needs_improvement: '建议不调薪，制定绩效改进计划'
}

export type TransferType = 'department_change' | 'promotion' | 'demotion' | 'salary_adjustment' | 'transfer_out' | 'transfer_in'

export interface EmployeeTransfer {
  id: string
  employeeId: string
  employeeName: string
  type: TransferType
  beforeDepartment: string
  beforePosition: string
  afterDepartment: string
  afterPosition: string
  reason: string
  effectiveDate: string
  status: 'pending' | 'effective' | 'cancelled'
  createdAt: string
  createdBy: string
  remarks?: string
}

export const TRANSFER_TYPE_OPTIONS: { label: string; value: TransferType }[] = [
  { label: '部门调动', value: 'department_change' },
  { label: '晋升', value: 'promotion' },
  { label: '降职', value: 'demotion' },
  { label: '薪资调整', value: 'salary_adjustment' },
  { label: '调入', value: 'transfer_in' },
  { label: '调出', value: 'transfer_out' }
]

export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  department_change: '部门调动',
  promotion: '晋升',
  demotion: '降职',
  salary_adjustment: '薪资调整',
  transfer_in: '调入',
  transfer_out: '调出'
}

export const TRANSFER_TYPE_COLORS: Record<TransferType, string> = {
  department_change: '#3B82F6',
  promotion: '#10B981',
  demotion: '#EF4444',
  salary_adjustment: '#F59E0B',
  transfer_in: '#8B5CF6',
  transfer_out: '#EC4899'
}

export const TRANSFER_STATUS_OPTIONS: { label: string; value: EmployeeTransfer['status'] }[] = [
  { label: '待生效', value: 'pending' },
  { label: '已生效', value: 'effective' },
  { label: '已取消', value: 'cancelled' }
]

export const TRANSFER_STATUS_LABELS: Record<EmployeeTransfer['status'], string> = {
  pending: '待生效',
  effective: '已生效',
  cancelled: '已取消'
}

export type RecruitmentRequirementStatus = 'pending' | 'approved' | 'rejected' | 'published' | 'closed'
export type RecruitmentUrgency = 'low' | 'medium' | 'high' | 'urgent'

export interface RecruitmentRequirement {
  id: string
  positionName: string
  headcount: number
  urgency: RecruitmentUrgency
  requirements: string
  department: string
  applicantId: string
  applicantName: string
  status: RecruitmentRequirementStatus
  actualHiredCount?: number
  closeReason?: string
  reviewerId?: string
  reviewerName?: string
  reviewComment?: string
  createdAt: string
  reviewedAt?: string
  publishedAt?: string
  closedAt?: string
}

export const RECRUITMENT_STATUS_OPTIONS: { label: string; value: RecruitmentRequirementStatus; color: string }[] = [
  { label: '待审核', value: 'pending', color: '#F59E0B' },
  { label: '已通过', value: 'approved', color: '#3B82F6' },
  { label: '已拒绝', value: 'rejected', color: '#EF4444' },
  { label: '已发布', value: 'published', color: '#10B981' },
  { label: '已关闭', value: 'closed', color: '#6B7280' }
]

export const RECRUITMENT_STATUS_LABELS: Record<RecruitmentRequirementStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  published: '已发布',
  closed: '已关闭'
}

export const RECRUITMENT_URGENCY_OPTIONS: { label: string; value: RecruitmentUrgency; color: string }[] = [
  { label: '普通', value: 'low', color: '#10B981' },
  { label: '一般', value: 'medium', color: '#3B82F6' },
  { label: '紧急', value: 'high', color: '#F59E0B' },
  { label: '特急', value: 'urgent', color: '#EF4444' }
]

export const RECRUITMENT_URGENCY_LABELS: Record<RecruitmentUrgency, string> = {
  low: '普通',
  medium: '一般',
  high: '紧急',
  urgent: '特急'
}

export type OvertimeStatus = 'pending' | 'approved' | 'rejected'

export const OVERTIME_STATUS_OPTIONS: { label: string; value: OvertimeStatus }[] = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]

export const OVERTIME_STATUS_LABELS: Record<OvertimeStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回'
}

export const OVERTIME_STATUS_COLORS: Record<OvertimeStatus, string> = {
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444'
}

export interface OvertimeApplication {
  id: string
  employeeId: string
  employeeName: string
  department: string
  overtimeDate: string
  startTime: string
  endTime: string
  totalHours: number
  reason: string
  status: OvertimeStatus
  approverId?: string
  approverName?: string
  approvalComment?: string
  createdAt: string
  approvedAt?: string
}

export const DEPARTMENT_OPTIONS = [
  { label: '技术部', value: '技术部' },
  { label: '产品部', value: '产品部' },
  { label: '市场部', value: '市场部' },
  { label: '人力资源部', value: '人力资源部' },
  { label: '财务部', value: '财务部' },
  { label: '运营部', value: '运营部' },
  { label: '设计部', value: '设计部' }
]

export type InterviewRound = 'first' | 'second' | 'third' | 'final'
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type InterviewResult = 'pass' | 'fail' | 'pending'

export const INTERVIEW_ROUND_LABELS: Record<InterviewRound, string> = {
  first: '初试',
  second: '复试',
  third: '三面',
  final: '终面'
}

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  scheduled: '待面试',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '未出席'
}

export const INTERVIEW_RESULT_LABELS: Record<InterviewResult, string> = {
  pass: '通过',
  fail: '不通过',
  pending: '待定'
}

export const INTERVIEW_RESULT_COLORS: Record<InterviewResult, 'success' | 'error' | 'warning'> = {
  pass: 'success',
  fail: 'error',
  pending: 'warning'
}

export interface InterviewSchedule {
  id: string
  candidateId: string
  candidateName: string
  candidateAvatar: string
  position: string
  round: InterviewRound
  interviewerId: string
  interviewerName: string
  interviewerAvatar: string
  date: string
  startTime: string
  endTime: string
  location: string
  meetingLink?: string
  status: InterviewStatus
  result?: InterviewResult
  remarks?: string
  createdAt: string
  createdBy: string
}

export interface InterviewEvaluation {
  id: string
  scheduleId: string
  candidateId: string
  candidateName: string
  interviewerId: string
  interviewerName: string
  overallScore: number
  technicalAbility: number
  communicationSkill: number
  problemSolving: number
  teamFit: number
  strengths: string
  weaknesses: string
  overallComment: string
  result: InterviewResult
  createdAt: string
}

export interface Interviewer {
  id: string
  name: string
  avatar: string
  department: string
  position: string
}
