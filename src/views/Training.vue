<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">培训管理</div>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <Plus :size="16" />
        </template>
        新增课程
      </n-button>
    </div>
    
    <n-tabs v-model:value="activeTab" type="segment" style="margin-bottom: 20px;">
      <n-tab-pane name="all" tab="全部课程" />
      <n-tab-pane name="upcoming" tab="即将开始" />
      <n-tab-pane name="ongoing" tab="进行中" />
      <n-tab-pane name="completed" tab="已完成" />
    </n-tabs>
    
    <n-grid :cols="3" :x-gap="20" :y-gap="20">
      <n-grid-item v-for="course in filteredCourses" :key="course.id">
        <n-card class="course-card">
          <template #cover>
            <div class="course-cover" :class="course.status">
              <BookOpen :size="48" color="#fff" />
            </div>
          </template>
          
          <div class="course-content">
            <div class="course-header">
              <h3 class="course-title">{{ course.title }}</h3>
              <n-tag size="small" :type="statusTypeMap[course.status]">
                {{ statusLabelMap[course.status] }}
              </n-tag>
            </div>
            
            <p class="course-desc">{{ course.description }}</p>
            
            <n-divider style="margin: 12px 0;" />
            
            <div class="course-meta">
              <div class="meta-item">
                <User :size="14" />
                <span>{{ course.instructor }}</span>
              </div>
              <div class="meta-item">
                <Users :size="14" />
                <span>{{ course.participants }} 人参与</span>
              </div>
            </div>
            
            <div class="course-date">
              <Calendar :size="14" />
              <span>{{ course.startDate }} ~ {{ course.endDate }}</span>
            </div>
          </div>
          
          <template #footer>
            <n-space justify="end">
              <n-button size="small" text @click.stop="openDetail(course)">查看详情</n-button>
              <n-button size="small" type="primary" :disabled="course.status === 'completed'" @click.stop="handleEnroll(course)">报名参加</n-button>
            </n-space>
          </template>
        </n-card>
      </n-grid-item>
    </n-grid>
    
    <n-modal v-model:show="showAddModal" preset="card" title="新增课程" style="width: 560px;">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="课程名称" path="title">
          <n-input v-model:value="formData.title" placeholder="请输入课程名称" />
        </n-form-item>
        <n-form-item label="课程描述" path="description">
          <n-input v-model:value="formData.description" type="textarea" placeholder="请输入课程描述" />
        </n-form-item>
        <n-form-item label="讲师" path="instructor">
          <n-input v-model:value="formData.instructor" placeholder="请输入讲师姓名" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="formData.status" placeholder="请选择" style="width: 100%;" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="开始日期" path="startDate">
          <n-date-picker v-model:value="formData.startDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="结束日期" path="endDate">
          <n-date-picker v-model:value="formData.endDate" type="date" style="width: 100%;" />
        </n-form-item>
      </n-form>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认添加</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <n-modal v-model:show="showDetailModal" preset="card" :title="detailCourse?.title" style="width: 700px;">
      <template v-if="detailCourse">
        <n-tabs v-model:value="activeDetailTab" type="line">
          <n-tab-pane name="info" tab="课程信息">
            <n-descriptions bordered :column="1" label-placement="left">
              <n-descriptions-item label="课程名称">{{ detailCourse.title }}</n-descriptions-item>
              <n-descriptions-item label="课程描述">{{ detailCourse.description }}</n-descriptions-item>
              <n-descriptions-item label="讲师">{{ detailCourse.instructor }}</n-descriptions-item>
              <n-descriptions-item label="课程状态">
                <n-tag size="small" :type="statusTypeMap[detailCourse.status]">
                  {{ statusLabelMap[detailCourse.status] }}
                </n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="开始日期">{{ detailCourse.startDate }}</n-descriptions-item>
              <n-descriptions-item label="结束日期">{{ detailCourse.endDate }}</n-descriptions-item>
              <n-descriptions-item label="参与人数">{{ detailCourse.participants }} 人</n-descriptions-item>
            </n-descriptions>
          </n-tab-pane>
          
          <n-tab-pane name="materials" tab="课程资料">
            <AttachmentManager
              v-if="detailCourse"
              owner-type="training"
              :owner-id="detailCourse.id"
              title="培训资料管理"
              :allowed-categories="['training_material', 'other']"
            />
          </n-tab-pane>
        </n-tabs>
      </template>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" :disabled="detailCourse?.status === 'completed'" @click="handleEnrollFromDetail">报名参加</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, BookOpen, User, Users, Calendar } from 'lucide-vue-next'
import { useTrainingStore } from '@/stores/training'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import type { TrainingCourse } from '@/types'
import AttachmentManager from '@/components/AttachmentManager.vue'

const trainingStore = useTrainingStore()
const message = useMessage()

const statusOptions = [
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已完成', value: 'completed' }
]

function formatDate(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const activeTab = ref('all')
const activeDetailTab = ref('info')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const detailCourse = ref<TrainingCourse | null>(null)
const formRef = ref<FormInst | null>(null)

const formData = ref<Partial<TrainingCourse>>({
  title: '',
  description: '',
  instructor: '',
  status: 'upcoming',
  startDate: null,
  endDate: null,
  participants: 0
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  instructor: [{ required: true, message: '请输入讲师姓名', trigger: 'blur' }],
  startDate: [{ required: true, type: 'number', message: '请选择开始日期', trigger: ['change', 'blur'] }],
  endDate: [{ required: true, type: 'number', message: '请选择结束日期', trigger: ['change', 'blur'] }]
}

const statusTypeMap: Record<string, any> = {
  upcoming: 'warning',
  ongoing: 'info',
  completed: 'success'
}

const statusLabelMap: Record<string, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已完成'
}

const filteredCourses = computed(() => {
  if (activeTab.value === 'all') {
    return trainingStore.courses
  }
  return trainingStore.courses.filter(c => c.status === activeTab.value)
})

function handleAdd() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const startDate = typeof formData.value.startDate === 'number' 
        ? formatDate(formData.value.startDate as number)
        : formData.value.startDate || ''
      const endDate = typeof formData.value.endDate === 'number' 
        ? formatDate(formData.value.endDate as number)
        : formData.value.endDate || ''
      
      trainingStore.addCourse({
        ...formData.value,
        startDate,
        endDate
      } as Omit<TrainingCourse, 'id'>)
      message.success('添加成功')
      showAddModal.value = false
      formData.value = {
        title: '',
        description: '',
        instructor: '',
        status: 'upcoming',
        startDate: null,
        endDate: null,
        participants: 0
      }
    }
  })
}

function openDetail(course: TrainingCourse) {
  detailCourse.value = { ...course }
  activeDetailTab.value = 'info'
  showDetailModal.value = true
}

function handleEnroll(course: TrainingCourse) {
  if (course.status === 'completed') {
    message.warning('该课程已结束，无法报名')
    return
  }
  trainingStore.enrollCourse(course.id)
  message.success(`已成功报名「${course.title}」`)
}

function handleEnrollFromDetail() {
  if (!detailCourse.value) return
  handleEnroll(detailCourse.value)
  detailCourse.value = { ...detailCourse.value, participants: detailCourse.value.participants + 1 }
  showDetailModal.value = false
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-card {
  height: 100%;
}

.course-cover {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
}

.course-cover.upcoming {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
}

.course-cover.ongoing {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
}

.course-cover.completed {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.course-content {
  padding: 8px 0;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
  margin: 0;
  flex: 1;
}

.course-desc {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
}

.course-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #7C3AED;
  font-weight: 500;
}
</style>
