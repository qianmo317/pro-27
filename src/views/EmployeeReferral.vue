<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <div class="page-title">员工内推</div>
        <div class="page-subtitle">推荐优秀人才，赢取丰厚奖励</div>
      </div>
      <n-button type="primary" size="large" @click="showAddModal = true">
        <template #icon>
          <UserPlus :size="18" />
        </template>
        提交内推
      </n-button>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #EDE9FE;">
            <FileText :size="24" color="#8B5CF6" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ referralStore.referrals.length }}</div>
            <div class="stat-label">总内推数</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #DBEAFE;">
            <Clock :size="24" color="#3B82F6" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ referralStore.activeReferrals.length }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #D1FAE5;">
            <CheckCircle :size="24" color="#10B981" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ referralStore.hiredReferrals.length }}</div>
            <div class="stat-label">已入职</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #FEF3C7;">
            <Wallet :size="24" color="#F59E0B" />
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ referralStore.totalBonusPaid.toLocaleString() }}</div>
            <div class="stat-label">已发奖金</div>
          </div>
        </div>
      </n-card>
    </div>

    <n-card class="filter-card">
      <n-space :size="16" wrap>
        <div class="filter-item">
          <span class="filter-label">状态:</span>
          <n-select 
            v-model:value="filterStatus" 
            :options="statusFilterOptions" 
            placeholder="全部状态"
            clearable
            style="width: 150px;"
            @update:value="handleFilterStatusChange"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">部门:</span>
          <n-select 
            v-model:value="filterDepartment" 
            :options="departmentFilterOptions" 
            placeholder="全部部门"
            clearable
            style="width: 150px;"
            @update:value="handleFilterDepartmentChange"
          />
        </div>
      </n-space>
    </n-card>

    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="paginatedReferrals"
        :pagination="pagination"
        :single-line="false"
        row-class-name="referral-row"
      />
    </n-card>

    <n-modal v-model:show="showAddModal" preset="card" title="提交内推候选人" style="width: 600px;" :mask-closable="false">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="候选人姓名" path="candidateName">
          <n-input v-model:value="formData.candidateName" placeholder="请输入候选人姓名" />
        </n-form-item>
        <n-form-item label="应聘职位" path="candidatePosition">
          <n-select 
            v-model:value="formData.candidatePosition" 
            placeholder="请选择应聘职位" 
            style="width: 100%;" 
            :options="positionOptions"
            filterable
          />
        </n-form-item>
        <n-form-item label="工作经验" path="experience">
          <n-select 
            v-model:value="formData.experience" 
            placeholder="请选择工作经验" 
            style="width: 100%;" 
            :options="experienceOptions"
          />
        </n-form-item>
        <n-form-item label="学历" path="education">
          <n-select 
            v-model:value="formData.education" 
            placeholder="请选择学历" 
            style="width: 100%;" 
            :options="educationOptions"
          />
        </n-form-item>
        <n-form-item label="匹配度评分" path="matchScore">
          <div class="score-container">
            <div class="score-header">
              <span class="score-label">
                {{ getMatchLabel(formData.matchScore) }}
              </span>
              <span class="score-value" :style="{ color: getMatchColor(formData.matchScore) }">
                {{ formData.matchScore }}分
              </span>
            </div>
            <div class="score-slider-wrapper">
              <n-slider 
                v-model:value="formData.matchScore" 
                :min="0" 
                :max="100" 
                :step="5"
                :marks="scoreMarks"
              />
            </div>
            <div class="score-levels">
              <span class="level-item">0-59 不匹配</span>
              <span class="level-item">60-74 及格</span>
              <span class="level-item">75-89 良好</span>
              <span class="level-item">90-100 优秀</span>
            </div>
          </div>
        </n-form-item>
        <n-form-item label="匹配说明" path="matchDescription">
          <n-input 
            v-model:value="formData.matchDescription" 
            type="textarea" 
            :rows="4" 
            placeholder="请详细描述候选人与岗位的匹配度，包括工作经验、技能、教育背景等"
          />
        </n-form-item>
        <n-form-item label="预计奖金">
          <n-input :value="`¥${referralStore.calculateBonus(formData.candidatePosition || '').toLocaleString()}`" disabled>
            <template #suffix>
              <n-tag size="small" type="info">根据岗位自动计算</n-tag>
            </template>
          </n-input>
        </n-form-item>
      </n-form>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">提交内推</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="card" title="内推详情" style="width: 600px;">
      <div v-if="selectedReferral" class="referral-detail">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="候选人">{{ selectedReferral.candidateName }}</n-descriptions-item>
          <n-descriptions-item label="应聘职位">{{ selectedReferral.candidatePosition }}</n-descriptions-item>
          <n-descriptions-item label="推荐人">{{ selectedReferral.referrerName }}</n-descriptions-item>
          <n-descriptions-item label="所属部门">{{ selectedReferral.referrerDepartment }}</n-descriptions-item>
          <n-descriptions-item label="推荐岗位">{{ selectedReferral.referrerPosition }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :color="getStatusColor(selectedReferral.status)" style="color: #fff;">
              {{ REFERRAL_STATUS_LABELS[selectedReferral.status] }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="匹配度">
            <div class="match-score-inline">
              <n-progress 
                :percentage="selectedReferral.matchScore" 
                :show-indicator="false" 
                :stroke-width="8"
                :color="getMatchColor(selectedReferral.matchScore)"
                style="width: 120px;"
              />
              <span class="match-value-inline">{{ selectedReferral.matchScore }}%</span>
            </div>
          </n-descriptions-item>
          <n-descriptions-item label="提交日期">{{ selectedReferral.createdAt }}</n-descriptions-item>
          <n-descriptions-item v-if="selectedReferral.bonusAmount" label="奖金金额">
            <span class="bonus-amount">¥{{ selectedReferral.bonusAmount.toLocaleString() }}</span>
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedReferral.bonusPaidAt" label="奖金发放">
            <n-tag type="success">已发放 · {{ selectedReferral.bonusPaidAt }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="匹配说明" :span="2">
            {{ selectedReferral.matchDescription }}
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedReferral.remarks" label="备注" :span="2">
            {{ selectedReferral.remarks }}
          </n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <div class="status-timeline">
          <div class="timeline-title">状态变更记录</div>
          <n-timeline>
            <n-timeline-item 
              timestamp="提交申请" 
              :time="selectedReferral.createdAt"
              type="success"
            >
              内推申请已提交
            </n-timeline-item>
            <n-timeline-item 
              v-if="selectedReferral.status !== 'pending'"
              timestamp="进入招聘流程" 
              :time="selectedReferral.updatedAt"
              type="info"
            >
              已进入 {{ REFERRAL_STATUS_LABELS[selectedReferral.status] }} 阶段
            </n-timeline-item>
            <n-timeline-item 
              v-if="selectedReferral.status === 'hired'"
              timestamp="成功入职" 
              :time="selectedReferral.bonusPaidAt"
              type="success"
            >
              候选人成功入职，奖金 ¥{{ selectedReferral.bonusAmount?.toLocaleString() }} 已发放
            </n-timeline-item>
          </n-timeline>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button 
            v-if="selectedReferral && selectedReferral.status === 'hired' && !selectedReferral.bonusPaidAt" 
            type="primary" 
            @click="handlePayBonus"
          >
            <template #icon>
              <Wallet :size="16" />
            </template>
            发放奖金
          </n-button>
          <n-dropdown 
            v-if="selectedReferral && ['pending', 'screening', 'interview', 'offer'].includes(selectedReferral.status)"
            trigger="click"
            @select="handleStatusChange"
          >
            <n-button type="primary">
              <template #icon>
                <RefreshCw :size="16" />
              </template>
              更新状态
            </n-button>
            <template #options>
              <n-dropdown-option 
                v-for="status in availableStatuses" 
                :key="status.value" 
                :value="status.value"
              >
                <span :style="{ color: status.color }">{{ status.label }}</span>
              </n-dropdown-option>
            </template>
          </n-dropdown>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showStatusModal" preset="card" title="更新状态" style="width: 450px;">
      <n-form
        ref="statusFormRef"
        :model="statusForm"
        :rules="statusRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item label="新状态">
          <n-tag :color="getStatusColor(statusForm.status)" style="color: #fff;">
            {{ REFERRAL_STATUS_LABELS[statusForm.status] }}
          </n-tag>
        </n-form-item>
        <n-form-item label="备注" path="remarks">
          <n-input 
            v-model:value="statusForm.remarks" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入状态变更备注（可选）"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showStatusModal = false">取消</n-button>
          <n-button type="primary" @click="confirmStatusChange">确认更新</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { UserPlus, FileText, Clock, CheckCircle, Wallet, RefreshCw, Eye, Users } from 'lucide-vue-next'
import { useMessage, type FormInst, type FormRules, type DataTableColumns } from 'naive-ui'
import { useReferralStore } from '@/stores/referral'
import { useRecruitmentStore } from '@/stores/recruitment'
import { 
  REFERRAL_STATUS_LABELS, 
  REFERRAL_STATUS_OPTIONS,
  DEPARTMENT_OPTIONS,
  type EmployeeReferral,
  type CandidateSource
} from '@/types'

const referralStore = useReferralStore()
const recruitmentStore = useRecruitmentStore()
const message = useMessage()

const showAddModal = ref(false)
const showDetailModal = ref(false)
const showStatusModal = ref(false)
const selectedReferral = ref<EmployeeReferral | null>(null)
const formRef = ref<FormInst | null>(null)
const statusFormRef = ref<FormInst | null>(null)
const filterStatus = ref<EmployeeReferral['status'] | null>(null)
const filterDepartment = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const formData = reactive({
  candidateName: '',
  candidatePosition: '',
  experience: '',
  education: '',
  matchScore: 75,
  matchDescription: ''
})

const statusForm = reactive({
  status: 'pending' as EmployeeReferral['status'],
  remarks: ''
})

const formRules: FormRules = {
  candidateName: [{ required: true, message: '请输入候选人姓名', trigger: 'blur' }],
  candidatePosition: [{ required: true, message: '请选择应聘职位', trigger: 'change' }],
  experience: [{ required: true, message: '请选择工作经验', trigger: 'change' }],
  education: [{ required: true, message: '请选择学历', trigger: 'change' }],
  matchScore: [{ required: true, type: 'number', message: '请设置匹配度评分', trigger: 'change' }],
  matchDescription: [{ required: true, message: '请填写匹配说明', trigger: 'blur' }]
}

const experienceOptions = [
  { label: '应届', value: '应届' },
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

const statusRules: FormRules = {
  remarks: [{ required: false }]
}

const scoreMarks = {
  0: '0',
  50: '50',
  100: '100'
}

function getMatchLabel(score: number): string {
  if (score >= 90) return '非常匹配'
  if (score >= 75) return '匹配良好'
  if (score >= 60) return '基本匹配'
  return '不太匹配'
}

const positionOptions = computed(() => 
  recruitmentStore.publishedPositions.map(p => ({ label: p, value: p }))
)

const statusFilterOptions = REFERRAL_STATUS_OPTIONS.map(s => ({
  label: s.label,
  value: s.value
}))

const departmentFilterOptions = DEPARTMENT_OPTIONS.map(d => ({
  label: d.label,
  value: d.value
}))

const availableStatuses = computed(() => 
  REFERRAL_STATUS_OPTIONS.filter(s => 
    ['screening', 'interview', 'offer', 'hired', 'rejected'].includes(s.value)
  )
)

const columns: DataTableColumns<EmployeeReferral> = [
  {
    title: '候选人',
    key: 'candidateName',
    width: 120,
    render: (row) => h('div', { class: 'candidate-cell' }, [
      h('span', { class: 'candidate-name' }, row.candidateName),
      h('span', { class: 'candidate-pos' }, row.candidatePosition)
    ])
  },
  {
    title: '推荐人',
    key: 'referrerName',
    width: 150,
    render: (row) => h('div', { class: 'referrer-cell' }, [
      h('span', { class: 'referrer-name' }, row.referrerName),
      h('span', { class: 'referrer-dept' }, `${row.referrerDepartment} · ${row.referrerPosition}`)
    ])
  },
  {
    title: '匹配度',
    key: 'matchScore',
    width: 150,
    render: (row) => h('div', { class: 'match-cell' }, [
      h('div', { class: 'match-bar-wrapper' }, [
        h('div', { 
          class: 'match-bar', 
          style: { 
            width: `${row.matchScore}%`,
            background: getMatchColor(row.matchScore)
          }
        })
      ]),
      h('span', { 
        class: 'match-text',
        style: { color: getMatchColor(row.matchScore) }
      }, `${row.matchScore}%`)
    ])
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h('n-tag', {
      color: getStatusColor(row.status),
      style: { color: '#fff' }
    }, () => REFERRAL_STATUS_LABELS[row.status])
  },
  {
    title: '奖金',
    key: 'bonusAmount',
    width: 100,
    render: (row) => {
      if (row.status === 'hired' && row.bonusAmount) {
        return h('div', { class: 'bonus-cell' }, [
          h('span', { class: 'bonus-amount' }, `¥${row.bonusAmount.toLocaleString()}`),
          row.bonusPaidAt 
            ? h('n-tag', { size: 'small', type: 'success' }, '已发放')
            : h('n-tag', { size: 'small', type: 'warning' }, '待发放')
        ])
      }
      return h('span', { class: 'text-muted' }, '-')
    }
  },
  {
    title: '提交日期',
    key: 'createdAt',
    width: 110
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => h('n-button', {
      size: 'small',
      type: 'primary',
      quaternary: true,
      onClick: () => viewDetail(row)
    }, () => h('span', { class: 'action-btn' }, [
      h(Eye, { size: 14 }),
      ' 详情'
    ]))
  }
]

function getMatchColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 75) return '#3B82F6'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function getStatusColor(status: EmployeeReferral['status']): string {
  const option = REFERRAL_STATUS_OPTIONS.find(o => o.value === status)
  return option?.color || '#6B7280'
}

const filteredReferrals = computed(() => {
  return referralStore.referrals.filter(r => {
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
  onUpdatePage: (page: number) => {
    currentPage.value = page
  },
  onUpdatePageSize: (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }
}))

function handleFilterStatusChange(value: EmployeeReferral['status'] | null) {
  filterStatus.value = value
  currentPage.value = 1
  referralStore.setFilterStatus(value)
}

function handleFilterDepartmentChange(value: string | null) {
  filterDepartment.value = value
  currentPage.value = 1
  referralStore.setFilterDepartment(value)
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      referralStore.addReferral({
        candidateName: formData.candidateName,
        candidatePosition: formData.candidatePosition,
        experience: formData.experience,
        education: formData.education,
        matchScore: formData.matchScore,
        matchDescription: formData.matchDescription
      })
      message.success('内推提交成功，候选人已进入招聘看板')
      showAddModal.value = false
      formData.candidateName = ''
      formData.candidatePosition = ''
      formData.experience = ''
      formData.education = ''
      formData.matchScore = 75
      formData.matchDescription = ''
    }
  })
}

function viewDetail(referral: EmployeeReferral) {
  selectedReferral.value = referral
  showDetailModal.value = true
}

function handleStatusChange(status: string) {
  if (!selectedReferral.value) return
  statusForm.status = status as EmployeeReferral['status']
  statusForm.remarks = ''
  showStatusModal.value = true
}

function confirmStatusChange() {
  if (!selectedReferral.value) return
  statusFormRef.value?.validate((errors) => {
    if (!errors) {
      referralStore.updateReferralStatus(
        selectedReferral.value!.id,
        statusForm.status,
        statusForm.remarks || undefined
      )
      message.success(`状态已更新为「${REFERRAL_STATUS_LABELS[statusForm.status]}」`)
      showStatusModal.value = false
      showDetailModal.value = false
    }
  })
}

function handlePayBonus() {
  if (!selectedReferral.value) return
  referralStore.payBonus(selectedReferral.value.id)
  message.success('奖金已发放')
  showDetailModal.value = false
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1E1B4B;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: #6B7280;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1E1B4B;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.table-card {
  border-radius: 12px;
}

.score-container {
  width: 100%;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.score-label {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
}

.score-slider-wrapper {
  width: 100%;
  padding: 8px 0 24px 0;
}

.score-slider-wrapper :deep(.n-slider) {
  width: 100%;
}

.score-slider-wrapper :deep(.n-slider-rail) {
  height: 8px;
  border-radius: 4px;
}

.score-slider-wrapper :deep(.n-slider-fill) {
  height: 8px;
  border-radius: 4px;
}

.score-slider-wrapper :deep(.n-slider-handle) {
  width: 20px;
  height: 20px;
  border-width: 3px;
}

.score-slider-wrapper :deep(.n-slider-mark) {
  font-size: 12px;
  color: #6B7280;
  padding-top: 8px;
}

.score-levels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 8px;
}

.level-item {
  font-size: 12px;
  color: #6B7280;
}

.bonus-amount {
  font-size: 16px;
  font-weight: 600;
  color: #059669;
}

.candidate-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.candidate-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.candidate-pos {
  font-size: 12px;
  color: #6B7280;
}

.referrer-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.referrer-name {
  font-size: 14px;
  font-weight: 500;
  color: #1E1B4B;
}

.referrer-dept {
  font-size: 12px;
  color: #6B7280;
}

.match-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  max-width: 100px;
}

.match-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.match-text {
  font-size: 13px;
  font-weight: 600;
  min-width: 40px;
}

.bonus-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.text-muted {
  color: #9CA3AF;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.referral-detail {
  margin-bottom: 16px;
}

.match-score-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-value-inline {
  font-size: 14px;
  font-weight: 600;
}

.status-timeline {
  margin-top: 8px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
