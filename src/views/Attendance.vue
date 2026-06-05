<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">考勤统计</div>
      <n-select
        v-model:value="selectedMonth"
        placeholder="选择月份"
        style="width: 160px;"
        :options="monthOptions"
      />
    </div>
    
    <n-grid :cols="4" :x-gap="20" :y-gap="20" class="stat-grid">
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
    </n-grid>
    
    <n-card title="考勤趋势图" class="chart-card" style="margin-top: 20px;">
      <div ref="chartRef" class="chart-container"></div>
    </n-card>
    
    <n-card title="考勤明细" class="table-card" style="margin-top: 20px;">
      <n-data-table
        :columns="columns"
        :data="attendanceStore.paginatedRecords"
        :bordered="false"
        size="large"
        :pagination="{
          page: attendanceStore.currentPage,
          pageSize: attendanceStore.pageSize,
          itemCount: attendanceStore.total,
          onUpdatePage: (page) => attendanceStore.setCurrentPage(page)
        }"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import * as echarts from 'echarts'
import { CalendarCheck, CheckCircle, Clock, XCircle } from 'lucide-vue-next'
import { useAttendanceStore } from '@/stores/attendance'
import { NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { AttendanceRecord } from '@/types'

const attendanceStore = useAttendanceStore()

const selectedMonth = ref('2024-01')
const chartRef = ref<HTMLDivElement | null>(null)

const months = ['2024-01', '2024-02', '2024-03']
const monthOptions = months.map(m => ({ label: m, value: m }))

const statistics = computed(() => attendanceStore.statistics)

watch(selectedMonth, (val) => {
  attendanceStore.setSelectedMonth(val)
  updateChart()
})

onMounted(() => {
  initChart()
})

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
    key: 'checkIn'
  },
  {
    title: '签退时间',
    key: 'checkOut'
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      const typeMap: Record<string, any> = {
        normal: 'success',
        late: 'warning',
        early: 'warning',
        absent: 'error'
      }
      const labelMap: Record<string, string> = {
        normal: '正常',
        late: '迟到',
        early: '早退',
        absent: '缺勤'
      }
      return h(NTag as any, { type: typeMap[row.status], size: 'small' }, { default: () => labelMap[row.status] }) as any
    }
  }
]

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

.stat-grid {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
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
  height: 380px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.table-card {
  margin-bottom: 20px;
}
</style>
