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
    
    <n-modal v-model:show="showViewModal" preset="card" title="员工详情" style="width: 500px;">
      <div v-if="currentEmployee" class="employee-detail">
        <div class="detail-avatar">
          <img :src="currentEmployee.avatar" alt="" />
        </div>
        <n-descriptions :column="1" bordered>
          <n-descriptions-item label="姓名">{{ currentEmployee.name }}</n-descriptions-item>
          <n-descriptions-item label="性别">{{ currentEmployee.gender === 'male' ? '男' : '女' }}</n-descriptions-item>
          <n-descriptions-item label="电话">{{ currentEmployee.phone }}</n-descriptions-item>
          <n-descriptions-item label="邮箱">{{ currentEmployee.email }}</n-descriptions-item>
          <n-descriptions-item label="部门">{{ currentEmployee.department }}</n-descriptions-item>
          <n-descriptions-item label="职位">{{ currentEmployee.position }}</n-descriptions-item>
          <n-descriptions-item label="入职日期">{{ currentEmployee.entryDate }}</n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="currentEmployee.status === 'active' ? 'success' : currentEmployee.status === 'probation' ? 'warning' : 'error'">
              {{ currentEmployee.status === 'active' ? '正式' : currentEmployee.status === 'probation' ? '试用' : '离职' }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
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
import { useMessage, useDialog, NTag, NSpace, NButton } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns, DialogReactive } from 'naive-ui'
import type { Employee } from '@/types'

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

const searchKeyword = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const currentEmployee = ref<Employee | null>(null)
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
  text-align: center;
}

.detail-avatar {
  margin-bottom: 20px;
}

.detail-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #7C3AED;
}
</style>
