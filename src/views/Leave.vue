<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">请假管理</div>
    </div>

    <n-tabs v-model:value="activeTab" type="line" size="large">
      <n-tab-pane name="apply" tab="申请请假">
        <n-card title="提交请假申请" class="form-card">
          <n-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-placement="left"
            label-width="100px"
          >
            <n-row :gutter="16">
              <n-col :span="12">
                <n-form-item label="请假类型" path="leaveType">
                  <n-select 
                    v-model:value="formData.leaveType" 
                    placeholder="请选择请假类型" 
                    :options="leaveTypeOptions" 
                  />
                </n-form-item>
              </n-col>
              <n-col :span="12">
                <n-form-item label="请假天数">
                  <n-input :value="`${totalDays} 天`" disabled />
                </n-form-item>
              </n-col>
            </n-row>
            <n-row :gutter="16">
              <n-col :span="12">
                <n-form-item label="开始日期" path="startDate">
                  <n-date-picker 
                    v-model:value="formData.startDate" 
                    type="date" 
                    style="width: 100%;" 
                    @update:value="calculateDays"
                  />
                </n-form-item>
              </n-col>
              <n-col :span="12">
                <n-form-item label="开始时间" path="startTime">
                  <n-time-picker 
                    v-model:value="formData.startTime" 
                    style="width: 100%;" 
                    format="HH:mm"
                    @update:value="calculateDays"
                  />
                </n-form-item>
              </n-col>
            </n-row>
            <n-row :gutter="16">
              <n-col :span="12">
                <n-form-item label="结束日期" path="endDate">
                  <n-date-picker 
                    v-model:value="formData.endDate" 
                    type="date" 
                    style="width: 100%;" 
                    @update:value="calculateDays"
                  />
                </n-form-item>
              </n-col>
              <n-col :span="12">
                <n-form-item label="结束时间" path="endTime">
                  <n-time-picker 
                    v-model:value="formData.endTime" 
                    style="width: 100%;" 
                    format="HH:mm"
                    @update:value="calculateDays"
                  />
                </n-form-item>
              </n-col>
            </n-row>
            <n-form-item label="请假事由" path="reason">
              <n-input 
                v-model:value="formData.reason" 
                type="textarea" 
                placeholder="请输入请假事由" 
                :rows="4" 
              />
            </n-form-item>
            
            <n-alert v-if="myBalance" type="info" :bordered="false" style="margin-bottom: 20px;">
              <div class="balance-info">
                <span>剩余年假：<strong>{{ myBalance.annualLeaveRemaining }}</strong> 天 / 共 {{ myBalance.annualLeaveTotal }} 天</span>
                <span>剩余调休：<strong>{{ myBalance.compensatoryLeaveRemaining }}</strong> 天 / 共 {{ myBalance.compensatoryLeaveTotal }} 天</span>
              </div>
            </n-alert>
            
            <n-form-item>
              <n-space>
                <n-button type="primary" @click="handleSubmit">
                  <template #icon>
                    <Send :size="16" />
                  </template>
                  提交申请
                </n-button>
                <n-button @click="resetForm">重置</n-button>
              </n-space>
            </n-form-item>
          </n-form>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="my">
        <n-card title="我的请假记录">
          <n-space :size="16" wrap style="margin-bottom: 16px;">
            <n-select
              v-model:value="myFilterStatus"
              placeholder="筛选状态"
              style="width: 140px;"
              clearable
              :options="statusOptions"
            />
            <n-select
              v-model:value="myFilterType"
              placeholder="筛选类型"
              style="width: 140px;"
              clearable
              :options="leaveTypeOptions"
            />
          </n-space>
          
          <n-data-table
            :columns="myColumns"
            :data="filteredMyApplications"
            :bordered="false"
            size="large"
            :pagination="{
              page: myCurrentPage,
              pageSize: 10,
              itemCount: filteredMyApplications.length,
              onUpdatePage: (page) => myCurrentPage = page
            }"
          />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="approve">
        <n-card title="待审批列表">
          <n-space :size="16" wrap style="margin-bottom: 16px;">
            <n-select
              v-model:value="approveFilterStatus"
              placeholder="筛选状态"
              style="width: 140px;"
              clearable
              :options="statusOptions"
            />
            <n-select
              v-model:value="approveFilterType"
              placeholder="筛选类型"
              style="width: 140px;"
              clearable
              :options="leaveTypeOptions"
            />
          </n-space>
          
          <n-data-table
            :columns="approveColumns"
            :data="filteredApproveApplications"
            :bordered="false"
            size="large"
            :pagination="{
              page: approveCurrentPage,
              pageSize: 10,
              itemCount: filteredApproveApplications.length,
              onUpdatePage: (page) => approveCurrentPage = page
            }"
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showApproveModal" preset="card" title="审批请假" style="width: 600px;">
      <div v-if="selectedApplication" class="approve-modal">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="申请人">{{ selectedApplication.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="部门">{{ selectedApplication.department }}</n-descriptions-item>
          <n-descriptions-item label="请假类型">
            <n-tag :style="{ backgroundColor: getLeaveTypeColor(selectedApplication.leaveType), color: '#fff' }" size="small">
              {{ getLeaveTypeLabel(selectedApplication.leaveType) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="请假天数">{{ selectedApplication.totalDays }} 天</n-descriptions-item>
          <n-descriptions-item label="开始时间">{{ selectedApplication.startDate }} {{ selectedApplication.startTime }}</n-descriptions-item>
          <n-descriptions-item label="结束时间">{{ selectedApplication.endDate }} {{ selectedApplication.endTime }}</n-descriptions-item>
          <n-descriptions-item label="申请时间">{{ selectedApplication.createdAt }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :style="{ backgroundColor: getStatusColor(selectedApplication.status), color: '#fff' }" size="small">
              {{ getStatusLabel(selectedApplication.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="请假事由" :span="2">
            {{ selectedApplication.reason }}
          </n-descriptions-item>
        </n-descriptions>

        <n-form
          ref="approveFormRef"
          :model="approveFormData"
          :rules="approveFormRules"
          label-placement="left"
          label-width="100px"
          style="margin-top: 20px;"
        >
          <n-form-item label="审批意见" path="comment">
            <n-input 
              v-model:value="approveFormData.comment" 
              type="textarea" 
              placeholder="请输入审批意见" 
              :rows="3" 
            />
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showApproveModal = false">取消</n-button>
          <n-button type="error" @click="handleReject">
            <template #icon>
              <XCircle :size="16" />
            </template>
            驳回
          </n-button>
          <n-button type="primary" @click="handleApprove">
            <template #icon>
              <CheckCircle :size="16" />
            </template>
            同意
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="card" title="请假详情" style="width: 600px;">
      <div v-if="selectedApplication" class="detail-modal">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="申请人">{{ selectedApplication.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="部门">{{ selectedApplication.department }}</n-descriptions-item>
          <n-descriptions-item label="请假类型">
            <n-tag :style="{ backgroundColor: getLeaveTypeColor(selectedApplication.leaveType), color: '#fff' }" size="small">
              {{ getLeaveTypeLabel(selectedApplication.leaveType) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="请假天数">{{ selectedApplication.totalDays }} 天</n-descriptions-item>
          <n-descriptions-item label="开始时间">{{ selectedApplication.startDate }} {{ selectedApplication.startTime }}</n-descriptions-item>
          <n-descriptions-item label="结束时间">{{ selectedApplication.endDate }} {{ selectedApplication.endTime }}</n-descriptions-item>
          <n-descriptions-item label="申请时间">{{ selectedApplication.createdAt }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :style="{ backgroundColor: getStatusColor(selectedApplication.status), color: '#fff' }" size="small">
              {{ getStatusLabel(selectedApplication.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="请假事由" :span="2">
            {{ selectedApplication.reason }}
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedApplication.approverName" label="审批人" :span="2">
            {{ selectedApplication.approverName }}
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedApplication.approvalComment" label="审批意见" :span="2">
            {{ selectedApplication.approvalComment }}
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedApplication.approvedAt" label="审批时间" :span="2">
            {{ selectedApplication.approvedAt }}
          </n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { Send, CheckCircle, XCircle, Eye } from 'lucide-vue-next'
import { useLeaveStore } from '@/stores/leave'
import { useUserStore } from '@/stores/user'
import { useMessage, useDialog, NTag, NSpace, NButton } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui'
import type { LeaveApplication, LeaveType, LeaveStatus } from '@/types'
import { LEAVE_TYPE_OPTIONS, LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS, LEAVE_STATUS_OPTIONS, LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS } from '@/types'

const leaveStore = useLeaveStore()
const userStore = useUserStore()
const message = useMessage()
const dialog = useDialog()

const activeTab = ref('apply')
const formRef = ref<FormInst | null>(null)
const approveFormRef = ref<FormInst | null>(null)

const leaveTypeOptions = LEAVE_TYPE_OPTIONS
const statusOptions = LEAVE_STATUS_OPTIONS

const formData = ref({
  leaveType: '' as LeaveType | '',
  startDate: null as number | null,
  endDate: null as number | null,
  startTime: null as number | null,
  endTime: null as number | null,
  reason: ''
})

const formRules: FormRules = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, type: 'number', message: '请选择开始日期', trigger: ['change', 'blur'] }],
  endDate: [{ required: true, type: 'number', message: '请选择结束日期', trigger: ['change', 'blur'] }],
  startTime: [{ required: true, type: 'number', message: '请选择开始时间', trigger: ['change', 'blur'] }],
  endTime: [{ required: true, type: 'number', message: '请选择结束时间', trigger: ['change', 'blur'] }],
  reason: [{ required: true, message: '请输入请假事由', trigger: 'blur' }]
}

const totalDays = computed(() => {
  if (!formData.value.startDate || !formData.value.endDate || !formData.value.startTime || !formData.value.endTime) {
    return 0
  }
  const start = new Date(formData.value.startDate)
  const end = new Date(formData.value.endDate)
  const startTs = start.getTime() + formData.value.startTime
  const endTs = end.getTime() + formData.value.endTime
  const diffMs = endTs - startTs
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return Math.round(diffDays * 10) / 10
})

function calculateDays() {
}

const myBalance = computed(() => leaveStore.getLeaveBalance('3'))

const myFilterStatus = ref('')
const myFilterType = ref('')
const myCurrentPage = ref(1)

const filteredMyApplications = computed(() => {
  let data = leaveStore.applications.filter(a => a.employeeId === '3')
  if (myFilterStatus.value) {
    data = data.filter(a => a.status === myFilterStatus.value)
  }
  if (myFilterType.value) {
    data = data.filter(a => a.leaveType === myFilterType.value)
  }
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const approveFilterStatus = ref('')
const approveFilterType = ref('')
const approveCurrentPage = ref(1)

const filteredApproveApplications = computed(() => {
  let data = leaveStore.applications
  if (approveFilterStatus.value) {
    data = data.filter(a => a.status === approveFilterStatus.value)
  }
  if (approveFilterType.value) {
    data = data.filter(a => a.leaveType === approveFilterType.value)
  }
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const showApproveModal = ref(false)
const showDetailModal = ref(false)
const selectedApplication = ref<LeaveApplication | null>(null)

const approveFormData = ref({
  comment: ''
})

const approveFormRules: FormRules = {
  comment: [{ required: true, message: '请输入审批意见', trigger: 'blur' }]
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function getLeaveTypeLabel(type: LeaveType): string {
  return LEAVE_TYPE_LABELS[type]
}

function getLeaveTypeColor(type: LeaveType): string {
  return LEAVE_TYPE_COLORS[type]
}

function getStatusLabel(status: LeaveStatus): string {
  return LEAVE_STATUS_LABELS[status]
}

function getStatusColor(status: LeaveStatus): string {
  return LEAVE_STATUS_COLORS[status]
}

const myColumns: DataTableColumns<LeaveApplication> = [
  {
    title: '请假类型',
    key: 'leaveType',
    render: (row) => {
      return h(NTag as any, { 
        style: { backgroundColor: getLeaveTypeColor(row.leaveType), color: '#fff' }, 
        size: 'small' 
      }, { default: () => getLeaveTypeLabel(row.leaveType) }) as any
    }
  },
  {
    title: '开始时间',
    key: 'startDate',
    render: (row) => `${row.startDate} ${row.startTime}`
  },
  {
    title: '结束时间',
    key: 'endDate',
    render: (row) => `${row.endDate} ${row.endTime}`
  },
  {
    title: '天数',
    key: 'totalDays',
    render: (row) => `${row.totalDays} 天`
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      return h(NTag as any, { 
        style: { backgroundColor: getStatusColor(row.status), color: '#fff' }, 
        size: 'small' 
      }, { default: () => getStatusLabel(row.status) }) as any
    }
  },
  {
    title: '申请时间',
    key: 'createdAt'
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h(NButton as any, { 
        size: 'small', 
        quaternary: true, 
        onClick: () => handleViewDetail(row) 
      }, {
        icon: () => h(Eye as any, { size: 14 })
      }) as any
    }
  }
]

const approveColumns: DataTableColumns<LeaveApplication> = [
  {
    title: '申请人',
    key: 'employeeName'
  },
  {
    title: '部门',
    key: 'department'
  },
  {
    title: '请假类型',
    key: 'leaveType',
    render: (row) => {
      return h(NTag as any, { 
        style: { backgroundColor: getLeaveTypeColor(row.leaveType), color: '#fff' }, 
        size: 'small' 
      }, { default: () => getLeaveTypeLabel(row.leaveType) }) as any
    }
  },
  {
    title: '开始时间',
    key: 'startDate',
    render: (row) => `${row.startDate} ${row.startTime}`
  },
  {
    title: '结束时间',
    key: 'endDate',
    render: (row) => `${row.endDate} ${row.endTime}`
  },
  {
    title: '天数',
    key: 'totalDays',
    render: (row) => `${row.totalDays} 天`
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      return h(NTag as any, { 
        style: { backgroundColor: getStatusColor(row.status), color: '#fff' }, 
        size: 'small' 
      }, { default: () => getStatusLabel(row.status) }) as any
    }
  },
  {
    title: '申请时间',
    key: 'createdAt'
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h(NSpace as any, { size: 'small' }, {
        default: () => [
          h(NButton as any, { 
            size: 'small', 
            quaternary: true, 
            onClick: () => handleViewDetail(row) 
          }, {
            icon: () => h(Eye as any, { size: 14 })
          }),
          row.status === 'pending' && h(NButton as any, { 
            size: 'small', 
            type: 'primary', 
            quaternary: true,
            onClick: () => handleOpenApprove(row) 
          }, {
            default: () => '审批'
          })
        ]
      }) as any
    }
  }
]

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const startDate = formatDate(formData.value.startDate)
      const endDate = formatDate(formData.value.endDate)
      const startTime = formatTime(formData.value.startTime)
      const endTime = formatTime(formData.value.endTime)
      
      leaveStore.addApplication({
        employeeId: '3',
        employeeName: '王员工',
        department: '市场部',
        leaveType: formData.value.leaveType as LeaveType,
        startDate,
        endDate,
        startTime,
        endTime,
        totalDays: totalDays.value,
        reason: formData.value.reason
      })
      
      message.success('请假申请提交成功，等待审批')
      resetForm()
      activeTab.value = 'my'
    }
  })
}

function resetForm() {
  formData.value = {
    leaveType: '',
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    reason: ''
  }
  formRef.value?.restoreValidation()
}

function handleOpenApprove(application: LeaveApplication) {
  selectedApplication.value = application
  approveFormData.value.comment = ''
  showApproveModal.value = true
}

function handleViewDetail(application: LeaveApplication) {
  selectedApplication.value = application
  showDetailModal.value = true
}

function handleApprove() {
  approveFormRef.value?.validate((errors) => {
    if (!errors && selectedApplication.value) {
      const d = dialog.warning({
        title: '确认通过',
        content: '确定要通过该请假申请吗？通过后将自动在考勤表中标记为请假。',
        positiveText: '确认通过',
        negativeText: '取消',
        onPositiveClick: () => {
          leaveStore.approveApplication(
            selectedApplication.value!.id,
            '1',
            '系统管理员',
            approveFormData.value.comment
          )
          message.success('已通过请假申请，考勤表已更新')
          showApproveModal.value = false
          d.destroy()
        }
      })
    }
  })
}

function handleReject() {
  approveFormRef.value?.validate((errors) => {
    if (!errors && selectedApplication.value) {
      const d = dialog.warning({
        title: '确认驳回',
        content: '确定要驳回该请假申请吗？',
        positiveText: '确认驳回',
        negativeText: '取消',
        type: 'error',
        onPositiveClick: () => {
          leaveStore.rejectApplication(
            selectedApplication.value!.id,
            '1',
            '系统管理员',
            approveFormData.value.comment
          )
          message.success('已驳回请假申请')
          showApproveModal.value = false
          d.destroy()
        }
      })
    }
  })
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-card {
  max-width: 800px;
}

.balance-info {
  display: flex;
  gap: 24px;
}

.balance-info strong {
  color: #7C3AED;
  font-size: 16px;
}

.approve-modal,
.detail-modal {
  text-align: left;
}
</style>
