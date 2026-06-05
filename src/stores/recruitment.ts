import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Candidate } from '@/types'
import { mockCandidates } from '@/mock/data'

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

  return {
    candidates,
    screeningCandidates,
    interview1Candidates,
    interview2Candidates,
    offerCandidates,
    rejectedCandidates,
    moveCandidate,
    addCandidate,
    getStageCandidates
  }
})
