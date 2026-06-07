<template>
  <div class="page-container">
    <div class="page-title">仪表盘</div>
    
    <n-grid :cols="4" :x-gap="20" :y-gap="20" class="stat-grid">
      <n-grid-item>
        <n-card class="stat-card card-gradient">
          <div class="stat-content">
            <div class="stat-icon">
              <Users :size="28" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ employeeStore.employees.length }}</div>
              <div class="stat-label">员工总数</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #EF4444 0%, #F87171 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <AlertTriangle :size="28" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ contractStore.expiringCount }}</div>
              <div class="stat-label">即将到期合同</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <UserCheck :size="28" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ attendanceStore.statistics.attendanceRate }}%</div>
              <div class="stat-label">本月出勤率</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <Briefcase :size="28" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ recruitmentStore.candidates.length }}</div>
              <div class="stat-label">招聘候选人</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
    
    <n-grid :cols="2" :x-gap="20" :y-gap="20" style="margin-top: 20px;">
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <Clock :size="28" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ myMonthlyOvertimeHours }} 小时</div>
              <div class="stat-label">本月加班时长</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <CalendarOff :size="28" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ myCompensatoryLeaveRemaining }} 天</div>
              <div class="stat-label">剩余调休天数</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
    
    <n-grid :cols="2" :x-gap="20" :y-gap="20" class="chart-grid" style="margin-top: 20px;">
      <n-grid-item>
        <n-card title="月度考勤趋势" class="chart-card">
          <div ref="chartRef" class="chart-container"></div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card title="部门人员分布" class="chart-card">
          <div ref="pieChartRef" class="chart-container"></div>
        </n-card>
      </n-grid-item>
    </n-grid>
    
    <n-grid :cols="3" :x-gap="20" :y-gap="20" style="margin-top: 20px;">
      <n-grid-item>
        <n-card title="最近入职员工" class="list-card">
          <n-list>
            <n-list-item v-for="emp in recentEmployees" :key="emp.id">
              <template #prefix>
                <n-avatar round :src="emp.avatar" :size="40" />
              </template>
              <div class="employee-item">
                <span class="employee-name">{{ emp.name }}</span>
                <span class="employee-position">{{ emp.position }}</span>
              </div>
              <template #suffix>
                <n-tag size="small" :type="emp.status === 'active' ? 'success' : 'warning'">
                  {{ emp.status === 'active' ? '正式' : '试用' }}
                </n-tag>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card title="即将到期合同" class="list-card">
          <n-list v-if="expiringContractsList.length > 0">
            <n-list-item v-for="con in expiringContractsList" :key="con.id">
              <template #prefix>
                <div class="contract-icon">
                  <FileText :size="20" color="#F59E0B" />
                </div>
              </template>
              <div class="employee-item">
                <span class="employee-name">{{ con.employeeName }}</span>
                <span class="employee-position">{{ contractTypeLabels[con.type] }} · {{ con.endDate }}</span>
              </div>
              <template #suffix>
                <n-tag size="small" type="warning">
                  剩 {{ getDaysRemaining(con.endDate) }} 天
                </n-tag>
              </template>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无即将到期合同" />
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card title="我的面试日程" class="list-card">
          <n-list v-if="upcomingInterviews.length > 0">
            <n-list-item v-for="interview in upcomingInterviews" :key="interview.id">
              <template #prefix>
                <div class="interview-icon">
                  <CalendarDays :size="20" color="#7C3AED" />
                </div>
              </template>
              <div class="employee-item">
                <span class="employee-name">{{ interview.candidateName }}</span>
                <span class="employee-position">{{ interview.position }} · {{ INTERVIEW_ROUND_LABELS[interview.round] }}</span>
              </div>
              <template #suffix>
                <div class="interview-time-info">
                  <div class="interview-date">{{ formatInterviewDate(interview.date) }}</div>
                  <div class="interview-hour">{{ interview.startTime }}</div>
                </div>
              </template>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无面试安排" />
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { Users, UserCheck, Briefcase, GraduationCap, FileText, AlertTriangle, CalendarDays, Clock, CalendarOff } from 'lucide-vue-next'
import { useEmployeeStore } from '@/stores/employee'
import { useAttendanceStore } from '@/stores/attendance'
import { useRecruitmentStore } from '@/stores/recruitment'
import { useTrainingStore } from '@/stores/training'
import { useContractStore } from '@/stores/contract'
import { useInterviewStore, INTERVIEW_ROUND_LABELS } from '@/stores/interview'
import { useUserStore } from '@/stores/user'
import { useLeaveStore } from '@/stores/leave'
import { useOvertimeStore } from '@/stores/overtime'
import { stageLabels } from '@/stores/recruitment'

const employeeStore = useEmployeeStore()
const attendanceStore = useAttendanceStore()
const recruitmentStore = useRecruitmentStore()
const trainingStore = useTrainingStore()
const contractStore = useContractStore()
const interviewStore = useInterviewStore()
const userStore = useUserStore()
const leaveStore = useLeaveStore()
const overtimeStore = useOvertimeStore()

const chartRef = ref<HTMLDivElement | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)

const recentEmployees = computed(() => 
  [...employeeStore.employees]
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    .slice(0, 5)
)

const pendingCandidates = computed(() => 
  recruitmentStore.screeningCandidates.slice(0, 5)
)

const expiringContractsList = computed(() => 
  contractStore.expiringContracts.slice(0, 5)
)

const upcomingInterviews = computed(() => {
  if (!userStore.currentUser) return []
  return interviewStore.getUpcomingInterviewsByInterviewer(userStore.currentUser.id, 5)
})

const myMonthlyOvertimeHours = computed(() => {
  if (!userStore.currentUser) return 0
  return overtimeStore.getCurrentMonthOvertimeHours(userStore.currentUser.id)
})

const myCompensatoryLeaveRemaining = computed(() => {
  if (!userStore.currentUser) return 0
  const balance = leaveStore.getLeaveBalance(userStore.currentUser.id)
  return balance?.compensatoryLeaveRemaining || 0
})

const contractTypeLabels: Record<string, string> = {
  fulltime: '全职',
  parttime: '兼职',
  intern: '实习'
}

function getDaysRemaining(endDate: string): number {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatInterviewDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  if (dateStr === today) return '今天'
  if (dateStr === tomorrow) return '明天'
  
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  
  return `${month}月${day}日 ${weekDay}`
}

onMounted(() => {
  contractStore.updateContractStatus()
  initLineChart()
  initPieChart()
})

function initLineChart() {
  if (!chartRef.value) return
  const chart = echarts.init(chartRef.value)
  
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
      data: ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
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
        data: [92, 95, 88, 96, 93, 97, 94],
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

function initPieChart() {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  
  const deptCount: Record<string, number> = {}
  employeeStore.employees.forEach(emp => {
    deptCount[emp.department] = (deptCount[emp.department] || 0) + 1
  })
  
  const data = Object.entries(deptCount).map(([name, value]) => ({ name, value }))
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        name: '部门人数',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: data,
        color: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE']
      }
    ]
  }
  
  chart.setOption(option)
}
</script>

<style scoped>
.stat-grid {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.chart-card {
  height: 350px;
}

.chart-container {
  width: 100%;
  height: 280px;
}

.list-card .n-list {
  max-height: 320px;
  overflow-y: auto;
}

.employee-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.employee-position {
  font-size: 12px;
  color: #6B7280;
}

.contract-icon {
  width: 40px;
  height: 40px;
  background: #FEF3C7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.interview-icon {
  width: 40px;
  height: 40px;
  background: #EDE9FE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.interview-time-info {
  text-align: right;
}

.interview-date {
  font-size: 12px;
  color: #7C3AED;
  font-weight: 600;
}

.interview-hour {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}
</style>
