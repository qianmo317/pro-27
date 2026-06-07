<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">异动管理</div>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <Plus :size="16" />
        </template>
        新增异动
      </n-button>
    </div>

    <n-row :gutter="16" class="stats-row">
      <n-col :span="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <Users :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCount }}</div>
              <div class="stat-label">异动总次数</div>
            </div>
          </div>
        </n-card>
      </n-col>
      <n-col :span="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon effective">
              <CheckCircle :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.effectiveCount }}</div>
              <div class="stat-label">已生效</div>
            </div>
          </div>
        </n-card>
      </n-col>
      <n-col :span="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <Clock :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pendingCount }}</div>
              <div class="stat-label">待生效</div>
            </div>
          </div>
        </n-card>
      </n-col>
      <n-col :span="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon promotion">
              <TrendingUp :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.typeStats.promotion }}</div>
              <div class="stat-label">晋升次数</div>
            </div>
          </div>
        </n-card>
      </n-col>
    </n-row>

    <n-card class="filter-card">
      <n-space :size="16" wrap>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索员工姓名、异动原因..."
          style="width: 280px;"
          clearable
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>

        <n-select
          v-model:value="filterType"
          placeholder="异动类型"
          style="width: 140px;"
          clearable
          :options="transferTypeOptions"
        />

        <n-select
          v-model:value="filterDepartment"
          placeholder="选择部门"
          style="width: 140px;"
          clearable
          :options="departmentOptions"
        />

        <n-select
          v-model:value="filterStatus"
          placeholder="状态"
          style="width: 120px;"
          clearable
          :options="transferStatusOptions"
        />

        <n-date-picker
          v-model:value="filterStartDate"
          type="date"
          placeholder="开始日期"
          style="width: 140px;"
          clearable
        />

        <n-date-picker
          v-model:value="filterEndDate"
          type="date"
          placeholder="结束日期"
          style="width: 140px;"
          clearable
        />

        <n-button @click="handleReset">重置</n-button>
      </n-space>
    </n-card>

    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="transferStore.paginatedTransfers"
        :pagination="{
          page: transferStore.currentPage,
          pageSize: transferStore.pageSize,
          itemCount: transferStore.total,
          showSizePicker: true,
          pageSizes: [10, 20, 50, 100],
          showQuickJumper: true,
          onUpdatePage: (page) => transferStore.setCurrentPage(page),
          onUpdatePageSize: (size) => transferStore.setPageSize(size)
        }"
        :bordered="false"
        size="large"
      />
    </n-card>

    <n-modal v-model:show="showAddModal" preset="card" title="新增异动" style="width: 720px;">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="选择员工" path="employeeId">
          <n-select
            v-model:value="formData.employeeId"
            placeholder="请选择员工"
            :options="employeeOptions"
            @update:value="handleEmployeeSelect"
            filterable
          />
        </n-form-item>
        <n-form-item label="异动类型" path="type">
          <n-select v-model:value="formData.type" placeholder="请选择异动类型" :options="transferTypeOptions" />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="异动前部门" path="beforeDepartment">
              <n-select v-model:value="formData.beforeDepartment" placeholder="请选择部门" :options="departmentOptions" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="异动前职位" path="beforePosition">
              <n-input v-model:value="formData.beforePosition" placeholder="请输入职位" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="异动后部门" path="afterDepartment">
              <n-select v-model:value="formData.afterDepartment" placeholder="请选择部门" :options="departmentOptions" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="异动后职位" path="afterPosition">
              <n-input v-model:value="formData.afterPosition" placeholder="请输入职位" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="异动原因" path="reason">
          <n-input v-model:value="formData.reason" type="textarea" placeholder="请输入异动原因" :rows="3" />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="生效日期" path="effectiveDate">
              <n-date-picker v-model:value="formData.effectiveDate" type="date" style="width: 100%;" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="状态" path="status">
              <n-select v-model:value="formData.status" placeholder="请选择状态" :options="transferStatusOptions" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="备注">
          <n-input v-model:value="formData.remarks" type="textarea" placeholder="请输入备注信息" :rows="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="card" title="异动详情" style="width: 680px;">
      <div v-if="currentTransfer" class="transfer-detail">
        <div class="detail-header">
          <div class="detail-type" :style="{ backgroundColor: getTypeColor(currentTransfer.type) + '20', color: getTypeColor(currentTransfer.type) }">
            {{ getTypeLabel(currentTransfer.type) }}
          </div>
          <n-tag :type="currentTransfer.status === 'effective' ? 'success' : currentTransfer.status === 'pending' ? 'warning' : 'default'" size="small">
            {{ currentTransfer.status === 'effective' ? '已生效' : currentTransfer.status === 'pending' ? '待生效' : '已取消' }}
          </n-tag>
        </div>

        <n-descriptions :column="2" bordered class="detail-desc">
          <n-descriptions-item label="员工姓名">{{ currentTransfer.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="生效日期">{{ currentTransfer.effectiveDate }}</n-descriptions-item>
          <n-descriptions-item label="异动前部门">{{ currentTransfer.beforeDepartment }}</n-descriptions-item>
          <n-descriptions-item label="异动前职位">{{ currentTransfer.beforePosition }}</n-descriptions-item>
          <n-descriptions-item label="异动后部门">{{ currentTransfer.afterDepartment }}</n-descriptions-item>
          <n-descriptions-item label="异动后职位">{{ currentTransfer.afterPosition }}</n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ currentTransfer.createdAt }}</n-descriptions-item>
          <n-descriptions-item label="操作人">{{ currentTransfer.createdBy }}</n-descriptions-item>
        </n-descriptions>

        <div class="detail-section">
          <div class="section-title">异动原因</div>
          <n-card size="small" :bordered="false" style="background: #F9FAFB;">
            {{ currentTransfer.reason }}
          </n-card>
        </div>

        <div v-if="currentTransfer.remarks" class="detail-section">
          <div class="section-title">备注</div>
          <n-card size="small" :bordered="false" style="background: #F9FAFB;">
            {{ currentTransfer.remarks }}
          </n-card>
        </div>

        <div class="detail-actions">
          <n-space justify="end">
            <n-button v-if="currentTransfer.status === 'pending'" type="primary" @click="handleMakeEffective">
              <template #icon>
                <CheckCircle :size="14" />
              </template>
              立即生效
            </n-button>
            <n-button v-if="currentTransfer.status !== 'cancelled'" type="default" @click="handleCancel">
              <template #icon>
                <XCircle :size="14" />
              </template>
              取消异动
            </n-button>
            <n-button type="error" @click="handleDelete">
              <template #icon>
                <Trash2 :size="14" />
              </template>
              删除
            </n-button>
          </n-space>
        </div>
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
import { ref, computed, watch, h, onMounted } from 'vue'
import { Plus, Search, Users, CheckCircle, Clock, TrendingUp, Eye, Trash2, XCircle } from 'lucide-vue-next'
import { useEmployeeTransferStore } from '@/stores/employee-transfer'
import { useEmployeeStore } from '@/stores/employee'
import { useMessage, useDialog, NTag, NSpace, NButton, NRow, NCol } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns, DialogReactive } from 'naive-ui'
import type { EmployeeTransfer, TransferType } from '@/types'
import { TRANSFER_TYPE_OPTIONS, TRANSFER_TYPE_LABELS, TRANSFER_STATUS_OPTIONS, TRANSFER_TYPE_COLORS } from '@/types'

const transferStore = useEmployeeTransferStore()
const employeeStore = useEmployeeStore()
const message = useMessage()
const dialog = useDialog()

const searchKeyword = ref('')
const filterType = ref<TransferType | ''>('')
const filterDepartment = ref('')
const filterStatus = ref<EmployeeTransfer['status'] | ''>('')
const filterStartDate = ref<number | null>(null)
const filterEndDate = ref<number | null>(null)

const showAddModal = ref(false)
const showDetailModal = ref(false)
const currentTransfer = ref<EmployeeTransfer | null>(null)
const formRef = ref<FormInst | null>(null)

const transferTypeOptions = TRANSFER_TYPE_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }))
const transferStatusOptions = TRANSFER_STATUS_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }))
const departmentOptions = computed(() => employeeStore.departments.map(dept => ({ label: dept, value: dept })))
const employeeOptions = computed(() => employeeStore.employees.map(emp => ({ label: `${emp.name} (${emp.department} · ${emp.position})`, value: emp.id })))

const statistics = computed(() => transferStore.getStatistics())

const formData = ref<Partial<EmployeeTransfer>>({
  employeeId: '',
  type: 'department_change' as TransferType,
  beforeDepartment: '',
  beforePosition: '',
  afterDepartment: '',
  afterPosition: '',
  reason: '',
  effectiveDate: null,
  status: 'pending' as EmployeeTransfer['status'],
  remarks: ''
})

const formRules: FormRules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  type: [{ required: true, message: '请选择异动类型', trigger: 'change' }],
  beforeDepartment: [{ required: true, message: '请选择异动前部门', trigger: 'change' }],
  beforePosition: [{ required: true, message: '请输入异动前职位', trigger: 'blur' }],
  afterDepartment: [{ required: true, message: '请选择异动后部门', trigger: 'change' }],
  afterPosition: [{ required: true, message: '请输入异动后职位', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入异动原因', trigger: 'blur' }],
  effectiveDate: [{ required: true, type: 'number', message: '请选择生效日期', trigger: ['change', 'blur'] }]
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTypeLabel(type: TransferType): string {
  return TRANSFER_TYPE_LABELS[type]
}

function getTypeColor(type: TransferType): string {
  return TRANSFER_TYPE_COLORS[type]
}

function handleEmployeeSelect(employeeId: string) {
  const employee = employeeStore.getEmployeeById(employeeId)
  if (employee) {
    formData.value.employeeName = employee.name
    formData.value.beforeDepartment = employee.department
    formData.value.beforePosition = employee.position
    formData.value.afterDepartment = employee.department
    formData.value.afterPosition = employee.position
  }
}

function handleReset() {
  searchKeyword.value = ''
  filterType.value = ''
  filterDepartment.value = ''
  filterStatus.value = ''
  filterStartDate.value = null
  filterEndDate.value = null
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const employee = employeeStore.getEmployeeById(formData.value.employeeId || '')
      if (!employee) {
        message.error('请选择有效的员工')
        return
      }

      const effectiveDate = typeof formData.value.effectiveDate === 'number'
        ? formatDate(formData.value.effectiveDate as number)
        : formData.value.effectiveDate || ''

      const today = new Date().toISOString().split('T')[0]
      let status = formData.value.status || 'pending'
      if (status === 'pending' && effectiveDate <= today) {
        status = 'effective'
      }

      transferStore.addTransfer({
        employeeId: employee.id,
        employeeName: employee.name,
        type: formData.value.type as TransferType,
        beforeDepartment: formData.value.beforeDepartment || '',
        beforePosition: formData.value.beforePosition || '',
        afterDepartment: formData.value.afterDepartment || '',
        afterPosition: formData.value.afterPosition || '',
        reason: formData.value.reason || '',
        effectiveDate,
        status,
        createdAt: today,
        createdBy: '李人事',
        remarks: formData.value.remarks
      })

      message.success('异动记录创建成功')
      showAddModal.value = false
      resetForm()
    }
  })
}

function resetForm() {
  formData.value = {
    employeeId: '',
    type: 'department_change' as TransferType,
    beforeDepartment: '',
    beforePosition: '',
    afterDepartment: '',
    afterPosition: '',
    reason: '',
    effectiveDate: null,
    status: 'pending' as EmployeeTransfer['status'],
    remarks: ''
  }
}

function handleView(transfer: EmployeeTransfer) {
  currentTransfer.value = transfer
  showDetailModal.value = true
}

function handleMakeEffective() {
  if (currentTransfer.value) {
    const d = dialog.warning({
      title: '确认生效',
      content: '确定要让该异动立即生效吗？生效后将自动更新员工的部门和职位信息。',
      positiveText: '确认生效',
      negativeText: '取消',
      onPositiveClick: () => {
        transferStore.updateTransfer(currentTransfer.value!.id, { status: 'effective' })
        message.success('异动已生效')
        showDetailModal.value = false
        d.destroy()
      }
    })
  }
}

function handleCancel() {
  if (currentTransfer.value) {
    const d = dialog.warning({
      title: '取消异动',
      content: '确定要取消该异动记录吗？取消后将无法恢复。',
      positiveText: '确认取消',
      negativeText: '保留',
      onPositiveClick: () => {
        transferStore.updateTransfer(currentTransfer.value!.id, { status: 'cancelled' })
        message.success('异动已取消')
        showDetailModal.value = false
        d.destroy()
      }
    })
  }
}

function handleDelete() {
  if (currentTransfer.value) {
    const d = dialog.warning({
      title: '确认删除',
      content: '确定要删除该异动记录吗？此操作不可恢复。',
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: () => {
        transferStore.deleteTransfer(currentTransfer.value!.id)
        message.success('删除成功')
        showDetailModal.value = false
        d.destroy()
      }
    })
  }
}

const columns: DataTableColumns<EmployeeTransfer> = [
  {
    title: '员工信息',
    key: 'employeeName',
    width: 150,
    render: (row) => {
      const employee = employeeStore.getEmployeeById(row.employeeId)
      return h('div', { class: 'employee-info' }, [
        h('img', { src: employee?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default', class: 'employee-avatar' }),
        h('div', { class: 'employee-details' }, [
          h('div', { class: 'employee-name' }, row.employeeName),
          h('div', { class: 'employee-dept' }, employee?.department || row.beforeDepartment)
        ])
      ]) as any
    }
  },
  {
    title: '异动类型',
    key: 'type',
    width: 100,
    render: (row) => {
      return h(NTag as any, { 
        size: 'small',
        style: {
          backgroundColor: getTypeColor(row.type) + '20',
          color: getTypeColor(row.type),
          border: 'none'
        }
      }, { default: () => getTypeLabel(row.type) }) as any
    }
  },
  {
    title: '异动前',
    key: 'before',
    width: 180,
    render: (row) => {
      return h('div', { class: 'transfer-before' }, [
        h('div', { class: 'dept' }, row.beforeDepartment),
        h('div', { class: 'position' }, row.beforePosition)
      ]) as any
    }
  },
  {
    title: '异动后',
    key: 'after',
    width: 180,
    render: (row) => {
      return h('div', { class: 'transfer-after' }, [
        h('div', { class: 'dept' }, row.afterDepartment),
        h('div', { class: 'position' }, row.afterPosition)
      ]) as any
    }
  },
  {
    title: '生效日期',
    key: 'effectiveDate',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const typeMap: Record<string, any> = {
        effective: 'success',
        pending: 'warning',
        cancelled: 'default'
      }
      const labelMap: Record<string, string> = {
        effective: '已生效',
        pending: '待生效',
        cancelled: '已取消'
      }
      return h(NTag as any, { type: typeMap[row.status], size: 'small' }, { default: () => labelMap[row.status] }) as any
    }
  },
  {
    title: '操作人',
    key: 'createdBy',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h(NSpace as any, { size: 'small' }, {
        default: () => [
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleView(row) }, {
            icon: () => h(Eye as any, { size: 14 })
          })
        ]
      }) as any
    }
  }
]

watch([searchKeyword, filterType, filterDepartment, filterStatus], () => {
  transferStore.setSearchKeyword(searchKeyword.value)
  transferStore.setFilterType(filterType.value)
  transferStore.setFilterDepartment(filterDepartment.value)
  transferStore.setFilterStatus(filterStatus.value)
})

watch(filterStartDate, (val) => {
  transferStore.setFilterStartDate(val ? formatDate(val) : '')
})

watch(filterEndDate, (val) => {
  transferStore.setFilterEndDate(val ? formatDate(val) : '')
})

onMounted(() => {
  transferStore.processPendingTransfers()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
}

.stat-icon.effective {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
}

.stat-icon.promotion {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1E1B4B;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
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

.transfer-before,
.transfer-after {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transfer-before .dept {
  font-size: 12px;
  color: #6B7280;
}

.transfer-before .position {
  font-size: 13px;
  color: #374151;
}

.transfer-after .dept {
  font-size: 12px;
  color: #6B7280;
}

.transfer-after .position {
  font-size: 13px;
  color: #1E1B4B;
  font-weight: 500;
}

.transfer-detail {
  padding: 8px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EDE9FE;
}

.detail-type {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.detail-desc {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 8px;
}

.detail-actions {
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}
</style>
