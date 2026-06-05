<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">员工花名册</div>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <Plus :size="16" />
        </template>
        新增员工
      </n-button>
    </div>
    
    <n-card class="filter-card">
      <n-space :size="16" wrap>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索姓名、邮箱、职位..."
          style="width: 280px;"
          clearable
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
        
        <n-select
          v-model:value="filterDepartment"
          placeholder="选择部门"
          style="width: 160px;"
          clearable
          :options="departmentOptions"
        />
        
        <n-select
          v-model:value="filterStatus"
          placeholder="选择状态"
          style="width: 140px;"
          clearable
          :options="statusOptions"
        />
      </n-space>
    </n-card>
    
    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="employeeStore.paginatedEmployees"
        :pagination="{
          page: employeeStore.currentPage,
          pageSize: employeeStore.pageSize,
          itemCount: employeeStore.total,
          onUpdatePage: (page) => employeeStore.setCurrentPage(page)
        }"
        :bordered="false"
        size="large"
      />
    </n-card>
    
    <n-modal v-model:show="showAddModal" preset="card" title="新增员工" style="width: 600px;">
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
        <n-form-item label="性别" path="gender">
          <n-select v-model:value="formData.gender" placeholder="请选择性别" :options="genderOptions" />
        </n-form-item>
        <n-form-item label="电话" path="phone">
          <n-input v-model:value="formData.phone" placeholder="请输入电话" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="formData.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="部门" path="department">
          <n-select v-model:value="formData.department" placeholder="请选择部门" :options="departmentOptions" />
        </n-form-item>
        <n-form-item label="职位" path="position">
          <n-input v-model:value="formData.position" placeholder="请输入职位" />
        </n-form-item>
        <n-form-item label="入职日期" path="entryDate">
          <n-date-picker v-model:value="formData.entryDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="formData.status" placeholder="请选择状态" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <n-modal v-model:show="showViewModal" preset="card" title="员工详情" style="width: 900px;">
      <div v-if="currentEmployee" class="employee-detail">
        <div class="detail-header">
          <div class="detail-avatar">
            <img :src="currentEmployee.avatar" alt="" />
          </div>
          <div class="detail-info">
            <div class="detail-name">{{ currentEmployee.name }}</div>
            <div class="detail-position">{{ currentEmployee.department }} · {{ currentEmployee.position }}</div>
            <n-tag :type="currentEmployee.status === 'active' ? 'success' : currentEmployee.status === 'probation' ? 'warning' : 'error'" size="small">
              {{ currentEmployee.status === 'active' ? '正式' : currentEmployee.status === 'probation' ? '试用' : '离职' }}
            </n-tag>
          </div>
        </div>

        <n-descriptions :column="2" bordered class="detail-desc">
          <n-descriptions-item label="性别">{{ currentEmployee.gender === 'male' ? '男' : '女' }}</n-descriptions-item>
          <n-descriptions-item label="电话">{{ currentEmployee.phone }}</n-descriptions-item>
          <n-descriptions-item label="邮箱">{{ currentEmployee.email }}</n-descriptions-item>
          <n-descriptions-item label="入职日期">{{ currentEmployee.entryDate }}</n-descriptions-item>
        </n-descriptions>

        <n-tabs v-model:value="activeDetailTab" type="line" style="margin-top: 20px;">
          <n-tab-pane name="contract" tab="合同信息">
            <div v-if="currentContract" class="current-contract">
              <div class="section-title">
                <span>当前合同</span>
                <n-tag :type="contractStatusTypes[currentContract.status]" size="small">
                  {{ contractStatusLabels[currentContract.status] }}
                </n-tag>
              </div>
              <n-card size="small" class="contract-card">
                <n-descriptions :column="2" :bordered="false" size="small">
                  <n-descriptions-item label="合同类型">{{ contractTypeLabels[currentContract.type] }}</n-descriptions-item>
                  <n-descriptions-item label="合同编号">{{ currentContract.id }}</n-descriptions-item>
                  <n-descriptions-item label="合同期限">{{ currentContract.startDate }} 至 {{ currentContract.endDate }}</n-descriptions-item>
                  <n-descriptions-item label="薪资约定">¥ {{ currentContract.salaryAgreement.toLocaleString() }}</n-descriptions-item>
                </n-descriptions>
                <n-alert v-if="currentContract.status === 'expiring'" type="warning" size="small" class="contract-warning">
                  此合同将在 {{ getDaysRemaining(currentContract.endDate) }} 天后到期，请及时处理续签事宜。
                </n-alert>
              </n-card>
            </div>

            <div v-else class="no-contract">
              <n-alert type="info" :bordered="false">
                该员工暂无有效合同
              </n-alert>
            </div>

            <div class="contract-timeline">
              <div class="section-title">合同时间线</div>
              <n-timeline v-if="employeeContracts.length > 0" :type="timelineType">
                <n-timeline-item
                  v-for="(contract, index) in employeeContracts"
                  :key="contract.id"
                  :type="getTimelineItemType(contract, index)"
                  :title="`${contractTypeLabels[contract.type]}合同`"
                  :time="`${contract.startDate} ~ ${contract.endDate}`"
                >
                  <div class="timeline-content">
                    <div class="timeline-id">合同编号：{{ contract.id }}</div>
                    <div class="timeline-salary">薪资：¥ {{ contract.salaryAgreement.toLocaleString() }}</div>
                    <n-tag size="small" :type="contractStatusTypes[contract.status]">
                      {{ contractStatusLabels[contract.status] }}
                    </n-tag>
                    <div v-if="contract.remarks" class="timeline-remarks">{{ contract.remarks }}</div>
                  </div>
                </n-timeline-item>
              </n-timeline>
              <div v-else class="no-history">
                <n-empty description="暂无历史合同记录" />
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="attachments" tab="档案附件">
            <AttachmentManager
              v-if="currentEmployee"
              owner-type="employee"
              :owner-id="currentEmployee.id"
              title="员工档案附件"
              :allowed-categories="['id_card', 'education_certificate', 'medical_report', 'resignation_proof', 'labor_contract', 'other']"
            />
          </n-tab-pane>
        </n-tabs>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showViewModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <n-modal v-model:show="showEditModal" preset="card" title="编辑员工" style="width: 600px;">
      <n-form
        ref="editFormRef"
        :model="editFormData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="姓名" path="name">
          <n-input v-model:value="editFormData.name" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-select v-model:value="editFormData.gender" placeholder="请选择性别" :options="genderOptions" />
        </n-form-item>
        <n-form-item label="电话" path="phone">
          <n-input v-model:value="editFormData.phone" placeholder="请输入电话" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="editFormData.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="部门" path="department">
          <n-select v-model:value="editFormData.department" placeholder="请选择部门" :options="departmentOptions" />
        </n-form-item>
        <n-form-item label="职位" path="position">
          <n-input v-model:value="editFormData.position" placeholder="请输入职位" />
        </n-form-item>
        <n-form-item label="入职日期" path="entryDate">
          <n-date-picker v-model:value="editFormData.entryDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="editFormData.status" placeholder="请选择状态" :options="statusOptions" />
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
import { ref, computed, watch, h } from 'vue'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-vue-next'
import { useEmployeeStore } from '@/stores/employee'
import { useContractStore } from '@/stores/contract'
import { useMessage, useDialog, NTag, NSpace, NButton, NTimeline, NTimelineItem } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns, DialogReactive } from 'naive-ui'
import type { Employee, Contract } from '@/types'
import AttachmentManager from '@/components/AttachmentManager.vue'

const employeeStore = useEmployeeStore()
const contractStore = useContractStore()
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

const searchKeyword = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const currentEmployee = ref<Employee | null>(null)
const activeDetailTab = ref('contract')

const employeeContracts = computed(() => {
  if (!currentEmployee.value) return []
  return contractStore.getContractsByEmployeeId(currentEmployee.value.id)
})

const currentContract = computed(() => {
  if (!currentEmployee.value) return null
  return contractStore.getCurrentContract(currentEmployee.value.id)
})

const contractTypeLabels: Record<string, string> = {
  fulltime: '全职',
  parttime: '兼职',
  intern: '实习'
}

const contractStatusLabels: Record<string, string> = {
  active: '生效中',
  expiring: '即将到期',
  expired: '已到期',
  terminated: '已终止'
}

const contractStatusTypes: Record<string, any> = {
  active: 'success',
  expiring: 'warning',
  expired: 'error',
  terminated: 'default'
}

function getDaysRemaining(endDate: string): number {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const timelineType = 'line'

function getTimelineItemType(contract: Contract, index: number): any {
  if (index === 0 && (contract.status === 'active' || contract.status === 'expiring')) {
    return 'success'
  }
  if (contract.status === 'expiring') return 'warning'
  if (contract.status === 'expired') return 'default'
  if (contract.status === 'terminated') return 'error'
  return 'default'
}

const formRef = ref<FormInst | null>(null)
const editFormRef = ref<FormInst | null>(null)

const editFormData = ref<Partial<Employee>>({
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  department: '',
  position: '',
  entryDate: null,
  status: 'probation'
})

const formData = ref<Partial<Employee>>({
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  department: '',
  position: '',
  entryDate: null,
  status: 'probation'
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }]
}

const departments = computed(() => employeeStore.departments)
const departmentOptions = computed(() => employeeStore.departments.map(dept => ({ label: dept, value: dept })))

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

const statusOptions = [
  { label: '正式', value: 'active' },
  { label: '试用', value: 'probation' },
  { label: '离职', value: 'inactive' }
]

watch([searchKeyword, filterDepartment, filterStatus], () => {
  employeeStore.setSearchKeyword(searchKeyword.value)
  employeeStore.setFilterDepartment(filterDepartment.value)
  employeeStore.setFilterStatus(filterStatus.value)
})

const columns: DataTableColumns<Employee> = [
  {
    title: '员工信息',
    key: 'name',
    width: 200,
    render: (row) => {
      return h('div', { class: 'employee-info' }, [
        h('img', { src: row.avatar, class: 'employee-avatar' }),
        h('div', { class: 'employee-details' }, [
          h('div', { class: 'employee-name' }, row.name),
          h('div', { class: 'employee-email' }, row.email)
        ])
      ]) as any
    }
  },
  {
    title: '部门',
    key: 'department'
  },
  {
    title: '职位',
    key: 'position'
  },
  {
    title: '入职日期',
    key: 'entryDate'
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      const typeMap: Record<string, any> = {
        active: 'success',
        probation: 'warning',
        inactive: 'error'
      }
      const labelMap: Record<string, string> = {
        active: '正式',
        probation: '试用',
        inactive: '离职'
      }
      return h(NTag as any, { type: typeMap[row.status], size: 'small' }, { default: () => labelMap[row.status] }) as any
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h(NSpace as any, { size: 'small' }, {
        default: () => [
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleView(row) }, {
            icon: () => h(Eye as any, { size: 14 })
          }),
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleEdit(row) }, {
            icon: () => h(Edit as any, { size: 14 })
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

function handleView(employee: Employee) {
  currentEmployee.value = employee
  activeDetailTab.value = 'contract'
  showViewModal.value = true
}

function handleEdit(employee: Employee) {
  currentEmployee.value = employee
  editFormData.value = { ...employee }
  if (employee.entryDate) {
    const [year, month, day] = employee.entryDate.split('-').map(Number)
    editFormData.value.entryDate = new Date(year, month - 1, day).getTime() as any
  }
  showEditModal.value = true
}

function handleEditSubmit() {
  editFormRef.value?.validate((errors) => {
    if (!errors && currentEmployee.value) {
      const entryDate = typeof editFormData.value.entryDate === 'number' 
        ? formatDate(editFormData.value.entryDate as number)
        : editFormData.value.entryDate || currentEmployee.value.entryDate
      
      employeeStore.updateEmployee(currentEmployee.value.id, {
        ...editFormData.value,
        entryDate
      })
      message.success('编辑成功')
      showEditModal.value = false
    }
  })
}

function handleDelete(id: string) {
  const d = dialog.warning({
    title: '确认删除',
    content: '确定要删除该员工吗？此操作不可恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      employeeStore.deleteEmployee(id)
      message.success('删除成功')
      d.destroy()
    }
  })
}

function handleAdd() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const entryDate = typeof formData.value.entryDate === 'number' 
        ? formatDate(formData.value.entryDate as number)
        : formData.value.entryDate || ''
      
      employeeStore.addEmployee({
        ...formData.value,
        entryDate,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      } as Omit<Employee, 'id'>)
      message.success('新增成功')
      showAddModal.value = false
      resetForm()
    }
  })
}

function resetForm() {
  formData.value = {
    name: '',
    gender: 'male',
    phone: '',
    email: '',
    department: '',
    position: '',
    entryDate: null,
    status: 'probation'
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  width: 40px;
  height: 40px;
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

.employee-email {
  font-size: 12px;
  color: #6B7280;
}

.employee-detail {
  text-align: left;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EDE9FE;
}

.detail-avatar {
  flex-shrink: 0;
}

.detail-avatar img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid #7C3AED;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-name {
  font-size: 20px;
  font-weight: 700;
  color: #1E1B4B;
}

.detail-position {
  font-size: 14px;
  color: #6B7280;
}

.detail-desc {
  margin-bottom: 24px;
}

.current-contract {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.contract-card {
  background: linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%);
  border: 1px solid #EDE9FE;
}

.contract-warning {
  margin-top: 12px;
}

.no-contract {
  margin-bottom: 24px;
}

.contract-timeline {
  margin-top: 24px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}

.timeline-id {
  font-size: 13px;
  color: #374151;
}

.timeline-salary {
  font-size: 13px;
  color: #059669;
  font-weight: 500;
}

.timeline-remarks {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
  font-style: italic;
}

.no-history {
  padding: 20px 0;
}
</style>
