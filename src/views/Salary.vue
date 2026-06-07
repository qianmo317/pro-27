<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">薪资工资条</div>
      <n-space>
        <n-dropdown :options="batchOptions" @select="handleBatchAction">
          <n-button type="primary">
            <template #icon>
              <Users :size="16" />
            </template>
            批量生成
          </n-button>
        </n-dropdown>
        <n-button type="primary" @click="openCreateModal">
          <template #icon>
            <Plus :size="16" />
          </template>
          创建工资条
        </n-button>
      </n-space>
    </div>

    <n-card class="summary-card">
      <div class="summary-content">
        <div class="summary-item">
          <span class="summary-label">发放人数</span>
          <span class="summary-value">{{ salaryStore.filteredRecords.length }} 人</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">应发总额</span>
          <span class="summary-value">¥ {{ formatNumber(salaryStore.totalGrossSalary) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">扣款总额</span>
          <span class="summary-value text-red">- ¥ {{ formatNumber(salaryStore.totalDeduction) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">实发总额</span>
          <span class="summary-value highlight">¥ {{ formatNumber(salaryStore.totalSalary) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">平均薪资</span>
          <span class="summary-value">¥ {{ formatNumber(averageSalary) }}</span>
        </div>
      </div>
    </n-card>

    <n-card class="filter-card" style="margin-top: 20px;">
      <n-space :size="16" wrap>
        <n-select
          v-model:value="selectedMonth"
          placeholder="选择月份"
          style="width: 160px;"
          :options="monthOptions"
        />
        <n-select
          v-model:value="departmentFilter"
          placeholder="选择部门"
          style="width: 160px;"
          clearable
          :options="departmentOptions"
        />
        <n-input
          v-model:value="employeeFilter"
          placeholder="搜索员工..."
          style="width: 200px;"
          clearable
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
      </n-space>
    </n-card>

    <n-grid :cols="3" :x-gap="20" :y-gap="20" style="margin-top: 20px;">
      <n-grid-item v-for="record in salaryStore.filteredRecords" :key="record.id">
        <n-card class="salary-card" hoverable @click="showDetail(record)">
          <div class="salary-header">
            <div class="employee-info">
              <n-avatar round :size="48">
                {{ record.employeeName.charAt(0) }}
              </n-avatar>
              <div class="employee-detail">
                <div class="employee-name">{{ record.employeeName }}</div>
                <div class="employee-position">{{ record.department }} · {{ record.position }}</div>
                <div class="salary-month">{{ record.month }} 工资条</div>
              </div>
            </div>
            <n-dropdown :options="getCardActions(record)" @select="(key) => handleCardAction(key, record)">
              <n-button quaternary circle size="small">
                <MoreVertical :size="16" />
              </n-button>
            </n-dropdown>
          </div>

          <div v-if="record.templateName" class="template-tag">
            <n-tag size="small" type="info">
              <template #icon>
                <FileText :size="12" />
              </template>
              {{ record.templateName }}
            </n-tag>
          </div>

          <div class="salary-net">
            <span class="net-label">实发工资</span>
            <span class="net-value">¥ {{ formatNumber(record.netSalary) }}</span>
          </div>

          <n-divider style="margin: 16px 0;" />

          <div class="salary-detail">
            <div class="detail-row">
              <span class="detail-label">应发工资</span>
              <span class="detail-value">¥ {{ formatNumber(record.grossSalary) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">基本工资</span>
              <span class="detail-value">¥ {{ formatNumber(record.baseSalary) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">岗位津贴</span>
              <span class="detail-value text-green">+ ¥ {{ formatNumber(record.postAllowance) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">绩效奖金</span>
              <span class="detail-value text-green">+ ¥ {{ formatNumber(record.performanceBonus) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">扣款合计</span>
              <span class="detail-value text-red">- ¥ {{ formatNumber(record.totalDeduction) }}</span>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-empty v-if="salaryStore.filteredRecords.length === 0" description="暂无工资条数据" />

    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="工资条详情"
      style="width: 560px;"
    >
      <div v-if="selectedRecord" class="modal-content">
        <div class="modal-header">
          <n-avatar round :size="64">
            {{ selectedRecord.employeeName.charAt(0) }}
          </n-avatar>
          <div>
            <div class="modal-name">{{ selectedRecord.employeeName }}</div>
            <div class="modal-position">{{ selectedRecord.department }} · {{ selectedRecord.position }}</div>
            <div class="modal-month">{{ selectedRecord.month }} 工资条</div>
            <div v-if="selectedRecord.templateName" class="template-info">
              <n-tag size="small" type="info">
                <template #icon>
                  <FileText :size="12" />
                </template>
                {{ selectedRecord.templateName }}
              </n-tag>
            </div>
          </div>
        </div>

        <n-divider />

        <div class="modal-net">
          <span class="net-label">实发工资</span>
          <span class="net-value">¥ {{ formatNumber(selectedRecord.netSalary) }}</span>
        </div>

        <n-divider />

        <div class="modal-detail">
          <div class="detail-section">
            <div class="section-title">收入</div>
            <div class="detail-row">
              <span>基本工资</span>
              <span>¥ {{ formatNumber(selectedRecord.baseSalary) }}</span>
            </div>
            <div class="detail-row">
              <span>岗位津贴</span>
              <span class="text-green">+ ¥ {{ formatNumber(selectedRecord.postAllowance) }}</span>
            </div>
            <div class="detail-row">
              <span>绩效奖金</span>
              <span class="text-green">+ ¥ {{ formatNumber(selectedRecord.performanceBonus) }}</span>
            </div>
            <div class="detail-row">
              <span>其他补贴</span>
              <span class="text-green">+ ¥ {{ formatNumber(selectedRecord.otherAllowance) }}</span>
            </div>
            <n-divider style="margin: 12px 0;" />
            <div class="detail-row total-row">
              <span>应发合计</span>
              <span>¥ {{ formatNumber(selectedRecord.grossSalary) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">扣款</div>
            <div class="detail-row">
              <span>社保</span>
              <span class="text-red">- ¥ {{ formatNumber(selectedRecord.socialSecurity) }}</span>
            </div>
            <div class="detail-row">
              <span>公积金</span>
              <span class="text-red">- ¥ {{ formatNumber(selectedRecord.housingFund) }}</span>
            </div>
            <div class="detail-row">
              <span>个税</span>
              <span class="text-red">- ¥ {{ formatNumber(selectedRecord.incomeTax) }}</span>
            </div>
            <div class="detail-row" v-if="selectedRecord.otherDeduction > 0">
              <span>其他扣款</span>
              <span class="text-red">- ¥ {{ formatNumber(selectedRecord.otherDeduction) }}</span>
            </div>
            <n-divider style="margin: 12px 0;" />
            <div class="detail-row total-row">
              <span>扣款合计</span>
              <span class="text-red">- ¥ {{ formatNumber(selectedRecord.totalDeduction) }}</span>
            </div>
          </div>
        </div>

        <n-divider style="margin: 20px 0;" />

        <div v-if="latestAppraisal" class="performance-section">
          <div class="section-title">
            <span>绩效考核关联</span>
            <n-tag size="small" :type="latestAppraisal.grade === 'excellent' ? 'success' : latestAppraisal.grade === 'good' ? 'info' : latestAppraisal.grade === 'qualified' ? 'warning' : 'error'">
              {{ getGradeLabel(latestAppraisal.grade) }}
            </n-tag>
          </div>

          <n-card size="small" class="performance-card" :bordered="false">
            <div class="performance-header">
              <div class="performance-info">
                <div class="performance-period">{{ latestAppraisal.period }}</div>
                <div class="performance-plan">{{ latestAppraisal.planName }}</div>
              </div>
              <div class="performance-score">
                <span class="score-label">绩效得分</span>
                <span class="score-value" :style="{ color: getGradeColor(latestAppraisal.grade) }">
                  {{ latestAppraisal.totalScore }}
                </span>
              </div>
            </div>

            <n-divider style="margin: 12px 0;" />

            <div class="salary-suggestion">
              <div class="suggestion-title">调薪建议</div>
              <div class="suggestion-content">
                {{ latestAppraisal.salaryAdjustmentSuggestion }}
              </div>
              <div v-if="latestAppraisal.salaryAdjustmentAmount > 0" class="adjustment-amount">
                建议调薪金额: <span>+ ¥ {{ formatNumber(latestAppraisal.salaryAdjustmentAmount) }}</span>
              </div>
            </div>

            <div class="performance-comments">
              <div class="comments-title">上级评语</div>
              <div class="comments-content">
                {{ latestAppraisal.comments || '暂无评语' }}
              </div>
            </div>
          </n-card>
        </div>

        <div v-else class="no-performance">
          <n-alert type="info" :bordered="false">
            该员工暂无绩效考核记录
          </n-alert>
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="openEditModal(selectedRecord!)">编辑</n-button>
          <n-button type="primary">导出PDF</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      :title="isEdit ? '编辑工资条' : '创建工资条'"
      style="width: 640px;"
      :mask-closable="false"
    >
      <n-form
        ref="createFormRef"
        :model="createFormData"
        :rules="createFormRules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="选择员工" path="employeeId">
          <n-select
            v-model:value="createFormData.employeeId"
            :options="employeeOptions"
            placeholder="请选择员工"
            @update:value="handleEmployeeSelect"
          />
        </n-form-item>

        <n-form-item label="薪资月份" path="month">
          <n-date-picker
            v-model:value="createFormData.month"
            type="month"
            value-format="YYYY-MM"
            placeholder="请选择月份"
            style="width: 100%;"
            @update:value="handleMonthChange"
          />
        </n-form-item>

        <n-form-item label="薪资模板" path="templateId">
          <n-select
            v-model:value="createFormData.templateId"
            :options="templateOptions"
            placeholder="请选择薪资模板"
            clearable
            @update:value="handleTemplateSelect"
          />
          <div v-if="autoMatchedTemplate" class="match-hint">
            <n-alert type="info" :bordered="false" size="small">
              已为员工自动匹配模板: {{ autoMatchedTemplate.name }}
            </n-alert>
          </div>
        </n-form-item>

        <n-form-item label="绩效系数" path="performanceMultiplier">
          <n-input-number
            v-model:value="createFormData.performanceMultiplier"
            :min="0"
            :max="3"
            :step="0.1"
            style="width: 100%;"
            @update:value="recalculateSalary"
          />
        </n-form-item>

        <n-divider>薪资明细</n-divider>

        <n-grid :cols="2" :x-gap="12">
          <n-form-item label="基本工资" path="baseSalary" label-placement="top">
            <n-input-number
              v-model:value="createFormData.baseSalary"
              :min="0"
              :step="100"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
          <n-form-item label="岗位津贴" path="postAllowance" label-placement="top">
            <n-input-number
              v-model:value="createFormData.postAllowance"
              :min="0"
              :step="100"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
          <n-form-item label="绩效奖金" path="performanceBonus" label-placement="top">
            <n-input-number
              v-model:value="createFormData.performanceBonus"
              :min="0"
              :step="100"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
          <n-form-item label="其他补贴" path="otherAllowance" label-placement="top">
            <n-input-number
              v-model:value="createFormData.otherAllowance"
              :min="0"
              :step="100"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
        </n-grid>

        <n-divider>扣款明细</n-divider>

        <n-grid :cols="2" :x-gap="12">
          <n-form-item label="社保" path="socialSecurity" label-placement="top">
            <n-input-number
              v-model:value="createFormData.socialSecurity"
              :min="0"
              :step="10"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
          <n-form-item label="公积金" path="housingFund" label-placement="top">
            <n-input-number
              v-model:value="createFormData.housingFund"
              :min="0"
              :step="10"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
          <n-form-item label="个税" path="incomeTax" label-placement="top">
            <n-input-number
              v-model:value="createFormData.incomeTax"
              :min="0"
              :step="10"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
          <n-form-item label="其他扣款" path="otherDeduction" label-placement="top">
            <n-input-number
              v-model:value="createFormData.otherDeduction"
              :min="0"
              :step="10"
              style="width: 100%;"
              @update:value="recalculateNet"
            />
          </n-form-item>
        </n-grid>

        <n-divider />

        <div class="form-summary">
          <div class="summary-row">
            <span class="summary-label">应发工资</span>
            <span class="summary-value">¥ {{ formatNumber(createFormData.grossSalary || 0) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">扣款合计</span>
            <span class="summary-value text-red">- ¥ {{ formatNumber(createFormData.totalDeduction || 0) }}</span>
          </div>
          <div class="summary-row net-row">
            <span class="summary-label">实发工资</span>
            <span class="summary-value net-value">¥ {{ formatNumber(createFormData.netSalary || 0) }}</span>
          </div>
        </div>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreateSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showBatchModal"
      preset="card"
      :title="batchModalTitle"
      style="width: 600px;"
      :mask-closable="false"
    >
      <n-form
        ref="batchFormRef"
        :model="batchFormData"
        :rules="batchFormRules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="薪资月份" path="month">
          <n-date-picker
            v-model:value="batchFormData.month"
            type="month"
            value-format="YYYY-MM"
            placeholder="请选择月份"
            style="width: 100%;"
          />
        </n-form-item>

        <template v-if="batchMode === 'template'">
          <n-form-item label="选择模板" path="templateId">
            <n-select
              v-model:value="batchFormData.templateId"
              :options="templateOptions"
              placeholder="请选择薪资模板"
            />
          </n-form-item>
          <n-form-item label="适用员工" path="employeeIds">
            <n-select
              v-model:value="batchFormData.employeeIds"
              :options="employeeOptions"
              multiple
              max-tag-count="5"
              placeholder="请选择要生成工资条的员工"
              style="width: 100%;"
            />
          </n-form-item>
        </template>

        <template v-else-if="batchMode === 'department'">
          <n-form-item label="选择部门" path="departments">
            <n-select
              v-model:value="batchFormData.departments"
              :options="DEPARTMENT_OPTIONS"
              multiple
              max-tag-count="5"
              placeholder="请选择要生成工资条的部门"
              style="width: 100%;"
            />
          </n-form-item>
          <n-alert type="info" :bordered="false" style="margin-bottom: 16px;">
            将为所选部门的所有在职员工自动匹配适用的薪资模板
          </n-alert>
        </template>

        <template v-else>
          <n-alert type="warning" :bordered="false">
            将为公司所有在职员工自动匹配适用的薪资模板，请确认后操作
          </n-alert>
        </template>

        <n-form-item label="默认绩效系数">
          <n-input-number
            v-model:value="batchFormData.defaultMultiplier"
            :min="0"
            :max="3"
            :step="0.1"
            style="width: 200px;"
          />
        </n-form-item>

        <n-form-item label="覆盖已存在">
          <n-switch v-model:value="batchFormData.overwrite" />
          <span style="margin-left: 8px; font-size: 13px; color: #6B7280;">
            如员工当月已有工资条，是否覆盖
          </span>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="handleBatchGenerate">生成工资条</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Search, Plus, MoreVertical, Users, FileText } from 'lucide-vue-next'
import { useSalaryStore } from '@/stores/salary'
import { useSalaryTemplateStore } from '@/stores/salary-template'
import { useEmployeeStore } from '@/stores/employee'
import { usePerformanceStore } from '@/stores/performance'
import { useMessage, useDialog } from 'naive-ui'
import type { SalaryRecord, PerformanceAppraisal, SalaryTemplate, Employee } from '@/types'
import {
  PERFORMANCE_GRADE_LABELS,
  PERFORMANCE_GRADE_COLORS,
  DEPARTMENT_OPTIONS
} from '@/types'
import type { FormInst, FormRules, DropdownOption, SelectOption } from 'naive-ui'

const salaryStore = useSalaryStore()
const templateStore = useSalaryTemplateStore()
const employeeStore = useEmployeeStore()
const performanceStore = usePerformanceStore()
const message = useMessage()
const dialog = useDialog()

const selectedMonth = ref('2024-01')
const employeeFilter = ref('')
const departmentFilter = ref('')
const showDetailModal = ref(false)
const showCreateModal = ref(false)
const showBatchModal = ref(false)
const selectedRecord = ref<SalaryRecord | null>(null)
const isEdit = ref(false)
const editingId = ref<string | null>(null)
const autoMatchedTemplate = ref<SalaryTemplate | null>(null)
const batchMode = ref<'template' | 'department' | 'all'>('template')

const createFormRef = ref<FormInst | null>(null)
const batchFormRef = ref<FormInst | null>(null)

const createFormData = reactive({
  employeeId: '',
  month: '2024-01',
  templateId: '',
  performanceMultiplier: 1.0,
  baseSalary: 0,
  postAllowance: 0,
  performanceBonus: 0,
  otherAllowance: 0,
  socialSecurity: 0,
  housingFund: 0,
  incomeTax: 0,
  otherDeduction: 0,
  grossSalary: 0,
  totalDeduction: 0,
  netSalary: 0
})

const batchFormData = reactive({
  month: '2024-01',
  templateId: '',
  employeeIds: [] as string[],
  departments: [] as string[],
  defaultMultiplier: 1.0,
  overwrite: false
})

const createFormRules: FormRules = {
  employeeId: [
    {
      validator: (_rule, value) => {
        if (value && value !== '') {
          return true
        }
        return new Error('请选择员工')
      },
      trigger: 'change'
    }
  ],
  month: [
    {
      validator: (_rule, value) => {
        if (value === null || value === undefined || value === '') {
          return new Error('请选择月份')
        }
        let monthStr = value
        if (value instanceof Date) {
          const year = value.getFullYear()
          const month = String(value.getMonth() + 1).padStart(2, '0')
          monthStr = `${year}-${month}`
        }
        if (typeof monthStr === 'string' && /^\d{4}-\d{2}$/.test(monthStr)) {
          return true
        }
        return new Error('请选择有效的月份')
      },
      trigger: 'change'
    }
  ]
}

const batchFormRules: FormRules = {
  month: [{ required: true, message: '请选择月份', trigger: 'change' }],
  templateId: [{ required: true, message: '请选择模板', trigger: 'change' }],
  employeeIds: [{ required: true, message: '请选择员工', trigger: 'change' }],
  departments: [{ required: true, message: '请选择部门', trigger: 'change' }]
}

const monthOptions = computed(() => salaryStore.months.map(m => ({ label: m, value: m })))

const departmentOptions = computed(() =>
  salaryStore.departments.map(d => ({ label: d, value: d }))
)

const employeeOptions = computed<SelectOption[]>(() =>
  employeeStore.employees
    .filter(e => e.status === 'active')
    .map(e => ({
      label: `${e.name} (${e.department} - ${e.position})`,
      value: e.id
    }))
)

const templateOptions = computed<SelectOption[]>(() =>
  templateStore.activeTemplates.map(t => ({
    label: t.name,
    value: t.id
  }))
)

const batchOptions: DropdownOption[] = [
  { label: '按模板生成', key: 'template' },
  { label: '按部门生成', key: 'department' },
  { label: '为所有员工生成', key: 'all' }
]

const batchModalTitle = computed(() => {
  switch (batchMode.value) {
    case 'template': return '按模板批量生成工资条'
    case 'department': return '按部门批量生成工资条'
    case 'all': return '为所有员工生成工资条'
    default: return '批量生成工资条'
  }
})

const averageSalary = computed(() => {
  const records = salaryStore.filteredRecords
  return records.length > 0 ? Math.round(salaryStore.totalSalary / records.length) : 0
})

const latestAppraisal = computed((): PerformanceAppraisal | null => {
  if (!selectedRecord.value) return null
  const appraisals = performanceStore.getAppraisalsByEmployeeId(selectedRecord.value.employeeId)
  return appraisals.length > 0 ? appraisals[appraisals.length - 1] : null
})

watch(selectedMonth, (val) => {
  salaryStore.setSelectedMonth(val)
})

watch(employeeFilter, (val) => {
  salaryStore.setEmployeeFilter(val)
})

watch(departmentFilter, (val) => {
  salaryStore.setDepartmentFilter(val)
})

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

function getGradeLabel(grade: string): string {
  return PERFORMANCE_GRADE_LABELS[grade as keyof typeof PERFORMANCE_GRADE_LABELS] || '-'
}

function getGradeColor(grade: string): string {
  return PERFORMANCE_GRADE_COLORS[grade as keyof typeof PERFORMANCE_GRADE_COLORS] || '#9CA3AF'
}

function getCardActions(record: SalaryRecord): DropdownOption[] {
  return [
    { label: '查看详情', key: 'view' },
    { label: '编辑', key: 'edit' },
    { type: 'divider', key: 'divider' },
    { label: '删除', key: 'delete', props: { style: 'color: #EF4444;' } }
  ]
}

function handleCardAction(key: string | number, record: SalaryRecord) {
  switch (key) {
    case 'view':
      showDetail(record)
      break
    case 'edit':
      openEditModal(record)
      break
    case 'delete':
      dialog.warning({
        title: '确认删除',
        content: `确定要删除 ${record.employeeName} ${record.month} 的工资条吗？`,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: () => {
          salaryStore.deleteSalaryRecord(record.id)
          message.success('工资条已删除')
        }
      })
      break
  }
}

function showDetail(record: SalaryRecord) {
  selectedRecord.value = record
  showDetailModal.value = true
}

function openCreateModal() {
  isEdit.value = false
  editingId.value = null
  autoMatchedTemplate.value = null
  Object.assign(createFormData, {
    employeeId: '',
    month: selectedMonth.value,
    templateId: '',
    performanceMultiplier: 1.0,
    baseSalary: 0,
    postAllowance: 0,
    performanceBonus: 0,
    otherAllowance: 0,
    socialSecurity: 0,
    housingFund: 0,
    incomeTax: 0,
    otherDeduction: 0,
    grossSalary: 0,
    totalDeduction: 0,
    netSalary: 0
  })
  showCreateModal.value = true
}

function openEditModal(record: SalaryRecord) {
  isEdit.value = true
  editingId.value = record.id
  autoMatchedTemplate.value = null
  const template = record.templateId ? templateStore.getTemplateById(record.templateId) : null
  Object.assign(createFormData, {
    employeeId: record.employeeId,
    month: record.month,
    templateId: record.templateId || '',
    performanceMultiplier: 1.0,
    baseSalary: record.baseSalary,
    postAllowance: record.postAllowance,
    performanceBonus: record.performanceBonus,
    otherAllowance: record.otherAllowance,
    socialSecurity: record.socialSecurity,
    housingFund: record.housingFund,
    incomeTax: record.incomeTax,
    otherDeduction: record.otherDeduction,
    grossSalary: record.grossSalary,
    totalDeduction: record.totalDeduction,
    netSalary: record.netSalary
  })
  if (template) {
    const expectedBonus = Math.round(template.baseSalary * template.performanceCoefficient)
    if (expectedBonus > 0) {
      createFormData.performanceMultiplier = Math.round((record.performanceBonus / expectedBonus) * 10) / 10
    }
  }
  showDetailModal.value = false
  showCreateModal.value = true
}

function handleEmployeeSelect(employeeId: string) {
  const employee = employeeStore.employees.find(e => e.id === employeeId)
  if (employee) {
    const template = templateStore.getTemplateForEmployee(employee)
    if (template) {
      autoMatchedTemplate.value = template
      createFormData.templateId = template.id
      applyTemplate(template)
    }
  }
}

function handleTemplateSelect(templateId: string) {
  const template = templateStore.getTemplateById(templateId)
  if (template) {
    applyTemplate(template)
  }
}

function handleMonthChange(value: string | number | Date | null) {
  if (value === null || value === undefined) return
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    createFormData.month = `${year}-${month}`
  } else if (typeof value === 'number') {
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    createFormData.month = `${year}-${month}`
  } else if (typeof value === 'string') {
    if (/^\d{4}-\d{2}$/.test(value)) {
      createFormData.month = value
    }
  }
}

function applyTemplate(template: SalaryTemplate) {
  const calculated = templateStore.calculateSalary(template, createFormData.performanceMultiplier)
  Object.assign(createFormData, calculated)
}

function recalculateSalary() {
  if (createFormData.templateId) {
    const template = templateStore.getTemplateById(createFormData.templateId)
    if (template) {
      applyTemplate(template)
    }
  }
}

function recalculateNet() {
  createFormData.grossSalary =
    createFormData.baseSalary +
    createFormData.postAllowance +
    createFormData.performanceBonus +
    createFormData.otherAllowance
  createFormData.totalDeduction =
    createFormData.socialSecurity +
    createFormData.housingFund +
    createFormData.incomeTax +
    createFormData.otherDeduction
  createFormData.netSalary = createFormData.grossSalary - createFormData.totalDeduction
}

function normalizeMonth(value: any): string {
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  } else if (typeof value === 'number') {
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  } else if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return value
  }
  return value
}

function handleCreateSave() {
  createFormData.month = normalizeMonth(createFormData.month)
  createFormRef.value?.validate(errors => {
    if (!errors) {
      const employee = employeeStore.employees.find(e => e.id === createFormData.employeeId)
      const template = createFormData.templateId ? templateStore.getTemplateById(createFormData.templateId) : undefined
      if (!employee) return

      const recordData: SalaryRecord = {
        id: editingId.value || `sal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        position: employee.position,
        month: createFormData.month,
        templateId: template?.id,
        templateName: template?.name,
        baseSalary: createFormData.baseSalary,
        postAllowance: createFormData.postAllowance,
        performanceBonus: createFormData.performanceBonus,
        otherAllowance: createFormData.otherAllowance,
        socialSecurity: createFormData.socialSecurity,
        housingFund: createFormData.housingFund,
        incomeTax: createFormData.incomeTax,
        otherDeduction: createFormData.otherDeduction,
        grossSalary: createFormData.grossSalary,
        totalDeduction: createFormData.totalDeduction,
        netSalary: createFormData.netSalary
      }

      if (isEdit.value && editingId.value) {
        salaryStore.updateSalaryRecord(editingId.value, recordData)
        message.success('工资条更新成功')
      } else {
        salaryStore.addSalaryRecord(recordData)
        message.success('工资条创建成功')
      }
      showCreateModal.value = false
    }
  })
}

function handleBatchAction(key: string | number) {
  batchMode.value = key as any
  Object.assign(batchFormData, {
    month: selectedMonth.value,
    templateId: '',
    employeeIds: [],
    departments: [],
    defaultMultiplier: 1.0,
    overwrite: false
  })
  showBatchModal.value = true
}

function handleBatchGenerate() {
  let records: SalaryRecord[] = []
  const multiplier = batchFormData.defaultMultiplier

  if (batchMode.value === 'template' && batchFormData.templateId) {
    const template = templateStore.getTemplateById(batchFormData.templateId)
    const employees = employeeStore.employees.filter(
      e => e.status === 'active' && batchFormData.employeeIds.includes(e.id)
    )
    if (template && employees.length > 0) {
      records = salaryStore.batchGenerateByTemplate(template, batchFormData.month, employees, {})
      records.forEach(r => {
        if (multiplier !== 1.0) {
          const calculated = templateStore.calculateSalary(template, multiplier)
          salaryStore.updateSalaryRecord(r.id, calculated)
        }
      })
    }
  } else if (batchMode.value === 'department' && batchFormData.departments.length > 0) {
    records = salaryStore.batchGenerateByDepartments(batchFormData.month, batchFormData.departments, {})
  } else if (batchMode.value === 'all') {
    records = salaryStore.batchGenerateAllActive(batchFormData.month, {})
  }

  if (records.length > 0) {
    message.success(`成功生成 ${records.length} 条工资条`)
  } else {
    message.warning('没有生成任何工资条，请检查条件')
  }
  showBatchModal.value = false
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1E1B4B;
}

.filter-card {
  margin-bottom: 16px;
}

.summary-card {
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
  color: white;
}

.summary-content {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  font-size: 14px;
  opacity: 0.9;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
}

.summary-value.highlight {
  font-size: 28px;
}

.summary-value.text-red {
  color: #FECACA;
}

.salary-card {
  cursor: pointer;
}

.salary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-detail {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.employee-position {
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
}

.salary-month {
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
}

.template-tag {
  margin-bottom: 12px;
}

.salary-net {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.net-label {
  font-size: 14px;
  color: #6B7280;
}

.net-value {
  font-size: 24px;
  font-weight: 700;
  color: #7C3AED;
}

.salary-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: #6B7280;
}

.detail-value {
  color: #1E1B4B;
  font-weight: 500;
}

.text-green {
  color: #10B981;
}

.text-red {
  color: #EF4444;
}

.modal-content {
  padding: 8px 0;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-name {
  font-size: 20px;
  font-weight: 600;
  color: #1E1B4B;
}

.modal-position {
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
}

.modal-month {
  font-size: 14px;
  color: #6B7280;
  margin-top: 4px;
}

.template-info {
  margin-top: 8px;
}

.modal-net {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.modal-net .net-label {
  font-size: 16px;
}

.modal-net .net-value {
  font-size: 32px;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.total-row {
  font-weight: 600;
  color: #7C3AED;
}

.performance-section {
  margin-top: 8px;
}

.performance-section .section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.performance-card {
  background: linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%);
  border: 1px solid #EDE9FE;
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.performance-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.performance-period {
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.performance-plan {
  font-size: 13px;
  color: #6B7280;
}

.performance-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.performance-score .score-label {
  font-size: 12px;
  color: #6B7280;
}

.performance-score .score-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.salary-suggestion {
  margin-top: 4px;
}

.suggestion-title, .comments-title {
  font-size: 13px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 6px;
}

.suggestion-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.adjustment-amount {
  margin-top: 8px;
  font-size: 14px;
  color: #10B981;
  font-weight: 600;
}

.adjustment-amount span {
  font-size: 18px;
}

.performance-comments {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #DDD6FE;
}

.comments-content {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
  font-style: italic;
}

.no-performance {
  margin-top: 8px;
}

.match-hint {
  margin-top: 8px;
}

.form-summary {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-row.net-row {
  border-top: 1px solid #E5E7EB;
  margin-top: 8px;
  padding-top: 16px;
}

.summary-row .summary-label {
  color: #6B7280;
}

.summary-row .summary-value {
  font-weight: 600;
  color: #1E1B4B;
}

.summary-row .net-value {
  font-size: 20px;
  color: #7C3AED;
}
</style>
