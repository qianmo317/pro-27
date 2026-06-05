<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="attachment?.name || '附件预览'"
    style="width: 90%; max-width: 900px;"
    :mask-closable="true"
  >
    <div v-if="attachment" class="preview-container">
      <div class="preview-info">
        <div class="info-row">
          <span class="info-label">分类：</span>
          <n-space size="8">
            <n-tag size="small" :type="attachment.isSensitive ? 'warning' : 'info'">
              {{ categoryLabel }}
            </n-tag>
            <n-tag v-if="attachment.isSensitive" type="error" size="small">
              <Lock :size="12" style="margin-right: 4px; vertical-align: -2px;" />
              敏感文件
            </n-tag>
          </n-space>
        </div>
        <div class="info-row">
          <span class="info-label">上传者：</span>
          <span>{{ attachment.uploaderName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">上传日期：</span>
          <span>{{ attachment.uploadDate }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">文件大小：</span>
          <span>{{ formattedSize }}</span>
        </div>
        <div v-if="attachment.description" class="info-row">
          <span class="info-label">备注：</span>
          <span>{{ attachment.description }}</span>
        </div>
      </div>

      <div class="preview-content">
        <div v-if="loadingWatermark" class="loading-preview">
          <div class="loading-content">
            <Loader2 :size="32" class="loading-icon" :spin="true" />
            <p>{{ attachment.isSensitive ? '正在为敏感文件添加水印...' : '正在加载图片...' }}</p>
          </div>
        </div>
        
        <div v-else-if="loadError" class="error-preview">
          <div class="error-content">
            <AlertTriangle :size="32" class="error-icon" />
            <p>{{ errorMessage || '图片加载失败' }}</p>
            <n-button size="small" @click="retryLoad">
              <template #icon>
                <RotateCcw :size="14" />
              </template>
              重新加载
            </n-button>
          </div>
        </div>
        
        <div v-else-if="isImage && watermarkedUrl" class="image-preview">
          <img :src="watermarkedUrl" :alt="attachment.name" />
          <div v-if="attachment.isSensitive" class="watermark-notice">
            <AlertTriangle :size="14" />
            <span>此为敏感文件，已自动添加水印标识</span>
          </div>
        </div>
        
        <div v-else-if="isPdf" class="pdf-preview">
          <div class="pdf-placeholder">
            <FileText :size="64" class="pdf-icon" />
            <p>PDF 文件预览</p>
            <p class="pdf-hint">点击下方下载按钮查看完整内容</p>
          </div>
        </div>
        
        <div v-else class="other-preview">
          <div class="other-placeholder">
            <component :is="fileIconComponent" :size="64" class="file-icon" />
            <p>该文件类型暂不支持在线预览</p>
            <p class="other-hint">文件类型：{{ attachment.fileType }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <n-space justify="end">
        <n-button @click="handleDownload">
          <template #icon>
            <Download :size="16" />
          </template>
          下载
        </n-button>
        <n-button type="primary" @click="visible = false">
          关闭
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Lock, AlertTriangle, FileText, Download, File, FileImage, FileVideo, FileAudio, FileSpreadsheet, FileArchive, Loader2, RotateCcw } from 'lucide-vue-next'
import type { Attachment } from '@/types'
import { ATTACHMENT_CATEGORY_LABELS } from '@/types'
import { formatFileSize, isImageFile, isPdfFile, addWatermarkToImage, getFileIcon } from '@/lib/watermark'

const props = defineProps<{
  show: boolean
  attachment: Attachment | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const watermarkedUrl = ref<string>('')
const loadingWatermark = ref(false)
const loadError = ref(false)
const errorMessage = ref('')
let currentRequestId = 0

const categoryLabel = computed(() => {
  if (!props.attachment) return ''
  return ATTACHMENT_CATEGORY_LABELS[props.attachment.category] || props.attachment.category
})

const formattedSize = computed(() => {
  if (!props.attachment) return ''
  return formatFileSize(props.attachment.fileSize)
})

const isImage = computed(() => {
  return props.attachment ? isImageFile(props.attachment.fileType) : false
})

const isPdf = computed(() => {
  return props.attachment ? isPdfFile(props.attachment.fileType) : false
})

const fileIconComponent = computed(() => {
  if (!props.attachment) return File
  const iconType = getFileIcon(props.attachment.fileType)
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
})

async function loadAttachmentImage(attachment: Attachment) {
  const requestId = ++currentRequestId
  loadError.value = false
  errorMessage.value = ''
  
  if (!isImageFile(attachment.fileType)) {
    watermarkedUrl.value = ''
    loadingWatermark.value = false
    return
  }
  
  loadingWatermark.value = true
  
  try {
    let resultUrl: string
    
    if (attachment.isSensitive && attachment.watermarkText) {
      resultUrl = await addWatermarkToImage(attachment.url, attachment.watermarkText)
    } else {
      resultUrl = attachment.url
    }
    
    if (requestId === currentRequestId) {
      watermarkedUrl.value = resultUrl
      loadError.value = false
    }
  } catch (e) {
    if (requestId === currentRequestId) {
      loadError.value = true
      errorMessage.value = e instanceof Error ? e.message : '图片加载失败'
      watermarkedUrl.value = attachment.url
    }
  } finally {
    if (requestId === currentRequestId) {
      loadingWatermark.value = false
    }
  }
}

async function retryLoad() {
  if (props.attachment) {
    await loadAttachmentImage(props.attachment)
  }
}

function resetState() {
  currentRequestId++
  watermarkedUrl.value = ''
  loadingWatermark.value = false
  loadError.value = false
  errorMessage.value = ''
}

watch(() => props.attachment, (newVal, oldVal) => {
  if (newVal && newVal.id !== oldVal?.id) {
    resetState()
    nextTick(() => {
      if (newVal) {
        loadAttachmentImage(newVal)
      }
    })
  } else if (!newVal) {
    resetState()
  }
}, { immediate: true })

watch(() => props.show, (newShow) => {
  if (newShow && props.attachment && !watermarkedUrl.value && !loadingWatermark.value) {
    loadAttachmentImage(props.attachment)
  }
})

function handleDownload() {
  if (!props.attachment) return
  const link = document.createElement('a')
  link.href = props.attachment.url
  link.download = props.attachment.originalName
  link.click()
}
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-info {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #6B7280;
  font-weight: 500;
  min-width: 70px;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #F3F4F6;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.image-preview {
  position: relative;
  max-width: 100%;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.watermark-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 16px;
  background: #FEF3C7;
  color: #B45309;
  border-radius: 6px;
  font-size: 13px;
}

.pdf-placeholder,
.other-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6B7280;
}

.pdf-icon,
.file-icon {
  color: #7C3AED;
  opacity: 0.6;
}

.pdf-placeholder p,
.other-placeholder p {
  margin: 0;
  font-size: 14px;
}

.pdf-hint,
.other-hint {
  font-size: 12px !important;
  color: #9CA3AF;
}

.loading-preview,
.error-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 300px;
}

.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.loading-icon {
  color: #7C3AED;
  animation: spin 1s linear infinite;
}

.loading-content p {
  margin: 0;
  font-size: 14px;
  color: #6B7280;
}

.error-icon {
  color: #EF4444;
}

.error-content p {
  margin: 0;
  font-size: 14px;
  color: #EF4444;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
