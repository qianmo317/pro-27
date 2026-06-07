import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PerformancePlan, PerformanceAppraisal, KpiIndicator, PerformanceResultGrade } from '@/types'
import { mockPerformancePlans, mockPerformanceAppraisals } from '@/mock/data'
import { PERFORMANCE_GRADE_SALARY_SUGGESTION } from '@/types'

export const usePerformanceStore = defineStore('performance', () => {
  const plans = ref<PerformancePlan[]>([...mockPerformancePlans])
  const appraisals = ref<PerformanceAppraisal[]>([...mockPerformanceAppraisals])
  
  const searchKeyword = ref('')
  const filterPeriod = ref('')
  const filterDepartment = ref('')
  const filterGrade = ref('')
  const filterStatus = ref('')
  
  const currentPage = ref(1)
  const pageSize = ref(10)
  const planCurrentPage = ref(1)
  const planPageSize = ref(10)

  const filteredPlans = computed(() => {
    return plans.value.filter(plan => {
      const matchKeyword = !searchKeyword.value || 
        plan.name.includes(searchKeyword.value)
      const matchPeriod = !filterPeriod.value || plan.period.includes(filterPeriod.value)
      const matchDept = !filterDepartment.value || plan.department === filterDepartment.value || plan.department === '全公司'
      return matchKeyword && matchPeriod && matchDept
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  const paginatedPlans = computed(() => {
    const start = (planCurrentPage.value - 1) * planPageSize.value
    return filteredPlans.value.slice(start, start + planPageSize.value)
  })

  const planTotal = computed(() => filteredPlans.value.length)

  const filteredAppraisals = computed(() => {
    return appraisals.value.filter(appr => {
      const matchKeyword = !searchKeyword.value || 
        appr.employeeName.includes(searchKeyword.value) ||
        appr.department.includes(searchKeyword.value)
      const matchPeriod = !filterPeriod.value || appr.period === filterPeriod.value
      const matchDept = !filterDepartment.value || appr.department === filterDepartment.value
      const matchGrade = !filterGrade.value || appr.grade === filterGrade.value
      const matchStatus = !filterStatus.value || appr.status === filterStatus.value
      return matchKeyword && matchPeriod && matchDept && matchGrade && matchStatus
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  const paginatedAppraisals = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredAppraisals.value.slice(start, start + pageSize.value)
  })

  const appraisalTotal = computed(() => filteredAppraisals.value.length)

  const planPagination = computed(() => ({
    page: planCurrentPage.value,
    pageSize: planPageSize.value,
    itemCount: planTotal.value,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
    onUpdatePage: (page: number) => setPlanCurrentPage(page),
    onUpdatePageSize: (size: number) => setPlanPageSize(size)
  }))

  const appraisalPagination = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    itemCount: appraisalTotal.value,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
    onUpdatePage: (page: number) => setCurrentPage(page),
    onUpdatePageSize: (size: number) => setPageSize(size)
  }))

  const periods = computed(() => [...new Set(plans.value.map(p => p.period))].sort().reverse())

  const departments = computed(() => [...new Set(plans.value.map(p => p.department).filter(d => d !== '全公司'))])

  const activePlans = computed(() => plans.value.filter(p => p.status === 'active'))

  const pendingAppraisals = computed(() => appraisals.value.filter(a => a.status === 'pending'))

  const statistics = computed(() => {
    const approved = appraisals.value.filter(a => a.status === 'approved')
    const gradeCounts: Record<PerformanceResultGrade, number> = {
      excellent: 0,
      good: 0,
      qualified: 0,
      needs_improvement: 0
    }
    approved.forEach(a => {
      gradeCounts[a.grade]++
    })
    const avgScore = approved.length > 0 
      ? Math.round(approved.reduce((sum, a) => sum + a.totalScore, 0) / approved.length)
      : 0
    return {
      totalPlans: plans.value.length,
      totalAppraisals: appraisals.value.length,
      pendingCount: pendingAppraisals.value.length,
      completedCount: approved.length,
      avgScore,
      gradeDistribution: gradeCounts
    }
  })

  function getAppraisalsByEmployeeId(employeeId: string): PerformanceAppraisal[] {
    return appraisals.value
      .filter(a => a.employeeId === employeeId && a.status === 'approved')
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  function getAppraisalById(id: string): PerformanceAppraisal | undefined {
    return appraisals.value.find(a => a.id === id)
  }

  function getPlanById(id: string): PerformancePlan | undefined {
    return plans.value.find(p => p.id === id)
  }

  function getAppraisalsByPlanId(planId: string): PerformanceAppraisal[] {
    return appraisals.value.filter(a => a.planId === planId)
  }

  function getAppraisalsBySupervisorId(supervisorId: string): PerformanceAppraisal[] {
    return appraisals.value
      .filter(a => a.supervisorId === supervisorId && a.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  function addPlan(plan: Omit<PerformancePlan, 'id' | 'createdAt' | 'createdBy'>, creatorName: string) {
    const maxId = Math.max(...plans.value.map(p => Number(p.id.replace('plan-', ''))), 0)
    const newId = `plan-${maxId + 1}`
    const newPlan: PerformancePlan = {
      ...plan,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: creatorName
    }
    plans.value.push(newPlan)
    return newPlan
  }

  function updatePlan(id: string, data: Partial<PerformancePlan>) {
    const index = plans.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plans.value[index] = { ...plans.value[index], ...data }
    }
  }

  function deletePlan(id: string) {
    const index = plans.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plans.value.splice(index, 1)
      appraisals.value = appraisals.value.filter(a => a.planId !== id)
    }
  }

  function submitAppraisal(id: string, scores: { kpiId: string; score: number }[], comments: string) {
    const appraisal = appraisals.value.find(a => a.id === id)
    if (!appraisal) return

    const plan = plans.value.find(p => p.id === appraisal.planId)
    if (!plan) return

    const updatedScores = appraisal.scores.map(s => {
      const newScore = scores.find(sc => sc.kpiId === s.kpiId)?.score ?? s.score
      const weightedScore = Math.round(newScore * (s.weight / 100) * 10) / 10
      return { ...s, score: newScore, weightedScore }
    })

    const totalScore = Math.round(updatedScores.reduce((sum, s) => sum + s.weightedScore, 0))
    let grade: PerformanceResultGrade
    if (totalScore >= 90) grade = 'excellent'
    else if (totalScore >= 75) grade = 'good'
    else if (totalScore >= 60) grade = 'qualified'
    else grade = 'needs_improvement'

    let salaryAdjustmentAmount = 0
    if (grade === 'excellent') salaryAdjustmentAmount = 2000 + Math.floor(Math.random() * 1500)
    else if (grade === 'good') salaryAdjustmentAmount = 1000 + Math.floor(Math.random() * 1000)
    else if (grade === 'qualified') salaryAdjustmentAmount = 300 + Math.floor(Math.random() * 500)

    const index = appraisals.value.findIndex(a => a.id === id)
    if (index !== -1) {
      appraisals.value[index] = {
        ...appraisal,
        scores: updatedScores,
        totalScore,
        grade,
        comments,
        salaryAdjustmentSuggestion: PERFORMANCE_GRADE_SALARY_SUGGESTION[grade],
        salaryAdjustmentAmount,
        status: 'submitted',
        submittedAt: new Date().toISOString().split('T')[0]
      }
    }
  }

  function approveAppraisal(id: string) {
    const index = appraisals.value.findIndex(a => a.id === id)
    if (index !== -1) {
      appraisals.value[index] = {
        ...appraisals.value[index],
        status: 'approved',
        approvedAt: new Date().toISOString().split('T')[0]
      }
    }
  }

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
    currentPage.value = 1
    planCurrentPage.value = 1
  }

  function setFilterPeriod(period: string) {
    filterPeriod.value = period
    currentPage.value = 1
    planCurrentPage.value = 1
  }

  function setFilterDepartment(dept: string) {
    filterDepartment.value = dept
    currentPage.value = 1
    planCurrentPage.value = 1
  }

  function setFilterGrade(grade: string) {
    filterGrade.value = grade
    currentPage.value = 1
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function setPlanCurrentPage(page: number) {
    planCurrentPage.value = page
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  function setPlanPageSize(size: number) {
    planPageSize.value = size
    planCurrentPage.value = 1
  }

  function generateAppraisalsForPlan(planId: string, employees: { id: string; name: string; department: string; supervisorId: string; supervisorName: string }[]) {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan) return

    const existingAppraisals = appraisals.value.filter(a => a.planId === planId)
    const existingEmployeeIds = new Set(existingAppraisals.map(a => a.employeeId))

    employees.forEach(emp => {
      if (existingEmployeeIds.has(emp.id)) return

      const scores = plan.kpiIndicators.map(kpi => ({
        kpiId: kpi.id,
        kpiName: kpi.name,
        score: 0,
        weight: kpi.weight,
        weightedScore: 0
      }))

      const newAppraisal: PerformanceAppraisal = {
        id: `appr-${Date.now()}-${emp.id}`,
        planId: plan.id,
        planName: plan.name,
        period: plan.period,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        supervisorId: emp.supervisorId,
        supervisorName: emp.supervisorName,
        scores,
        totalScore: 0,
        grade: 'qualified',
        comments: '',
        salaryAdjustmentSuggestion: '',
        salaryAdjustmentAmount: 0,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      }

      appraisals.value.push(newAppraisal)
    })
  }

  return {
    plans,
    appraisals,
    searchKeyword,
    filterPeriod,
    filterDepartment,
    filterGrade,
    filterStatus,
    currentPage,
    pageSize,
    planCurrentPage,
    planPageSize,
    filteredPlans,
    paginatedPlans,
    planTotal,
    planPagination,
    filteredAppraisals,
    paginatedAppraisals,
    appraisalTotal,
    appraisalPagination,
    periods,
    departments,
    activePlans,
    pendingAppraisals,
    statistics,
    getAppraisalsByEmployeeId,
    getAppraisalById,
    getPlanById,
    getAppraisalsByPlanId,
    getAppraisalsBySupervisorId,
    addPlan,
    updatePlan,
    deletePlan,
    submitAppraisal,
    approveAppraisal,
    setSearchKeyword,
    setFilterPeriod,
    setFilterDepartment,
    setFilterGrade,
    setFilterStatus,
    setCurrentPage,
    setPlanCurrentPage,
    setPageSize,
    setPlanPageSize,
    generateAppraisalsForPlan
  }
})
