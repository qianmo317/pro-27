<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">面试日程</div>
      <div class="header-actions">
        <n-space>
          <n-radio-group v-model:value="viewMode" button-style>
            <n-radio value="day">日视图</n-radio>
            <n-radio value="week">周视图</n-radio>
          </n-radio-group>
          <n-button type="primary" @click="showScheduleModal = true">
            <template #icon>
              <Plus :size="16" />
            </template>
            预约面试
          </n-button>
        </n-space>
      </div>
    </div>

    <div class="calendar-header">
      <div class="date-nav">
        <n-button circle size="small" @click="navigateDate(-1)">
          <template #icon>
            <ChevronLeft :size="18" />
          </template>
        </n-button>
        <div class="current-date">{{ currentDateText }}</div>
        <n-button circle size="small" @click="navigateDate(1)">
          <template #icon>
            <ChevronRight :size="18" />
          </template>
        </n-button>
        <n-button size="small" @click="goToToday">今天</n-button>
      </div>
    </div>

    <div v-if="viewMode === 'week'" class="week-view">
      <div class="week-header">
        <div 
          v-for="day in weekDays" 
          :key="day.dateStr" 
          class="week-day-header"
          :class="{ 'is-today': day.isToday }"
        >
          <div class="day-name">{{ day.dayName }}</div>
          <div class="day-number" :class="{ 'highlight': day.isToday }">{{ day.day }}</div>
        </div>
      </div>
      <div class="week-body">
        <div v-for="day in weekDays" :key="day.dateStr" class="week-day-column">
          <div 
            v-for="interview in getInterviewsByDate(day.dateStr)" 
            :key="interview.id"
            class="interview-card"
            :class="[`status-${interview.status}`, `round-${interview.round}`]"
            @click="viewInterviewDetail(interview)"
          >
            <div class="interview-time">{{ interview.startTime }} - {{ interview.endTime }}</div>
            <div class="interview-candidate">{{ interview.candidateName }}</div>
            <div class="interview-position">{{ interview.position }}</div>
            <div class="interview-round-tag">
              <n-tag size="small" :type="getRoundTagType(interview.round)">
                {{ INTERVIEW_ROUND_LABELS[interview.round] }}
              </n-tag>
            </div>
          </div>
          <div v-if="getInterviewsByDate(day.dateStr).length === 0" class="no-interviews">
            <Empty description="暂无面试" :icon-size="24" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="day-view">
      <div class="day-timeline">
        <div class="time-slots">
          <div v-for="hour in timeSlots" :key="hour" class="time-slot">
            <div class="slot-time">{{ String(hour).padStart(2, '0') }}:00</div>
            <div class="slot-line"></div>
          </div>
        </div>
        <div class="day-events">
          <div 
            v-for="interview in dayInterviews" 
            :key="interview.id"
            class="interview-event"
            :class="[`status-${interview.status}`, `round-${interview.round}`]"
            :style="getEventStyle(interview)"
            @click="viewInterviewDetail(interview)"
          >
            <div class="event-header">
              <span class="event-time">{{ interview.startTime }} - {{ interview.endTime }}</span>
              <n-tag size="small" :type="getRoundTagType(interview.round)">
                {{ INTERVIEW_ROUND_LABELS[interview.round] }}
              </n-tag>
            </div>
            <div class="event-candidate">{{ interview.candidateName }}</div>
            <div class="event-position">{{ interview.position }}</div>
            <div class="event-interviewer">
              <n-avatar round :src="interview.interviewerAvatar" :size="20" />
              <span>{{ interview.interviewerName }}</span>
            </div>
            <div class="event-location">
              <MapPin :size="12" />
              <span>{{ interview.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showDetailModal" preset="card" title="面试详情" style="width: 600px;">
      <div v-if="selectedInterview" class="interview-detail">
        <div class="detail-header">
          <n-avatar round :src="selectedInterview.candidateAvatar" :size="64" />
          <div class="candidate-info">
            <h3 class="candidate-name">{{ selectedInterview.candidateName }}</h3>
            <n-tag type="info">{{ selectedInterview.position }}</n-tag>
          </div>
          <div class="status-badge">
            <n-tag :type="getStatusTagType(selectedInterview.status)" size="large">
              {{ INTERVIEW_STATUS_LABELS[selectedInterview.status] }}
            </n-tag>
          </div>
        </div>

        <n-divider />

        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="面试轮次">
            <n-tag :type="getRoundTagType(selectedInterview.round)">
              {{ INTERVIEW_ROUND_LABELS[selectedInterview.round] }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="面试日期">{{ selectedInterview.date }}</n-descriptions-item>
          <n-descriptions-item label="面试时间">{{ selectedInterview.startTime }} - {{ selectedInterview.endTime }}</n-descriptions-item>
          <n-descriptions-item label="面试地点">{{ selectedInterview.location }}</n-descriptions-item>
          <n-descriptions-item label="面试官">
            <div class="interviewer-info">
              <n-avatar round :src="selectedInterview.interviewerAvatar" :size="24" />
              <span>{{ selectedInterview.interviewerName }}</span>
            </div>
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedInterview.meetingLink" label="会议链接">
            <a :href="selectedInterview.meetingLink" target="_blank" class="meeting-link">
              加入会议
            </a>
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedInterview.result" label="面试结果">
            <n-tag :type="INTERVIEW_RESULT_COLORS[selectedInterview.result]">
              {{ INTERVIEW_RESULT_LABELS[selectedInterview.result] }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedInterview.remarks" label="备注" :span="2">
            {{ selectedInterview.remarks }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider v-if="existingEvaluation" title="面试评价" />
        
        <div v-if="existingEvaluation" class="evaluation-section">
          <div class="score-overview">
            <n-statistic label="综合得分" :value="existingEvaluation.overallScore">
              <template #suffix>
                <span class="score-suffix">/ 100</span>
              </template>
            </n-statistic>
            <div class="result-badge">
              <n-tag :type="INTERVIEW_RESULT_COLORS[existingEvaluation.result]" size="large">
                {{ INTERVIEW_RESULT_LABELS[existingEvaluation.result] }}
              </n-tag>
            </div>
          </div>

          <div class="score-items">
            <div v-for="item in scoreItems" :key="item.key" class="score-item">
              <div class="score-label">{{ item.label }}</div>
              <n-progress 
                type="line" 
                :percentage="existingEvaluation[item.key as keyof typeof existingEvaluation] as number" 
                :color="getScoreColor(existingEvaluation[item.key as keyof typeof existingEvaluation] as number)"
                :show-indicator="false"
              />
              <div class="score-value">{{ existingEvaluation[item.key as keyof typeof existingEvaluation] as number }}分</div>
            </div>
          </div>

          <div class="evaluation-comments">
            <div class="comment-item">
              <div class="comment-label">
                <ThumbsUp :size="16" class="icon-positive" />
                优势
              </div>
              <p>{{ existingEvaluation.strengths }}</p>
            </div>
            <div class="comment-item">
              <div class="comment-label">
                <ThumbsDown :size="16" class="icon-negative" />
                待改进
              </div>
              <p>{{ existingEvaluation.weaknesses }}</p>
            </div>
            <div class="comment-item">
              <div class="comment-label">
                <MessageSquare :size="16" />
                综合评价
              </div>
              <p>{{ existingEvaluation.overallComment }}</p>
            </div>
          </div>
        </div>

        <div v-if="canEvaluate" class="evaluate-action">
          <n-alert type="info" title="待评价">
            本次面试已完成，请点击下方按钮录入面试评价
          </n-alert>
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button v-if="canEvaluate" type="primary" @click="openEvaluationModal">
            录入评价
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showEvaluationModal" preset="card" title="录入面试评价" style="width: 700px;">
      <n-form
        ref="evaluationFormRef"
        :model="evaluationForm"
        :rules="evaluationRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="面试结果" path="result">
          <n-radio-group v-model:value="evaluationForm.result">
            <n-space>
              <n-radio value="pass">通过</n-radio>
              <n-radio value="fail">不通过</n-radio>
              <n-radio value="pending">待定</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-divider title="评分项" />

        <div class="scoring-section">
          <div v-for="item in scoreItems" :key="item.key" class="scoring-item">
            <div class="scoring-label">{{ item.label }}</div>
            <n-slider 
              v-model:value="evaluationForm[item.key as keyof typeof evaluationForm] as number" 
              :min="0" 
              :max="100" 
              :marks="scoreMarks"
            />
            <div class="scoring-value">{{ evaluationForm[item.key as keyof typeof evaluationForm] as number }}分</div>
          </div>
        </div>

        <n-form-item label="综合得分">
          <n-input-number 
            v-model:value="evaluationForm.overallScore" 
            :min="0" 
            :max="100" 
            :show-button="false"
            style="width: 120px;"
          />
        </n-form-item>

        <n-divider title="评价内容" />

        <n-form-item label="优势" path="strengths">
          <n-input v-model:value="evaluationForm.strengths" type="textarea" :rows="2" placeholder="请描述候选人的优势" />
        </n-form-item>

        <n-form-item label="待改进" path="weaknesses">
          <n-input v-model:value="evaluationForm.weaknesses" type="textarea" :rows="2" placeholder="请描述候选人需要改进的地方" />
        </n-form-item>

        <n-form-item label="综合评价" path="overallComment">
          <n-input v-model:value="evaluationForm.overallComment" type="textarea" :rows="3" placeholder="请给出综合评价和建议" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showEvaluationModal = false">取消</n-button>
          <n-button type="primary" @click="submitEvaluation">提交评价</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showScheduleModal" preset="card" title="预约面试" style="width: 550px;">
      <n-form
        ref="scheduleFormRef"
        :model="scheduleForm"
        :rules="scheduleRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="候选人" path="candidateId">
          <n-select 
            v-model:value="scheduleForm.candidateId" 
            placeholder="请选择候选人"
            style="width: 100%;"
            :options="candidateOptions"
            filterable
            @update:value="handleCandidateChange"
          />
        </n-form-item>

        <n-form-item label="面试轮次" path="round">
          <n-select 
            v-model:value="scheduleForm.round" 
            placeholder="请选择面试轮次"
            style="width: 100%;"
            :options="roundOptions"
          />
        </n-form-item>

        <n-form-item label="面试官" path="interviewerId">
          <n-select 
            v-model:value="scheduleForm.interviewerId" 
            placeholder="请选择面试官"
            style="width: 100%;"
            :options="interviewerOptions"
            filterable
            @update:value="handleInterviewerChange"
          />
        </n-form-item>

        <n-form-item label="面试日期" path="date">
          <n-date-picker 
            v-model:value="scheduleForm.date" 
            type="date" 
            style="width: 100%;"
            :min-date="Date.now()"
          />
        </n-form-item>

        <n-space>
          <n-form-item label="开始时间" path="startTime">
            <n-time-picker 
              v-model:value="scheduleForm.startTime" 
              format="HH:mm"
              style="width: 150px;"
            />
          </n-form-item>
          <n-form-item label="结束时间" path="endTime">
            <n-time-picker 
              v-model:value="scheduleForm.endTime" 
              format="HH:mm"
              style="width: 150px;"
            />
          </n-form-item>
        </n-space>

        <n-form-item label="面试地点" path="location">
          <n-select 
            v-model:value="scheduleForm.location" 
            placeholder="请选择面试地点"
            style="width: 100%;"
            :options="locationOptions"
            allow-input
          />
        </n-form-item>

        <n-form-item label="会议链接" path="meetingLink">
          <n-input v-model:value="scheduleForm.meetingLink" placeholder="线上会议链接（可选）" />
        </n-form-item>

        <n-form-item label="备注" path="remarks">
          <n-input v-model:value="scheduleForm.remarks" type="textarea" :rows="2" placeholder="备注信息（可选）" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showScheduleModal = false">取消</n-button>
          <n-button type="primary" @click="submitSchedule">确认预约</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Plus, ChevronLeft, ChevronRight, MapPin, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-vue-next'
import { useInterviewStore, INTERVIEW_ROUND_LABELS, INTERVIEW_STATUS_LABELS, INTERVIEW_RESULT_LABELS, INTERVIEW_RESULT_COLORS, getNextStage } from '@/stores/interview'
import { useRecruitmentStore } from '@/stores/recruitment'
import { useMessage, NRadioGroup, NRadio, NCard, NButton, NSpace, NTag, NModal, NForm, NFormItem, NSelect, NDatePicker, NTimePicker, NInput, NText, NProgress, NSlider, NList, NListItem, NAvatar } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import type { InterviewSchedule, InterviewEvaluation, InterviewRound, InterviewResult } from '@/types'
import Empty from '@/components/Empty.vue'

const interviewStore = useInterviewStore()
const recruitmentStore = useRecruitmentStore()
const message = useMessage()

type ViewMode = 'week' | 'day'

const viewMode = ref<ViewMode>('week')

const currentDate = ref(new Date())
const selectedInterview = ref<InterviewSchedule | null>(null)
const existingEvaluation = ref<InterviewEvaluation | null>(null)

const showDetailModal = ref(false)
const showEvaluationModal = ref(false)
const showScheduleModal = ref(false)

const evaluationFormRef = ref<FormInst | null>(null)
const scheduleFormRef = ref<FormInst | null>(null)

const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

const scoreMarks = {
  0: '0',
  20: '20',
  40: '40',
  60: '60',
  80: '80',
  100: '100'
}

const scoreItems = [
  { key: 'technicalAbility', label: '专业能力' },
  { key: 'communicationSkill', label: '沟通能力' },
  { key: 'problemSolving', label: '问题解决' },
  { key: 'teamFit', label: '团队契合' }
]

const roundOptions: SelectOption[] = [
  { label: '初试', value: 'first' },
  { label: '复试', value: 'second' },
  { label: '三面', value: 'third' },
  { label: '终面', value: 'final' }
]

const locationOptions: SelectOption[] = [
  { label: '3楼会议室A', value: '3楼会议室A' },
  { label: '3楼会议室B', value: '3楼会议室B' },
  { label: '2楼小会议室', value: '2楼小会议室' },
  { label: '1楼大会议室', value: '1楼大会议室' },
  { label: '线上会议', value: '线上会议' }
]

const candidateOptions = computed(() => 
  recruitmentStore.candidates.map(c => ({
    label: `${c.name} - ${c.position}`,
    value: c.id,
    data: c
  }))
)

const interviewerOptions = computed(() =>
  interviewStore.interviewers.map(i => ({
    label: `${i.name} - ${i.department} ${i.position}`,
    value: i.id,
    data: i
  }))
)

const weekDays = computed(() => {
  const days = interviewStore.getWeekDates(currentDate.value)
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date().toISOString().split('T')[0]
  
  return days.map(date => {
    const dateStr = date.toISOString().split('T')[0]
    return {
      date,
      dateStr,
      dayName: dayNames[date.getDay()],
      day: date.getDate(),
      isToday: dateStr === today
    }
  })
})

const currentDateText = computed(() => {
  if (viewMode.value === 'week') {
    const start = weekDays.value[0]
    const end = weekDays.value[6]
    return `${start.date.getMonth() + 1}月${start.day}日 - ${end.date.getMonth() + 1}月${end.day}日`
  } else {
    const date = currentDate.value
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${dayNames[date.getDay()]}`
  }
})

const dayInterviews = computed(() => {
  const dateStr = currentDate.value.toISOString().split('T')[0]
  return interviewStore.getSchedulesByDate(dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const canEvaluate = computed(() => {
  if (!selectedInterview.value) return false
  return selectedInterview.value.status === 'completed' && !selectedInterview.value.result
})

const evaluationForm = reactive({
  overallScore: 80,
  technicalAbility: 80,
  communicationSkill: 80,
  problemSolving: 80,
  teamFit: 80,
  strengths: '',
  weaknesses: '',
  overallComment: '',
  result: 'pass' as InterviewResult
})

const evaluationRules: FormRules = {
  result: [{ required: true, message: '请选择面试结果', trigger: 'change' }],
  overallScore: [{ required: true, message: '请输入综合得分', trigger: 'blur' }],
  strengths: [{ required: true, message: '请描述候选人优势', trigger: 'blur' }],
  weaknesses: [{ required: true, message: '请描述待改进点', trigger: 'blur' }],
  overallComment: [{ required: true, message: '请输入综合评价', trigger: 'blur' }]
}

const scheduleForm = reactive({
  candidateId: '',
  candidateName: '',
  candidateAvatar: '',
  position: '',
  round: 'first' as InterviewRound,
  interviewerId: '',
  interviewerName: '',
  interviewerAvatar: '',
  date: null as number | null,
  startTime: null as number | null,
  endTime: null as number | null,
  location: '',
  meetingLink: '',
  remarks: ''
})

function convertDateToString(timestamp: number | null): string {
  if (!timestamp) return ''
  return new Date(timestamp).toISOString().split('T')[0]
}

function convertTimeToString(seconds: number | null): string {
  if (!seconds) return ''
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const scheduleRules: FormRules = {
  candidateId: [{ required: true, message: '请选择候选人', trigger: 'change' }],
  round: [{ required: true, message: '请选择面试轮次', trigger: 'change' }],
  interviewerId: [{ required: true, message: '请选择面试官', trigger: 'change' }],
  date: [{ required: true, message: '请选择面试日期', trigger: ['change', 'blur'] }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: ['change', 'blur'] }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: ['change', 'blur'] }],
  location: [{ required: true, message: '请选择面试地点', trigger: 'change' }]
}

function navigateDate(direction: number) {
  const newDate = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + direction * 7)
  } else {
    newDate.setDate(newDate.getDate() + direction)
  }
  currentDate.value = newDate
}

function goToToday() {
  currentDate.value = new Date()
}

function getInterviewsByDate(dateStr: string) {
  return interviewStore.getSchedulesByDate(dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

function getEventStyle(interview: InterviewSchedule) {
  const [startHour, startMin] = interview.startTime.split(':').map(Number)
  const [endHour, endMin] = interview.endTime.split(':').map(Number)
  
  const top = ((startHour - 9) * 60 + startMin) * 1.5
  const height = ((endHour - startHour) * 60 + (endMin - startMin)) * 1.5 - 8
  
  return {
    top: `${top}px`,
    height: `${Math.max(height, 60)}px`
  }
}

function getRoundTagType(round: InterviewRound): 'info' | 'warning' | 'success' | 'error' {
  const typeMap: Record<InterviewRound, 'info' | 'warning' | 'success' | 'error'> = {
    first: 'info',
    second: 'warning',
    third: 'info',
    final: 'success'
  }
  return typeMap[round]
}

function getStatusTagType(status: string): 'info' | 'warning' | 'success' | 'error' | 'default' {
  const typeMap: Record<string, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
    scheduled: 'warning',
    completed: 'success',
    cancelled: 'error',
    no_show: 'error'
  }
  return typeMap[status] || 'default'
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function viewInterviewDetail(interview: InterviewSchedule) {
  selectedInterview.value = interview
  existingEvaluation.value = interviewStore.getEvaluationByScheduleId(interview.id) || null
  showDetailModal.value = true
}

function openEvaluationModal() {
  if (!selectedInterview.value) return
  
  evaluationForm.overallScore = 80
  evaluationForm.technicalAbility = 80
  evaluationForm.communicationSkill = 80
  evaluationForm.problemSolving = 80
  evaluationForm.teamFit = 80
  evaluationForm.strengths = ''
  evaluationForm.weaknesses = ''
  evaluationForm.overallComment = ''
  evaluationForm.result = 'pass'
  
  showDetailModal.value = false
  showEvaluationModal.value = true
}

function submitEvaluation() {
  evaluationFormRef.value?.validate((errors) => {
    if (!errors && selectedInterview.value) {
      interviewStore.submitEvaluation({
        scheduleId: selectedInterview.value.id,
        candidateId: selectedInterview.value.candidateId,
        candidateName: selectedInterview.value.candidateName,
        interviewerId: selectedInterview.value.interviewerId,
        interviewerName: selectedInterview.value.interviewerName,
        ...evaluationForm
      })

      if (evaluationForm.result === 'pass') {
        const candidate = recruitmentStore.candidates.find(c => c.id === selectedInterview.value!.candidateId)
        if (candidate) {
          const nextStage = getNextStage(candidate.stage)
          if (nextStage) {
            recruitmentStore.moveCandidate(candidate.id, nextStage as any)
          }
        }
      }
      
      message.success('评价提交成功，已同步到候选人看板')
      showEvaluationModal.value = false
      
      existingEvaluation.value = interviewStore.getEvaluationByScheduleId(selectedInterview.value.id) || null
      selectedInterview.value = interviewStore.getScheduleById(selectedInterview.value.id) || null
      showDetailModal.value = true
    }
  })
}

function handleCandidateChange(value: string, option: SelectOption) {
  if (option && option.data) {
    const data = option.data as { name: string; avatar: string; position: string }
    scheduleForm.candidateName = data.name
    scheduleForm.candidateAvatar = data.avatar
    scheduleForm.position = data.position
  }
}

function handleInterviewerChange(value: string, option: SelectOption) {
  if (option && option.data) {
    const data = option.data as { name: string; avatar: string }
    scheduleForm.interviewerName = data.name
    scheduleForm.interviewerAvatar = data.avatar
  }
}

function submitSchedule() {
  scheduleFormRef.value?.validate((errors) => {
    if (!errors) {
      interviewStore.scheduleInterview({
        candidateId: scheduleForm.candidateId,
        candidateName: scheduleForm.candidateName,
        candidateAvatar: scheduleForm.candidateAvatar,
        position: scheduleForm.position,
        round: scheduleForm.round,
        interviewerId: scheduleForm.interviewerId,
        interviewerName: scheduleForm.interviewerName,
        interviewerAvatar: scheduleForm.interviewerAvatar,
        date: convertDateToString(scheduleForm.date),
        startTime: convertTimeToString(scheduleForm.startTime),
        endTime: convertTimeToString(scheduleForm.endTime),
        location: scheduleForm.location,
        meetingLink: scheduleForm.meetingLink || undefined,
        remarks: scheduleForm.remarks || undefined
      })
      
      message.success('面试预约成功')
      showScheduleModal.value = false
      
      scheduleForm.candidateId = ''
      scheduleForm.candidateName = ''
      scheduleForm.candidateAvatar = ''
      scheduleForm.position = ''
      scheduleForm.round = 'first'
      scheduleForm.interviewerId = ''
      scheduleForm.interviewerName = ''
      scheduleForm.interviewerAvatar = ''
      scheduleForm.date = null
      scheduleForm.startTime = null
      scheduleForm.endTime = null
      scheduleForm.location = ''
      scheduleForm.meetingLink = ''
      scheduleForm.remarks = ''
    }
  })
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-date {
  font-size: 18px;
  font-weight: 600;
  color: #1E1B4B;
  min-width: 200px;
  text-align: center;
}

.week-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
}

.week-day-header {
  padding: 16px 12px;
  text-align: center;
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.week-day-header:last-child {
  border-right: none;
}

.week-day-header.is-today {
  background: rgba(255, 255, 255, 0.15);
}

.day-name {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.day-number {
  font-size: 24px;
  font-weight: 600;
}

.day-number.highlight {
  background: white;
  color: #7C3AED;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.week-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 500px;
}

.week-day-column {
  padding: 12px;
  border-right: 1px solid #E5E7EB;
  min-height: 400px;
}

.week-day-column:last-child {
  border-right: none;
}

.interview-card {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid;
}

.interview-card:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.interview-card.status-scheduled {
  background: #FEF3C7;
  border-left-color: #F59E0B;
}

.interview-card.status-completed {
  background: #D1FAE5;
  border-left-color: #10B981;
}

.interview-card.status-cancelled {
  background: #FEE2E2;
  border-left-color: #EF4444;
  opacity: 0.7;
}

.interview-time {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.interview-candidate {
  font-size: 13px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 2px;
}

.interview-position {
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 6px;
}

.no-interviews {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.day-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.day-timeline {
  display: flex;
  position: relative;
  min-height: 600px;
}

.time-slots {
  width: 80px;
  border-right: 1px solid #E5E7EB;
}

.time-slot {
  height: 90px;
  position: relative;
}

.slot-time {
  position: absolute;
  top: 0;
  right: 8px;
  font-size: 12px;
  color: #9CA3AF;
  transform: translateY(-50%);
}

.slot-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-top: 1px dashed #E5E7EB;
}

.day-events {
  flex: 1;
  position: relative;
  padding: 0 16px;
}

.interview-event {
  position: absolute;
  left: 16px;
  right: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  border-left: 4px solid;
}

.interview-event:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.interview-event.status-scheduled {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-left-color: #F59E0B;
}

.interview-event.status-completed {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  border-left-color: #10B981;
}

.interview-event.status-cancelled {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  border-left-color: #EF4444;
  opacity: 0.7;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.event-time {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.event-candidate {
  font-size: 15px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 4px;
}

.event-position {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 6px;
}

.event-interviewer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4B5563;
  margin-bottom: 4px;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6B7280;
}

.interview-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.candidate-info {
  flex: 1;
}

.candidate-name {
  font-size: 20px;
  font-weight: 600;
  color: #1E1B4B;
  margin: 0 0 8px 0;
}

.interviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meeting-link {
  color: #7C3AED;
  text-decoration: none;
}

.meeting-link:hover {
  text-decoration: underline;
}

.score-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #F5F3FF;
  border-radius: 8px;
  margin-bottom: 16px;
}

.score-suffix {
  font-size: 16px;
  color: #6B7280;
}

.score-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-label {
  width: 80px;
  font-size: 14px;
  color: #4B5563;
}

.score-item .n-progress {
  flex: 1;
}

.score-value {
  width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.evaluation-comments {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
}

.comment-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 8px;
}

.icon-positive {
  color: #10B981;
}

.icon-negative {
  color: #EF4444;
}

.comment-item p {
  margin: 0;
  font-size: 14px;
  color: #4B5563;
  line-height: 1.6;
}

.evaluate-action {
  margin-top: 16px;
}

.scoring-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.scoring-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scoring-label {
  width: 100px;
  font-size: 14px;
  color: #4B5563;
}

.scoring-item .n-slider {
  flex: 1;
}

.scoring-value {
  width: 60px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #7C3AED;
}
</style>
