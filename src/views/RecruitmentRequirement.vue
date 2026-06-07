<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">招聘需求管理</div>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <Plus :size="16" />
        </template>
        提交招聘申请
      </n-button>
    </div>

    <n-card class="filter-card" :bordered="false">
      <n-space :size="16" wrap>
        <n-select
          v-model:value="filterStatus"
          placeholder="按状态筛选"
          clearable
          style="width: 160px"
          :options="statusFilterOptions"
        />
        <n-select
          v-model:value="filterUrgency"
          placeholder="按紧急程度筛选"
          clearable
          style="width: 160px"
          :options="urgencyFilterOptions"
        />
        <n-button @click="resetFilters">重置筛选</n-button>
      </n-space>
    </n-card>

    <n-card class="table-card" :bordered="false">
      <n-data-table
        :columns="columns"
        :data="recruitmentStore.paginatedRequirements"
        :pagination="recruitmentStore.pagination"
        :row-key="rowKey"
        remote
      />
    </n-card>

    <n-modal v-model:show="showAddModal" preset="card" title="提交招聘申请" style="width: 600px;">
      <n-form
        ref="addFormRef"
        :model="addFormData"
        :rules="addFormRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="职位名称" path="positionName">
          <n-input v-model:value="addFormData.positionName" placeholder="请输入职位名称" />
        </n-form-item>
        <n-form-item label="招聘人数" path="headcount">
          <n-input-number v-model:value="addFormData.headcount" :min="1" :max="100" placeholder="请输入招聘人数" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="紧急程度" path="urgency">
          <n-select v-model:value="addFormData.urgency" placeholder="请选择紧急程度" style="width: 100%;" :options="urgencyOptions" />
        </n-form-item>
        <n-form-item label="所属部门" path="department">
          <n-select v-model:value="addFormData.department" placeholder="请选择所属部门" style="width: 100%;" :options="departmentOptions" />
        </n-form-item>
        <n-form-item label="职位要求" path="requirements">
          <n-input
            v-model:value="addFormData.requirements"
            type="textarea"
            :rows="6"
            placeholder="请输入职位要求，可分点描述"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">提交申请</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="card" title="招聘需求详情" style="width: 600px;">
      <div v-if="selectedRequirement" class="requirement-detail">
        <div class="detail-section">
          <div class="detail-label">职位名称</div>
          <div class="detail-value">{{ selectedRequirement.positionName }}</div>
        </div>
        <n-descriptions :column="2" bordered size="small">
          <n-descriptions-item label="招聘人数">{{ selectedRequirement.headcount }} 人</n-descriptions-item>
          <n-descriptions-item label="紧急程度">
            <n-tag :color="getUrgencyColor(selectedRequirement.urgency)" type="success" round>
              {{ getUrgencyLabel(selectedRequirement.urgency) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="所属部门">{{ selectedRequirement.department }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :color="getStatusColor(selectedRequirement.status)" type="success" round>
              {{ getStatusLabel(selectedRequirement.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="申请人">{{ selectedRequirement.applicantName }}</n-descriptions-item>
          <n-descriptions-item label="申请日期">{{ selectedRequirement.createdAt }}</n-descriptions-item>
          <template v-if="selectedRequirement.reviewerName">
            <n-descriptions-item label="审核人">{{ selectedRequirement.reviewerName }}</n-descriptions-item>
            <n-descriptions-item label="审核日期">{{ selectedRequirement.reviewedAt }}</n-descriptions-item>
          </template>
          <template v-if="selectedRequirement.publishedAt">
            <n-descriptions-item label="发布日期" :span="2">{{ selectedRequirement.publishedAt }}</n-descriptions-item>
          </template>
          <template v-if="selectedRequirement.status === 'closed'">
            <n-descriptions-item label="实际录用">{{ selectedRequirement.actualHiredCount }} 人</n-descriptions-item>
            <n-descriptions-item label="关闭日期">{{ selectedRequirement.closedAt }}</n-descriptions-item>
          </template>
        </n-descriptions>
        <n-divider title="职位要求" title-placement="left" />
        <div class="requirements-text" style="white-space: pre-wrap;">{{ selectedRequirement.requirements }}</div>
        <template v-if="selectedRequirement.reviewComment">
          <n-divider title="审核意见" title-placement="left" />
          <div class="review-comment">{{ selectedRequirement.reviewComment }}</div>
        </template>
        <template v-if="selectedRequirement.closeReason">
          <n-divider title="关闭原因" title-placement="left" />
          <div class="close-reason">{{ selectedRequirement.closeReason }}</div>
        </template>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showReviewModal" preset="card" title="审核招聘需求" style="width: 500px;">
      <div v-if="selectedRequirement" class="review-info">
        <n-alert type="info" :title="`审核：${selectedRequirement.positionName}`">
          申请部门：{{ selectedRequirement.department }}，招聘人数：{{ selectedRequirement.headcount }} 人
        </n-alert>
      </div>
      <n-form
        ref="reviewFormRef"
        :model="reviewFormData"
        :rules="reviewFormRules"
        label-placement="left"
        label-width="100px"
        style="margin-top: 16px;"
      >
        <n-form-item label="审核结果" path="approved">
          <n-radio-group v-model:value="reviewFormData.approved">
            <n-radio :value="true">通过</n-radio>
            <n-radio :value="false">拒绝</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="审核意见" path="comment">
          <n-input
            v-model:value="reviewFormData.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showReviewModal = false">取消</n-button>
          <n-button type="primary" @click="handleReview">确认审核</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showCloseModal" preset="card" title="关闭招聘需求" style="width: 500px;">
      <div v-if="selectedRequirement" class="close-info">
        <n-alert type="warning" :title="`关闭：${selectedRequirement.positionName}`">
          需求人数：{{ selectedRequirement.headcount }} 人
        </n-alert>
      </div>
      <n-form
        ref="closeFormRef"
        :model="closeFormData"
        :rules="closeFormRules"
        label-placement="left"
        label-width="120px"
        style="margin-top: 16px;"
      >
        <n-form-item label="实际录用人数" path="actualHiredCount">
          <n-input-number v-model:value="closeFormData.actualHiredCount" :min="0" placeholder="请输入实际录用人数" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="关闭原因" path="closeReason">
          <n-input
            v-model:value="closeFormData.closeReason"
            type="textarea"
            :rows="4"
            placeholder="请输入关闭原因，如：已完成招聘、需求取消等"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCloseModal = false">取消</n-button>
          <n-button type="primary" @click="handleClose">确认关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, watch } from 'vue'
import { Plus, Eye, CheckCircle, XCircle, Send, XSquare } from 'lucide-vue-next'
import { useRecruitmentStore } from '@/stores/recruitment'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns, DataTableCreateRowKey } from 'naive-ui'
import type { RecruitmentRequirement, RecruitmentRequirementStatus, RecruitmentUrgency } from '@/types'
import { RECRUITMENT_STATUS_OPTIONS, RECRUITMENT_URGENCY_OPTIONS, DEPARTMENT_OPTIONS, RECRUITMENT_STATUS_LABELS, RECRUITMENT_URGENCY_LABELS } from '@/types'

const recruitmentStore = useRecruitmentStore()
const message = useMessage()

const filterStatus = ref<RecruitmentRequirementStatus | null>(null)
const filterUrgency = ref<RecruitmentUrgency | null>(null)

watch([filterStatus, filterUrgency], () => {
  recruitmentStore.setFilterStatus(filterStatus.value)
  recruitmentStore.setFilterUrgency(filterUrgency.value)
})

const showAddModal = ref(false)
const showDetailModal = ref(false)
const showReviewModal = ref(false)
const showCloseModal = ref(false)
const selectedRequirement = ref<RecruitmentRequirement | null>(null)

const addFormRef = ref<FormInst | null>(null)
const reviewFormRef = ref<FormInst | null>(null)
const closeFormRef = ref<FormInst | null>(null)

const statusFilterOptions = RECRUITMENT_STATUS_OPTIONS.map(opt => ({
  label: opt.label,
  value: opt.value
}))

const urgencyFilterOptions = RECRUITMENT_URGENCY_OPTIONS.map(opt => ({
  label: opt.label,
  value: opt.value
}))

const urgencyOptions = RECRUITMENT_URGENCY_OPTIONS.map(opt => ({
  label: opt.label,
  value: opt.value
}))

const departmentOptions = DEPARTMENT_OPTIONS

const addFormData = reactive({
  positionName: '',
  headcount: 1,
  urgency: 'medium' as RecruitmentUrgency,
  department: '',
  requirements: ''
})

const addFormRules: FormRules = {
  positionName: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  headcount: [{ required: true, message: '请输入招聘人数', trigger: 'blur', type: 'number' }],
  urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  department: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  requirements: [{ required: true, message: '请输入职位要求', trigger: 'blur' }]
}

const reviewFormData = reactive({
  approved: true,
  comment: ''
})

const reviewFormRules: FormRules = {
  comment: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
}

const closeFormData = reactive({
  actualHiredCount: 0,
  closeReason: ''
})

const closeFormRules: FormRules = {
  actualHiredCount: [{ required: true, message: '请输入实际录用人数', trigger: 'blur', type: 'number' }],
  closeReason: [{ required: true, message: '请输入关闭原因', trigger: 'blur' }]
}

const rowKey: DataTableCreateRowKey<RecruitmentRequirement> = (row) => row.id

function getStatusLabel(status: RecruitmentRequirementStatus): string {
  return RECRUITMENT_STATUS_LABELS[status]
}

function getStatusColor(status: RecruitmentRequirementStatus): string {
  const opt = RECRUITMENT_STATUS_OPTIONS.find(o => o.value === status)
  return opt?.color || '#6B7280'
}

function getUrgencyLabel(urgency: RecruitmentUrgency): string {
  return RECRUITMENT_URGENCY_LABELS[urgency]
}

function getUrgencyColor(urgency: RecruitmentUrgency): string {
  const opt = RECRUITMENT_URGENCY_OPTIONS.find(o => o.value === urgency)
  return opt?.color || '#6B7280'
}

const columns: DataTableColumns<RecruitmentRequirement> = [
  {
    title: '职位名称',
    key: 'positionName',
    width: 180,
    render: (row) => h('span', { class: 'font-medium text-gray-800' }, row.positionName)
  },
  {
    title: '部门',
    key: 'department',
    width: 120
  },
  {
    title: '招聘人数',
    key: 'headcount',
    width: 100,
    render: (row) => h('span', {}, `${row.headcount} 人`)
  },
  {
    title: '紧急程度',
    key: 'urgency',
    width: 100,
    render: (row) => h('n-tag', {
      color: getUrgencyColor(row.urgency),
      type: 'success',
      round: true,
      size: 'small'
    }, { default: () => getUrgencyLabel(row.urgency) })
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h('n-tag', {
      color: getStatusColor(row.status),
      type: 'success',
      round: true,
      size: 'small'
    }, { default: () => getStatusLabel(row.status) })
  },
  {
    title: '申请人',
    key: 'applicantName',
    width: 100
  },
  {
    title: '申请日期',
    key: 'createdAt',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: (row) => {
      const actions = []
      actions.push(
        h('n-button', {
          size: 'small',
          quaternary: true,
          onClick: () => viewDetail(row)
        }, {
          icon: () => h(Eye, { size: 14 }),
          default: () => '查看'
        })
      )
      if (row.status === 'pending') {
        actions.push(
          h('n-button', {
            size: 'small',
            type: 'primary',
            quaternary: true,
            onClick: () => openReviewModal(row)
          }, {
            icon: () => h(CheckCircle, { size: 14 }),
            default: () => '审核'
          })
        )
      }
      if (row.status === 'approved') {
        actions.push(
          h('n-button', {
            size: 'small',
            type: 'success',
            quaternary: true,
            onClick: () => handlePublish(row.id)
          }, {
            icon: () => h(Send, { size: 14 }),
            default: () => '发布'
          })
        )
      }
      if (row.status === 'published') {
        actions.push(
          h('n-button', {
            size: 'small',
            type: 'warning',
            quaternary: true,
            onClick: () => openCloseModal(row)
          }, {
            icon: () => h(XSquare, { size: 14 }),
            default: () => '关闭'
          })
        )
      }
      return h('n-space', { size: 4 }, { default: () => actions })
    }
  }
]

function resetFilters() {
  filterStatus.value = null
  filterUrgency.value = null
  recruitmentStore.setFilterStatus(null)
  recruitmentStore.setFilterUrgency(null)
}

function viewDetail(row: RecruitmentRequirement) {
  selectedRequirement.value = row
  showDetailModal.value = true
}

function openReviewModal(row: RecruitmentRequirement) {
  selectedRequirement.value = row
  reviewFormData.approved = true
  reviewFormData.comment = ''
  showReviewModal.value = true
}

function openCloseModal(row: RecruitmentRequirement) {
  selectedRequirement.value = row
  closeFormData.actualHiredCount = 0
  closeFormData.closeReason = ''
  showCloseModal.value = true
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (!errors) {
      recruitmentStore.addRequirement({
        positionName: addFormData.positionName,
        headcount: addFormData.headcount,
        urgency: addFormData.urgency,
        department: addFormData.department,
        requirements: addFormData.requirements
      })
      message.success('招聘申请提交成功，等待 HR 审核')
      showAddModal.value = false
      addFormData.positionName = ''
      addFormData.headcount = 1
      addFormData.urgency = 'medium'
      addFormData.department = ''
      addFormData.requirements = ''
    }
  })
}

function handleReview() {
  reviewFormRef.value?.validate((errors) => {
    if (!errors && selectedRequirement.value) {
      recruitmentStore.reviewRequirement(
        selectedRequirement.value.id,
        reviewFormData.approved,
        reviewFormData.comment
      )
      message.success(reviewFormData.approved ? '审核通过' : '已拒绝')
      showReviewModal.value = false
    }
  })
}

function handlePublish(id: string) {
  recruitmentStore.publishRequirement(id)
  message.success('职位已发布到招聘看板')
}

function handleClose() {
  closeFormRef.value?.validate((errors) => {
    if (!errors && selectedRequirement.value) {
      recruitmentStore.closeRequirement(
        selectedRequirement.value.id,
        closeFormData.actualHiredCount,
        closeFormData.closeReason
      )
      message.success('需求已关闭')
      showCloseModal.value = false
    }
  })
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 24px;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 18px;
  font-weight: 600;
  color: #1E1B4B;
}

.requirements-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  padding: 12px;
  background: #F5F3FF;
  border-radius: 8px;
}

.review-comment,
.close-reason {
  font-size: 14px;
  color: #374151;
  padding: 12px;
  background: #F5F3FF;
  border-radius: 8px;
}

.review-info,
.close-info {
  margin-bottom: 16px;
}

:deep(.n-data-table .n-data-table-th) {
  background: #F5F3FF;
  font-weight: 600;
  color: #1E1B4B;
}
</style>
