import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InterviewSchedule, InterviewEvaluation, InterviewRound, InterviewStatus, InterviewResult, Interviewer } from '@/types'
import { 
  mockInterviewSchedules, 
  mockInterviewEvaluations, 
  mockInterviewers, 
  mockUsers 
} from '@/mock/data'
import { useUserStore } from './user'

export function getNextStage(currentStage: string): string | null {
  const stages = ['screening', 'interview1', 'interview2', 'offer', 'rejected']
  const currentIndex = stages.indexOf(currentStage)
  if (currentIndex < stages.length - 2) {
    return stages[currentIndex + 1]
  }
  return null
}

export { 
  INTERVIEW_ROUND_LABELS, 
  INTERVIEW_STATUS_LABELS, 
  INTERVIEW_RESULT_LABELS, 
  INTERVIEW_RESULT_COLORS 
} from '@/types'

export const useInterviewStore = defineStore('interview', () => {
  const schedules = ref<InterviewSchedule[]>([...mockInterviewSchedules])
  const evaluations = ref<InterviewEvaluation[]>([...mockInterviewEvaluations])
  const interviewers = ref<Interviewer[]>([...mockInterviewers])

  const scheduledInterviews = computed(() =>
    schedules.value.filter(s => s.status === 'scheduled')
  )

  const completedInterviews = computed(() =>
    schedules.value.filter(s => s.status === 'completed')
  )

  const pendingEvaluationInterviews = computed(() =>
    schedules.value.filter(s => s.status === 'completed' && !s.result)
  )

  function getSchedulesByInterviewer(interviewerId: string) {
    return schedules.value.filter(s => s.interviewerId === interviewerId)
  }

  function getSchedulesByDateRange(startDate: string, endDate: string) {
    return schedules.value.filter(s => s.date >= startDate && s.date <= endDate)
  }

  function getSchedulesByDate(date: string) {
    return schedules.value.filter(s => s.date === date)
  }

  function getSchedulesByCandidate(candidateId: string) {
    return schedules.value.filter(s => s.candidateId === candidateId)
  }

  function getInterviewersByDepartment(department: string) {
    return interviewers.value.filter(i => i.department === department)
  }

  function getUpcomingInterviewsByInterviewer(interviewerId: string, limit = 5) {
    const today = new Date().toISOString().split('T')[0]
    return schedules.value
      .filter(s => s.interviewerId === interviewerId && s.date >= today && s.status === 'scheduled')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.startTime.localeCompare(b.startTime)
      })
      .slice(0, limit)
  }

  function getScheduleById(id: string): InterviewSchedule | undefined {
    return schedules.value.find(s => s.id === id)
  }

  function getEvaluationByScheduleId(scheduleId: string): InterviewEvaluation | undefined {
    return evaluations.value.find(e => e.scheduleId === scheduleId)
  }

  function scheduleInterview(data: {
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
    remarks?: string
  }) {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      throw new Error('用户未登录，无法预约面试')
    }
    
    const newId = `int-${Date.now()}`
    const newSchedule: InterviewSchedule = {
      ...data,
      id: newId,
      status: 'scheduled',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: userStore.currentUser.name
    }
    schedules.value.unshift(newSchedule)
    return newSchedule
  }

  function updateSchedule(id: string, data: Partial<InterviewSchedule>) {
    const index = schedules.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules.value[index] = { ...schedules.value[index], ...data }
    }
  }

  function updateScheduleStatus(id: string, status: InterviewStatus) {
    const schedule = schedules.value.find(s => s.id === id)
    if (schedule) {
      schedule.status = status
    }
  }

  function cancelSchedule(id: string, reason: string) {
    const schedule = schedules.value.find(s => s.id === id)
    if (schedule) {
      schedule.status = 'cancelled'
      schedule.remarks = reason
    }
  }

  function submitEvaluation(data: {
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
  }) {
    const newId = `eval-${Date.now()}`
    const newEvaluation: InterviewEvaluation = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    }
    evaluations.value.unshift(newEvaluation)

    const schedule = schedules.value.find(s => s.id === data.scheduleId)
    if (schedule) {
      schedule.result = data.result
      schedule.status = 'completed'
    }

    return newEvaluation
  }

  function getWeekDates(date: Date): Date[] {
    const result: Date[] = []
    const current = new Date(date)
    const day = current.getDay()
    const diff = current.getDate() - day + (day === 0 ? -6 : 1)
    current.setDate(diff)
    
    for (let i = 0; i < 7; i++) {
      result.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return result
  }

  function getInterviewsByWeek(date: Date) {
    const weekDates = getWeekDates(date)
    const startDate = weekDates[0].toISOString().split('T')[0]
    const endDate = weekDates[6].toISOString().split('T')[0]
    return getSchedulesByDateRange(startDate, endDate)
  }

  return {
    schedules,
    evaluations,
    interviewers,
    scheduledInterviews,
    completedInterviews,
    pendingEvaluationInterviews,
    getSchedulesByInterviewer,
    getSchedulesByDateRange,
    getSchedulesByDate,
    getSchedulesByCandidate,
    getInterviewersByDepartment,
    getUpcomingInterviewsByInterviewer,
    getScheduleById,
    getEvaluationByScheduleId,
    scheduleInterview,
    updateSchedule,
    updateScheduleStatus,
    cancelSchedule,
    submitEvaluation,
    getWeekDates,
    getInterviewsByWeek
  }
})
