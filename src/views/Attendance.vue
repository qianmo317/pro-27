<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">考勤统计</div>
      <div class="header-actions">
        <n-select
          v-model:value="selectedMonth"
          placeholder="选择月份"
          style="width: 160px;"
          :options="monthOptions"
        />
        <n-select
          v-model:value="abnormalFilter"
          placeholder="状态筛选"
          style="width: 140px;"
          :options="ABNORMAL_FILTER_OPTIONS"
        />
      </div>
    </div>
    
    <n-grid :cols="7" :x-gap="16" :y-gap="16" class="stat-grid">
      <n-grid-item>
        <n-card class="stat-card card-gradient">
          <div class="stat-content">
            <div class="stat-icon">
              <CalendarCheck :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.attendanceRate }}%</div>
              <div class="stat-label">出勤率</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <CheckCircle :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.normal }}</div>
              <div class="stat-label">正常打卡</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <CalendarOff :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.leave }}</div>
              <div class="stat-label">请假</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <Clock :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.late + statistics.early }}</div>
              <div class="stat-label">迟到/早退</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #EF4444 0%, #F87171 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <XCircle :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.absent }}</div>
              <div class="stat-label">缺勤</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #F97316 0%, #FB923C 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <ClockAlert :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pending }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <CheckCheck :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.corrected }}</div>
              <div class="stat-label">已修正</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
    
    <n-card title="考勤趋势图" class="chart-card" style="margin-top: 20px;">
      <div ref="chartRef" class="chart-container"></div>
    </n-card>
    
    <n-card title="考勤明细" class="table-card" style="margin-top: 20px;">
      <n-data-table
        :columns="columns"
        :data="attendanceStore.paginatedRecords"
        :bordered="false"
        remote
        size="large"
        :pagination="attendanceStore.pagination"
        :row-props="getRowProps"
      />
    </n-card>

    <n-modal v-model:show="showCorrectionModal" preset="card" title="考勤异常处理" style="width: 560px;">
      <n-form
        ref="correctionFormRef"
        :model="correctionForm"
        :rules="correctionRules"
        label-placement="top"
        label-width="auto"
      >
        <n-form-item label="申请类型" path="type">
          <n-radio-group v-model:value="correctionForm.type">
            <n-radio value="makeup">补卡</n-radio>
            <n-radio value="explain">情况说明</n-radio>
          </n-radio-group>
        </n-form-item>
        
        <template v-if="correctionForm.type === 'makeup'">
          <n-form-item label="补卡签到时间" path="makeupCheckIn">
            <n-time-picker v-model:value="correctionForm.makeupCheckIn" format="HH:mm" />
          </n-form-item>
          <n-form-item label="补卡签退时间" path="makeupCheckOut">
            <n-time-picker v-model:value="correctionForm.makeupCheckOut" format="HH:mm" />
          </n-form-item>
        </template>
        
        <n-form-item label="申请说明" path="reason">
          <n-input
            v-model:value="correctionForm.reason"
            type="textarea"
            placeholder="请详细说明异常原因..."
            :rows="4"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCorrectionModal = false">取消</n-button>
          <n-button type="primary" @click="submitCorrection">提交申请</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showApprovalModal" preset="card" title="审批考勤修正申请" style="width: 560px;">
      <div v-if="currentRecord" class="approval-content">
        <n-descriptions :column="2" bordered size="small">
          <n-descriptions-item label="员工姓名">{{ currentRecord.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="考勤日期">{{ currentRecord.date }}</n-descriptions-item>
          <n-descriptions-item label="原状态">
            <n-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="申请类型">
            {{ CORRECTION_TYPE_LABELS[currentRecord.correction!.type] }}
          </n-descriptions-item>
          <n-descriptions-item label="申请时间" :span="2">
            {{ currentRecord.correction!.applicationTime }}
          </n-descriptions-item>
          <n-descriptions-item label="申请说明" :span="2">
            {{ currentRecord.correction!.reason }}
          </n-descriptions-item>
          <template v-if="currentRecord.correction!.type === 'makeup'">
            <n-descriptions-item label="补卡签到">
              {{ currentRecord.correction!.makeupCheckIn }}
            </n-descriptions-item>
            <n-descriptions-item label="补卡签退">
              {{ currentRecord.correction!.makeupCheckOut }}
            </n-descriptions-item>
          </template>
        </n-descriptions>
        
        <n-form style="margin-top: 20px;" label-placement="top">
          <n-form-item label="审批意见">
            <n-input
              v-model:value="approvalComment"
              type="textarea"
              placeholder="请输入审批意见..."
              :rows="3"
            />
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showApprovalModal = false">取消</n-button>
          <n-button type="error" @click="handleReject">驳回</n-button>
          <n-button type="primary" @click="handleApprove">通过</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import * as echarts from 'echarts'
import { CalendarCheck, CheckCircle, Clock, XCircle, CalendarOff, ClockAlert, CheckCheck } from 'lucide-vue-next'
import { useAttendanceStore } from '@/stores/attendance'
import { NTag, useMessage, type FormInst, type FormRules, type DataTableColumns } from 'naive-ui'
import type { AttendanceRecord, AttendanceAbnormalFilter, AttendanceCorrectionType } from '@/types'
import {
  ABNORMAL_FILTER_OPTIONS,
  CORRECTION_TYPE_LABELS,
  CORRECTION_STATUS_LABELS,
  CORRECTION_STATUS_COLORS,
  LEAVE_TYPE_LABELS
} from '@/types'

const attendanceStore = useAttendanceStore()
const message = useMessage()

const selectedMonth = ref('2024-01')
const abnormalFilter = ref<AttendanceAbnormalFilter>('all')
const chartRef = ref<HTMLDivElement | null>(null)
const showCorrectionModal = ref(false)
const showApprovalModal = ref(false)
const currentRecord = ref<AttendanceRecord | null>(null)
const correctionFormRef = ref<FormInst | null>(null)
const approvalComment = ref('')

const months = ['2024-01', '2024-02', '2024-03']
const monthOptions = months.map(m => ({ label: m, value: m }))

const correctionForm = ref({
  type: 'makeup' as AttendanceCorrectionType,
  reason: '',
  makeupCheckIn: null as number | null,
  makeupCheckOut: null as number | null
})

const correctionRules: FormRules = {
  type: {
    required: true,
    message: '请选择申请类型',
    trigger: 'change'
  },
  reason: {
    required: true,
    message: '请填写申请说明',
    trigger: 'blur'
  }
}

const statistics = computed(() => attendanceStore.statistics)

watch(selectedMonth, (val) => {
  attendanceStore.setSelectedMonth(val)
  updateChart()
})

watch(abnormalFilter, (val) => {
  attendanceStore.setAbnormalFilter(val)
})

onMounted(() => {
  initChart()
})

function getStatusType(status: string): 'success' | 'warning' | 'error' | 'info' {
  const typeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    normal: 'success',
    late: 'warning',
    early: 'warning',
    absent: 'error',
    leave: 'info'
  }
  return typeMap[status] || 'info'
}

function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    normal: '正常',
    late: '迟到',
    early: '早退',
    absent: '缺勤',
    leave: '请假'
  }
  return labelMap[status] || status
}

function isAbnormal(row: AttendanceRecord): boolean {
  return (row.status === 'late' || row.status === 'early' || row.status === 'absent') &&
    (!row.correction || row.correction.status !== 'approved')
}

function getRowProps(row: AttendanceRecord): any {
  if (isAbnormal(row)) {
    return {
      style: {
        backgroundColor: 'rgba(239, 68, 68, 0.06)'
      }
    }
  }
  if (row.correction?.status === 'approved') {
    return {
      style: {
        backgroundColor: 'rgba(16, 185, 129, 0.06)'
      }
    }
  }
  return {}
}

const columns: DataTableColumns<AttendanceRecord> = [
  {
    title: '姓名',
    key: 'employeeName'
  },
  {
    title: '日期',
    key: 'date'
  },
  {
    title: '签到时间',
    key: 'checkIn',
    render: (row) => {
      return h('span', {
        style: {
          color: row.status === 'late' && (!row.correction || row.correction.status !== 'approved') ? '#EF4444' : undefined,
          fontWeight: row.status === 'late' && (!row.correction || row.correction.status !== 'approved') ? 600 : undefined
        }
      }, row.checkIn)
    }
  },
  {
    title: '签退时间',
    key: 'checkOut',
    render: (row) => {
      return h('span', {
        style: {
          color: row.status === 'early' && (!row.correction || row.correction.status !== 'approved') ? '#EF4444' : undefined,
          fontWeight: row.status === 'early' && (!row.correction || row.correction.status !== 'approved') ? 600 : undefined
        }
      }, row.checkOut)
    }
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      let type: 'success' | 'warning' | 'error' | 'info' = getStatusType(row.status)
      let label = getStatusLabel(row.status)
      
      if (row.status === 'leave' && row.leaveType) {
        label = `请假(${LEAVE_TYPE_LABELS[row.leaveType]})`
      }
      
      if (row.correction) {
        const correctionLabel = CORRECTION_TYPE_LABELS[row.correction.type]
        const statusLabel = CORRECTION_STATUS_LABELS[row.correction.status]
        const statusColor = CORRECTION_STATUS_COLORS[row.correction.status]
        
        if (row.correction.status === 'approved') {
          type = 'success'
          label = `正常(已${correctionLabel})`
        } else if (row.correction.status === 'pending') {
          type = 'warning'
          label = `${label}(${statusLabel})`
        } else if (row.correction.status === 'rejected') {
          type = 'error'
          label = `${label}(已驳回)`
        }
        
        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
          h(NTag as any, { type, size: 'small' }, { default: () => label }),
          row.correction.status !== 'pending' && h('div', {
            style: { fontSize: '12px', color: '#6B7280' }
          }, [
            '审批人: ',
            h('span', { style: { color: statusColor, fontWeight: 500 } }, row.correction.approverName),
            ' · ',
            row.correction.approvalComment
          ])
        ])
      }
      
      return h(NTag as any, { type, size: 'small' }, { default: () => label }) as any
    }
  },
  {
    title: '修正信息',
    key: 'correction',
    render: (row) => {
      if (!row.correction) {
        return h('span', { style: { color: '#9CA3AF' } }, '-')
      }
      
      const cor = row.correction
      const statusColor = CORRECTION_STATUS_COLORS[cor.status]
      
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          h('span', { style: { color: '#6B7280' } }, `${CORRECTION_TYPE_LABELS[cor.type]}:`),
          h('span', { style: { fontWeight: 500 } }, cor.reason.substring(0, 20) + (cor.reason.length > 20 ? '...' : ''))
        ]),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          h('span', { style: { color: '#6B7280' } }, '状态:'),
          h('span', { style: { color: statusColor, fontWeight: 500 } }, CORRECTION_STATUS_LABELS[cor.status]),
          cor.status === 'approved' && cor.type === 'makeup' && h('span', { style: { color: '#6B7280' } }, [
            `(${cor.makeupCheckIn} - ${cor.makeupCheckOut})`
          ])
        ])
      ])
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) => {
      const actions = []
      
      const isAbnormalStatus = row.status === 'late' || row.status === 'early' || row.status === 'absent'
      const canApply = isAbnormalStatus && (!row.correction || row.correction.status === 'rejected')
      
      if (canApply) {
        actions.push(
          h('n-button', {
            size: 'small',
            type: 'primary',
            onClick: () => openCorrectionModal(row)
          }, { default: () => '申请修正' })
        )
      }
      
      if (row.correction?.status === 'pending') {
        actions.push(
          h('n-button', {
            size: 'small',
            type: 'warning',
            onClick: () => openApprovalModal(row)
          }, { default: () => '审批' })
        )
      }
      
      return h('div', { style: { display: 'flex', gap: '8px' } }, actions)
    }
  }
]

function openCorrectionModal(record: AttendanceRecord) {
  currentRecord.value = record
  correctionForm.value = {
    type: 'makeup',
    reason: '',
    makeupCheckIn: null,
    makeupCheckOut: null
  }
  showCorrectionModal.value = true
}

function openApprovalModal(record: AttendanceRecord) {
  currentRecord.value = record
  approvalComment.value = ''
  showApprovalModal.value = true
}

function submitCorrection() {
  correctionFormRef.value?.validate((errors) => {
    if (!errors && currentRecord.value) {
      const form = correctionForm.value
      let checkIn: string | undefined
      let checkOut: string | undefined
      
      if (form.type === 'makeup') {
        if (!form.makeupCheckIn || !form.makeupCheckOut) {
          message.warning('请填写完整的补卡时间')
          return
        }
        checkIn = formatTime(form.makeupCheckIn)
        checkOut = formatTime(form.makeupCheckOut)
      }
      
      const success = attendanceStore.submitCorrection(
        currentRecord.value.id,
        form.type,
        form.reason,
        checkIn,
        checkOut
      )
      
      if (success) {
        message.success('申请提交成功，等待审批')
        showCorrectionModal.value = false
        updateChart()
      } else {
        message.error('申请提交失败')
      }
    }
  })
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function handleApprove() {
  if (currentRecord.value) {
    const success = attendanceStore.approveCorrection(
      currentRecord.value.id,
      approvalComment.value || '情况属实，同意修正'
    )
    if (success) {
      message.success('审批通过')
      showApprovalModal.value = false
      updateChart()
    } else {
      message.error('审批失败')
    }
  }
}

function handleReject() {
  if (!approvalComment.value.trim()) {
    message.warning('请填写驳回理由')
    return
  }
  if (currentRecord.value) {
    const success = attendanceStore.rejectCorrection(
      currentRecord.value.id,
      approvalComment.value
    )
    if (success) {
      message.success('已驳回申请')
      showApprovalModal.value = false
      updateChart()
    } else {
      message.error('操作失败')
    }
  }
}

function initChart() {
  if (!chartRef.value) return
  const chart = echarts.init(chartRef.value)
  updateChartData(chart)
}

function updateChart() {
  if (!chartRef.value) return
  const chart = echarts.getInstanceByDom(chartRef.value)
  if (chart) {
    updateChartData(chart)
  }
}

function updateChartData(chart: echarts.ECharts) {
  const { days, rates } = attendanceStore.chartData
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days.map(d => d + '日')
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '出勤率',
        type: 'line',
        smooth: true,
        data: rates,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(124, 58, 237, 0.3)' },
            { offset: 1, color: 'rgba(124, 58, 237, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#7C3AED',
          width: 3
        },
        itemStyle: {
          color: '#7C3AED'
        }
      }
    ]
  }
  
  chart.setOption(option)
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stat-grid {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 2px;
}

.chart-card {
  height: 380px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.table-card {
  margin-bottom: 20px;
}

.card-gradient {
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
  color: white;
}

.approval-content {
  padding: 8px 0;
}
</style>
