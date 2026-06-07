<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">加班管理</div>
    </div>

    <n-tabs v-model:value="activeTab" type="line" size="large">
      <n-tab-pane name="apply" tab="申请加班">
        <n-card title="提交加班申请" class="form-card">
          <n-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-placement="left"
            label-width="100px"
          >
            <n-row :gutter="16">
              <n-col :span="12">
                <n-form-item label="加班日期" path="overtimeDate">
                  <n-date-picker 
                    v-model:value="formData.overtimeDate" 
                    type="date" 
                    style="width: 100%;" 
                  />
                </n-form-item>
              </n-col>
              <n-col :span="12">
                <n-form-item label="加班时长">
                  <n-input :value="`${totalHours} 小时`" disabled />
                </n-form-item>
              </n-col>
            </n-row>
            <n-row :gutter="16">
              <n-col :span="12">
                <n-form-item label="开始时间" path="startTime">
                  <n-time-picker 
                    v-model:value="formData.startTime" 
                    style="width: 100%;" 
                    format="HH:mm"
                    @update:value="calculateHours"
                  />
                </n-form-item>
              </n-col>
              <n-col :span="12">
                <n-form-item label="结束时间" path="endTime">
                  <n-time-picker 
                    v-model:value="formData.endTime" 
                    style="width: 100%;" 
                    format="HH:mm"
                    @update:value="calculateHours"
                  />
                </n-form-item>
              </n-col>
            </n-row>
            <n-form-item label="加班事由" path="reason">
              <n-input 
                v-model:value="formData.reason" 
                type="textarea" 
                placeholder="请输入加班事由" 
                :rows="4" 
              />
            </n-form-item>
            
            <n-alert v-if="myBalance" type="info" :bordered="false" style="margin-bottom: 20px;">
              <div class="balance-info">
                <span>累计加班：<strong>{{ overtimeStore.getOvertimeHoursByEmployeeId('3') }}</strong> 小时</span>
                <span>可换调休：<strong>{{ overtimeStore.getCompensatoryLeaveDays('3') }}</strong> 天</span>
                <span>剩余调休：<strong>{{ myBalance.compensatoryLeaveRemaining }}</strong> 天</span>
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
        <n-card title="我的加班记录">
          <n-space :size="16" wrap style="margin-bottom: 16px;">
            <n-select
              v-model:value="myFilterStatus"
              placeholder="筛选状态"
              style="width: 140px;"
              clearable
              :options="statusOptions"
            />
          </n-space>
          
          <n-data-table
            :columns="myColumns"
            :data="paginatedMyApplications"
            :bordered="false"
            remote
            size="large"
            :pagination="myPagination"
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
          </n-space>
          
          <n-data-table
            :columns="approveColumns"
            :data="paginatedApproveApplications"
            :bordered="false"
            remote
            size="large"
            :pagination="approvePagination"
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showApproveModal" preset="card" title="审批加班" style="width: 600px;">
      <div v-if="selectedApplication" class="approve-modal">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="申请人">{{ selectedApplication.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="部门">{{ selectedApplication.department }}</n-descriptions-item>
          <n-descriptions-item label="加班日期">{{ selectedApplication.overtimeDate }}</n-descriptions-item>
          <n-descriptions-item label="加班时长">{{ selectedApplication.totalHours }} 小时</n-descriptions-item>
          <n-descriptions-item label="开始时间">{{ selectedApplication.startTime }}</n-descriptions-item>
          <n-descriptions-item label="结束时间">{{ selectedApplication.endTime }}</n-descriptions-item>
          <n-descriptions-item label="申请时间">{{ selectedApplication.createdAt }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :style="{ backgroundColor: getStatusColor(selectedApplication.status), color: '#fff' }" size="small">
              {{ getStatusLabel(selectedApplication.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="加班事由" :span="2">
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

    <n-modal v-model:show="showDetailModal" preset="card" title="加班详情" style="width: 600px;">
      <div v-if="selectedApplication" class="detail-modal">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="申请人">{{ selectedApplication.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="部门">{{ selectedApplication.department }}</n-descriptions-item>
          <n-descriptions-item label="加班日期">{{ selectedApplication.overtimeDate }}</n-descriptions-item>
          <n-descriptions-item label="加班时长">{{ selectedApplication.totalHours }} 小时</n-descriptions-item>
          <n-descriptions-item label="开始时间">{{ selectedApplication.startTime }}</n-descriptions-item>
          <n-descriptions-item label="结束时间">{{ selectedApplication.endTime }}</n-descriptions-item>
          <n-descriptions-item label="申请时间">{{ selectedApplication.createdAt }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :style="{ backgroundColor: getStatusColor(selectedApplication.status), color: '#fff' }" size="small">
              {{ getStatusLabel(selectedApplication.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="加班事由" :span="2">
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
import { useOvertimeStore } from '@/stores/overtime'
import { useLeaveStore } from '@/stores/leave'
import { useMessage, useDialog, NTag, NSpace, NButton } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui'
import type { OvertimeApplication, OvertimeStatus } from '@/types'
import { OVERTIME_STATUS_OPTIONS, OVERTIME_STATUS_LABELS, OVERTIME_STATUS_COLORS } from '@/types'

const overtimeStore = useOvertimeStore()
const leaveStore = useLeaveStore()
const message = useMessage()
const dialog = useDialog()

const activeTab = ref('apply')
const formRef = ref<FormInst | null>(null)
const approveFormRef = ref<FormInst | null>(null)

const statusOptions = OVERTIME_STATUS_OPTIONS

const formData = ref({
  overtimeDate: null as number | null,
  startTime: null as number | null,
  endTime: null as number | null,
  reason: ''
})

const formRules: FormRules = {
  overtimeDate: [{ required: true, type: 'number', message: '请选择加班日期', trigger: ['change', 'blur'] }],
  startTime: [{ required: true, type: 'number', message: '请选择开始时间', trigger: ['change', 'blur'] }],
  endTime: [{ required: true, type: 'number', message: '请选择结束时间', trigger: ['change', 'blur'] }],
  reason: [{ required: true, message: '请输入加班事由', trigger: 'blur' }]
}

const totalHours = computed(() => {
  if (!formData.value.startTime || !formData.value.endTime) {
    return 0
  }
  return overtimeStore.calculateTotalHours(
    formatTime(formData.value.startTime),
    formatTime(formData.value.endTime)
  )
})

function calculateHours() {
}

const myBalance = computed(() => leaveStore.getLeaveBalance('3'))

const myFilterStatus = ref('')
const myCurrentPage = ref(1)
const myPageSize = ref(10)

const filteredMyApplications = computed(() => {
  let data = overtimeStore.applications.filter(a => a.employeeId === '3')
  if (myFilterStatus.value) {
    data = data.filter(a => a.status === myFilterStatus.value)
  }
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const paginatedMyApplications = computed(() => {
  const start = (myCurrentPage.value - 1) * myPageSize.value
  return filteredMyApplications.value.slice(start, start + myPageSize.value)
})

const approveFilterStatus = ref('')
const approveCurrentPage = ref(1)
const approvePageSize = ref(10)

const filteredApproveApplications = computed(() => {
  let data = overtimeStore.applications
  if (approveFilterStatus.value) {
    data = data.filter(a => a.status === approveFilterStatus.value)
  }
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const paginatedApproveApplications = computed(() => {
  const start = (approveCurrentPage.value - 1) * approvePageSize.value
  return filteredApproveApplications.value.slice(start, start + approvePageSize.value)
})

const myPagination = computed(() => ({
  page: myCurrentPage.value,
  pageSize: myPageSize.value,
  itemCount: filteredMyApplications.value.length,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  onUpdatePage: (page: number) => {
    myCurrentPage.value = page
  },
  onUpdatePageSize: (size: number) => {
    myPageSize.value = size
    myCurrentPage.value = 1
  }
}))

const approvePagination = computed(() => ({
  page: approveCurrentPage.value,
  pageSize: approvePageSize.value,
  itemCount: filteredApproveApplications.value.length,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  onUpdatePage: (page: number) => {
    approveCurrentPage.value = page
  },
  onUpdatePageSize: (size: number) => {
    approvePageSize.value = size
    approveCurrentPage.value = 1
  }
}))

const showApproveModal = ref(false)
const showDetailModal = ref(false)
const selectedApplication = ref<OvertimeApplication | null>(null)

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

function getStatusLabel(status: OvertimeStatus): string {
  return OVERTIME_STATUS_LABELS[status]
}

function getStatusColor(status: OvertimeStatus): string {
  return OVERTIME_STATUS_COLORS[status]
}

const myColumns: DataTableColumns<OvertimeApplication> = [
  {
    title: '加班日期',
    key: 'overtimeDate'
  },
  {
    title: '开始时间',
    key: 'startTime'
  },
  {
    title: '结束时间',
    key: 'endTime'
  },
  {
    title: '时长',
    key: 'totalHours',
    render: (row) => `${row.totalHours} 小时`
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

const approveColumns: DataTableColumns<OvertimeApplication> = [
  {
    title: '申请人',
    key: 'employeeName'
  },
  {
    title: '部门',
    key: 'department'
  },
  {
    title: '加班日期',
    key: 'overtimeDate'
  },
  {
    title: '时长',
    key: 'totalHours',
    render: (row) => `${row.totalHours} 小时`
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
      const overtimeDate = formatDate(formData.value.overtimeDate)
      const startTime = formatTime(formData.value.startTime)
      const endTime = formatTime(formData.value.endTime)
      
      overtimeStore.addApplication({
        employeeId: '3',
        employeeName: '王员工',
        department: '市场部',
        overtimeDate,
        startTime,
        endTime,
        totalHours: totalHours.value,
        reason: formData.value.reason
      })
      
      message.success('加班申请提交成功，等待审批')
      resetForm()
      activeTab.value = 'my'
    }
  })
}

function resetForm() {
  formData.value = {
    overtimeDate: null,
    startTime: null,
    endTime: null,
    reason: ''
  }
  formRef.value?.restoreValidation()
}

function handleOpenApprove(application: OvertimeApplication) {
  selectedApplication.value = application
  approveFormData.value.comment = ''
  showApproveModal.value = true
}

function handleViewDetail(application: OvertimeApplication) {
  selectedApplication.value = application
  showDetailModal.value = true
}

function handleApprove() {
  approveFormRef.value?.validate((errors) => {
    if (!errors && selectedApplication.value) {
      const d = dialog.warning({
        title: '确认通过',
        content: `确定要通过该加班申请吗？通过后将自动增加 ${selectedApplication.value.totalHours} 小时加班时长，可兑换 ${Math.round((selectedApplication.value.totalHours / 8) * 10) / 10} 天调休。`,
        positiveText: '确认通过',
        negativeText: '取消',
        onPositiveClick: () => {
          overtimeStore.approveApplication(
            selectedApplication.value!.id,
            '1',
            '系统管理员',
            approveFormData.value.comment
          )
          message.success('已通过加班申请，调休余额已更新')
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
        content: '确定要驳回该加班申请吗？',
        positiveText: '确认驳回',
        negativeText: '取消',
        type: 'error',
        onPositiveClick: () => {
          overtimeStore.rejectApplication(
            selectedApplication.value!.id,
            '1',
            '系统管理员',
            approveFormData.value.comment
          )
          message.success('已驳回加班申请')
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
