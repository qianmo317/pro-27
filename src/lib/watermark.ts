export function addWatermarkToImage(
  imageUrl: string,
  watermarkText: string,
  options: {
    fontSize?: number
    color?: string
    opacity?: number
    rotation?: number
    gapX?: number
    gapY?: number
  } = {}
): Promise<string> {
  const {
    fontSize = 14,
    color = 'rgba(0, 0, 0, 0.15)',
    opacity = 0.15,
    rotation = -25,
    gapX = 100,
    gapY = 80
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = color
      ctx.globalAlpha = opacity
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const radians = (rotation * Math.PI) / 180
      const textWidth = ctx.measureText(watermarkText).width
      const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)

      for (let y = -diagonal; y < canvas.height + diagonal; y += gapY) {
        for (let x = -diagonal; x < canvas.width + diagonal; x += gapX) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(radians)
          ctx.fillText(watermarkText, 0, 0)
          ctx.restore()
        }
      }

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = imageUrl
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(fileType: string): string {
  const type = fileType.toLowerCase()
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (type.includes('pdf')) return 'pdf'
  if (type.includes('word') || type.includes('document')) return 'word'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'excel'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'ppt'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'zip'
  return 'file'
}

export function isImageFile(fileType: string): boolean {
  return fileType.toLowerCase().startsWith('image/')
}

export function isPdfFile(fileType: string): boolean {
  return fileType.toLowerCase().includes('pdf')
}

export function isPreviewable(fileType: string): boolean {
  return isImageFile(fileType) || isPdfFile(fileType)
}
