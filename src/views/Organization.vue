<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">组织架构</div>
      <n-space>
        <n-button v-if="editMode" @click="handleResetLayout">
          <template #icon>
            <RotateCcw :size="16" />
          </template>
          重置布局
        </n-button>
        <n-button :type="editMode ? 'default' : 'primary'" @click="toggleEditMode">
          <template #icon>
            <Edit3 :size="16" />
          </template>
          {{ editMode ? '退出编辑' : '编辑模式' }}
        </n-button>
        <n-button @click="organizationStore.expandAll()">全部展开</n-button>
        <n-button @click="organizationStore.collapseAll()">全部收起</n-button>
      </n-space>
    </div>
    
    <n-card class="org-card">
      <div class="org-toolbar" v-if="editMode">
        <n-space>
          <n-button type="primary" size="small" @click="handleAddRoot">
            <template #icon>
              <Plus :size="14" />
            </template>
            新增根部门
          </n-button>
          <n-tag>拖拽节点可调整位置，拖拽到其他部门可调整上下级关系</n-tag>
        </n-space>
      </div>
      
      <div 
        ref="orgContainerRef"
        class="org-container" 
        :class="{ 'edit-mode': editMode, 'drag-mode': isDragging }"
        @dragover.prevent
        @drop="handleContainerDrop"
      >
        <template v-for="dept in organizationStore.departments" :key="dept.id">
          <div 
            class="dept-level level-1"
            :style="getDeptStyle(dept)"
          >
            <div 
              class="dept-node root-node"
              :class="{ 
                'dragging': dragState.draggingId === dept.id,
                'drag-over': dragState.overId === dept.id && dragState.draggingId !== dept.id
              }"
              :draggable="editMode"
              @dragstart="(e) => handleDragStart(e, dept)"
              @dragend="handleDragEnd"
              @dragover.prevent="(e) => handleDragOver(e, dept)"
              @dragleave="handleDragLeave"
              @drop="(e) => handleDrop(e, dept)"
            >
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
                <div class="dept-actions" v-if="editMode" @click.stop>
                  <n-space :size="4">
                    <n-button 
                      quaternary 
                      size="tiny" 
                      @click.stop="handleAddChild(dept)"
                      title="添加子部门"
                    >
                      <template #icon>
                        <FolderPlus :size="14" />
                      </template>
                    </n-button>
                    <n-button 
                      quaternary 
                      size="tiny" 
                      @click.stop="handleEdit(dept)"
                      title="编辑部门"
                    >
                      <template #icon>
                        <Pencil :size="14" />
                      </template>
                    </n-button>
                    <n-popconfirm
                      positive-text="确定"
                      negative-text="取消"
                      @positive-click="handleDelete(dept)"
                    >
                      <template #trigger>
                        <n-button 
                          quaternary 
                          size="tiny" 
                          title="删除部门"
                        >
                          <template #icon>
                            <Trash2 :size="14" />
                          </template>
                        </n-button>
                      </template>
                      确定要删除「{{ dept.name }}」吗？其下所有子部门也将被删除，相关员工的部门信息将被清空。
                    </n-popconfirm>
                  </n-space>
                </div>
              </div>
              
              <div 
                class="drag-handle" 
                v-if="editMode"
                @mousedown.stop="startPositionDrag($event, dept)"
              >
                <Move :size="14" />
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
                :style="getDeptStyle(child)"
              >
                <div class="connect-line"></div>
                <div 
                  class="dept-node"
                  :class="{ 
                    'dragging': dragState.draggingId === child.id,
                    'drag-over': dragState.overId === child.id && dragState.draggingId !== child.id
                  }"
                  :draggable="editMode"
                  @dragstart="(e) => handleDragStart(e, child)"
                  @dragend="handleDragEnd"
                  @dragover.prevent="(e) => handleDragOver(e, child)"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, child)"
                >
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
                    <div class="dept-actions" v-if="editMode" @click.stop>
                      <n-space :size="4">
                        <n-button 
                          quaternary 
                          size="tiny" 
                          @click.stop="handleAddChild(child)"
                          title="添加子部门"
                        >
                          <template #icon>
                            <FolderPlus :size="14" />
                          </template>
                        </n-button>
                        <n-button 
                          quaternary 
                          size="tiny" 
                          @click.stop="handleEdit(child)"
                          title="编辑部门"
                        >
                          <template #icon>
                            <Pencil :size="14" />
                          </template>
                        </n-button>
                        <n-popconfirm
                          positive-text="确定"
                          negative-text="取消"
                          @positive-click="handleDelete(child)"
                        >
                          <template #trigger>
                            <n-button 
                              quaternary 
                              size="tiny" 
                              title="删除部门"
                            >
                              <template #icon>
                                <Trash2 :size="14" />
                              </template>
                            </n-button>
                          </template>
                          确定要删除「{{ child.name }}」吗？其下所有子部门也将被删除，相关员工的部门信息将被清空。
                        </n-popconfirm>
                      </n-space>
                    </div>
                  </div>
                  
                  <div 
                    class="drag-handle" 
                    v-if="editMode"
                    @mousedown.stop="startPositionDrag($event, child)"
                  >
                    <Move :size="14" />
                  </div>
                  
                  <div 
                    v-if="child.children && organizationStore.isExpanded(child.id)" 
                    class="sub-depts"
                  >
                    <div 
                      v-for="sub in child.children" 
                      :key="sub.id"
                      class="sub-dept"
                      :class="{ 
                        'dragging': dragState.draggingId === sub.id,
                        'drag-over': dragState.overId === sub.id && dragState.draggingId !== sub.id
                      }"
                      :draggable="editMode"
                      @dragstart="(e) => handleDragStart(e, sub)"
                      @dragend="handleDragEnd"
                      @dragover.prevent="(e) => handleDragOver(e, sub)"
                      @dragleave="handleDragLeave"
                      @drop="(e) => handleDrop(e, sub)"
                    >
                      <div class="sub-dept-icon">
                        <User :size="16" color="#A78BFA" />
                      </div>
                      <div class="sub-dept-info">
                        <span class="sub-dept-name">{{ sub.name }}</span>
                        <span class="sub-dept-count">{{ sub.employeeCount }}人</span>
                      </div>
                      <div class="sub-dept-actions" v-if="editMode" @click.stop>
                        <n-space :size="2">
                          <n-button 
                            quaternary 
                            size="tiny" 
                            @click.stop="handleEdit(sub)"
                            title="编辑部门"
                          >
                            <template #icon>
                              <Pencil :size="12" />
                            </template>
                          </n-button>
                          <n-popconfirm
                            positive-text="确定"
                            negative-text="取消"
                            @positive-click="handleDelete(sub)"
                          >
                            <template #trigger>
                              <n-button 
                                quaternary 
                                size="tiny" 
                                title="删除部门"
                              >
                                <template #icon>
                                  <Trash2 :size="12" />
                                </template>
                              </n-button>
                            </template>
                            确定要删除「{{ sub.name }}」吗？
                          </n-popconfirm>
                        </n-space>
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
    
    <n-modal 
      v-model:show="showDeptModal" 
      preset="card" 
      :title="isEditing ? '编辑部门' : '新增部门'" 
      style="width: 500px;"
      :mask-closable="false"
    >
      <n-form
        ref="deptFormRef"
        :model="deptFormData"
        :rules="deptFormRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="部门名称" path="name">
          <n-input v-model:value="deptFormData.name" placeholder="请输入部门名称" />
        </n-form-item>
        <n-form-item label="上级部门" path="parentId">
          <n-select 
            v-model:value="deptFormData.parentId" 
            placeholder="请选择上级部门（不选则为根部门）" 
            :options="parentDeptOptions"
            clearable
          />
        </n-form-item>
        <n-form-item label="部门负责人" path="managerId">
          <n-select 
            v-model:value="deptFormData.managerId" 
            placeholder="请从员工列表选择" 
            :options="employeeOptions"
            filterable
            label-field="label"
            value-field="value"
          >
            <template #render-label="{ option }">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img 
                  :src="option.avatar" 
                  style="width: 24px; height: 24px; border-radius: 50%;" 
                />
                <div>
                  <div style="font-weight: 500;">{{ option.label }}</div>
                  <div style="font-size: 12px; color: #999;">
                    {{ option.department }} · {{ option.position }}
                  </div>
                </div>
              </div>
            </template>
          </n-select>
        </n-form-item>
        <n-form-item v-if="deptFormData.managerId" label="负责人姓名">
          <n-input :value="selectedManagerName" disabled />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeptModal = false">取消</n-button>
          <n-button type="primary" @click="handleDeptSubmit">确认</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { 
  Building2, Users, User, ChevronDown, Plus, Edit3, 
  Pencil, Trash2, FolderPlus, Move, RotateCcw 
} from 'lucide-vue-next'
import { useOrganizationStore } from '@/stores/organization'
import { useEmployeeStore } from '@/stores/employee'
import type { Department, Employee } from '@/types'
import { useMessage } from 'naive-ui'

const organizationStore = useOrganizationStore()
const employeeStore = useEmployeeStore()
const message = useMessage()

const chartRef = ref<HTMLDivElement | null>(null)
const orgContainerRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const editMode = ref(false)
const isDragging = ref(false)
const isPositionDragging = ref(false)
const positionDragState = reactive({
  deptId: '',
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0
})

const dragState = reactive({
  draggingId: '',
  overId: ''
})

const showDeptModal = ref(false)
const isEditing = ref(false)
const editingDeptId = ref<string | null>(null)
const deptFormRef = ref<any>(null)

const deptFormData = reactive({
  name: '',
  parentId: null as string | null,
  managerId: undefined as string | undefined
})

const deptFormRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ]
}

const employeeOptions = computed(() => {
  return employeeStore.employees.map(emp => ({
    label: emp.name,
    value: emp.id,
    avatar: emp.avatar,
    department: emp.department,
    position: emp.position
  }))
})

const parentDeptOptions = computed(() => {
  const currentId = editingDeptId.value
  const excludeIds = currentId ? [currentId, ...organizationStore.getAllSubDepartmentIds(currentId)] : []
  
  return organizationStore.flatDepartments
    .filter(d => !excludeIds.includes(d.id))
    .map(d => ({
      label: d.name,
      value: d.id
    }))
})

const selectedManagerName = computed(() => {
  if (!deptFormData.managerId) return ''
  const emp = employeeStore.getEmployeeById(deptFormData.managerId)
  return emp?.name || ''
})

function toggleEditMode() {
  editMode.value = !editMode.value
  if (!editMode.value) {
    isPositionDragging.value = false
  }
}

function toggleExpand(deptId: string) {
  if (isPositionDragging.value) return
  organizationStore.toggleExpand(deptId)
}

function handleAddRoot() {
  isEditing.value = false
  editingDeptId.value = null
  deptFormData.name = ''
  deptFormData.parentId = null
  deptFormData.managerId = undefined
  showDeptModal.value = true
}

function handleAddChild(dept: Department) {
  isEditing.value = false
  editingDeptId.value = null
  deptFormData.name = ''
  deptFormData.parentId = dept.id
  deptFormData.managerId = undefined
  showDeptModal.value = true
}

function handleEdit(dept: Department) {
  isEditing.value = true
  editingDeptId.value = dept.id
  deptFormData.name = dept.name
  deptFormData.parentId = dept.parentId
  deptFormData.managerId = dept.managerId
  showDeptModal.value = true
}

async function handleDeptSubmit() {
  try {
    await deptFormRef.value?.validate()
    
    const manager = deptFormData.managerId 
      ? employeeStore.getEmployeeById(deptFormData.managerId)
      : null
    
    if (isEditing.value && editingDeptId.value) {
      organizationStore.updateDepartment(editingDeptId.value, {
        name: deptFormData.name,
        parentId: deptFormData.parentId,
        manager: manager?.name || '',
        managerId: deptFormData.managerId
      })
      message.success('部门更新成功')
    } else {
      organizationStore.addDepartment({
        name: deptFormData.name,
        parentId: deptFormData.parentId,
        manager: manager?.name || '',
        managerId: deptFormData.managerId
      })
      message.success('部门创建成功')
    }
    
    showDeptModal.value = false
  } catch (e) {
    console.error(e)
  }
}

function handleDelete(dept: Department) {
  const subIds = organizationStore.getAllSubDepartmentIds(dept.id)
  const affectedCount = dept.employees?.length || 0
  
  organizationStore.deleteDepartment(dept.id)
  message.success(`部门删除成功，已清空 ${affectedCount} 名员工的部门信息`)
}

function handleDragStart(e: DragEvent, dept: Department) {
  if (!editMode.value) return
  isDragging.value = true
  dragState.draggingId = dept.id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dept.id)
  }
}

function handleDragEnd() {
  isDragging.value = false
  dragState.draggingId = ''
  dragState.overId = ''
}

function handleDragOver(e: DragEvent, dept: Department) {
  if (!editMode.value || dragState.draggingId === dept.id) return
  dragState.overId = dept.id
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function handleDragLeave() {
  dragState.overId = ''
}

function handleDrop(e: DragEvent, targetDept: Department) {
  e.stopPropagation()
  if (!editMode.value) return
  
  const sourceId = dragState.draggingId
  const targetId = targetDept.id
  
  if (!sourceId || sourceId === targetId) {
    handleDragEnd()
    return
  }
  
  const path = organizationStore.getDepartmentPath(targetId)
  if (path.includes(sourceId)) {
    message.error('不能将部门移动到其子部门下')
    handleDragEnd()
    return
  }
  
  organizationStore.moveDepartment(sourceId, targetId)
  message.success('部门层级已调整')
  handleDragEnd()
}

function handleContainerDrop(e: DragEvent) {
  if (!editMode.value) return
  
  const sourceId = dragState.draggingId
  if (!sourceId) {
    handleDragEnd()
    return
  }
  
  const sourceDept = organizationStore.getDepartmentById(sourceId)
  if (!sourceDept || sourceDept.parentId === null) {
    handleDragEnd()
    return
  }
  
  organizationStore.moveDepartment(sourceId, null)
  message.success('部门已调整为根部门')
  handleDragEnd()
}

function startPositionDrag(e: MouseEvent, dept: Department) {
  if (!editMode.value) return
  
  isPositionDragging.value = true
  positionDragState.deptId = dept.id
  positionDragState.startX = e.clientX
  positionDragState.startY = e.clientY
  
  const currentPos = organizationStore.savedLayouts[dept.id]
  positionDragState.offsetX = currentPos?.x || 0
  positionDragState.offsetY = currentPos?.y || 0
  
  document.addEventListener('mousemove', handlePositionDragMove)
  document.addEventListener('mouseup', handlePositionDragEnd)
}

function handlePositionDragMove(e: MouseEvent) {
  if (!isPositionDragging.value) return
  
  const deltaX = e.clientX - positionDragState.startX
  const deltaY = e.clientY - positionDragState.startY
  
  const newX = positionDragState.offsetX + deltaX
  const newY = positionDragState.offsetY + deltaY
  
  organizationStore.saveNodePosition(positionDragState.deptId, { x: newX, y: newY })
}

function handlePositionDragEnd() {
  isPositionDragging.value = false
  positionDragState.deptId = ''
  document.removeEventListener('mousemove', handlePositionDragMove)
  document.removeEventListener('mouseup', handlePositionDragEnd)
}

function getDeptStyle(dept: Department) {
  const pos = dept.position
  if (!pos) return {}
  return {
    transform: `translate(${pos.x}px, ${pos.y}px)`
  }
}

function handleResetLayout() {
  Object.keys(organizationStore.savedLayouts).forEach(key => {
    organizationStore.clearNodePosition(key)
  })
  message.success('布局已重置')
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

.org-toolbar {
  margin-bottom: 16px;
  padding: 12px;
  background: #F5F3FF;
  border-radius: 8px;
}

.org-container {
  padding: 20px;
  position: relative;
  overflow: auto;
  min-height: 400px;
  transition: background 0.2s ease;
}

.org-container.edit-mode {
  background: #FAFAFF;
  border: 2px dashed #DDD6FE;
  border-radius: 8px;
}

.org-container.drag-mode {
  background: #F0EEFF;
}

.dept-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s ease;
}

.dept-node {
  background: white;
  border: 2px solid #DDD6FE;
  border-radius: 12px;
  min-width: 320px;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
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

.dept-node.dragging {
  opacity: 0.5;
  transform: scale(1.02);
}

.dept-node.drag-over {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
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

.dept-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.dept-node:hover .dept-actions {
  opacity: 1;
}

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EDE9FE;
  border-radius: 4px;
  cursor: grab;
  color: #7C3AED;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.dept-node:hover .drag-handle {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
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
  transition: transform 0.15s ease;
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
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sub-dept:hover {
  border-color: #7C3AED;
}

.sub-dept.dragging {
  opacity: 0.5;
}

.sub-dept.drag-over {
  border-color: #10B981;
  background: #ECFDF5;
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
  flex: 1;
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

.sub-dept-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sub-dept:hover .sub-dept-actions {
  opacity: 1;
}

.chart-container {
  width: 100%;
  height: 400px;
}

:deep(.n-option) {
  height: auto;
  padding: 8px 12px;
}
</style>
