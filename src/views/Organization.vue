<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">组织架构</div>
      <n-space>
        <n-button @click="organizationStore.expandAll()">全部展开</n-button>
        <n-button @click="organizationStore.collapseAll()">全部收起</n-button>
      </n-space>
    </div>
    
    <n-card class="org-card">
      <div class="org-container">
        <template v-for="dept in organizationStore.departments" :key="dept.id">
          <div class="dept-level level-1">
            <div class="dept-node root-node">
              <div class="dept-header" @click="toggleExpand(dept.id)">
                <ChevronDown 
                  v-if="dept.children?.length" 
                  :size="20" 
                  :class="{ 'rotate-90': !organizationStore.isExpanded(dept.id) }"
                  class="expand-icon"
                />
                <div class="dept-icon root-icon">
                  <Building2 :size="24" color="#fff" />
                </div>
                <div class="dept-info">
                  <div class="dept-name">{{ dept.name }}</div>
                  <div class="dept-meta">
                    <span class="dept-manager">负责人：{{ dept.manager }}</span>
                    <span class="dept-count">{{ dept.employeeCount }} 人</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              v-if="dept.children && organizationStore.isExpanded(dept.id)" 
              class="dept-children level-2"
            >
              <div 
                v-for="child in dept.children" 
                :key="child.id"
                class="dept-item"
              >
                <div class="connect-line"></div>
                <div class="dept-node">
                  <div class="dept-header" @click="toggleExpand(child.id)">
                    <ChevronDown 
                      v-if="child.children?.length" 
                      :size="20" 
                      :class="{ 'rotate-90': !organizationStore.isExpanded(child.id) }"
                      class="expand-icon"
                    />
                    <div class="dept-icon">
                      <Users :size="20" color="#7C3AED" />
                    </div>
                    <div class="dept-info">
                      <div class="dept-name">{{ child.name }}</div>
                      <div class="dept-meta">
                        <span class="dept-manager">负责人：{{ child.manager }}</span>
                        <span class="dept-count">{{ child.employeeCount }} 人</span>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    v-if="child.children && organizationStore.isExpanded(child.id)" 
                    class="sub-depts"
                  >
                    <div 
                      v-for="sub in child.children" 
                      :key="sub.id"
                      class="sub-dept"
                    >
                      <div class="sub-dept-icon">
                        <User :size="16" color="#A78BFA" />
                      </div>
                      <div class="sub-dept-info">
                        <span class="sub-dept-name">{{ sub.name }}</span>
                        <span class="sub-dept-count">{{ sub.employeeCount }}人</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </n-card>
    
    <n-card title="部门统计" style="margin-top: 20px;">
      <div ref="chartRef" class="chart-container"></div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { Building2, Users, User, ChevronDown } from 'lucide-vue-next'
import { useOrganizationStore } from '@/stores/organization'
import type { Department } from '@/types'

const organizationStore = useOrganizationStore()
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function toggleExpand(deptId: string) {
  organizationStore.toggleExpand(deptId)
}

function buildChartData(departments: Department[]): any[] {
  function transform(dept: Department): any {
    const result: any = {
      name: dept.name,
      value: dept.employeeCount
    }
    if (dept.children && dept.children.length > 0) {
      result.children = dept.children.map(transform)
    }
    return result
  }
  return departments.map(transform)
}

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  
  const chartData = buildChartData(organizationStore.departments)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const total = organizationStore.departments[0]?.employeeCount || 1
        const percent = ((params.value / total) * 100).toFixed(1)
        return `${params.name}: ${params.value}人 (${percent}%)`
      }
    },
    series: [
      {
        name: '部门人数',
        type: 'sunburst',
        data: chartData,
        radius: [0, '90%'],
        center: ['50%', '50%'],
        levels: [
          {},
          {
            r0: '15%',
            r: '35%',
            itemStyle: {
              borderWidth: 2
            },
            label: {
              show: true,
              rotate: 'tangential'
            }
          },
          {
            r0: '35%',
            r: '70%',
            label: {
              show: true,
              position: 'outside',
              padding: 3,
              silent: false
            },
            itemStyle: {
              borderWidth: 2
            }
          },
          {
            r0: '70%',
            r: '72%',
            label: {
              show: false,
              position: 'inside'
            },
            itemStyle: {
              color: 'rgba(124, 58, 237, 0.8)'
            }
          }
        ],
        color: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE']
      }
    ]
  }
  
  chart.setOption(option)
}

onMounted(() => {
  initChart()
})

watch(() => organizationStore.departments, () => {
  if (chart) {
    const chartData = buildChartData(organizationStore.departments)
    chart.setOption({ series: [{ data: chartData }] })
  }
}, { deep: true })
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.org-card {
  min-height: 500px;
}

.org-container {
  padding: 20px;
}

.dept-level {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dept-node {
  background: white;
  border: 2px solid #DDD6FE;
  border-radius: 12px;
  min-width: 320px;
  transition: all 0.2s ease;
}

.dept-node:hover {
  border-color: #7C3AED;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
}

.dept-node.root-node {
  background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
  border: none;
  color: white;
}

.dept-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
}

.expand-icon {
  transition: transform 0.2s ease;
  color: #7C3AED;
}

.expand-icon.rotate-90 {
  transform: rotate(-90deg);
}

.root-node .expand-icon {
  color: white;
}

.dept-icon {
  width: 44px;
  height: 44px;
  background: #F5F3FF;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dept-icon.root-icon {
  background: rgba(255, 255, 255, 0.2);
}

.dept-info {
  flex: 1;
}

.dept-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.dept-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  opacity: 0.8;
}

.root-node .dept-meta {
  opacity: 0.9;
}

.dept-children {
  display: flex;
  gap: 20px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
}

.dept-children::before {
  content: '';
  position: absolute;
  top: -24px;
  left: 50%;
  width: 2px;
  height: 24px;
  background: #DDD6FE;
}

.dept-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connect-line {
  width: 2px;
  height: 16px;
  background: #DDD6FE;
}

.sub-depts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #EDE9FE;
  background: #F5F3FF;
  border-radius: 0 0 10px 10px;
}

.sub-dept {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
}

.sub-dept-icon {
  width: 28px;
  height: 28px;
  background: #EDE9FE;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-dept-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sub-dept-name {
  font-size: 14px;
  font-weight: 500;
  color: #1E1B4B;
}

.sub-dept-count {
  font-size: 12px;
  color: #7C3AED;
  background: #EDE9FE;
  padding: 2px 8px;
  border-radius: 10px;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
