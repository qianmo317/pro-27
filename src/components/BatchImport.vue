<template>
  <n-modal
    :show="show"
    @update:show="handleUpdateShow"
    preset="card"
    :title="title"
    style="width: 900px;"
    :mask-closable="false"
  >
    <div class="batch-import">
      <div class="import-actions">
        <n-space>
          <n-button @click="handleDownloadTemplate">
            <template #icon>
              <Download :size="16" />
            </template>
            下载模板
          </n-button>
          <n-upload
            :show-file-list="false"
            :custom-request="handleUpload"
            accept=".xlsx,.xls"
            :max="1"
          >
            <n-button type="primary">
              <template #icon>
                <Upload :size="16" />
              </template>
              选择文件
            </n-button>
          </n-upload>
        </n-space>
        <div class="import-tip">
          <n-alert type="info" :bordered="false" size="small">
            请下载模板后按格式填写，带 * 号的为必填项。仅支持 .xlsx 和 .xls 格式。
          </n-alert>
        </div>
      </div>

      <div v-if="parseResult" class="import-result">
        <n-divider />
        <div class="result-summary">
          <n-space>
            <n-statistic label="总条数" :value="totalCount" />
            <n-statistic label="成功条数" :value="parseResult.success.length" :value-style="{ color: '#10B981' }" />
            <n-statistic label="失败条数" :value="parseResult.errors.length" :value-style="{ color: '#EF4444' }" />
          </n-space>
        </div>

        <div v-if="parseResult.success.length > 0" class="result-section">
          <div class="section-title">
            <CheckCircle :size="18" color="#10B981" />
            <span>待导入数据（{{ parseResult.success.length }} 条）</span>
          </div>
          <div class="table-wrapper">
            <n-data-table
              :columns="previewColumns"
              :data="parseResult.success"
              :bordered="false"
              size="small"
              :max-height="200"
            />
          </div>
        </div>

        <div v-if="parseResult.errors.length > 0" class="result-section">
          <div class="section-title error">
            <XCircle :size="18" color="#EF4444" />
            <span>错误数据（{{ parseResult.errors.length }} 条）</span>
          </div>
          <div class="table-wrapper">
            <n-data-table
              :columns="errorColumns"
              :data="parseResult.errors"
              :bordered="false"
              size="small"
              :max-height="200"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">取消</n-button>
        <n-button
          v-if="parseResult && parseResult.success.length > 0"
          type="primary"
          :loading="importing"
          @click="handleConfirmImport"
        >
          确认导入（{{ parseResult.success.length }} 条）
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, Upload, CheckCircle, XCircle } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { parseExcel, downloadTemplate, type ExcelColumn, type ImportResult } from '@/lib/excel'

const props = defineProps<{
  show: boolean
  title?: string
  columns: ExcelColumn[]
  templateFileName: string
  exampleData?: any[]
  validateFn?: (data: any[]) => Promise<{ success: any[]; errors: { row: number; message: string; data: any }[]}>
  onImport: (data: any[]) => Promise<void> | void
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'success': [data: { successCount: number; errors: any[] }]
}>()

const message = useMessage()
const parseResult = ref<ImportResult<any> | null>(null)
const importing = ref(false)

const totalCount = computed(() => {
  if (!parseResult.value) return 0
  return parseResult.value.success.length + parseResult.value.errors.length
})

const previewColumns = computed<DataTableColumns>(() => {
  return props.columns.map(col => ({
    title: col.required ? `${col.title}*` : col.title,
    key: String(col.key),
    render: (row: any) => {
      const value = row[col.key as string]
      if (col.type === 'select' && col.options) {
        const option = col.options.find(o => o.value === value)
        return option?.label ?? value ?? ''
      }
      if (col.formatter) {
        return col.formatter(value)
      }
      return value ?? ''
    }
  }))
})

const errorColumns = computed<DataTableColumns>(() => {
  const cols: DataTableColumns = [
    {
      title: '行号',
      key: 'row',
      width: 80
    },
    ...props.columns.map(col => ({
      title: col.required ? `${col.title}*` : col.title,
      key: `data_${String(col.key)}`,
      render: (row: any) => {
        const value = row.data?.[col.key as string]
        if (col.type === 'select' && col.options) {
          const option = col.options.find(o => o.value === value)
          return option?.label ?? value ?? ''
        }
        if (col.formatter) {
          return col.formatter(value)
        }
        return value ?? ''
      }
    })),
    {
      title: '错误信息',
      key: 'message',
      width: 200,
      render: (row: any) => {
        return `<span style="color: #EF4444;">${row.message}</span>`
      }
    }
  ]
  return cols
})

function handleUpdateShow(value: boolean) {
  if (!value) {
    parseResult.value = null
  }
  emit('update:show', value)
}

function handleClose() {
  emit('update:show', false)
}

function handleDownloadTemplate() {
  downloadTemplate(props.columns, props.templateFileName, props.exampleData)
  message.success('模板下载成功')
}

async function handleUpload(options: any) {
  const file = options.file?.file as File
  if (!file) return

  try {
    const result = await parseExcel(file, props.columns)
    
    if (props.validateFn) {
      const validateResult = await props.validateFn(result.success)
      result.success = validateResult.success
      result.errors = [...result.errors, ...validateResult.errors]
    }

    parseResult.value = result

    if (result.success.length === 0 && result.errors.length > 0) {
      message.warning(`解析完成，但所有 ${result.errors.length} 条数据都有错误，请检查后重新上传`)
    } else if (result.errors.length > 0) {
      message.info(`解析完成：成功 ${result.success.length} 条，失败 ${result.errors.length} 条`)
    } else {
      message.success(`解析完成：共 ${result.success.length} 条数据`)
    }
  } catch (error) {
    console.error('Parse error:', error)
    message.error('文件解析失败，请检查文件格式')
  }
}

async function handleConfirmImport() {
  if (!parseResult.value || parseResult.value.success.length === 0) return

  importing.value = true
  try {
    await props.onImport(parseResult.value.success)
    message.success(`成功导入 ${parseResult.value.success.length} 条数据`)
    emit('success', {
      successCount: parseResult.value.success.length,
      errors: parseResult.value.errors
    })
    emit('update:show', false)
    parseResult.value = null
  } catch (error) {
    console.error('Import error:', error)
    message.error('导入失败，请稍后重试')
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.batch-import {
  text-align: left;
}

.import-actions {
  margin-bottom: 16px;
}

.import-tip {
  margin-top: 12px;
}

.import-result {
  margin-top: 16px;
}

.result-summary {
  padding: 16px 0;
}

.result-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.section-title.error {
  color: #ef4444;
}

.table-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
