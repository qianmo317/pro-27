<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">合同管理</div>
      <div class="header-right">
        <n-alert v-if="contractStore.expiringCount > 0" type="warning" :bordered="false" class="expiring-alert">
          <template #icon>
            <AlertTriangle :size="18" />
          </template>
          <span>有 {{ contractStore.expiringCount }} 份合同将在30天内到期，请及时处理续签！</span>
        </n-alert>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon>
            <Plus :size="16" />
          </template>
          新增合同
        </n-button>
      </div>
    </div>

    <n-card class="filter-card">
      <n-space :size="16" wrap>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索员工姓名、合同编号..."
          style="width: 280px;"
          clearable
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>

        <n-select
          v-model:value="filterType"
          placeholder="合同类型"
          style="width: 140px;"
          clearable
          :options="typeOptions"
        />

        <n-select
          v-model:value="filterStatus"
          placeholder="合同状态"
          style="width: 140px;"
          clearable
          :options="statusOptions"
        />
      </n-space>
    </n-card>

    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="contractStore.paginatedContracts"
        :pagination="pagination"
        :bordered="false"
        size="large"
      />
    </n-card>

    <n-modal v-model:show="showAddModal" preset="card" title="新增合同" style="width: 650px;">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="员工" path="employeeId">
          <n-select v-model:value="formData.employeeId" placeholder="请选择员工" :options="employeeOptions" @update:value="handleEmployeeSelect" />
        </n-form-item>
        <n-form-item label="合同类型" path="type">
          <n-select v-model:value="formData.type" placeholder="请选择合同类型" :options="typeOptions" />
        </n-form-item>
        <n-form-item label="开始日期" path="startDate">
          <n-date-picker v-model:value="formData.startDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="结束日期" path="endDate">
          <n-date-picker v-model:value="formData.endDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="试用期(月)" path="probationMonths">
          <n-input-number v-model:value="formData.probationMonths" :min="0" :max="6" style="width: 100%;" placeholder="0-6个月" />
        </n-form-item>
        <n-form-item label="转正条件" path="conversionConditions">
          <n-input v-model:value="formData.conversionConditions" type="textarea" :rows="3" placeholder="请输入转正条件" />
        </n-form-item>
        <n-form-item label="薪资约定" path="salaryAgreement">
          <n-input-number v-model:value="formData.salaryAgreement" :min="0" style="width: 100%;" placeholder="请输入薪资">
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="备注" path="remarks">
          <n-input v-model:value="formData.remarks" type="textarea" :rows="2" placeholder="选填" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showViewModal" preset="card" title="合同详情" style="width: 600px;">
      <div v-if="currentContract" class="contract-detail">
        <div class="contract-header">
          <div class="contract-id">合同编号：{{ currentContract.id }}</div>
          <n-tag :type="statusTypeMap[currentContract.status]" size="large">
            {{ statusLabelMap[currentContract.status] }}
          </n-tag>
        </div>

        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="员工姓名">{{ currentContract.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="合同类型">{{ typeLabelMap[currentContract.type] }}</n-descriptions-item>
          <n-descriptions-item label="开始日期">{{ currentContract.startDate }}</n-descriptions-item>
          <n-descriptions-item label="结束日期">{{ currentContract.endDate }}</n-descriptions-item>
          <n-descriptions-item label="试用期">{{ currentContract.probationMonths }} 个月</n-descriptions-item>
          <n-descriptions-item label="薪资约定">¥ {{ currentContract.salaryAgreement.toLocaleString() }}</n-descriptions-item>
          <n-descriptions-item label="转正条件" :span="2">{{ currentContract.conversionConditions }}</n-descriptions-item>
          <n-descriptions-item v-if="currentContract.remarks" label="备注" :span="2">{{ currentContract.remarks }}</n-descriptions-item>
          <n-descriptions-item label="创建时间" :span="2">{{ currentContract.createdAt }}</n-descriptions-item>
        </n-descriptions>

        <n-alert v-if="currentContract.status === 'expiring'" type="warning" class="warning-alert">
          <template #icon>
            <AlertTriangle :size="18" />
          </template>
          此合同将在 {{ getDaysRemaining(currentContract.endDate) }} 天后到期，请及时处理续签事宜。
        </n-alert>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showViewModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showEditModal" preset="card" title="编辑合同" style="width: 650px;">
      <n-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="员工">
          <n-select :value="editFormData.employeeId" :options="employeeOptions" disabled />
        </n-form-item>
        <n-form-item label="合同类型" path="type">
          <n-select v-model:value="editFormData.type" placeholder="请选择合同类型" :options="typeOptions" />
        </n-form-item>
        <n-form-item label="开始日期" path="startDate">
          <n-date-picker v-model:value="editFormData.startDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="结束日期" path="endDate">
          <n-date-picker v-model:value="editFormData.endDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="试用期(月)" path="probationMonths">
          <n-input-number v-model:value="editFormData.probationMonths" :min="0" :max="6" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="转正条件" path="conversionConditions">
          <n-input v-model:value="editFormData.conversionConditions" type="textarea" :rows="3" />
        </n-form-item>
        <n-form-item label="薪资约定" path="salaryAgreement">
          <n-input-number v-model:value="editFormData.salaryAgreement" :min="0" style="width: 100%;">
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="备注" path="remarks">
          <n-input v-model:value="editFormData.remarks" type="textarea" :rows="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, onMounted } from 'vue'
import { Plus, Search, Edit, Trash2, Eye, FileText, AlertTriangle, Ban } from 'lucide-vue-next'
import { useContractStore } from '@/stores/contract'
import { useEmployeeStore } from '@/stores/employee'
import { useMessage, useDialog, NTag, NSpace, NButton } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns, DialogReactive } from 'naive-ui'
import type { Contract } from '@/types'

const contractStore = useContractStore()
const employeeStore = useEmployeeStore()
const message = useMessage()
const dialog = useDialog()

function formatDate(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDaysRemaining(endDate: string): number {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const currentContract = ref<Contract | null>(null)
const formRef = ref<FormInst | null>(null)
const editFormRef = ref<FormInst | null>(null)

const typeOptions = [
  { label: '全职', value: 'fulltime' },
  { label: '兼职', value: 'parttime' },
  { label: '实习', value: 'intern' }
]

const statusOptions = [
  { label: '生效中', value: 'active' },
  { label: '即将到期', value: 'expiring' },
  { label: '已到期', value: 'expired' },
  { label: '已终止', value: 'terminated' }
]

const typeLabelMap: Record<string, string> = {
  fulltime: '全职',
  parttime: '兼职',
  intern: '实习'
}

const statusLabelMap: Record<string, string> = {
  active: '生效中',
  expiring: '即将到期',
  expired: '已到期',
  terminated: '已终止'
}

const statusTypeMap: Record<string, any> = {
  active: 'success',
  expiring: 'warning',
  expired: 'error',
  terminated: 'default'
}

const employeeOptions = computed(() =>
  employeeStore.employees.map(emp => ({
    label: emp.name,
    value: emp.id,
    employeeName: emp.name
  }))
)

const pagination = computed(() => ({
  page: contractStore.currentPage,
  pageSize: contractStore.pageSize,
  itemCount: contractStore.total,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  onUpdatePage: (page: number) => contractStore.setCurrentPage(page),
  onUpdatePageSize: (size: number) => contractStore.setPageSize(size)
}))

const formData = ref<Partial<Contract>>({
  employeeId: '',
  employeeName: '',
  type: 'fulltime',
  startDate: null,
  endDate: null,
  probationMonths: 3,
  conversionConditions: '',
  salaryAgreement: 0,
  remarks: ''
})

const editFormData = ref<Partial<Contract>>({
  employeeId: '',
  employeeName: '',
  type: 'fulltime',
  startDate: null,
  endDate: null,
  probationMonths: 0,
  conversionConditions: '',
  salaryAgreement: 0,
  remarks: ''
})

function createDateRangeValidator(startDateGetter: () => any) {
  return (_rule: any, value: any) => {
    if (value === null || value === undefined || value === '') {
      return new Error('请选择结束日期')
    }
    const startVal = startDateGetter()
    if (startVal !== null && startVal !== undefined && startVal !== '') {
      const start = typeof startVal === 'number' ? new Date(startVal) : new Date(startVal)
      const end = typeof value === 'number' ? new Date(value) : new Date(value)
      if (end < start) {
        return new Error('结束日期不能早于开始日期')
      }
    }
    return true
  }
}

const formRules: FormRules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  startDate: [
    { 
      required: true, 
      validator: (_rule, value) => {
        if (value === null || value === undefined || value === '') {
          return new Error('请选择开始日期')
        }
        return true
      },
      trigger: ['change', 'blur'] 
    }
  ],
  endDate: [
    { 
      required: true, 
      validator: createDateRangeValidator(() => formData.value.startDate),
      trigger: ['change', 'blur'] 
    }
  ],
  conversionConditions: [{ required: true, message: '请输入转正条件', trigger: 'blur' }],
  salaryAgreement: [
    { 
      required: true, 
      validator: (_rule, value) => {
        if (value === null || value === undefined || value < 0) {
          return new Error('请输入有效的薪资约定')
        }
        return true
      },
      trigger: 'blur' 
    }
  ]
}

const editFormRules: FormRules = {
  type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  startDate: [
    { 
      required: true, 
      validator: (_rule, value) => {
        if (value === null || value === undefined || value === '') {
          return new Error('请选择开始日期')
        }
        return true
      },
      trigger: ['change', 'blur'] 
    }
  ],
  endDate: [
    { 
      required: true, 
      validator: createDateRangeValidator(() => editFormData.value.startDate),
      trigger: ['change', 'blur'] 
    }
  ],
  conversionConditions: [{ required: true, message: '请输入转正条件', trigger: 'blur' }],
  salaryAgreement: [
    { 
      required: true, 
      validator: (_rule, value) => {
        if (value === null || value === undefined || value < 0) {
          return new Error('请输入有效的薪资约定')
        }
        return true
      },
      trigger: 'blur' 
    }
  ]
}

watch([searchKeyword, filterType, filterStatus], () => {
  contractStore.setSearchKeyword(searchKeyword.value)
  contractStore.setFilterType(filterType.value)
  contractStore.setFilterStatus(filterStatus.value)
})

function handleEmployeeSelect(value: string) {
  const emp = employeeStore.getEmployeeById(value)
  if (emp) {
    formData.value.employeeName = emp.name
  }
}

const columns: DataTableColumns<Contract> = [
  {
    title: '合同编号',
    key: 'id',
    width: 120,
    render: (row) => {
      return h('span', { class: 'contract-id' }, row.id)
    }
  },
  {
    title: '员工信息',
    key: 'employeeName',
    width: 160,
    render: (row) => {
      const emp = employeeStore.getEmployeeById(row.employeeId)
      return h('div', { class: 'employee-info' }, [
        emp ? h('img', { src: emp.avatar, class: 'employee-avatar', style: 'width: 28px; height: 28px; border-radius: 50%; object-fit: cover;' }) : null,
        h('div', { class: 'employee-details' }, [
          h('div', { class: 'employee-name' }, row.employeeName),
          h('div', { class: 'employee-dept' }, emp?.department || '-')
        ])
      ]) as any
    }
  },
  {
    title: '合同类型',
    key: 'type',
    width: 100,
    render: (row) => {
      return h(NTag as any, { size: 'small' }, { default: () => typeLabelMap[row.type] }) as any
    }
  },
  {
    title: '合同期限',
    key: 'period',
    width: 220,
    render: (row) => {
      return h('div', { class: 'contract-period' }, [
        h('div', { class: 'period-dates' }, `${row.startDate} 至 ${row.endDate}`),
        h('div', { class: 'period-duration' }, `共 ${getContractDuration(row.startDate, row.endDate)}`)
      ])
    }
  },
  {
    title: '薪资约定',
    key: 'salaryAgreement',
    width: 120,
    render: (row) => {
      return h('span', { class: 'salary-text' }, `¥ ${row.salaryAgreement.toLocaleString()}`)
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render: (row) => {
      const content = [h(NTag as any, { type: statusTypeMap[row.status], size: 'small' }, { default: () => statusLabelMap[row.status] })]
      if (row.status === 'expiring') {
        content.push(h('div', { class: 'days-remaining' }, `剩余 ${getDaysRemaining(row.endDate)} 天`))
      }
      return h('div', { class: 'status-cell' }, content) as any
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render: (row) => {
      return h(NSpace as any, { size: 'small' }, {
        default: () => [
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleView(row) }, {
            icon: () => h(Eye as any, { size: 14 })
          }),
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleEdit(row), disabled: row.status === 'terminated' }, {
            icon: () => h(Edit as any, { size: 14 })
          }),
          h(NButton as any, {
            size: 'small',
            quaternary: true,
            onClick: () => handleTerminate(row),
            disabled: row.status === 'terminated' || row.status === 'expired'
          }, {
            icon: () => h(Ban as any, { size: 14 }),
            style: row.status === 'terminated' || row.status === 'expired' ? '' : 'color: #F59E0B;'
          }),
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleDelete(row.id) }, {
            icon: () => h(Trash2 as any, { size: 14 }),
            style: 'color: #EF4444;'
          })
        ]
      }) as any
    }
  }
]

function getContractDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
  if (months < 12) {
    return `${months} 个月`
  } else if (months % 12 === 0) {
    return `${months / 12} 年`
  } else {
    return `${Math.floor(months / 12)} 年 ${months % 12} 个月`
  }
}

function handleView(contract: Contract) {
  currentContract.value = contract
  showViewModal.value = true
}

function handleEdit(contract: Contract) {
  if (contract.status === 'terminated') {
    message.warning('已终止的合同不能编辑')
    return
  }
  currentContract.value = contract
  editFormData.value = { ...contract }
  if (contract.startDate) {
    const [year, month, day] = contract.startDate.split('-').map(Number)
    editFormData.value.startDate = new Date(year, month - 1, day).getTime() as any
  }
  if (contract.endDate) {
    const [year, month, day] = contract.endDate.split('-').map(Number)
    editFormData.value.endDate = new Date(year, month - 1, day).getTime() as any
  }
  showEditModal.value = true
}

function handleEditSubmit() {
  editFormRef.value?.validate((errors) => {
    if (!errors && currentContract.value) {
      const startDate = typeof editFormData.value.startDate === 'number'
        ? formatDate(editFormData.value.startDate as number)
        : editFormData.value.startDate || currentContract.value.startDate

      const endDate = typeof editFormData.value.endDate === 'number'
        ? formatDate(editFormData.value.endDate as number)
        : editFormData.value.endDate || currentContract.value.endDate

      contractStore.updateContract(currentContract.value.id, {
        ...editFormData.value,
        startDate,
        endDate
      })
      message.success('编辑成功')
      showEditModal.value = false
    }
  })
}

function handleTerminate(contract: Contract) {
  const d = dialog.warning({
    title: '确认终止合同',
    content: `确定要终止 ${contract.employeeName} 的这份合同吗？此操作会将合同状态标记为已终止。`,
    positiveText: '确认终止',
    negativeText: '取消',
    onPositiveClick: () => {
      contractStore.terminateContract(contract.id, '人工终止')
      message.success('合同已终止')
      d.destroy()
    }
  })
}

function handleDelete(id: string) {
  const d = dialog.warning({
    title: '确认删除',
    content: '确定要删除这份合同吗？此操作不可恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      contractStore.deleteContract(id)
      message.success('删除成功')
      d.destroy()
    }
  })
}

function handleAdd() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const startDate = typeof formData.value.startDate === 'number'
        ? formatDate(formData.value.startDate as number)
        : formData.value.startDate || ''

      const endDate = typeof formData.value.endDate === 'number'
        ? formatDate(formData.value.endDate as number)
        : formData.value.endDate || ''

      contractStore.addContract({
        employeeId: formData.value.employeeId!,
        employeeName: formData.value.employeeName!,
        type: formData.value.type as Contract['type'],
        startDate,
        endDate,
        probationMonths: formData.value.probationMonths || 0,
        conversionConditions: formData.value.conversionConditions!,
        salaryAgreement: formData.value.salaryAgreement || 0,
        remarks: formData.value.remarks
      })
      contractStore.setCurrentPage(1)
      message.success('新增成功')
      showAddModal.value = false
      resetForm()
    }
  })
}

function resetForm() {
  formData.value = {
    employeeId: '',
    employeeName: '',
    type: 'fulltime',
    startDate: null,
    endDate: null,
    probationMonths: 3,
    conversionConditions: '',
    salaryAgreement: 0,
    remarks: ''
  }
}

onMounted(() => {
  contractStore.updateContractStatus()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.expiring-alert {
  margin-right: 16px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.contract-id {
  font-family: monospace;
  color: #7C3AED;
  font-weight: 600;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.employee-avatar) {
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
}

.employee-details {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.employee-dept {
  font-size: 12px;
  color: #6B7280;
}

.contract-period {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.period-dates {
  font-size: 14px;
  color: #1E1B4B;
}

.period-duration {
  font-size: 12px;
  color: #6B7280;
}

.salary-text {
  font-weight: 600;
  color: #059669;
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.days-remaining {
  font-size: 11px;
  color: #F59E0B;
  font-weight: 500;
}

.contract-detail {
  padding: 10px 0;
}

.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EDE9FE;
}

.contract-id {
  font-size: 16px;
  font-weight: 600;
  color: #7C3AED;
}

.warning-alert {
  margin-top: 20px;
}

:deep(.n-data-table .n-pagination) {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  padding: 16px !important;
}

:deep(.n-pagination .n-pagination-item) {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  min-width: 32px !important;
  height: 32px !important;
}

:deep(.n-pagination .n-pagination-item.n-pagination-item--button) {
  display: inline-flex !important;
}

:deep(.n-pagination .n-pagination-jumper) {
  display: inline-flex !important;
  visibility: visible !important;
}

:deep(.n-pagination .n-pagination-sizes) {
  display: inline-flex !important;
  visibility: visible !important;
}
</style>
