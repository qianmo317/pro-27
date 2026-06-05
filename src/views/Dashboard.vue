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
      
      <n-grid-item>
        <n-card class="stat-card" style="background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); color: white;">
          <div class="stat-content">
            <div class="stat-icon">
              <GraduationCap :size="28" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ trainingStore.ongoingCourses.length }}</div>
              <div class="stat-label">进行中培训</div>
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
    
    <n-grid :cols="2" :x-gap="20" :y-gap="20" style="margin-top: 20px;">
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
        <n-card title="待处理招聘" class="list-card">
          <n-list>
            <n-list-item v-for="can in pendingCandidates" :key="can.id">
              <template #prefix>
                <n-avatar round :src="can.avatar" :size="40" />
              </template>
              <div class="employee-item">
                <span class="employee-name">{{ can.name }}</span>
                <span class="employee-position">{{ can.position }}</span>
              </div>
              <template #suffix>
                <n-tag size="small" type="info">
                  {{ stageLabels[can.stage] }}
                </n-tag>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { Users, UserCheck, Briefcase, GraduationCap } from 'lucide-vue-next'
import { useEmployeeStore } from '@/stores/employee'
import { useAttendanceStore } from '@/stores/attendance'
import { useRecruitmentStore } from '@/stores/recruitment'
import { useTrainingStore } from '@/stores/training'
import { stageLabels } from '@/stores/recruitment'

const employeeStore = useEmployeeStore()
const attendanceStore = useAttendanceStore()
const recruitmentStore = useRecruitmentStore()
const trainingStore = useTrainingStore()

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

onMounted(() => {
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
</style>
