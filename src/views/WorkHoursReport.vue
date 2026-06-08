<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">工时统计报表</div>
      <div class="header-actions">
        <n-select
          v-model:value="selectedMonth"
          placeholder="选择月份"
          style="width: 160px;"
          :options="monthOptions"
        />
        <n-select
          v-model:value="filterDepartment"
          placeholder="部门筛选"
          style="width: 160px;"
          clearable
          :options="DEPARTMENT_OPTIONS"
        />
        <n-input-number
          v-model:value="consecutiveThreshold"
          placeholder="连续加班阈值"
          :min="1"
          :max="30"
          style="width: 160px;"
          :formatter="(value: number) => `连续 ${value} 天`"
          :parser="(value: string) => parseInt(value.replace(/连续\s?|\s?天/g, '')) || 3"
        />
        <n-checkbox v-model:checked="filterOverworkedOnly" label="仅看过劳员工" />
        <n-dropdown :options="exportOptions" @select="handleExport">
          <n-button type="primary">
            <template #icon>
              <Download :size="16" />
            </template>
            导出报表
          </n-button>
        </n-dropdown>
      </div>
    </div>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stat-grid">
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <Users :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.totalEmployees }}</div>
              <div class="stat-label">员工总数</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <Clock :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.avgActualHours }}h</div>
              <div class="stat-label">人均实际工时</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <ClockAlert :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.avgOvertimeHours }}h</div>
              <div class="stat-label">人均加班工时</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #EF4444 0%, #F87171 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <AlertTriangle :size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.overworkedCount }}</div>
              <div class="stat-label">过劳风险员工</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card v-if="overworkedEmployees.length > 0" title="过劳风险预警" class="warning-card" style="margin-top: 20px;">
      <template #header-extra>
        <n-badge :value="overworkedEmployees.length" type="error" />
      </template>
      <div class="overworked-list">
        <div 
          v-for="employee in overworkedEmployees" 
          :key="employee.employeeId"
          class="overworked-item"
        >
          <n-avatar round :src="employee.avatar" :size="40" />
          <div class="overworked-info">
            <div class="overworked-name">
              {{ employee.employeeName }}
              <n-tag 
                :type="getRiskTagType(employee.riskLevel)" 
                size="small"
                style="margin-left: 8px;"
              >
                {{ getRiskLabel(employee.riskLevel) }}
              </n-tag>
            </div>
            <div class="overworked-detail">
              {{ employee.department }} · 连续加班 {{ employee.consecutiveDays }} 天 · 累计加班 {{ employee.totalOvertimeHours }}h
            </div>
          </div>
          <div class="overworked-dates">
            <n-tag v-for="date in employee.overtimeDates.slice(0, 5)" :key="date" size="small" type="warning">
              {{ date.slice(5) }}
            </n-tag>
            <span v-if="employee.overtimeDates.length > 5" class="more-dates">
              +{{ employee.overtimeDates.length - 5 }}
            </span>
          </div>
        </div>
      </div>
    </n-card>

    <n-card title="计划工时 vs 实际工时对比" class="chart-card" style="margin-top: 20px;">
      <div ref="planVsActualChartRef" class="chart-container"></div>
    </n-card>

    <n-tabs v-model:value="activeTab" type="line" style="margin-top: 20px;">
      <n-tab-pane name="employee" tab="按员工统计">
        <n-card class="table-card">
          <n-data-table
            :columns="employeeColumns"
            :data="workhoursStore.paginatedEmployeeStats"
            :bordered="false"
            remote
            size="large"
            :pagination="workhoursStore.pagination"
            :row-props="getEmployeeRowProps"
          />
        </n-card>
      </n-tab-pane>
      
      <n-tab-pane name="department" tab="按部门统计">
        <n-card class="table-card">
          <n-data-table
            :columns="departmentColumns"
            :data="workhoursStore.departmentStats"
            :bordered="false"
            size="large"
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showDetailModal" preset="card" title="工时明细" style="width: 900px;">
      <div v-if="selectedEmployee" class="detail-content">
        <n-descriptions :column="3" bordered size="small" style="margin-bottom: 20px;">
          <n-descriptions-item label="员工姓名">{{ selectedEmployee.employeeName }}</n-descriptions-item>
          <n-descriptions-item label="部门">{{ selectedEmployee.department }}</n-descriptions-item>
          <n-descriptions-item label="职位">{{ selectedEmployee.position }}</n-descriptions-item>
          <n-descriptions-item label="计划工时">{{ selectedEmployee.plannedWorkHours }}h</n-descriptions-item>
          <n-descriptions-item label="实际工时">{{ selectedEmployee.actualWorkHours }}h</n-descriptions-item>
          <n-descriptions-item label="加班工时">{{ selectedEmployee.overtimeHours }}h</n-descriptions-item>
          <n-descriptions-item label="请假工时">{{ selectedEmployee.leaveHours }}h</n-descriptions-item>
          <n-descriptions-item label="出勤率">{{ selectedEmployee.attendanceRate }}%</n-descriptions-item>
          <n-descriptions-item label="连续加班">{{ selectedEmployee.consecutiveOvertimeDays }}天</n-descriptions-item>
        </n-descriptions>
        
        <n-data-table
          :columns="dailyColumns"
          :data="selectedEmployee.dailyRecords"
          :bordered="false"
          size="small"
          :max-height="400"
          :row-props="getDailyRowProps"
        />
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="exportEmployeeDetail">
            <template #icon>
              <Download :size="16" />
            </template>
            导出该员工明细
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import * as echarts from 'echarts'
import { 
  Users, 
  Clock, 
  ClockAlert, 
  AlertTriangle, 
  Download,
  Eye
} from 'lucide-vue-next'
import { useWorkHoursStore } from '@/stores/workhours'
import { NTag, useMessage, type DataTableColumns, type DropdownOption } from 'naive-ui'
import type { WorkHoursEmployeeStat, WorkHoursDailyRecord, OverworkedEmployee } from '@/types'
import { DEPARTMENT_OPTIONS, OVERTIME_RISK_LEVELS } from '@/types'

const workhoursStore = useWorkHoursStore()
const message = useMessage()

const selectedMonth = ref('2024-01')
const filterDepartment = ref('')
const consecutiveThreshold = ref(3)
const filterOverworkedOnly = ref(false)
const activeTab = ref('employee')
const showDetailModal = ref(false)
const selectedEmployee = ref<WorkHoursEmployeeStat | null>(null)

const planVsActualChartRef = ref<HTMLDivElement | null>(null)

const months = ['2024-01', '2024-02', '2024-03']
const monthOptions = months.map(m => ({ label: m, value: m }))

const summaryStats = computed(() => workhoursStore.summaryStats)
const overworkedEmployees = computed(() => workhoursStore.overworkedEmployees)

const exportOptions: DropdownOption[] = [
  {
    label: '导出工时汇总表',
    key: 'summary',
    icon: () => h(Download as any, { size: 16 })
  },
  {
    label: '导出全员工时明细表',
    key: 'detail-all',
    icon: () => h(Download as any, { size: 16 })
  }
]

const employeeColumns: DataTableColumns<WorkHoursEmployeeStat> = [
  {
    title: '员工姓名',
    key: 'employeeName',
    width: 120,
    fixed: 'left'
  },
  {
    title: '部门',
    key: 'department',
    width: 120
  },
  {
    title: '职位',
    key: 'position',
    width: 160
  },
  {
    title: '计划工时(h)',
    key: 'plannedWorkHours',
    width: 110,
    align: 'right'
  },
  {
    title: '实际工时(h)',
    key: 'actualWorkHours',
    width: 110,
    align: 'right',
    render: (row) => {
      const diff = row.actualWorkHours - row.plannedWorkHours
      const color = diff >= 0 ? '#10B981' : '#EF4444'
      return h('span', { style: { color, fontWeight: 600 } }, row.actualWorkHours)
    }
  },
  {
    title: '加班工时(h)',
    key: 'overtimeHours',
    width: 110,
    align: 'right',
    render: (row) => {
      return h('span', { 
        style: { 
          color: row.overtimeHours > 10 ? '#EF4444' : '#F59E0B', 
          fontWeight: 600 
        } 
      }, row.overtimeHours)
    }
  },
  {
    title: '请假工时(h)',
    key: 'leaveHours',
    width: 110,
    align: 'right'
  },
  {
    title: '出勤率(%)',
    key: 'attendanceRate',
    width: 100,
    align: 'right',
    render: (row) => {
      const color = row.attendanceRate >= 95 ? '#10B981' : row.attendanceRate >= 80 ? '#F59E0B' : '#EF4444'
      return h('span', { style: { color, fontWeight: 600 } }, row.attendanceRate + '%')
    }
  },
  {
    title: '连续加班(天)',
    key: 'consecutiveOvertimeDays',
    width: 120,
    align: 'center',
    render: (row) => {
      if (row.consecutiveOvertimeDays >= consecutiveThreshold.value) {
        return h(NTag as any, { type: 'error', size: 'small' }, { 
          default: () => `${row.consecutiveOvertimeDays}天 ⚠️` 
        })
      }
      return row.consecutiveOvertimeDays || '-'
    }
  },
  {
    title: '过劳风险',
    key: 'isOverworked',
    width: 100,
    align: 'center',
    render: (row) => {
      if (row.isOverworked) {
        return h(NTag as any, { type: 'error', size: 'small' }, { default: () => '高风险' })
      }
      return h(NTag as any, { type: 'success', size: 'small' }, { default: () => '正常' })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) => {
      return h('n-button', {
        size: 'small',
        type: 'primary',
        quaternary: true,
        onClick: () => openDetailModal(row)
      }, { 
        default: () => h('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, [
          h(Eye as any, { size: 14 }),
          '查看'
        ])
      })
    }
  }
]

const departmentColumns: DataTableColumns = [
  {
    title: '部门',
    key: 'department',
    width: 140
  },
  {
    title: '员工数',
    key: 'employeeCount',
    width: 100,
    align: 'center'
  },
  {
    title: '总计划工时(h)',
    key: 'totalPlannedWorkHours',
    width: 130,
    align: 'right'
  },
  {
    title: '总实际工时(h)',
    key: 'totalActualWorkHours',
    width: 130,
    align: 'right',
    render: (row: any) => {
      const diff = row.totalActualWorkHours - row.totalPlannedWorkHours
      const color = diff >= 0 ? '#10B981' : '#EF4444'
      return h('span', { style: { color, fontWeight: 600 } }, row.totalActualWorkHours)
    }
  },
  {
    title: '总加班工时(h)',
    key: 'totalOvertimeHours',
    width: 130,
    align: 'right',
    render: (row: any) => {
      return h('span', { 
        style: { color: '#F59E0B', fontWeight: 600 } 
      }, row.totalOvertimeHours)
    }
  },
  {
    title: '总请假工时(h)',
    key: 'totalLeaveHours',
    width: 130,
    align: 'right'
  },
  {
    title: '人均实际工时(h)',
    key: 'avgActualWorkHours',
    width: 130,
    align: 'right'
  },
  {
    title: '人均加班工时(h)',
    key: 'avgOvertimeHours',
    width: 130,
    align: 'right'
  },
  {
    title: '过劳风险人数',
    key: 'overworkedEmployeeCount',
    width: 130,
    align: 'center',
    render: (row: any) => {
      if (row.overworkedEmployeeCount > 0) {
        return h(NTag as any, { type: 'error', size: 'small' }, { 
          default: () => `${row.overworkedEmployeeCount}人 ⚠️` 
        })
      }
      return h(NTag as any, { type: 'success', size: 'small' }, { default: () => '0人' })
    }
  }
]

const dailyColumns: DataTableColumns<WorkHoursDailyRecord> = [
  {
    title: '日期',
    key: 'date',
    width: 120
  },
  {
    title: '签到',
    key: 'checkIn',
    width: 100
  },
  {
    title: '签退',
    key: 'checkOut',
    width: 100
  },
  {
    title: '工作时长(h)',
    key: 'workHours',
    width: 120,
    align: 'right'
  },
  {
    title: '加班时长(h)',
    key: 'overtimeHours',
    width: 120,
    align: 'right',
    render: (row) => {
      if (row.overtimeHours > 0) {
        return h('span', { style: { color: '#F59E0B', fontWeight: 600 } }, row.overtimeHours)
      }
      return '-'
    }
  },
  {
    title: '请假时长(h)',
    key: 'leaveHours',
    width: 120,
    align: 'right',
    render: (row) => {
      if (row.leaveHours > 0) {
        return h('span', { style: { color: '#8B5CF6', fontWeight: 600 } }, row.leaveHours)
      }
      return '-'
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, { type: 'success' | 'warning' | 'error' | 'info' | 'default', label: string }> = {
        normal: { type: 'success', label: '正常' },
        late: { type: 'warning', label: '迟到' },
        early: { type: 'warning', label: '早退' },
        absent: { type: 'error', label: '缺勤' },
        leave: { type: 'info', label: '请假' },
        weekend: { type: 'default', label: '周末' },
        holiday: { type: 'default', label: '节假日' }
      }
      const status = statusMap[row.status] || { type: 'default', label: row.status }
      return h(NTag as any, { type: status.type, size: 'small' }, { default: () => status.label })
    }
  }
]

watch(selectedMonth, (val) => {
  workhoursStore.setSelectedMonth(val)
  updatePlanVsActualChart()
})

watch(filterDepartment, (val) => {
  workhoursStore.setFilterDepartment(val || '')
})

watch(consecutiveThreshold, (val) => {
  workhoursStore.setConsecutiveOvertimeThreshold(val)
})

watch(filterOverworkedOnly, (val) => {
  workhoursStore.setFilterOverworkedOnly(val)
})

onMounted(() => {
  initPlanVsActualChart()
})

function getRiskTagType(level: string): 'success' | 'warning' | 'error' {
  const map: Record<string, 'success' | 'warning' | 'error'> = {
    low: 'warning',
    medium: 'warning',
    high: 'error'
  }
  return map[level] || 'warning'
}

function getRiskLabel(level: string): string {
  return OVERTIME_RISK_LEVELS[level]?.label || '未知风险'
}

function getEmployeeRowProps(row: WorkHoursEmployeeStat): any {
  if (row.isOverworked) {
    return {
      style: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderLeft: '3px solid #EF4444'
      }
    }
  }
  return {}
}

function getDailyRowProps(row: WorkHoursDailyRecord): any {
  if (row.overtimeHours > 0) {
    return {
      style: {
        backgroundColor: 'rgba(245, 158, 11, 0.06)'
      }
    }
  }
  if (row.status === 'leave') {
    return {
      style: {
        backgroundColor: 'rgba(139, 92, 246, 0.06)'
      }
    }
  }
  if (row.status === 'absent') {
    return {
      style: {
        backgroundColor: 'rgba(239, 68, 68, 0.06)'
      }
    }
  }
  return {}
}

function openDetailModal(employee: WorkHoursEmployeeStat) {
  selectedEmployee.value = employee
  showDetailModal.value = true
}

function handleExport(key: string | number) {
  if (key === 'summary') {
    workhoursStore.exportWorkHoursSummary()
    message.success('工时汇总表导出成功')
  } else if (key === 'detail-all') {
    workhoursStore.exportWorkHoursDetail()
    message.success('工时明细表导出成功')
  }
}

function exportEmployeeDetail() {
  if (selectedEmployee.value) {
    workhoursStore.exportWorkHoursDetail(selectedEmployee.value.employeeId)
    message.success(`${selectedEmployee.value.employeeName} 工时明细导出成功`)
  }
}

function initPlanVsActualChart() {
  if (!planVsActualChartRef.value) return
  const chart = echarts.init(planVsActualChartRef.value)
  updatePlanVsActualChartData(chart)
  
  const handleResize = () => chart.resize()
  window.addEventListener('resize', handleResize)
}

function updatePlanVsActualChart() {
  if (!planVsActualChartRef.value) return
  const chart = echarts.getInstanceByDom(planVsActualChartRef.value)
  if (chart) {
    updatePlanVsActualChartData(chart)
  }
}

function updatePlanVsActualChartData(chart: echarts.ECharts) {
  const data = workhoursStore.planVsActualData
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['计划工时', '实际工时'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: {
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '工时(小时)',
      axisLabel: {
        formatter: '{value}h'
      }
    },
    series: [
      {
        name: '计划工时',
        type: 'bar',
        data: data.map(d => d.plannedHours),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#A78BFA' },
            { offset: 1, color: '#7C3AED' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      },
      {
        name: '实际工时',
        type: 'bar',
        data: data.map(d => d.actualHours),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#34D399' },
            { offset: 1, color: '#10B981' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
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
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1E1B4B;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
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

.warning-card {
  border: 1px solid #FCA5A5;
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
}

.warning-card :deep(.n-card-header) {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  border-bottom: 1px solid #FCA5A5;
}

.overworked-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overworked-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #FECACA;
}

.overworked-info {
  flex: 1;
}

.overworked-name {
  font-size: 15px;
  font-weight: 600;
  color: #1E1B4B;
  display: flex;
  align-items: center;
}

.overworked-detail {
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
}

.overworked-dates {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  max-width: 300px;
}

.more-dates {
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}

.chart-card {
  min-height: 420px;
}

.chart-container {
  width: 100%;
  height: 340px;
}

.table-card {
  margin-top: 0;
}

.detail-content {
  padding: 8px 0;
}
</style>
