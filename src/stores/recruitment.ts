import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Candidate, CandidateSource, RecruitmentRequirement, RecruitmentRequirementStatus, RecruitmentUrgency } from '@/types'
import { mockCandidates, mockRecruitmentRequirements, mockUsers } from '@/mock/data'

export type StageType = 'screening' | 'interview1' | 'interview2' | 'offer' | 'rejected'

export const stageLabels: Record<StageType, string> = {
  screening: '简历筛选',
  interview1: '初试',
  interview2: '复试',
  offer: '发放 Offer',
  rejected: '已淘汰'
}

const CANDIDATES_STORAGE_KEY = 'hrm_candidates'
const REQUIREMENTS_STORAGE_KEY = 'hrm_requirements'

function loadCandidates(): Candidate[] {
  try {
    const stored = localStorage.getItem(CANDIDATES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const hasAllSources = parsed.every((c: Candidate) => c.source)
        if (hasAllSources) {
          return parsed
        }
      }
    }
  } catch (e) {
    console.error('Failed to load candidates from localStorage:', e)
  }
  return [...mockCandidates]
}

function loadRequirements(): RecruitmentRequirement[] {
  try {
    const stored = localStorage.getItem(REQUIREMENTS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load requirements from localStorage:', e)
  }
  return [...mockRecruitmentRequirements]
}

export const useRecruitmentStore = defineStore('recruitment', () => {
  const candidates = ref<Candidate[]>(loadCandidates())
  const requirements = ref<RecruitmentRequirement[]>(loadRequirements())

  watch(
    () => candidates.value,
    (newVal) => {
      try {
        localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(newVal))
      } catch (e) {
        console.error('Failed to save candidates to localStorage:', e)
      }
    },
    { deep: true }
  )

  watch(
    () => requirements.value,
    (newVal) => {
      try {
        localStorage.setItem(REQUIREMENTS_STORAGE_KEY, JSON.stringify(newVal))
      } catch (e) {
        console.error('Failed to save requirements to localStorage:', e)
      }
    },
    { deep: true }
  )
  const currentPage = ref(1)
  const pageSize = ref(10)
  const filterStatus = ref<RecruitmentRequirementStatus | null>(null)
  const filterUrgency = ref<RecruitmentUrgency | null>(null)

  const screeningCandidates = computed(() => 
    candidates.value.filter(c => c.stage === 'screening')
  )
  const interview1Candidates = computed(() => 
    candidates.value.filter(c => c.stage === 'interview1')
  )
  const interview2Candidates = computed(() => 
    candidates.value.filter(c => c.stage === 'interview2')
  )
  const offerCandidates = computed(() => 
    candidates.value.filter(c => c.stage === 'offer')
  )
  const rejectedCandidates = computed(() => 
    candidates.value.filter(c => c.stage === 'rejected')
  )

  function moveCandidate(candidateId: string, newStage: StageType) {
    const candidate = candidates.value.find(c => c.id === candidateId)
    if (candidate) {
      candidate.stage = newStage
    }
  }

  function addCandidate(candidate: Omit<Candidate, 'id' | 'stage' | 'source'> & { source?: CandidateSource }) {
    const newId = `can-${Date.now()}`
    candidates.value.push({ 
      ...candidate, 
      id: newId, 
      stage: 'screening',
      source: candidate.source || 'job_platform'
    })
  }

  function getStageCandidates(stage: StageType): Candidate[] {
    return candidates.value.filter(c => c.stage === stage)
  }

  const pendingRequirements = computed(() => 
    requirements.value.filter(r => r.status === 'pending')
  )

  const publishedRequirements = computed(() => 
    requirements.value.filter(r => r.status === 'published')
  )

  const publishedPositions = computed(() => 
    publishedRequirements.value.map(r => r.positionName)
  )

  function getRequirementsByFilters(status?: RecruitmentRequirementStatus, urgency?: RecruitmentUrgency) {
    return requirements.value.filter(r => {
      if (status && r.status !== status) return false
      if (urgency && r.urgency !== urgency) return false
      return true
    })
  }

  const filteredRequirements = computed(() => {
    return getRequirementsByFilters(
      filterStatus.value || undefined,
      filterUrgency.value || undefined
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  const paginatedRequirements = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredRequirements.value.slice(start, start + pageSize.value)
  })

  const total = computed(() => filteredRequirements.value.length)

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

  function setFilterStatus(status: RecruitmentRequirementStatus | null) {
    filterStatus.value = status
    currentPage.value = 1
  }

  function setFilterUrgency(urgency: RecruitmentUrgency | null) {
    filterUrgency.value = urgency
    currentPage.value = 1
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  function addRequirement(requirement: Omit<RecruitmentRequirement, 'id' | 'status' | 'createdAt' | 'applicantId' | 'applicantName'>) {
    const currentUser = mockUsers.find(u => u.role === 'employee') || mockUsers[2]
    const newId = `req-${Date.now()}`
    requirements.value.unshift({
      ...requirement,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      applicantId: currentUser.id,
      applicantName: currentUser.name
    })
  }

  function reviewRequirement(id: string, approved: boolean, comment: string) {
    const requirement = requirements.value.find(r => r.id === id)
    if (requirement && requirement.status === 'pending') {
      const reviewer = mockUsers.find(u => u.role === 'hr') || mockUsers[1]
      requirement.status = approved ? 'approved' : 'rejected'
      requirement.reviewerId = reviewer.id
      requirement.reviewerName = reviewer.name
      requirement.reviewComment = comment
      requirement.reviewedAt = new Date().toISOString().split('T')[0]
    }
  }

  function publishRequirement(id: string) {
    const requirement = requirements.value.find(r => r.id === id)
    if (requirement && requirement.status === 'approved') {
      requirement.status = 'published'
      requirement.publishedAt = new Date().toISOString().split('T')[0]
    }
  }

  function closeRequirement(id: string, actualHiredCount: number, closeReason: string) {
    const requirement = requirements.value.find(r => r.id === id)
    if (requirement && requirement.status === 'published') {
      requirement.status = 'closed'
      requirement.actualHiredCount = actualHiredCount
      requirement.closeReason = closeReason
      requirement.closedAt = new Date().toISOString().split('T')[0]
    }
  }

  function getRequirementById(id: string): RecruitmentRequirement | undefined {
    return requirements.value.find(r => r.id === id)
  }

  return {
    candidates,
    requirements,
    currentPage,
    pageSize,
    filterStatus,
    filterUrgency,
    screeningCandidates,
    interview1Candidates,
    interview2Candidates,
    offerCandidates,
    rejectedCandidates,
    pendingRequirements,
    publishedRequirements,
    publishedPositions,
    filteredRequirements,
    paginatedRequirements,
    total,
    pagination,
    moveCandidate,
    addCandidate,
    getStageCandidates,
    getRequirementsByFilters,
    addRequirement,
    reviewRequirement,
    publishRequirement,
    closeRequirement,
    getRequirementById,
    setFilterStatus,
    setFilterUrgency,
    setCurrentPage,
    setPageSize
  }
})
