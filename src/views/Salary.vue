<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">薪资工资条</div>
      <n-space>
        <n-select
        v-model:value="selectedMonth"
        placeholder="选择月份"
        style="width: 160px;"
        :options="monthOptions"
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
    </div>
    
    <n-card class="summary-card">
      <div class="summary-content">
        <div class="summary-item">
          <span class="summary-label">发放人数</span>
          <span class="summary-value">{{ salaryStore.filteredRecords.length }} 人</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">薪资总额</span>
          <span class="summary-value highlight">¥ {{ formatNumber(salaryStore.totalSalary) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">平均薪资</span>
          <span class="summary-value">¥ {{ formatNumber(averageSalary) }}</span>
        </div>
      </div>
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
                <div class="salary-month">{{ selectedMonth }} 工资条</div>
              </div>
            </div>
          </div>
          
          <div class="salary-net">
            <span class="net-label">实发工资</span>
            <span class="net-value">¥ {{ formatNumber(record.netSalary) }}</span>
          </div>
          
          <n-divider style="margin: 16px 0;" />
          
          <div class="salary-detail">
            <div class="detail-row">
              <span class="detail-label">基本工资</span>
              <span class="detail-value">¥ {{ formatNumber(record.baseSalary) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">奖金</span>
              <span class="detail-value text-green">+ ¥ {{ formatNumber(record.bonus) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">津贴</span>
              <span class="detail-value text-green">+ ¥ {{ formatNumber(record.allowance) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">扣款</span>
              <span class="detail-value text-red">- ¥ {{ formatNumber(record.deduction) }}</span>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
    
    <n-modal v-model:show="showDetailModal" preset="card" title="工资条详情" style="width: 480px;">
      <div v-if="selectedRecord" class="modal-content">
        <div class="modal-header">
          <n-avatar round :size="64">
            {{ selectedRecord.employeeName.charAt(0) }}
          </n-avatar>
          <div>
            <div class="modal-name">{{ selectedRecord.employeeName }}</div>
            <div class="modal-month">{{ selectedRecord.month }} 工资条</div>
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
              <span>奖金</span>
              <span class="text-green">+ ¥ {{ formatNumber(selectedRecord.bonus) }}</span>
            </div>
            <div class="detail-row">
              <span>津贴</span>
              <span class="text-green">+ ¥ {{ formatNumber(selectedRecord.allowance) }}</span>
            </div>
            <n-divider style="margin: 12px 0;" />
            <div class="detail-row total-row">
              <span>应发合计</span>
              <span>¥ {{ formatNumber(selectedRecord.baseSalary + selectedRecord.bonus + selectedRecord.allowance) }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <div class="section-title">扣款</div>
            <div class="detail-row">
              <span>社保/公积金/个税</span>
              <span class="text-red">- ¥ {{ formatNumber(selectedRecord.deduction) }}</span>
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
          <n-button type="primary">导出PDF</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { useSalaryStore } from '@/stores/salary'
import { usePerformanceStore } from '@/stores/performance'
import type { SalaryRecord, PerformanceAppraisal } from '@/types'
import { PERFORMANCE_GRADE_LABELS, PERFORMANCE_GRADE_COLORS } from '@/types'

const salaryStore = useSalaryStore()
const performanceStore = usePerformanceStore()

const selectedMonth = ref('2024-01')
const employeeFilter = ref('')
const showDetailModal = ref(false)
const selectedRecord = ref<SalaryRecord | null>(null)

const latestAppraisal = computed((): PerformanceAppraisal | null => {
  if (!selectedRecord.value) return null
  const appraisals = performanceStore.getAppraisalsByEmployeeId(selectedRecord.value.employeeId)
  return appraisals.length > 0 ? appraisals[appraisals.length - 1] : null
})

function getGradeLabel(grade: string): string {
  return PERFORMANCE_GRADE_LABELS[grade as keyof typeof PERFORMANCE_GRADE_LABELS] || '-'
}

function getGradeColor(grade: string): string {
  return PERFORMANCE_GRADE_COLORS[grade as keyof typeof PERFORMANCE_GRADE_COLORS] || '#9CA3AF'
}

const monthOptions = computed(() => salaryStore.months.map(m => ({ label: m, value: m })))

const averageSalary = computed(() => {
  const records = salaryStore.filteredRecords
  return records.length > 0 ? Math.round(salaryStore.totalSalary / records.length) : 0
})

watch(selectedMonth, (val) => {
  salaryStore.setSelectedMonth(val)
})

watch(employeeFilter, (val) => {
  salaryStore.setEmployeeFilter(val)
})

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

function showDetail(record: SalaryRecord) {
  selectedRecord.value = record
  showDetailModal.value = true
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-card {
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
  color: white;
}

.summary-content {
  display: flex;
  gap: 80px;
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
  font-size: 28px;
  font-weight: 700;
}

.summary-value.highlight {
  font-size: 32px;
}

.salary-card {
  cursor: pointer;
}

.salary-header {
  margin-bottom: 16px;
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

.salary-month {
  font-size: 13px;
  color: #6B7280;
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

.modal-month {
  font-size: 14px;
  color: #6B7280;
  margin-top: 4px;
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
</style>
