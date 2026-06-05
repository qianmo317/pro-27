import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Attachment, AttachmentCategory } from '@/types'
import { mockAttachments } from '@/mock/data'
import { ATTACHMENT_CATEGORY_OPTIONS } from '@/types'
import { addWatermarkToImage, isImageFile } from '@/lib/watermark'

export const useAttachmentStore = defineStore('attachment', () => {
  const attachments = ref<Attachment[]>([...mockAttachments])

  const getAttachmentsByOwner = (ownerType: 'employee' | 'training' | 'other', ownerId: string) => {
    return computed(() => 
      attachments.value.filter(a => a.ownerType === ownerType && a.ownerId === ownerId)
    )
  }

  const getAttachmentsByCategory = (ownerType: 'employee' | 'training' | 'other', ownerId: string, category: AttachmentCategory) => {
    return computed(() => 
      attachments.value.filter(a => 
        a.ownerType === ownerType && 
        a.ownerId === ownerId && 
        a.category === category
      )
    )
  }

  const getAttachmentById = (id: string): Attachment | undefined => {
    return attachments.value.find(a => a.id === id)
  }

  function isCategorySensitive(category: AttachmentCategory): boolean {
    const option = ATTACHMENT_CATEGORY_OPTIONS.find(o => o.value === category)
    return option?.isSensitive ?? false
  }

  async function uploadAttachment(
    file: File,
    params: {
      name?: string
      category: AttachmentCategory
      description?: string
      ownerType: 'employee' | 'training' | 'other'
      ownerId: string
      uploaderId: string
      uploaderName: string
    }
  ): Promise<Attachment> {
    const { name, category, description, ownerType, ownerId, uploaderId, uploaderName } = params
    const isSensitive = isCategorySensitive(category)
    
    let url = URL.createObjectURL(file)
    let thumbnail: string | undefined

    if (isImageFile(file.type)) {
      if (isSensitive) {
        const watermarkText = `仅供公司人事档案使用 - ${new Date().toLocaleDateString()}`
        url = await addWatermarkToImage(url, watermarkText)
      }
      
      thumbnail = await createThumbnail(file, isSensitive)
    }

    const newAttachment: Attachment = {
      id: `att-${Date.now()}`,
      name: name || file.name.replace(/\.[^/.]+$/, ''),
      originalName: file.name,
      category,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      url,
      thumbnail,
      uploaderId,
      uploaderName,
      uploadDate: new Date().toISOString().split('T')[0],
      description,
      isSensitive,
      watermarkText: isSensitive ? `仅供公司人事档案使用 - ${new Date().toLocaleDateString()}` : undefined,
      ownerType,
      ownerId
    }

    attachments.value.unshift(newAttachment)
    return newAttachment
  }

  async function createThumbnail(file: File, isSensitive: boolean): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        let result = e.target?.result as string
        
        if (isSensitive) {
          result = await addWatermarkToImage(result, '仅供预览', {
            fontSize: 12,
            opacity: 0.2,
            gapX: 60,
            gapY: 50
          })
        }
        
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          const maxWidth = 200
          const maxHeight = 150
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width
            height = maxHeight
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    })
  }

  function updateAttachment(id: string, data: Partial<Pick<Attachment, 'name' | 'description' | 'category'>>) {
    const index = attachments.value.findIndex(a => a.id === id)
    if (index !== -1) {
      const isSensitive = data.category ? isCategorySensitive(data.category) : attachments.value[index].isSensitive
      attachments.value[index] = { 
        ...attachments.value[index], 
        ...data,
        isSensitive
      }
    }
  }

  function deleteAttachment(id: string) {
    const index = attachments.value.findIndex(a => a.id === id)
    if (index !== -1) {
      const attachment = attachments.value[index]
      if (attachment.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url)
      }
      attachments.value.splice(index, 1)
    }
  }

  async function getWatermarkedUrl(attachment: Attachment): Promise<string> {
    if (!attachment.isSensitive || !isImageFile(attachment.fileType)) {
      return attachment.url
    }
    const watermarkText = attachment.watermarkText || `仅供公司人事档案使用 - ${new Date().toLocaleDateString()}`
    return await addWatermarkToImage(attachment.url, watermarkText)
  }

  return {
    attachments,
    getAttachmentsByOwner,
    getAttachmentsByCategory,
    getAttachmentById,
    uploadAttachment,
    updateAttachment,
    deleteAttachment,
    getWatermarkedUrl,
    isCategorySensitive
  }
})
