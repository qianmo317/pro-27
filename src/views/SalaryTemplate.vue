<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">薪资结构模板</div>
      <n-space>
        <n-button type="primary" @click="openCreateModal">
          <template #icon>
            <Plus :size="16" />
          </template>
          新增模板
        </n-button>
      </n-space>
    </div>

    <n-card class="filter-card">
      <n-space :size="16" wrap>
        <n-input
          v-model:value="keyword"
          placeholder="搜索模板名称..."
          style="width: 240px;"
          clearable
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
        <n-select
          v-model:value="typeFilter"
          placeholder="模板类型"
          style="width: 160px;"
          clearable
          :options="TEMPLATE_TYPE_OPTIONS"
        />
        <n-select
          v-model:value="statusFilter"
          placeholder="状态"
          style="width: 140px;"
          clearable
          :options="TEMPLATE_STATUS_OPTIONS"
        />
      </n-space>
    </n-card>

    <n-grid :cols="1" :x-gap="20" :y-gap="20" style="margin-top: 20px;">
      <n-grid-item v-for="template in templateStore.filteredTemplates" :key="template.id">
        <n-card hoverable>
          <div class="template-header">
            <div class="template-info">
              <div class="template-name">
                {{ template.name }}
                <n-tag v-if="template.isDefault" size="small" type="success" style="margin-left: 8px;">
                  默认模板
                </n-tag>
              </div>
              <div class="template-meta">
                <n-tag size="small" :color="TEMPLATE_TYPE_COLORS[template.type]" style="opacity: 0.15; margin-right: 8px;">
                  <span :style="{ color: TEMPLATE_TYPE_COLORS[template.type] }">
                    {{ TEMPLATE_TYPE_LABELS[template.type] }}
                  </span>
                </n-tag>
                <n-tag size="small" :type="template.status === 'active' ? 'success' : 'default'">
                  {{ TEMPLATE_STATUS_LABELS[template.status] }}
                </n-tag>
              </div>
            </div>
            <n-dropdown :options="getActionOptions(template)" @select="(key) => handleAction(key, template)">
              <n-button quaternary circle>
                <MoreVertical :size="18" />
              </n-button>
            </n-dropdown>
          </div>

          <div v-if="template.description" class="template-desc">
            {{ template.description }}
          </div>

          <n-divider style="margin: 16px 0;" />

          <div class="template-content">
            <div class="section">
              <div class="section-title">适用范围</div>
              <div class="info-grid">
                <div class="info-item" v-if="template.applicableDepartment">
                  <span class="info-label">适用部门</span>
                  <span class="info-value">{{ template.applicableDepartment }}</span>
                </div>
                <div class="info-item" v-if="template.applicablePosition">
                  <span class="info-label">适用岗位</span>
                  <span class="info-value">{{ template.applicablePosition }}</span>
                </div>
                <div class="info-item" v-if="template.applicableLevel">
                  <span class="info-label">适用职级</span>
                  <span class="info-value">{{ template.applicableLevel }}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">薪资构成</div>
              <div class="salary-grid">
                <div class="salary-item">
                  <span class="salary-label">基本工资</span>
                  <span class="salary-value">¥ {{ formatNumber(template.baseSalary) }}</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">岗位津贴</span>
                  <span class="salary-value text-green">+ ¥ {{ formatNumber(template.postAllowance) }}</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">绩效系数</span>
                  <span class="salary-value">{{ (template.performanceCoefficient * 100).toFixed(0) }}%</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">餐补</span>
                  <span class="salary-value text-green">+ ¥ {{ formatNumber(template.mealAllowance) }}</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">交通补贴</span>
                  <span class="salary-value text-green">+ ¥ {{ formatNumber(template.transportationAllowance) }}</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">通讯补贴</span>
                  <span class="salary-value text-green">+ ¥ {{ formatNumber(template.communicationAllowance) }}</span>
                </div>
                <div class="salary-item" v-if="template.otherAllowance > 0">
                  <span class="salary-label">其他补贴</span>
                  <span class="salary-value text-green">+ ¥ {{ formatNumber(template.otherAllowance) }}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">扣除项</div>
              <div class="salary-grid">
                <div class="salary-item">
                  <span class="salary-label">社保比例</span>
                  <span class="salary-value text-red">{{ (template.socialSecurityRate * 100).toFixed(1) }}%</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">公积金比例</span>
                  <span class="salary-value text-red">{{ (template.housingFundRate * 100).toFixed(1) }}%</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">个税起征点</span>
                  <span class="salary-value">¥ {{ formatNumber(template.taxThreshold) }}</span>
                </div>
              </div>
            </div>

            <div class="section summary-section">
              <div class="summary-item">
                <span class="summary-label">预计月总收入</span>
                <span class="summary-value">¥ {{ formatNumber(estimateTotalIncome(template)) }}</span>
              </div>
            </div>
          </div>

          <div class="template-footer">
            <span class="footer-text">创建时间: {{ template.createdAt }}</span>
            <span class="footer-text">更新时间: {{ template.updatedAt }}</span>
            <span class="footer-text">创建人: {{ template.createdBy }}</span>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-empty v-if="templateStore.filteredTemplates.length === 0" description="暂无薪资模板" />

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑薪资模板' : '新增薪资模板'"
      style="width: 680px;"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="模板名称" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入模板名称" />
        </n-form-item>

        <n-form-item label="模板类型" path="type">
          <n-select v-model:value="formData.type" :options="TEMPLATE_TYPE_OPTIONS" />
        </n-form-item>

        <n-form-item label="适用部门" path="applicableDepartment">
          <n-select
            v-model:value="formData.applicableDepartment"
            :options="DEPARTMENT_OPTIONS"
            placeholder="请选择适用部门"
            clearable
          />
        </n-form-item>

        <n-form-item label="适用岗位" path="applicablePosition">
          <n-input v-model:value="formData.applicablePosition" placeholder="请输入适用岗位" clearable />
        </n-form-item>

        <n-form-item label="适用职级" path="applicableLevel">
          <n-select
            v-model:value="formData.applicableLevel"
            :options="POSITION_LEVEL_OPTIONS"
            placeholder="请选择适用职级"
            clearable
          />
        </n-form-item>

        <n-form-item label="模板描述" path="description">
          <n-input v-model:value="formData.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
        </n-form-item>

        <n-divider>薪资构成</n-divider>

        <n-form-item label="基本工资" path="baseSalary">
          <n-input-number v-model:value="formData.baseSalary" :min="0" :step="100" style="width: 100%;" />
        </n-form-item>

        <n-form-item label="岗位津贴" path="postAllowance">
          <n-input-number v-model:value="formData.postAllowance" :min="0" :step="100" style="width: 100%;" />
        </n-form-item>

        <n-form-item label="绩效系数" path="performanceCoefficient">
          <n-input-number
            v-model:value="formData.performanceCoefficient"
            :min="0"
            :max="2"
            :step="0.05"
            style="width: 100%;"
          >
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>

        <n-grid :cols="3" :x-gap="12">
          <n-form-item label="餐补" path="mealAllowance" label-placement="top">
            <n-input-number v-model:value="formData.mealAllowance" :min="0" :step="50" style="width: 100%;" />
          </n-form-item>
          <n-form-item label="交通补贴" path="transportationAllowance" label-placement="top">
            <n-input-number v-model:value="formData.transportationAllowance" :min="0" :step="50" style="width: 100%;" />
          </n-form-item>
          <n-form-item label="通讯补贴" path="communicationAllowance" label-placement="top">
            <n-input-number v-model:value="formData.communicationAllowance" :min="0" :step="50" style="width: 100%;" />
          </n-form-item>
        </n-grid>

        <n-form-item label="其他补贴" path="otherAllowance">
          <n-input-number v-model:value="formData.otherAllowance" :min="0" :step="100" style="width: 100%;" />
        </n-form-item>

        <n-divider>扣除项</n-divider>

        <n-grid :cols="2" :x-gap="12">
          <n-form-item label="社保比例" path="socialSecurityRate" label-placement="top">
            <n-input-number
              v-model:value="formData.socialSecurityRate"
              :min="0"
              :max="0.3"
              :step="0.005"
              style="width: 100%;"
            >
              <template #suffix>%</template>
            </n-input-number>
          </n-form-item>
          <n-form-item label="公积金比例" path="housingFundRate" label-placement="top">
            <n-input-number
              v-model:value="formData.housingFundRate"
              :min="0"
              :max="0.3"
              :step="0.005"
              style="width: 100%;"
            >
              <template #suffix>%</template>
            </n-input-number>
          </n-form-item>
        </n-grid>

        <n-form-item label="个税起征点" path="taxThreshold">
          <n-input-number v-model:value="formData.taxThreshold" :min="0" :step="100" style="width: 100%;" />
        </n-form-item>

        <n-form-item label="状态" path="status">
          <n-radio-group v-model:value="formData.status">
            <n-radio value="active">启用</n-radio>
            <n-radio value="inactive">停用</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="设为默认">
          <n-switch v-model:value="formData.isDefault" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showPreviewModal" preset="card" title="薪资预览" style="width: 560px;">
      <div v-if="previewData" class="preview-content">
        <div class="preview-section">
          <div class="preview-section-title">收入</div>
          <div class="preview-row">
            <span>基本工资</span>
            <span>¥ {{ formatNumber(previewData.baseSalary) }}</span>
          </div>
          <div class="preview-row">
            <span>岗位津贴</span>
            <span class="text-green">+ ¥ {{ formatNumber(previewData.postAllowance) }}</span>
          </div>
          <div class="preview-row">
            <span>绩效奖金 (1.0倍)</span>
            <span class="text-green">+ ¥ {{ formatNumber(previewData.performanceBonus) }}</span>
          </div>
          <div class="preview-row">
            <span>其他补贴</span>
            <span class="text-green">+ ¥ {{ formatNumber(previewData.otherAllowance) }}</span>
          </div>
          <n-divider style="margin: 12px 0;" />
          <div class="preview-row total-row">
            <span>应发合计</span>
            <span>¥ {{ formatNumber(previewData.grossSalary) }}</span>
          </div>
        </div>

        <div class="preview-section">
          <div class="preview-section-title">扣除</div>
          <div class="preview-row">
            <span>社保</span>
            <span class="text-red">- ¥ {{ formatNumber(previewData.socialSecurity) }}</span>
          </div>
          <div class="preview-row">
            <span>公积金</span>
            <span class="text-red">- ¥ {{ formatNumber(previewData.housingFund) }}</span>
          </div>
          <div class="preview-row">
            <span>个税</span>
            <span class="text-red">- ¥ {{ formatNumber(previewData.incomeTax) }}</span>
          </div>
          <n-divider style="margin: 12px 0;" />
          <div class="preview-row total-row">
            <span>扣款合计</span>
            <span class="text-red">- ¥ {{ formatNumber(previewData.totalDeduction) }}</span>
          </div>
        </div>

        <div class="preview-section net-section">
          <div class="preview-row">
            <span class="net-label">实发工资</span>
            <span class="net-value">¥ {{ formatNumber(previewData.netSalary) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showPreviewModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Search, Plus, MoreVertical } from 'lucide-vue-next'
import { useSalaryTemplateStore } from '@/stores/salary-template'
import { useMessage, useDialog } from 'naive-ui'
import type { FormInst, FormRules, DropdownOption } from 'naive-ui'
import type { SalaryTemplate } from '@/types'
import {
  TEMPLATE_TYPE_OPTIONS,
  TEMPLATE_TYPE_LABELS,
  TEMPLATE_TYPE_COLORS,
  TEMPLATE_STATUS_OPTIONS,
  TEMPLATE_STATUS_LABELS,
  DEPARTMENT_OPTIONS,
  POSITION_LEVEL_OPTIONS
} from '@/types'

const templateStore = useSalaryTemplateStore()
const message = useMessage()
const dialog = useDialog()

const keyword = ref('')
const typeFilter = ref<SalaryTemplate['type'] | ''>('')
const statusFilter = ref<SalaryTemplate['status'] | ''>('')
const showModal = ref(false)
const showPreviewModal = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInst | null>(null)
const previewData = ref<any>(null)

const formData = reactive<Partial<SalaryTemplate>>({
  name: '',
  type: 'custom',
  applicableDepartment: undefined,
  applicablePosition: undefined,
  applicableLevel: undefined,
  description: '',
  baseSalary: 10000,
  postAllowance: 1000,
  performanceCoefficient: 0.15,
  mealAllowance: 500,
  transportationAllowance: 300,
  communicationAllowance: 200,
  otherAllowance: 0,
  socialSecurityRate: 0.08,
  housingFundRate: 0.12,
  taxThreshold: 5000,
  isDefault: false,
  status: 'active'
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  baseSalary: [{ required: true, message: '请输入基本工资', trigger: 'blur' }]
}

watch(keyword, val => templateStore.setKeywordFilter(val))
watch(typeFilter, val => templateStore.setTypeFilter(val))
watch(statusFilter, val => templateStore.setStatusFilter(val))

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

function estimateTotalIncome(template: SalaryTemplate): number {
  return template.baseSalary + template.postAllowance +
    template.mealAllowance + template.transportationAllowance +
    template.communicationAllowance + template.otherAllowance +
    Math.round(template.baseSalary * template.performanceCoefficient)
}

function getActionOptions(template: SalaryTemplate): DropdownOption[] {
  const options: DropdownOption[] = [
    { label: '预览薪资', key: 'preview' },
    { label: '编辑', key: 'edit' },
    { label: '复制', key: 'copy' },
    { type: 'divider', key: 'divider' }
  ]
  if (template.status === 'active') {
    options.push({ label: '停用', key: 'disable', props: { style: 'color: #F59E0B;' } })
  } else {
    options.push({ label: '启用', key: 'enable', props: { style: 'color: #10B981;' } })
  }
  if (!template.isDefault) {
    options.push({ label: '设为默认', key: 'setDefault', props: { style: 'color: #3B82F6;' } })
  }
  options.push(
    { type: 'divider', key: 'divider2' },
    { label: '删除', key: 'delete', props: { style: 'color: #EF4444;' } }
  )
  return options
}

function handleAction(key: string | number, template: SalaryTemplate) {
  switch (key) {
    case 'preview':
      previewData.value = templateStore.calculateSalary(template, 1.0)
      showPreviewModal.value = true
      break
    case 'edit':
      openEditModal(template)
      break
    case 'copy':
      templateStore.copyTemplate(template.id)
      message.success('模板复制成功')
      break
    case 'enable':
      templateStore.updateTemplate(template.id, { status: 'active' })
      message.success('模板已启用')
      break
    case 'disable':
      templateStore.updateTemplate(template.id, { status: 'inactive' })
      message.success('模板已停用')
      break
    case 'setDefault':
      templateStore.updateTemplate(template.id, { isDefault: true })
      message.success('已设为默认模板')
      break
    case 'delete':
      dialog.warning({
        title: '确认删除',
        content: `确定要删除模板「${template.name}」吗？此操作不可恢复。`,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: () => {
          templateStore.deleteTemplate(template.id)
          message.success('模板已删除')
        }
      })
      break
  }
}

function openCreateModal() {
  isEdit.value = false
  editingId.value = null
  Object.assign(formData, {
    name: '',
    type: 'custom',
    applicableDepartment: undefined,
    applicablePosition: undefined,
    applicableLevel: undefined,
    description: '',
    baseSalary: 10000,
    postAllowance: 1000,
    performanceCoefficient: 0.15,
    mealAllowance: 500,
    transportationAllowance: 300,
    communicationAllowance: 200,
    otherAllowance: 0,
    socialSecurityRate: 0.08,
    housingFundRate: 0.12,
    taxThreshold: 5000,
    isDefault: false,
    status: 'active'
  })
  showModal.value = true
}

function openEditModal(template: SalaryTemplate) {
  isEdit.value = true
  editingId.value = template.id
  Object.assign(formData, { ...template })
  showModal.value = true
}

function handleSave() {
  formRef.value?.validate(errors => {
    if (!errors) {
      if (isEdit.value && editingId.value) {
        templateStore.updateTemplate(editingId.value, formData as SalaryTemplate)
        message.success('模板更新成功')
      } else {
        templateStore.addTemplate(formData as Omit<SalaryTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>)
        message.success('模板创建成功')
      }
      showModal.value = false
    }
  })
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1E1B4B;
}

.filter-card {
  margin-bottom: 16px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 18px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 8px;
}

.template-meta {
  display: flex;
  align-items: center;
}

.template-desc {
  margin-top: 12px;
  color: #6B7280;
  font-size: 14px;
  line-height: 1.5;
}

.template-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #9CA3AF;
}

.info-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.salary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.salary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
}

.salary-label {
  font-size: 13px;
  color: #6B7280;
}

.salary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.text-green {
  color: #10B981;
}

.text-red {
  color: #EF4444;
}

.summary-section {
  background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
  color: white;
}

.summary-section .section-title {
  color: white;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 16px;
  opacity: 0.9;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
}

.template-footer {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.footer-text {
  font-size: 12px;
  color: #9CA3AF;
}

.preview-content {
  padding: 8px 0;
}

.preview-section {
  margin-bottom: 20px;
}

.preview-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.preview-row.total-row {
  font-weight: 600;
  font-size: 15px;
  color: #7C3AED;
}

.net-section {
  background: #FAF5FF;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.net-label {
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.net-value {
  font-size: 28px;
  font-weight: 700;
  color: #7C3AED;
}
</style>
