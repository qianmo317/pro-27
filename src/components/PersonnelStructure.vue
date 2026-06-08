<template>
  <n-card :title="title" class="personnel-structure-card">
    <template #header-extra>
      <div class="filter-section" v-if="showDepartmentFilter">
        <n-select
          v-model:value="selectedDepartment"
          :options="departmentOptions"
          placeholder="选择部门"
          clearable
          size="small"
          style="width: 180px"
          @update:value="handleDepartmentChange"
        />
      </div>
    </template>

    <div class="summary-stats">
      <n-statistic label="在职员工" :value="filteredEmployees.length" class="stat-item">
        <template #suffix>
          <span class="stat-suffix">人</span>
        </template>
      </n-statistic>
      <n-statistic label="试用期" :value="probationCount" class="stat-item">
        <template #suffix>
          <span class="stat-suffix">人</span>
        </template>
      </n-statistic>
      <n-statistic label="正式员工" :value="activeCount" class="stat-item">
        <template #suffix>
          <span class="stat-suffix">人</span>
        </template>
      </n-statistic>
      <n-statistic label="转正率" :value="conversionRate" class="stat-item">
        <template #suffix>
          <span class="stat-suffix">%</span>
        </template>
      </n-statistic>
    </div>

    <n-grid :cols="2" :x-gap="16" :y-gap="16" class="chart-grid">
      <n-grid-item>
        <n-card title="性别分布" size="small" class="chart-card">
          <div ref="genderChartRef" class="chart-container"></div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="年龄分布" size="small" class="chart-card">
          <div ref="ageChartRef" class="chart-container"></div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="职级分布" size="small" class="chart-card">
          <div ref="levelChartRef" class="chart-container"></div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="司龄分布" size="small" class="chart-card">
          <div ref="tenureChartRef" class="chart-container"></div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card title="试用期转正漏斗" size="small" class="chart-card funnel-card">
      <div ref="funnelChartRef" class="funnel-container"></div>
    </n-card>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { Employee } from '@/types'
import { calculateAge, calculateWorkYears } from '@/lib/utils'

interface Props {
  employees: Employee[]
  showDepartmentFilter?: boolean
  defaultDepartment?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  showDepartmentFilter: true,
  title: '人员结构分析',
  defaultDepartment: ''
})

const emit = defineEmits<{
  (e: 'department-change', department: string): void
}>()

const selectedDepartment = ref(props.defaultDepartment)

const genderChartRef = ref<HTMLDivElement | null>(null)
const ageChartRef = ref<HTMLDivElement | null>(null)
const levelChartRef = ref<HTMLDivElement | null>(null)
const tenureChartRef = ref<HTMLDivElement | null>(null)
const funnelChartRef = ref<HTMLDivElement | null>(null)

let genderChart: echarts.ECharts | null = null
let ageChart: echarts.ECharts | null = null
let levelChart: echarts.ECharts | null = null
let tenureChart: echarts.ECharts | null = null
let funnelChart: echarts.ECharts | null = null

const departments = computed(() => {
  const depts = [...new Set(props.employees.map(e => e.department))]
  return depts.sort()
})

const departmentOptions = computed(() => {
  return departments.value.map(d => ({ label: d, value: d }))
})

const filteredEmployees = computed(() => {
  const active = props.employees.filter(e => e.status === 'active' || e.status === 'probation')
  if (!selectedDepartment.value) return active
  return active.filter(e => e.department === selectedDepartment.value)
})

const probationCount = computed(() => {
  return filteredEmployees.value.filter(e => e.status === 'probation').length
})

const activeCount = computed(() => {
  return filteredEmployees.value.filter(e => e.status === 'active').length
})

const conversionRate = computed(() => {
  const total = probationCount.value + activeCount.value
  if (total === 0) return 0
  return Math.round((activeCount.value / total) * 100)
})

function handleDepartmentChange(value: string) {
  emit('department-change', value || '')
}

function initCharts() {
  if (genderChartRef.value) {
    genderChart = echarts.init(genderChartRef.value)
    updateGenderChart()
  }
  if (ageChartRef.value) {
    ageChart = echarts.init(ageChartRef.value)
    updateAgeChart()
  }
  if (levelChartRef.value) {
    levelChart = echarts.init(levelChartRef.value)
    updateLevelChart()
  }
  if (tenureChartRef.value) {
    tenureChart = echarts.init(tenureChartRef.value)
    updateTenureChart()
  }
  if (funnelChartRef.value) {
    funnelChart = echarts.init(funnelChartRef.value)
    updateFunnelChart()
  }
}

function updateGenderChart() {
  if (!genderChart) return

  const maleCount = filteredEmployees.value.filter(e => e.gender === 'male').length
  const femaleCount = filteredEmployees.value.filter(e => e.gender === 'female').length

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      bottom: '0',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: maleCount, name: '男', itemStyle: { color: '#3B82F6' } },
          { value: femaleCount, name: '女', itemStyle: { color: '#EC4899' } }
        ]
      }
    ]
  }

  genderChart.setOption(option)
}

function updateAgeChart() {
  if (!ageChart) return

  const ageRanges = [
    { name: '25岁以下', min: 0, max: 25, count: 0 },
    { name: '26-30岁', min: 26, max: 30, count: 0 },
    { name: '31-35岁', min: 31, max: 35, count: 0 },
    { name: '36-40岁', min: 36, max: 40, count: 0 },
    { name: '41岁以上', min: 41, max: 200, count: 0 }
  ]

  filteredEmployees.value.forEach(emp => {
    if (emp.birthday) {
      const age = calculateAge(emp.birthday)
      for (const range of ageRanges) {
        if (age >= range.min && age <= range.max) {
          range.count++
          break
        }
      }
    }
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}人'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ageRanges.map(r => r.name),
      axisLabel: {
        interval: 0,
        rotate: 0,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        type: 'bar',
        data: ageRanges.map(r => r.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8B5CF6' },
            { offset: 1, color: '#A78BFA' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '50%'
      }
    ]
  }

  ageChart.setOption(option)
}

function updateLevelChart() {
  if (!levelChart) return

  const levelCount: Record<string, number> = {}
  filteredEmployees.value.forEach(emp => {
    const level = emp.level || '未设置'
    levelCount[level] = (levelCount[level] || 0) + 1
  })

  const levelOrder = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'M1', 'M2', 'M3', 'M4', '未设置']
  const sortedData = levelOrder
    .filter(level => levelCount[level])
    .map(level => ({
      name: level,
      value: levelCount[level]
    }))

  const levelColors: Record<string, string> = {
    'P1': '#9CA3AF',
    'P2': '#60A5FA',
    'P3': '#3B82F6',
    'P4': '#2563EB',
    'P5': '#1D4ED8',
    'P6': '#1E40AF',
    'M1': '#F59E0B',
    'M2': '#D97706',
    'M3': '#B45309',
    'M4': '#92400E',
    '未设置': '#6B7280'
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        data: sortedData.map(d => ({
          ...d,
          itemStyle: { color: levelColors[d.name] || '#6B7280' }
        }))
      }
    ]
  }

  levelChart.setOption(option)
}

function updateTenureChart() {
  if (!tenureChart) return

  const tenureRanges = [
    { name: '1年以下', min: 0, max: 0.99, count: 0 },
    { name: '1-3年', min: 1, max: 2.99, count: 0 },
    { name: '3-5年', min: 3, max: 4.99, count: 0 },
    { name: '5-10年', min: 5, max: 9.99, count: 0 },
    { name: '10年以上', min: 10, max: 100, count: 0 }
  ]

  filteredEmployees.value.forEach(emp => {
    const workYears = calculateWorkYears(emp.entryDate)
    const exactYears = (Date.now() - new Date(emp.entryDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    for (const range of tenureRanges) {
      if (exactYears >= range.min && exactYears <= range.max) {
        range.count++
        break
      }
    }
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}人'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: tenureRanges.map(r => r.name),
      axisLabel: {
        interval: 0,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        type: 'bar',
        data: tenureRanges.map(r => r.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10B981' },
            { offset: 1, color: '#34D399' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '50%'
      }
    ]
  }

  tenureChart.setOption(option)
}

function updateFunnelChart() {
  if (!funnelChart) return

  const totalEmployees = props.employees.filter(e => e.status === 'active' || e.status === 'probation')
  const deptFiltered = selectedDepartment.value
    ? totalEmployees.filter(e => e.department === selectedDepartment.value)
    : totalEmployees

  const probation = deptFiltered.filter(e => e.status === 'probation').length
  const active = deptFiltered.filter(e => e.status === 'active').length

  const historicalProbation = Math.round(deptFiltered.length * 0.3)
  const converted = active

  const funnelData = [
    { value: deptFiltered.length, name: '入职总人数' },
    { value: historicalProbation + probation, name: '进入试用期' },
    { value: converted + Math.round(probation * 0.8), name: '通过考核' },
    { value: converted, name: '正式员工' }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人'
    },
    legend: {
      top: '0',
      left: 'center'
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 20,
        width: '80%',
        min: 0,
        max: Math.max(...funnelData.map(d => d.value)) * 1.1,
        minSize: '20%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}人',
          fontSize: 12,
          color: '#fff'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 14
          }
        },
        data: funnelData,
        color: ['#8B5CF6', '#6366F1', '#3B82F6', '#10B981']
      }
    ]
  }

  funnelChart.setOption(option)
}

function updateAllCharts() {
  updateGenderChart()
  updateAgeChart()
  updateLevelChart()
  updateTenureChart()
  updateFunnelChart()
}

function handleResize() {
  genderChart?.resize()
  ageChart?.resize()
  levelChart?.resize()
  tenureChart?.resize()
  funnelChart?.resize()
}

watch([() => props.employees, selectedDepartment], () => {
  updateAllCharts()
}, { deep: true })

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  genderChart?.dispose()
  ageChart?.dispose()
  levelChart?.dispose()
  tenureChart?.dispose()
  funnelChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.personnel-structure-card {
  width: 100%;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-item :deep(.n-statistic__value) {
  font-size: 28px;
  font-weight: 700;
  color: #7C3AED;
}

.stat-item :deep(.n-statistic__label) {
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
}

.stat-suffix {
  font-size: 14px;
  font-weight: 500;
  color: #7C3AED;
  margin-left: 2px;
}

.chart-grid {
  margin-bottom: 16px;
}

.chart-card {
  height: 320px;
}

.chart-container {
  width: 100%;
  height: 240px;
}

.funnel-card {
  height: 380px;
}

.funnel-container {
  width: 100%;
  height: 300px;
}

@media (max-width: 1200px) {
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-grid {
    :deep(.n-grid) {
      grid-template-columns: 1fr !important;
    }
  }
}

@media (max-width: 640px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
