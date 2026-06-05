<template>
  <div class="attachment-manager">
    <div class="manager-header">
      <div class="header-left">
        <div class="manager-title">
          <Paperclip :size="20" class="title-icon" />
          <span>{{ title }}</span>
          <n-tag v-if="attachments.length > 0" size="small" type="info">
            {{ attachments.length }} 个文件
          </n-tag>
        </div>
      </div>
      <div class="header-right">
        <n-space :size="12">
          <n-select
            v-model:value="selectedCategory"
            placeholder="筛选分类"
            clearable
            style="width: 160px;"
            size="small"
            :options="categoryFilterOptions"
          />
          <n-upload
            v-model:file-list="fileList"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            multiple
            :max="10"
            accept="*/*"
          >
            <n-button type="primary" size="small">
              <template #icon>
                <Upload :size="16" />
              </template>
              上传附件
            </n-button>
          </n-upload>
        </n-space>
      </div>
    </div>

    <div v-if="filteredAttachments.length > 0" class="attachments-grid">
      <div
        v-for="attachment in filteredAttachments"
        :key="attachment.id"
        class="attachment-card"
      >
        <div class="card-thumbnail" @click="handlePreview(attachment)">
          <template v-if="attachment.thumbnail">
            <img :src="attachment.thumbnail" :alt="attachment.name" class="thumbnail-img" />
            <div class="thumbnail-overlay">
              <Eye :size="24" />
            </div>
          </template>
          <template v-else>
            <component :is="getFileIcon(attachment.fileType)" :size="40" class="thumbnail-icon" />
          </template>
          <div v-if="attachment.isSensitive" class="sensitive-badge">
            <Lock :size="12" />
            敏感
          </div>
        </div>
        
        <div class="card-content">
          <div class="card-header">
            <div class="card-title" :title="attachment.name">{{ attachment.name }}</div>
            <n-dropdown
              :options="getActionOptions(attachment)"
              @select="(key: string) => handleAction(key, attachment)"
              trigger="click"
            >
              <n-button quaternary size="small" class="action-btn">
                <MoreVertical :size="16" />
              </n-button>
            </n-dropdown>
          </div>
          
          <div class="card-meta">
            <n-tag size="small" :type="getCategoryTagType(attachment.category)">
              {{ getCategoryLabel(attachment.category) }}
            </n-tag>
            <span class="file-size">{{ formatFileSize(attachment.fileSize) }}</span>
          </div>
          
          <div class="card-footer">
            <span class="uploader">{{ attachment.uploaderName }}</span>
            <span class="date">{{ attachment.uploadDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Empty description="暂无附件，点击上方按钮上传" />
    </div>

    <n-modal v-model:show="showUploadModal" preset="card" title="上传附件" style="width: 500px;">
      <n-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item label="附件分类" path="category">
          <n-select
            v-model:value="uploadForm.category"
            placeholder="请选择分类"
            style="width: 100%;"
            :options="categoryOptions"
          />
        </n-form-item>
        <n-form-item label="文件名称" path="name">
          <n-input v-model:value="uploadForm.name" placeholder="留空则使用原文件名" />
        </n-form-item>
        <n-form-item label="备注说明" path="description">
          <n-input
            v-model:value="uploadForm.description"
            type="textarea"
            placeholder="可选，输入附件说明"
            :rows="3"
          />
        </n-form-item>
        <n-form-item label="已选文件">
          <div class="selected-files">
            <div v-for="(file, index) in pendingFiles" :key="index" class="file-item">
              <File :size="16" />
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <n-button
                text
                size="tiny"
                type="error"
                @click="removePendingFile(index)"
              >
                <X :size="14" />
              </n-button>
            </div>
          </div>
        </n-form-item>
        <n-alert v-if="isSensitiveCategory" type="warning" :bordered="false" size="small">
          <template #icon>
            <AlertTriangle :size="16" />
          </template>
          此分类为敏感文件，上传后将自动添加水印标识
        </n-alert>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="cancelUpload">取消</n-button>
          <n-button type="primary" :loading="uploading" @click="confirmUpload">
            确认上传
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showEditModal" preset="card" title="编辑附件" style="width: 460px;">
      <n-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item label="附件分类" path="category">
          <n-select
            v-model:value="editForm.category"
            placeholder="请选择分类"
            style="width: 100%;"
            :options="categoryOptions"
          />
        </n-form-item>
        <n-form-item label="文件名称" path="name">
          <n-input v-model:value="editForm.name" placeholder="请输入文件名称" />
        </n-form-item>
        <n-form-item label="备注说明" path="description">
          <n-input
            v-model:value="editForm.description"
            type="textarea"
            placeholder="可选，输入附件说明"
            :rows="3"
          />
        </n-form-item>
        <n-alert v-if="isEditSensitiveCategory" type="warning" :bordered="false" size="small">
          <template #icon>
            <AlertTriangle :size="16" />
          </template>
          此分类为敏感文件，预览和下载时将自动添加水印标识
        </n-alert>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="confirmEdit">
            保存修改
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <AttachmentPreview
      v-model:show="showPreview"
      :attachment="previewAttachment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import {
  Paperclip, Upload, Eye, Lock, MoreVertical, File, X, AlertTriangle,
  FileImage, FileVideo, FileAudio, FileText, FileSpreadsheet,
  FileArchive, Trash2, Edit3, Download
} from 'lucide-vue-next'
import { useMessage, useDialog } from 'naive-ui'
import type { FormInst, FormRules, UploadFileInfo } from 'naive-ui'
import type { Attachment, AttachmentCategory } from '@/types'
import { ATTACHMENT_CATEGORY_OPTIONS, ATTACHMENT_CATEGORY_LABELS } from '@/types'
import { useAttachmentStore } from '@/stores/attachment'
import { useUserStore } from '@/stores/user'
import { formatFileSize, getFileIcon as getFileType, isPreviewable } from '@/lib/watermark'
import AttachmentPreview from './AttachmentPreview.vue'
import Empty from './Empty.vue'

const props = defineProps<{
  ownerType: 'employee' | 'training' | 'other'
  ownerId: string
  title?: string
  allowedCategories?: AttachmentCategory[]
}>()

const emit = defineEmits<{
  (e: 'uploaded', attachment: Attachment): void
  (e: 'deleted', attachmentId: string): void
}>()

const attachmentStore = useAttachmentStore()
const userStore = useUserStore()
const message = useMessage()
const dialog = useDialog()

const title = computed(() => props.title || '附件管理')

const attachments = computed(() => 
  attachmentStore.getAttachmentsByOwner(props.ownerType, props.ownerId).value
)

const selectedCategory = ref<AttachmentCategory | ''>('')

const categoryOptions = computed(() => {
  const options = ATTACHMENT_CATEGORY_OPTIONS
  if (props.allowedCategories) {
    return options.filter(o => props.allowedCategories!.includes(o.value))
  }
  return options
})

const categoryFilterOptions = computed(() => {
  const categories = [...new Set(attachments.value.map(a => a.category))]
  return categoryOptions.value
    .filter(o => categories.includes(o.value))
    .map(o => ({ label: o.label, value: o.value }))
})

const filteredAttachments = computed(() => {
  if (!selectedCategory.value) return attachments.value
  return attachments.value.filter(a => a.category === selectedCategory.value)
})

const fileList = ref<any[]>([])
const pendingFiles = ref<File[]>([])
const showUploadModal = ref(false)
const uploading = ref(false)
const uploadFormRef = ref<FormInst | null>(null)
const uploadForm = ref({
  category: '' as AttachmentCategory | '',
  name: '',
  description: ''
})

const uploadRules: FormRules = {
  category: [{ required: true, message: '请选择附件分类', trigger: 'change' }]
}

const isSensitiveCategory = computed(() => {
  if (!uploadForm.value.category) return false
  return attachmentStore.isCategorySensitive(uploadForm.value.category)
})

const showEditModal = ref(false)
const editFormRef = ref<FormInst | null>(null)
const editingAttachment = ref<Attachment | null>(null)
const editForm = ref({
  category: '' as AttachmentCategory | '',
  name: '',
  description: ''
})

const editRules: FormRules = {
  category: [{ required: true, message: '请选择附件分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入文件名称', trigger: 'blur' }]
}

const isEditSensitiveCategory = computed(() => {
  if (!editForm.value.category) return false
  return attachmentStore.isCategorySensitive(editForm.value.category)
})

const showPreview = ref(false)
const previewAttachment = ref<Attachment | null>(null)

function getFileIcon(fileType: string) {
  const iconType = getFileType(fileType)
  const iconMap: Record<string, any> = {
    image: FileImage,
    video: FileVideo,
    audio: FileAudio,
    pdf: FileText,
    word: FileText,
    excel: FileSpreadsheet,
    ppt: FileText,
    zip: FileArchive,
    file: File
  }
  return iconMap[iconType] || File
}

function getCategoryLabel(category: AttachmentCategory): string {
  return ATTACHMENT_CATEGORY_LABELS[category] || category
}

function getCategoryTagType(category: AttachmentCategory): string {
  const option = ATTACHMENT_CATEGORY_OPTIONS.find(o => o.value === category)
  return option?.isSensitive ? 'warning' : 'info'
}

function getActionOptions(attachment: Attachment) {
  const options: Array<{ label: string; key: string; icon?: () => any; props?: any }> = []
  
  if (isPreviewable(attachment.fileType)) {
    options.push({ label: '预览', key: 'preview', icon: () => h(Eye, { size: 16 }) })
  }
  options.push({ label: '下载', key: 'download', icon: () => h(Download, { size: 16 }) })
  options.push({ label: '编辑', key: 'edit', icon: () => h(Edit3, { size: 16 }) })
  options.push({ label: '删除', key: 'delete', icon: () => h(Trash2, { size: 16 }), props: { style: 'color: #EF4444;' } })
  
  return options
}

function handleAction(key: string, attachment: Attachment) {
  switch (key) {
    case 'preview':
      handlePreview(attachment)
      break
    case 'download':
      handleDownload(attachment)
      break
    case 'edit':
      handleEdit(attachment)
      break
    case 'delete':
      handleDelete(attachment)
      break
  }
}

const isUploadingModal = ref(false)
const collectedFiles: File[] = []
let uploadTimer: number | null = null

function handleBeforeUpload({ file }: { file: UploadFileInfo }): boolean {
  if (isUploadingModal.value) {
    fileList.value = []
    return false
  }
  
  const rawFile = file.file
  if (rawFile instanceof File) {
    if (!collectedFiles.find(f => f.name === rawFile.name && f.size === rawFile.size)) {
      collectedFiles.push(rawFile)
    }
  }
  
  if (uploadTimer) {
    clearTimeout(uploadTimer)
  }
  uploadTimer = window.setTimeout(() => {
    if (collectedFiles.length > 0) {
      pendingFiles.value = [...collectedFiles]
      collectedFiles.length = 0
      uploadForm.value.name = ''
      uploadForm.value.description = ''
      isUploadingModal.value = true
      showUploadModal.value = true
      fileList.value = []
    }
  }, 100)
  
  return false
}

function removePendingFile(index: number) {
  pendingFiles.value.splice(index, 1)
}

function cancelUpload() {
  showUploadModal.value = false
  isUploadingModal.value = false
  pendingFiles.value = []
  collectedFiles.length = 0
  fileList.value = []
  uploadForm.value = { category: '', name: '', description: '' }
}

async function confirmUpload() {
  uploadFormRef.value?.validate(async (errors) => {
    if (!errors && pendingFiles.value.length > 0 && uploadForm.value.category) {
      uploading.value = true
      try {
        const currentUser = userStore.currentUser
        const fileCount = pendingFiles.value.length
        const customName = uploadForm.value.name?.trim()
        
        for (let i = 0; i < pendingFiles.value.length; i++) {
          const file = pendingFiles.value[i]
          let finalName: string | undefined
          
          if (customName) {
            if (fileCount > 1) {
              finalName = `${customName} (${i + 1})`
            } else {
              finalName = customName
            }
          } else {
            finalName = file.name.replace(/\.[^/.]+$/, '')
          }
          
          const attachment = await attachmentStore.uploadAttachment(file, {
            name: finalName,
            category: uploadForm.value.category,
            description: uploadForm.value.description || undefined,
            ownerType: props.ownerType,
            ownerId: props.ownerId,
            uploaderId: currentUser?.id || '2',
            uploaderName: currentUser?.name || '系统管理员'
          })
          emit('uploaded', attachment)
        }
        message.success(`成功上传 ${pendingFiles.value.length} 个文件`)
        cancelUpload()
      } catch (e) {
        message.error('上传失败，请重试')
      } finally {
        uploading.value = false
      }
    }
  })
}

function handlePreview(attachment: Attachment) {
  previewAttachment.value = attachment
  showPreview.value = true
}

function handleDownload(attachment: Attachment) {
  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.originalName
  link.click()
  message.success('开始下载')
}

function handleEdit(attachment: Attachment) {
  editingAttachment.value = attachment
  editForm.value = {
    category: attachment.category,
    name: attachment.name,
    description: attachment.description || ''
  }
  showEditModal.value = true
}

function confirmEdit() {
  editFormRef.value?.validate((errors) => {
    if (!errors && editingAttachment.value && editForm.value.category) {
      attachmentStore.updateAttachment(editingAttachment.value.id, {
        category: editForm.value.category,
        name: editForm.value.name,
        description: editForm.value.description
      })
      message.success('修改成功')
      showEditModal.value = false
    }
  })
}

function handleDelete(attachment: Attachment) {
  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除附件「${attachment.name}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      attachmentStore.deleteAttachment(attachment.id)
      emit('deleted', attachment.id)
      message.success('删除成功')
      d.destroy()
    }
  })
}

watch(() => props.ownerId, () => {
  selectedCategory.value = ''
})
</script>

<style scoped>
.attachment-manager {
  width: 100%;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manager-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.title-icon {
  color: #7C3AED;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.attachment-card {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: all 0.2s;
}

.attachment-card:hover {
  border-color: #A78BFA;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
}

.card-thumbnail {
  position: relative;
  height: 120px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.card-thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-icon {
  color: #9CA3AF;
}

.sensitive-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.card-content {
  padding: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.card-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1E1B4B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-btn {
  padding: 4px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-size {
  font-size: 12px;
  color: #9CA3AF;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9CA3AF;
}

.empty-state {
  padding: 40px 0;
}

.selected-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 6px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #9CA3AF;
}
</style>
