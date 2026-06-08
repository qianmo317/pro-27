import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { EmployeeReferral, ReferralRanking, Candidate } from '@/types'
import { REFERRAL_STATUS_LABELS, REFERRAL_BONUS_RULES, DEPARTMENT_OPTIONS } from '@/types'
import { mockEmployeeReferrals, mockEmployees, mockUsers } from '@/mock/data'
import { useRecruitmentStore } from '@/stores/recruitment'

const STORAGE_KEY = 'hrm_referrals'

function loadReferrals(): EmployeeReferral[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load referrals from localStorage:', e)
  }
  return [...mockEmployeeReferrals]
}

export const useReferralStore = defineStore('referral', () => {
  const referrals = ref<EmployeeReferral[]>(loadReferrals())

  watch(
    () => referrals.value,
    (newVal) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
      } catch (e) {
        console.error('Failed to save referrals to localStorage:', e)
      }
    },
    { deep: true }
  )
  const currentPage = ref(1)
  const pageSize = ref(10)
  const filterStatus = ref<EmployeeReferral['status'] | null>(null)
  const filterDepartment = ref<string | null>(null)

  const pendingReferrals = computed(() =>
    referrals.value.filter(r => r.status === 'pending')
  )

  const activeReferrals = computed(() =>
    referrals.value.filter(r => ['pending', 'screening', 'interview', 'offer'].includes(r.status))
  )

  const hiredReferrals = computed(() =>
    referrals.value.filter(r => r.status === 'hired')
  )

  const totalBonusPaid = computed(() =>
    referrals.value
      .filter(r => r.status === 'hired' && r.bonusAmount)
      .reduce((sum, r) => sum + (r.bonusAmount || 0), 0)
  )

  const filteredReferrals = computed(() => {
    return referrals.value.filter(r => {
      if (filterStatus.value && r.status !== filterStatus.value) return false
      if (filterDepartment.value && r.referrerDepartment !== filterDepartment.value) return false
      return true
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  const paginatedReferrals = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredReferrals.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => filteredReferrals.value.length)

  const pagination = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    itemCount: total.value,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
    onUpdatePage: (page: number) => setCurrentPage(page),
    onUpdatePageSize: (size: number) => setPageSize(size)
  }))

  const departmentRankings = computed<ReferralRanking[]>(() => {
    const deptMap: Record<string, ReferralRanking> = {}

    DEPARTMENT_OPTIONS.forEach(dept => {
      deptMap[dept.value] = {
        department: dept.value,
        referralCount: 0,
        hiredCount: 0,
        totalBonus: 0,
        rank: 0,
        employees: []
      }
    })

    const empMap: Record<string, { id: string; name: string; referralCount: number; hiredCount: number; totalBonus: number }> = {}

    referrals.value.forEach(referral => {
      const dept = deptMap[referral.referrerDepartment]
      if (dept) {
        dept.referralCount++
        if (referral.status === 'hired') {
          dept.hiredCount++
          dept.totalBonus += referral.bonusAmount || 0
        }

        if (!empMap[referral.referrerId]) {
          empMap[referral.referrerId] = {
            id: referral.referrerId,
            name: referral.referrerName,
            referralCount: 0,
            hiredCount: 0,
            totalBonus: 0
          }
        }
        empMap[referral.referrerId].referralCount++
        if (referral.status === 'hired') {
          empMap[referral.referrerId].hiredCount++
          empMap[referral.referrerId].totalBonus += referral.bonusAmount || 0
        }
      }
    })

    Object.values(empMap).forEach(emp => {
      const referral = referrals.value.find(r => r.referrerId === emp.id)
      if (referral) {
        const dept = deptMap[referral.referrerDepartment]
        if (dept) {
          dept.employees.push(emp)
        }
      }
    })

    const rankings = Object.values(deptMap)
      .filter(d => d.referralCount > 0)
      .sort((a, b) => b.hiredCount - a.hiredCount || b.referralCount - a.referralCount)
      .map((dept, index) => ({
        ...dept,
        rank: index + 1,
        employees: dept.employees.sort((a, b) => b.hiredCount - a.hiredCount || b.referralCount - a.referralCount)
      }))

    return rankings
  })

  function calculateBonus(position: string): number {
    if (position.includes('总监') || position.includes('经理') || position.includes('M3') || position.includes('M4')) {
      return REFERRAL_BONUS_RULES.MANAGER
    } else if (position.includes('P6') || position.includes('专家') || position.includes('资深') || position.includes('架构师')) {
      return REFERRAL_BONUS_RULES.P6_ABOVE
    } else if (position.includes('P4') || position.includes('P5') || position.includes('高级')) {
      return REFERRAL_BONUS_RULES.P4_P5
    } else {
      return REFERRAL_BONUS_RULES.P4_BELOW
    }
  }

  function getReferralById(id: string): EmployeeReferral | undefined {
    return referrals.value.find(r => r.id === id)
  }

  function getReferralByCandidateId(candidateId: string): EmployeeReferral | undefined {
    return referrals.value.find(r => r.candidateId === candidateId)
  }

  function addReferral(data: {
    candidateName: string
    candidatePosition: string
    experience: string
    education: string
    matchScore: number
    matchDescription: string
    candidatePhone?: string
    candidateEmail?: string
    candidateResume?: string
  }) {
    const currentUser = mockUsers.find(u => u.role === 'employee') || mockUsers[2]
    const employee = mockEmployees.find(e => e.id === currentUser.id) || mockEmployees[0]

    const newId = `ref-${Date.now()}`
    const candidateId = `can-ref-${Date.now()}`

    const newReferral: EmployeeReferral = {
      id: newId,
      candidateId,
      candidateName: data.candidateName,
      candidatePosition: data.candidatePosition,
      referrerId: employee.id,
      referrerName: employee.name,
      referrerDepartment: employee.department,
      referrerPosition: employee.position,
      matchScore: data.matchScore,
      matchDescription: data.matchDescription,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    referrals.value.unshift(newReferral)

    const recruitmentStore = useRecruitmentStore()
    recruitmentStore.addCandidate({
      name: data.candidateName,
      position: data.candidatePosition,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidateId}`,
      appliedDate: new Date().toISOString().split('T')[0],
      experience: data.experience,
      education: data.education,
      source: 'referral',
      referrerId: employee.id,
      referrerName: employee.name,
      referrerDepartment: employee.department,
      matchScore: data.matchScore,
      matchDescription: data.matchDescription
    } as Candidate)

    return newReferral
  }

  function updateReferralStatus(id: string, status: EmployeeReferral['status'], remarks?: string) {
    const referral = referrals.value.find(r => r.id === id)
    if (referral) {
      referral.status = status
      referral.updatedAt = new Date().toISOString().split('T')[0]
      if (remarks) {
        referral.remarks = remarks
      }

      if (status === 'hired' && !referral.bonusAmount) {
        referral.bonusAmount = calculateBonus(referral.candidatePosition)
        referral.bonusPaidAt = new Date().toISOString().split('T')[0]
      }

      const recruitmentStore = useRecruitmentStore()
      if (status === 'screening') {
        recruitmentStore.moveCandidate(referral.candidateId, 'screening')
      } else if (status === 'interview') {
        recruitmentStore.moveCandidate(referral.candidateId, 'interview1')
      } else if (status === 'offer') {
        recruitmentStore.moveCandidate(referral.candidateId, 'offer')
      } else if (status === 'rejected') {
        recruitmentStore.moveCandidate(referral.candidateId, 'rejected')
      }
    }
  }

  function payBonus(id: string) {
    const referral = referrals.value.find(r => r.id === id)
    if (referral && referral.status === 'hired' && !referral.bonusPaidAt) {
      if (!referral.bonusAmount) {
        referral.bonusAmount = calculateBonus(referral.candidatePosition)
      }
      referral.bonusPaidAt = new Date().toISOString().split('T')[0]
      referral.updatedAt = new Date().toISOString().split('T')[0]
    }
  }

  function setFilterStatus(status: EmployeeReferral['status'] | null) {
    filterStatus.value = status
    currentPage.value = 1
  }

  function setFilterDepartment(department: string | null) {
    filterDepartment.value = department
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  return {
    referrals,
    currentPage,
    pageSize,
    filterStatus,
    filterDepartment,
    pendingReferrals,
    activeReferrals,
    hiredReferrals,
    totalBonusPaid,
    filteredReferrals,
    paginatedReferrals,
    total,
    pagination,
    departmentRankings,
    calculateBonus,
    getReferralById,
    getReferralByCandidateId,
    addReferral,
    updateReferralStatus,
    payBonus,
    setFilterStatus,
    setFilterDepartment,
    setCurrentPage,
    setPageSize
  }
})
