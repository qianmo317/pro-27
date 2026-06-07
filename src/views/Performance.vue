<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">绩效考核</div>
    </div>

    <n-grid :cols="4" :x-gap="16" style="margin-bottom: 20px;">
      <n-grid-item>
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">考核计划</div>
            <div class="stat-value">{{ performanceStore.statistics.totalPlans }}</div>
          </div>
          <div class="stat-icon icon-purple">
            <ClipboardList :size="24" />
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">待评价</div>
            <div class="stat-value text-orange">{{ performanceStore.statistics.pendingCount }}</div>
          </div>
          <div class="stat-icon icon-orange">
            <Clock :size="24" />
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">已完成</div>
            <div class="stat-value text-green">{{ performanceStore.statistics.completedCount }}</div>
          </div>
          <div class="stat-icon icon-green">
            <CheckCircle2 :size="24" />
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">平均得分</div>
            <div class="stat-value text-blue">{{ performanceStore.statistics.avgScore }}</div>
          </div>
          <div class="stat-icon icon-blue">
            <TrendingUp :size="24" />
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-tabs v-model:value="activeTab" type="line" size="large">
      <n-tab-pane name="plans" tab="考核计划">
        <div class="tab-content">
          <n-card class="filter-card">
            <n-space :size="16" wrap>
              <n-input
                v-model:value="searchKeyword"
                placeholder="搜索计划名称..."
                style="width: 240px;"
                clearable
              >
                <template #prefix>
                  <Search :size="16" />
                </template>
              </n-input>
              
              <n-select
                v-model:value="filterPeriod"
                placeholder="选择周期"
                style="width: 160px;"
                clearable
                :options="periodOptions"
              />
              
              <n-select
                v-model:value="filterDepartment"
                placeholder="选择部门"
                style="width: 160px;"
                clearable
                :options="departmentOptions"
              />

              <n-button type="primary" @click="showAddPlanModal = true">
                <template #icon>
                  <Plus :size="16" />
                </template>
                新建考核计划
              </n-button>
            </n-space>
          </n-card>

          <n-card class="table-card">
            <n-data-table
              :columns="planColumns"
              :data="performanceStore.paginatedPlans"
              :pagination="{
                page: performanceStore.planCurrentPage,
                pageSize: performanceStore.planPageSize,
                itemCount: performanceStore.planTotal,
                onUpdatePage: (page) => performanceStore.setPlanCurrentPage(page)
              }"
              :bordered="false"
              size="large"
            />
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="appraisals" tab="考核评价">
        <div class="tab-content">
          <n-card class="filter-card">
            <n-space :size="16" wrap>
              <n-input
                v-model:value="searchKeyword"
                placeholder="搜索员工、部门..."
                style="width: 240px;"
                clearable
              >
                <template #prefix>
                  <Search :size="16" />
                </template>
              </n-input>
              
              <n-select
                v-model:value="filterPeriod"
                placeholder="选择周期"
                style="width: 160px;"
                clearable
                :options="periodOptions"
              />
              
              <n-select
                v-model:value="filterDepartment"
                placeholder="选择部门"
                style="width: 160px;"
                clearable
                :options="departmentOptions"
              />
              
              <n-select
                v-model:value="filterGrade"
                placeholder="选择等级"
                style="width: 140px;"
                clearable
                :options="gradeOptions"
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
              :columns="appraisalColumns"
              :data="performanceStore.paginatedAppraisals"
              :pagination="{
                page: performanceStore.currentPage,
                pageSize: performanceStore.pageSize,
                itemCount: performanceStore.appraisalTotal,
                onUpdatePage: (page) => performanceStore.setCurrentPage(page)
              }"
              :bordered="false"
              size="large"
            />
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="statistics" tab="统计分析">
        <div class="tab-content">
          <n-grid :cols="2" :x-gap="20" :y-gap="20">
            <n-grid-item>
              <n-card title="等级分布" class="chart-card">
                <div ref="gradeChartRef" class="chart-container"></div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card title="部门平均得分" class="chart-card">
                <div ref="deptChartRef" class="chart-container"></div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showAddPlanModal" preset="card" title="新建考核计划" style="width: 720px;">
      <n-form
        ref="planFormRef"
        :model="planFormData"
        :rules="planFormRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="计划名称" path="name">
          <n-input v-model:value="planFormData.name" placeholder="请输入计划名称" />
        </n-form-item>
        
        <n-form-item label="考核周期" path="cycleType">
          <n-radio-group v-model:value="planFormData.cycleType">
            <n-radio value="quarterly">季度考核</n-radio>
            <n-radio value="monthly">月度考核</n-radio>
          </n-radio-group>
        </n-form-item>
        
        <n-form-item label="周期标识" path="period">
          <n-input v-model:value="planFormData.period" placeholder="如：2024-Q1 或 2024-01" />
        </n-form-item>
        
        <n-form-item label="开始日期" path="startDate">
          <n-date-picker v-model:value="planFormData.startDate" type="date" style="width: 100%;" />
        </n-form-item>
        
        <n-form-item label="结束日期" path="endDate">
          <n-date-picker v-model:value="planFormData.endDate" type="date" style="width: 100%;" />
        </n-form-item>
        
        <n-form-item label="适用部门" path="department">
          <n-select 
            v-model:value="planFormData.department" 
            placeholder="请选择适用部门"
            :options="allDepartmentOptions"
          />
        </n-form-item>

        <n-form-item label="KPI 指标">
          <div class="kpi-section">
            <div class="kpi-header">
              <span class="kpi-title">KPI 指标设置</span>
              <n-button size="small" type="primary" @click="addKpi">
                <template #icon><Plus :size="14" /></template>
                添加指标
              </n-button>
            </div>
            
            <div class="kpi-list">
              <div v-for="(kpi, index) in planFormData.kpiIndicators" :key="index" class="kpi-item">
                <n-input 
                  v-model:value="kpi.name" 
                  placeholder="指标名称" 
                  style="width: 180px;"
                />
                <n-input 
                  v-model:value="kpi.description" 
                  placeholder="指标描述" 
                  style="flex: 1;"
                />
                <n-input-number
                  v-model:value="kpi.weight"
                  placeholder="权重%"
                  :min="1"
                  :max="100"
                  style="width: 100px;"
                />
                <span class="weight-label">%</span>
                <n-button quaternary circle size="small" @click="removeKpi(index)">
                  <Trash2 :size="16" />
                </n-button>
              </div>
            </div>
            
            <div class="kpi-footer">
              <span class="weight-total" :class="{ 'text-red': totalWeight !== 100 }">
                权重合计: {{ totalWeight }}%
              </span>
              <span v-if="totalWeight !== 100" class="text-red">
                (权重合计必须等于 100%)
              </span>
            </div>
          </div>
        </n-form-item>
      </n-form>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddPlanModal = false">取消</n-button>
          <n-button type="primary" @click="handleAddPlan">确认创建</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showScoreModal" preset="card" title="绩效考核评价" style="width: 720px;">
      <div v-if="currentAppraisal && currentPlan" class="score-modal">
        <div class="score-header">
          <div class="employee-info">
            <n-avatar round :size="56">
              {{ currentAppraisal.employeeName.charAt(0) }}
            </n-avatar>
            <div class="employee-detail">
              <div class="employee-name">{{ currentAppraisal.employeeName }}</div>
              <div class="employee-meta">{{ currentAppraisal.department }} · {{ currentPlan.name }}</div>
            </div>
          </div>
          <div class="score-summary">
            <div class="score-label">总分</div>
            <div class="score-value" :style="{ color: getGradeColor(calculatedGrade) }">
              {{ calculatedTotalScore }}
            </div>
            <n-tag :type="getGradeTagType(calculatedGrade)" size="small">
              {{ getGradeLabel(calculatedGrade) }}
            </n-tag>
          </div>
        </div>

        <n-divider />

        <div class="score-section">
          <div class="section-title">KPI 评分</div>
          <div class="score-table">
            <div class="score-table-header">
              <span class="col-name">指标名称</span>
              <span class="col-desc">描述</span>
              <span class="col-weight">权重</span>
              <span class="col-score">得分 (0-100)</span>
              <span class="col-weighted">加权得分</span>
            </div>
            <div v-for="(kpi, index) in currentPlan.kpiIndicators" :key="kpi.id" class="score-table-row">
              <span class="col-name">{{ kpi.name }}</span>
              <span class="col-desc">{{ kpi.description }}</span>
              <span class="col-weight">{{ kpi.weight }}%</span>
              <span class="col-score">
                <n-input-number
                  v-model:value="scoreFormData.scores[index].score"
                  :min="0"
                  :max="100"
                  :step="1"
                  style="width: 100px;"
                  @update:value="updateWeightedScore(index)"
                />
              </span>
              <span class="col-weighted">{{ getWeightedScore(index).toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <n-divider />

        <div class="comments-section">
          <div class="section-title">评语</div>
          <n-input
            v-model:value="scoreFormData.comments"
            type="textarea"
            :rows="4"
            placeholder="请输入评价评语..."
          />
        </div>

        <n-divider />

        <div class="suggestion-section">
          <div class="section-title">调薪建议</div>
          <n-alert :type="getGradeAlertType(calculatedGrade)" :bordered="false">
            {{ getSalarySuggestion(calculatedGrade) }}
          </n-alert>
        </div>
      </div>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showScoreModal = false">取消</n-button>
          <n-button v-if="currentAppraisal?.status === 'pending'" type="primary" @click="handleSubmitScore">
            提交评价
          </n-button>
          <n-button v-if="currentAppraisal?.status === 'submitted'" type="primary" @click="handleApprove">
            审核通过
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showViewModal" preset="card" title="考核详情" style="width: 720px;">
      <div v-if="currentAppraisal && currentPlan" class="view-modal">
        <div class="score-header">
          <div class="employee-info">
            <n-avatar round :size="56">
              {{ currentAppraisal.employeeName.charAt(0) }}
            </n-avatar>
            <div class="employee-detail">
              <div class="employee-name">{{ currentAppraisal.employeeName }}</div>
              <div class="employee-meta">{{ currentAppraisal.department }} · {{ currentAppraisal.period }}</div>
              <div class="employee-meta">直属上级: {{ currentAppraisal.supervisorName }}</div>
            </div>
          </div>
          <div class="score-summary">
            <div class="score-label">总分</div>
            <div class="score-value" :style="{ color: getGradeColor(currentAppraisal.grade) }">
              {{ currentAppraisal.totalScore }}
            </div>
            <n-tag :type="getGradeTagType(currentAppraisal.grade)" size="small">
              {{ getGradeLabel(currentAppraisal.grade) }}
            </n-tag>
          </div>
        </div>

        <n-divider />

        <div class="score-section">
          <div class="section-title">KPI 评分明细</div>
          <n-descriptions :column="1" bordered>
            <n-descriptions-item 
              v-for="score in currentAppraisal.scores" 
              :key="score.kpiId"
              :label="`${score.kpiName} (权重 ${score.weight}%)`"
            >
              <span>得分: {{ score.score }}</span>
              <span style="margin-left: 20px; color: #7C3AED; font-weight: 600;">
                加权: {{ score.weightedScore.toFixed(1) }}
              </span>
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <n-divider />

        <div class="comments-section">
          <div class="section-title">评语</div>
          <n-card size="small" :bordered="false" style="background: #F9FAFB;">
            {{ currentAppraisal.comments || '暂无评语' }}
          </n-card>
        </div>

        <n-divider />

        <div class="suggestion-section">
          <div class="section-title">调薪建议</div>
          <n-alert :type="getGradeAlertType(currentAppraisal.grade)" :bordered="false">
            <div class="suggestion-content">
              <span>{{ currentAppraisal.salaryAdjustmentSuggestion || '暂无建议' }}</span>
              <span v-if="currentAppraisal.salaryAdjustmentAmount > 0" class="adjustment-amount">
                建议调薪金额: ¥{{ currentAppraisal.salaryAdjustmentAmount.toLocaleString() }}
              </span>
            </div>
          </n-alert>
        </div>
      </div>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showViewModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h, nextTick } from 'vue'
import { 
  Plus, Search, Trash2, Clock, CheckCircle2, TrendingUp, 
  ClipboardList, Eye, Edit, Trash2 as TrashIcon 
} from 'lucide-vue-next'
import * as echarts from 'echarts'
import { usePerformanceStore } from '@/stores/performance'
import { useUserStore } from '@/stores/user'
import { useEmployeeStore } from '@/stores/employee'
import { useMessage, useDialog, NTag, NSpace, NButton } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui'
import type { 
  PerformancePlan, PerformanceAppraisal, KpiIndicator,
  PerformanceResultGrade 
} from '@/types'
import { 
  PERFORMANCE_GRADE_LABELS, PERFORMANCE_GRADE_COLORS,
  PERFORMANCE_CYCLE_LABELS, PERFORMANCE_GRADE_SALARY_SUGGESTION
} from '@/types'

const performanceStore = usePerformanceStore()
const userStore = useUserStore()
const employeeStore = useEmployeeStore()
const message = useMessage()
const dialog = useDialog()

const activeTab = ref('plans')
const searchKeyword = ref('')
const filterPeriod = ref('')
const filterDepartment = ref('')
const filterGrade = ref('')
const filterStatus = ref('')

const showAddPlanModal = ref(false)
const showScoreModal = ref(false)
const showViewModal = ref(false)
const currentAppraisal = ref<PerformanceAppraisal | null>(null)
const currentPlan = ref<PerformancePlan | null>(null)

const planFormRef = ref<FormInst | null>(null)
const gradeChartRef = ref<HTMLElement | null>(null)
const deptChartRef = ref<HTMLElement | null>(null)

const planFormData = ref<Partial<PerformancePlan>>({
  name: '',
  cycleType: 'quarterly',
  period: '',
  startDate: null,
  endDate: null,
  department: '全公司',
  status: 'draft',
  kpiIndicators: [
    { id: 'kpi-1', name: '工作业绩', description: '完成工作目标和任务的质量与数量', weight: 40, maxScore: 100 },
    { id: 'kpi-2', name: '工作能力', description: '专业技能、解决问题能力', weight: 25, maxScore: 100 },
    { id: 'kpi-3', name: '工作态度', description: '责任心、积极性和团队协作', weight: 20, maxScore: 100 },
    { id: 'kpi-4', name: '学习成长', description: '学习新知识、技能提升', weight: 15, maxScore: 100 }
  ]
})

const scoreFormData = ref({
  scores: [] as { kpiId: string; score: number }[],
  comments: ''
})

const planFormRules: FormRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  cycleType: [{ required: true, message: '请选择考核周期', trigger: 'change' }],
  period: [{ required: true, message: '请输入周期标识', trigger: 'blur' }],
  startDate: [{ required: true, type: 'number', message: '请选择开始日期', trigger: ['change', 'blur'] }],
  endDate: [{ required: true, type: 'number', message: '请选择结束日期', trigger: ['change', 'blur'] }],
  department: [{ required: true, message: '请选择适用部门', trigger: 'change' }]
}

const totalWeight = computed(() => {
  return planFormData.value.kpiIndicators?.reduce((sum, kpi) => sum + (kpi.weight || 0), 0) || 0
})

const periodOptions = computed(() => 
  performanceStore.periods.map(p => ({ label: p, value: p }))
)

const departmentOptions = computed(() => 
  employeeStore.departments.map(d => ({ label: d, value: d }))
)

const allDepartmentOptions = computed(() => [
  { label: '全公司', value: '全公司' },
  ...departmentOptions.value
])

const gradeOptions = [
  { label: '优秀', value: 'excellent' },
  { label: '良好', value: 'good' },
  { label: '合格', value: 'qualified' },
  { label: '待改进', value: 'needs_improvement' }
]

const statusOptions = [
  { label: '待评价', value: 'pending' },
  { label: '已提交', value: 'submitted' },
  { label: '已通过', value: 'approved' }
]

const calculatedTotalScore = computed(() => {
  if (!currentPlan.value) return 0
  const scores = scoreFormData.value.scores
  const kpis = currentPlan.value.kpiIndicators
  let total = 0
  scores.forEach((s, i) => {
    const kpi = kpis[i]
    if (kpi) {
      total += s.score * (kpi.weight / 100)
    }
  })
  return Math.round(total * 10) / 10
})

const calculatedGrade = computed((): PerformanceResultGrade => {
  const score = calculatedTotalScore.value
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'qualified'
  return 'needs_improvement'
})

const planColumns: DataTableColumns<PerformancePlan> = [
  {
    title: '计划名称',
    key: 'name',
    width: 200,
    render: (row) => {
      return h('div', { class: 'plan-name' }, row.name)
    }
  },
  {
    title: '周期类型',
    key: 'cycleType',
    width: 100,
    render: (row) => PERFORMANCE_CYCLE_LABELS[row.cycleType]
  },
  {
    title: '周期',
    key: 'period',
    width: 120
  },
  {
    title: '时间范围',
    key: 'dateRange',
    width: 220,
    render: (row) => `${row.startDate} 至 ${row.endDate}`
  },
  {
    title: '适用部门',
    key: 'department',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const typeMap: Record<string, any> = {
        draft: 'default',
        active: 'info',
        completed: 'success'
      }
      const labelMap: Record<string, string> = {
        draft: '草稿',
        active: '进行中',
        completed: '已结束'
      }
      return h(NTag as any, { type: typeMap[row.status], size: 'small' }, { 
        default: () => labelMap[row.status] 
      }) as any
    }
  },
  {
    title: 'KPI 数量',
    key: 'kpiCount',
    width: 100,
    render: (row) => `${row.kpiIndicators.length} 项`
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render: (row) => {
      return h(NSpace as any, { size: 'small' }, {
        default: () => [
          h(NButton as any, { 
            size: 'small', quaternary: true, onClick: () => handleActivatePlan(row) 
          }, { default: () => row.status === 'draft' ? '发布' : '查看' }),
          h(NButton as any, { 
            size: 'small', quaternary: true, onClick: () => handleGenerateAppraisals(row) 
          }, { default: () => '生成评价' }),
          h(NButton as any, { 
            size: 'small', quaternary: true, onClick: () => handleDeletePlan(row.id) 
          }, { 
            default: () => h(TrashIcon as any, { size: 14 }),
            style: 'color: #EF4444;'
          })
        ]
      }) as any
    }
  }
]

const appraisalColumns: DataTableColumns<PerformanceAppraisal> = [
  {
    title: '员工信息',
    key: 'employeeName',
    width: 180,
    render: (row) => {
      return h('div', { class: 'employee-info-cell' }, [
        h('span', { class: 'employee-name' }, row.employeeName),
        h('span', { class: 'employee-dept' }, row.department)
      ])
    }
  },
  {
    title: '考核周期',
    key: 'period',
    width: 120
  },
  {
    title: '考核计划',
    key: 'planName',
    width: 180
  },
  {
    title: '总分',
    key: 'totalScore',
    width: 100,
    render: (row) => {
      return h('span', { 
        style: { 
          color: row.status === 'pending' ? '#9CA3AF' : PERFORMANCE_GRADE_COLORS[row.grade],
          fontWeight: 600 
        } 
      }, row.status === 'pending' ? '-' : row.totalScore)
    }
  },
  {
    title: '等级',
    key: 'grade',
    width: 100,
    render: (row) => {
      if (row.status === 'pending') {
        return h(NTag as any, { type: 'default', size: 'small' }, { default: () => '待评价' })
      }
      return h(NTag as any, { 
        type: getGradeTagType(row.grade), 
        size: 'small' 
      }, { default: () => getGradeLabel(row.grade) }) as any
    }
  },
  {
    title: '直属上级',
    key: 'supervisorName',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const typeMap: Record<string, any> = {
        pending: 'warning',
        submitted: 'info',
        approved: 'success'
      }
      const labelMap: Record<string, string> = {
        pending: '待评价',
        submitted: '已提交',
        approved: '已通过'
      }
      return h(NTag as any, { type: typeMap[row.status], size: 'small' }, { 
        default: () => labelMap[row.status] 
      }) as any
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render: (row) => {
      return h(NSpace as any, { size: 'small' }, {
        default: () => {
          const actions = []
          if (row.status === 'pending' || row.status === 'submitted') {
            actions.push(
              h(NButton as any, { 
                size: 'small', type: 'primary', onClick: () => handleScore(row) 
              }, { default: () => row.status === 'pending' ? '评价' : '审核' })
            )
          }
          if (row.status === 'approved') {
            actions.push(
              h(NButton as any, { 
                size: 'small', quaternary: true, onClick: () => handleView(row) 
              }, { 
                default: () => h(Eye as any, { size: 14 })
              })
            )
          }
          return actions
        }
      }) as any
    }
  }
]

watch([searchKeyword, filterPeriod, filterDepartment, filterGrade, filterStatus], () => {
  performanceStore.setSearchKeyword(searchKeyword.value)
  performanceStore.setFilterPeriod(filterPeriod.value)
  performanceStore.setFilterDepartment(filterDepartment.value)
  performanceStore.setFilterGrade(filterGrade.value)
  performanceStore.setFilterStatus(filterStatus.value)
})

function formatDate(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getGradeLabel(grade: PerformanceResultGrade): string {
  return PERFORMANCE_GRADE_LABELS[grade]
}

function getGradeColor(grade: PerformanceResultGrade): string {
  return PERFORMANCE_GRADE_COLORS[grade]
}

function getGradeTagType(grade: PerformanceResultGrade): any {
  const typeMap: Record<PerformanceResultGrade, any> = {
    excellent: 'success',
    good: 'info',
    qualified: 'warning',
    needs_improvement: 'error'
  }
  return typeMap[grade]
}

function getGradeAlertType(grade: PerformanceResultGrade): any {
  return getGradeTagType(grade)
}

function getSalarySuggestion(grade: PerformanceResultGrade): string {
  return PERFORMANCE_GRADE_SALARY_SUGGESTION[grade]
}

function addKpi() {
  const maxId = Math.max(
    ...planFormData.value.kpiIndicators!.map(k => Number(k.id.replace('kpi-', ''))),
    0
  )
  planFormData.value.kpiIndicators!.push({
    id: `kpi-${maxId + 1}`,
    name: '',
    description: '',
    weight: 10,
    maxScore: 100
  })
}

function removeKpi(index: number) {
  planFormData.value.kpiIndicators!.splice(index, 1)
}

function getWeightedScore(index: number): number {
  const score = scoreFormData.value.scores[index]?.score || 0
  const weight = currentPlan.value?.kpiIndicators[index]?.weight || 0
  return score * (weight / 100)
}

function updateWeightedScore(_index: number) {
}

function handleAddPlan() {
  planFormRef.value?.validate((errors) => {
    if (!errors) {
      if (totalWeight.value !== 100) {
        message.error('KPI 权重合计必须等于 100%')
        return
      }
      
      const startDate = typeof planFormData.value.startDate === 'number'
        ? formatDate(planFormData.value.startDate as number)
        : planFormData.value.startDate || ''
      const endDate = typeof planFormData.value.endDate === 'number'
        ? formatDate(planFormData.value.endDate as number)
        : planFormData.value.endDate || ''
      
      const kpiIndicators: KpiIndicator[] = planFormData.value.kpiIndicators!.map((kpi, i) => ({
        ...kpi,
        id: `kpi-${Date.now()}-${i}`
      }))
      
      performanceStore.addPlan({
        name: planFormData.value.name!,
        cycleType: planFormData.value.cycleType!,
        period: planFormData.value.period!,
        startDate,
        endDate,
        department: planFormData.value.department!,
        kpiIndicators,
        status: 'draft'
      }, userStore.currentUser?.name || '系统')
      
      message.success('创建成功')
      showAddPlanModal.value = false
      resetPlanForm()
    }
  })
}

function resetPlanForm() {
  planFormData.value = {
    name: '',
    cycleType: 'quarterly',
    period: '',
    startDate: null,
    endDate: null,
    department: '全公司',
    status: 'draft',
    kpiIndicators: [
      { id: 'kpi-1', name: '工作业绩', description: '完成工作目标和任务的质量与数量', weight: 40, maxScore: 100 },
      { id: 'kpi-2', name: '工作能力', description: '专业技能、解决问题能力', weight: 25, maxScore: 100 },
      { id: 'kpi-3', name: '工作态度', description: '责任心、积极性和团队协作', weight: 20, maxScore: 100 },
      { id: 'kpi-4', name: '学习成长', description: '学习新知识、技能提升', weight: 15, maxScore: 100 }
    ]
  }
}

function handleActivatePlan(plan: PerformancePlan) {
  if (plan.status === 'draft') {
    performanceStore.updatePlan(plan.id, { status: 'active' })
    message.success('计划已发布')
  }
}

function handleGenerateAppraisals(plan: PerformancePlan) {
  const employees = employeeStore.employees
    .filter(e => e.status === 'active')
    .filter(e => plan.department === '全公司' || e.department === plan.department)
  
  const employeesWithSupervisor = employees.map(emp => {
    const deptManager = employeeStore.employees.find(e => 
      e.department === emp.department && e.position.includes('经理')
    ) || employeeStore.employees[0]
    
    return {
      id: emp.id,
      name: emp.name,
      department: emp.department,
      supervisorId: deptManager.id,
      supervisorName: deptManager.name
    }
  })
  
  performanceStore.generateAppraisalsForPlan(plan.id, employeesWithSupervisor)
  message.success(`已为 ${employeesWithSupervisor.length} 名员工生成考核评价`)
}

function handleDeletePlan(id: string) {
  const d = dialog.warning({
    title: '确认删除',
    content: '确定要删除该考核计划吗？相关的考核评价也会被删除，此操作不可恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      performanceStore.deletePlan(id)
      message.success('删除成功')
      d.destroy()
    }
  })
}

function handleScore(appraisal: PerformanceAppraisal) {
  currentAppraisal.value = appraisal
  currentPlan.value = performanceStore.getPlanById(appraisal.planId) || null
  
  if (currentPlan.value) {
    scoreFormData.value.scores = currentPlan.value.kpiIndicators.map((kpi, i) => ({
      kpiId: kpi.id,
      score: appraisal.scores[i]?.score || 0
    }))
    scoreFormData.value.comments = appraisal.comments
  }
  
  showScoreModal.value = true
}

function handleView(appraisal: PerformanceAppraisal) {
  currentAppraisal.value = appraisal
  currentPlan.value = performanceStore.getPlanById(appraisal.planId) || null
  showViewModal.value = true
}

function handleSubmitScore() {
  if (!currentAppraisal.value) return
  
  performanceStore.submitAppraisal(
    currentAppraisal.value.id,
    scoreFormData.value.scores,
    scoreFormData.value.comments
  )
  
  message.success('评价已提交')
  showScoreModal.value = false
}

function handleApprove() {
  if (!currentAppraisal.value) return
  
  performanceStore.approveAppraisal(currentAppraisal.value.id)
  message.success('审核通过')
  showScoreModal.value = false
}

function initCharts() {
  nextTick(() => {
    if (gradeChartRef.value) {
      const gradeChart = echarts.init(gradeChartRef.value)
      const grades = performanceStore.statistics.gradeDistribution
      const gradeData = [
        { name: '优秀', value: grades.excellent, itemStyle: { color: '#10B981' } },
        { name: '良好', value: grades.good, itemStyle: { color: '#3B82F6' } },
        { name: '合格', value: grades.qualified, itemStyle: { color: '#F59E0B' } },
        { name: '待改进', value: grades.needs_improvement, itemStyle: { color: '#EF4444' } }
      ]
      
      gradeChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {c}人 ({d}%)' },
          data: gradeData
        }]
      })
    }
    
    if (deptChartRef.value) {
      const deptChart = echarts.init(deptChartRef.value)
      const departments = employeeStore.departments
      const deptScores = departments.map(dept => {
        const deptAppraisals = performanceStore.appraisals.filter(
          a => a.department === dept && a.status === 'approved'
        )
        const avgScore = deptAppraisals.length > 0
          ? Math.round(deptAppraisals.reduce((sum, a) => sum + a.totalScore, 0) / deptAppraisals.length)
          : 0
        return { name: dept, score: avgScore }
      })
      
      deptChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: deptScores.map(d => d.name) },
        yAxis: { type: 'value', min: 0, max: 100 },
        series: [{
          type: 'bar',
          data: deptScores.map(d => ({
            value: d.score,
            itemStyle: {
              color: d.score >= 85 ? '#10B981' : d.score >= 70 ? '#3B82F6' : d.score >= 60 ? '#F59E0B' : '#EF4444'
            }
          })),
          label: { show: true, position: 'top' },
          barWidth: '50%'
        }]
      })
    }
  })
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  background: #fff;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1E1B4B;
}

.text-orange {
  color: #F59E0B !important;
}

.text-green {
  color: #10B981 !important;
}

.text-blue {
  color: #3B82F6 !important;
}

.text-red {
  color: #EF4444 !important;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.icon-purple {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.icon-orange {
  background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
}

.icon-green {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
}

.icon-blue {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
}

.tab-content {
  padding-top: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.plan-name {
  font-weight: 600;
  color: #1E1B4B;
}

.employee-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-name {
  font-weight: 600;
  color: #1E1B4B;
}

.employee-dept {
  font-size: 12px;
  color: #6B7280;
}

.kpi-section {
  background: #F9FAFB;
  padding: 16px;
  border-radius: 8px;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.kpi-title {
  font-weight: 600;
  color: #1E1B4B;
}

.kpi-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
}

.weight-label {
  color: #6B7280;
  font-size: 14px;
}

.kpi-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
}

.weight-total {
  font-weight: 600;
  color: #1E1B4B;
}

.score-modal, .view-modal {
  padding: 8px 0;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.employee-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-name {
  font-size: 20px;
  font-weight: 700;
  color: #1E1B4B;
}

.employee-meta {
  font-size: 13px;
  color: #6B7280;
}

.score-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-label {
  font-size: 13px;
  color: #6B7280;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.score-table {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.score-table-header {
  display: grid;
  grid-template-columns: 140px 1fr 80px 120px 100px;
  background: #F9FAFB;
  padding: 12px 16px;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.score-table-row {
  display: grid;
  grid-template-columns: 140px 1fr 80px 120px 100px;
  padding: 12px 16px;
  border-top: 1px solid #E5E7EB;
  align-items: center;
  font-size: 14px;
}

.col-name {
  font-weight: 500;
  color: #1E1B4B;
}

.col-desc {
  color: #6B7280;
  font-size: 13px;
}

.col-weight {
  color: #7C3AED;
  font-weight: 500;
}

.col-weighted {
  color: #7C3AED;
  font-weight: 600;
}

.suggestion-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.adjustment-amount {
  font-weight: 600;
  color: #7C3AED;
}

:deep(.n-card) {
  position: relative;
}
</style>
