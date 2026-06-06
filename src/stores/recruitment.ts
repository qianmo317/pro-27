import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Candidate, RecruitmentRequirement, RecruitmentRequirementStatus, RecruitmentUrgency } from '@/types'
import { mockCandidates, mockRecruitmentRequirements, mockUsers } from '@/mock/data'

export type StageType = 'screening' | 'interview1' | 'interview2' | 'offer' | 'rejected'

export const stageLabels: Record<StageType, string> = {
  screening: '简历筛选',
  interview1: '初试',
  interview2: '复试',
  offer: '发放 Offer',
  rejected: '已淘汰'
}

export const useRecruitmentStore = defineStore('recruitment', () => {
  const candidates = ref<Candidate[]>([...mockCandidates])
  const requirements = ref<RecruitmentRequirement[]>([...mockRecruitmentRequirements])

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

  function addCandidate(candidate: Omit<Candidate, 'id' | 'stage'>) {
    const newId = `can-${Date.now()}`
    candidates.value.push({ ...candidate, id: newId, stage: 'screening' })
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
    screeningCandidates,
    interview1Candidates,
    interview2Candidates,
    offerCandidates,
    rejectedCandidates,
    pendingRequirements,
    publishedRequirements,
    publishedPositions,
    moveCandidate,
    addCandidate,
    getStageCandidates,
    getRequirementsByFilters,
    addRequirement,
    reviewRequirement,
    publishRequirement,
    closeRequirement,
    getRequirementById
  }
})
