<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">招聘看板</div>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <Plus :size="16" />
        </template>
        添加候选人
      </n-button>
    </div>
    
    <div class="kanban-container">
      <div 
        v-for="stage in stages" 
        :key="stage.key" 
        class="kanban-column"
      >
        <div class="column-header" :style="{ borderColor: stage.color }">
          <div class="column-title">
            <span class="title-dot" :style="{ background: stage.color }"></span>
            <span>{{ stage.label }}</span>
          </div>
          <n-badge :value="getStageCount(stage.key)" type="info" size="small" />
        </div>
        
        <draggable
          v-model="stageList[stage.key]"
          group="candidates"
          item-key="id"
          class="kanban-list"
          ghost-class="ghost"
          @end="handleDragEnd($event, stage.key)"
        >
          <template #item="{ element }">
            <div class="candidate-card" @click="viewCandidate(element)">
              <div class="candidate-header">
                <n-avatar round :src="element.avatar" :size="40" />
                <div class="candidate-info">
                  <div class="candidate-name">{{ element.name }}</div>
                  <div class="candidate-position">{{ element.position }}</div>
                </div>
              </div>
              <div class="candidate-tags">
                <n-tag size="small" type="info">{{ element.experience }}</n-tag>
                <n-tag size="small">{{ element.education }}</n-tag>
              </div>
              <div class="candidate-footer">
                <span class="apply-date">
                  <Calendar :size="12" />
                  {{ element.appliedDate }}
                </span>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    
    <n-modal v-model:show="showAddModal" preset="card" title="添加候选人" style="width: 500px;">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="姓名" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="应聘职位" path="position">
          <n-select 
            v-model:value="formData.position" 
            placeholder="请选择应聘职位" 
            style="width: 100%;" 
            :options="positionOptions"
            filterable
          />
        </n-form-item>
        <n-form-item label="工作经验" path="experience">
          <n-select v-model:value="formData.experience" placeholder="请选择" style="width: 100%;" :options="experienceOptions" />
        </n-form-item>
        <n-form-item label="学历" path="education">
          <n-select v-model:value="formData.education" placeholder="请选择" style="width: 100%;" :options="educationOptions" />
        </n-form-item>
      </n-form>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认添加</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <n-modal v-model:show="showDetailModal" preset="card" title="候选人详情" style="width: 500px;">
      <div v-if="selectedCandidate" class="candidate-detail">
        <div class="detail-header">
          <n-avatar round :src="selectedCandidate.avatar" :size="80" />
          <div class="candidate-basic">
            <h3 class="detail-name">{{ selectedCandidate.name }}</h3>
            <n-tag size="large" type="info">{{ selectedCandidate.position }}</n-tag>
          </div>
        </div>
        <n-divider />
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="工作经验">{{ selectedCandidate.experience }}</n-descriptions-item>
          <n-descriptions-item label="学历">{{ selectedCandidate.education }}</n-descriptions-item>
          <n-descriptions-item label="当前阶段" :span="2">
            <n-tag :type="stageTypeMap[selectedCandidate.stage]">
              {{ stageLabels[selectedCandidate.stage] }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="应聘日期" :span="2">{{ selectedCandidate.appliedDate }}</n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
          <n-space justify="end">
            <n-button @click="showDetailModal = false">关闭</n-button>
            <n-button type="primary" @click="openScheduleModal">
              <template #icon>
                <CalendarDays :size="16" />
              </template>
              预约面试
            </n-button>
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
          <n-form-item label="候选人">
            <n-input :value="selectedCandidate?.name" disabled />
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
import { ref, reactive, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { Plus, Calendar, CalendarDays } from 'lucide-vue-next'
import { useRecruitmentStore, stageLabels, type StageType } from '@/stores/recruitment'
import { useInterviewStore } from '@/stores/interview'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import type { Candidate, InterviewRound } from '@/types'

const recruitmentStore = useRecruitmentStore()
const interviewStore = useInterviewStore()
const message = useMessage()

const showAddModal = ref(false)
const showDetailModal = ref(false)
const showScheduleModal = ref(false)
const selectedCandidate = ref<Candidate | null>(null)
const formRef = ref<FormInst | null>(null)
const scheduleFormRef = ref<FormInst | null>(null)

const stageTypeMap: Record<StageType, string> = {
  screening: 'info',
  interview1: 'warning',
  interview2: 'info',
  offer: 'success',
  rejected: 'error'
} as any

const formData = ref<Partial<Candidate>>({
  name: '',
  position: '',
  experience: '',
  education: '',
  appliedDate: new Date().toISOString().split('T')[0]
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入应聘职位', trigger: 'blur' }]
}

const experienceOptions = [
  { label: '1年', value: '1年' },
  { label: '2年', value: '2年' },
  { label: '3年', value: '3年' },
  { label: '5年以上', value: '5年' }
]

const educationOptions = [
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' }
]

const positionOptions = computed(() => 
  recruitmentStore.publishedPositions.map(p => ({ label: p, value: p }))
)

const stages = [
  { key: 'screening', label: '简历筛选', color: '#7C3AED' },
  { key: 'interview1', label: '初试', color: '#F59E0B' },
  { key: 'interview2', label: '复试', color: '#3B82F6' },
  { key: 'offer', label: '发放 Offer', color: '#10B981' },
  { key: 'rejected', label: '已淘汰', color: '#EF4444' }
]

const stageList = reactive({
  screening: [] as Candidate[],
  interview1: [] as Candidate[],
  interview2: [] as Candidate[],
  offer: [] as Candidate[],
  rejected: [] as Candidate[]
})

watch(
  () => recruitmentStore.candidates,
  () => {
    stageList.screening = [...recruitmentStore.screeningCandidates]
    stageList.interview1 = [...recruitmentStore.interview1Candidates]
    stageList.interview2 = [...recruitmentStore.interview2Candidates]
    stageList.offer = [...recruitmentStore.offerCandidates]
    stageList.rejected = [...recruitmentStore.rejectedCandidates]
  },
  { immediate: true, deep: true }
)

function getStageCount(stage: string): number {
  return stageList[stage as keyof typeof stageList].length
}

function handleDragEnd(event: any, newStage: string) {
  if (event.oldIndex !== undefined && event.newIndex !== undefined) {
    const movedItem = stageList[newStage as keyof typeof stageList][event.newIndex]
    if (movedItem && movedItem.stage !== newStage) {
      recruitmentStore.moveCandidate(movedItem.id, newStage as StageType)
      message.success(`已移动到「${stageLabels[newStage as StageType]}」阶段`)
    }
  }
}

function viewCandidate(candidate: Candidate) {
  selectedCandidate.value = candidate
  showDetailModal.value = true
}

function handleAdd() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      recruitmentStore.addCandidate({
        ...formData.value,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      } as Candidate)
      message.success('添加成功')
      showAddModal.value = false
      formData.value = {
        name: '',
        position: '',
        experience: '',
        education: '',
        appliedDate: new Date().toISOString().split('T')[0]
      }
    }
  })
}

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

const interviewerOptions = computed(() =>
  interviewStore.interviewers.map(i => ({
    label: `${i.name} - ${i.department} ${i.position}`,
    value: i.id,
    data: i
  }))
)

const scheduleForm = reactive({
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

const scheduleRules: FormRules = {
  round: [{ required: true, message: '请选择面试轮次', trigger: 'change' }],
  interviewerId: [{ required: true, message: '请选择面试官', trigger: 'change' }],
  date: [{ required: true, message: '请选择面试日期', trigger: ['change', 'blur'] }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: ['change', 'blur'] }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: ['change', 'blur'] }],
  location: [{ required: true, message: '请选择面试地点', trigger: 'change' }]
}

function openScheduleModal() {
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
  showDetailModal.value = false
  showScheduleModal.value = true
}

function handleInterviewerChange(value: string, option: SelectOption) {
  if (option && option.data) {
    const data = option.data as { name: string; avatar: string }
    scheduleForm.interviewerName = data.name
    scheduleForm.interviewerAvatar = data.avatar
  }
}

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

function submitSchedule() {
  scheduleFormRef.value?.validate((errors) => {
    if (!errors && selectedCandidate.value) {
      interviewStore.scheduleInterview({
        candidateId: selectedCandidate.value.id,
        candidateName: selectedCandidate.value.name,
        candidateAvatar: selectedCandidate.value.avatar,
        position: selectedCandidate.value.position,
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

.kanban-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: calc(100vh - 200px);
}

.kanban-column {
  flex: 1;
  min-width: 260px;
  max-width: 300px;
  background: #F5F3FF;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 3px solid;
  border-radius: 12px 12px 0 0;
  background: white;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1E1B4B;
}

.title-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.kanban-list {
  flex: 1;
  padding: 12px;
  min-height: 100px;
}

.candidate-card {
  background: white;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
}

.candidate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.15);
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.candidate-info {
  flex: 1;
}

.candidate-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.candidate-position {
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
}

.candidate-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.candidate-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.apply-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9CA3AF;
}

.ghost {
  opacity: 0.5;
  background: #DDD6FE;
  border: 2px dashed #7C3AED;
}

.candidate-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.candidate-basic {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-name {
  font-size: 20px;
  font-weight: 600;
  color: #1E1B4B;
  margin: 0;
}
</style>
