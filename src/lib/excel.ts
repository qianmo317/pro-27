import * as XLSX from 'xlsx'

export interface ExcelColumn<T = any> {
  key: keyof T | string
  title: string
  required?: boolean
  type?: 'string' | 'number' | 'date' | 'select'
  options?: { label: string; value: any }[]
  formatter?: (value: any) => string
  parser?: (value: any) => any
}

export interface ImportResult<T> {
  success: T[]
  errors: { row: number; message: string; data: Partial<T> }[]
}

export function exportToExcel<T>(
  data: T[],
  columns: ExcelColumn<T>[],
  fileName: string
): void {
  const exportData = data.map(row => {
    const exportRow: Record<string, any> = {}
    columns.forEach(col => {
      const key = String(col.key)
      const value = (row as any)[col.key as keyof T]
      exportRow[col.title] = col.formatter ? col.formatter(value) : value ?? ''
    })
    return exportRow
  })

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

export function downloadTemplate<T>(
  columns: ExcelColumn<T>[],
  fileName: string,
  exampleData?: Partial<T>[]
): void {
  const templateColumns = columns.map(col => ({
    title: col.required ? `${col.title}*` : col.title,
    key: col.key
  }))

  const headerRow: Record<string, string> = {}
  templateColumns.forEach(col => {
    headerRow[String(col.key)] = col.title
  })

  const exportData: Record<string, any>[] = [headerRow]

  if (exampleData && exampleData.length > 0) {
    exampleData.forEach(example => {
      const row: Record<string, any> = {}
      columns.forEach(col => {
        const value = example[col.key as keyof T]
        row[String(col.key)] = value ?? ''
      })
      exportData.push(row)
    })
  }

  const ws = XLSX.utils.json_to_sheet(exportData, { skipHeader: true })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${fileName}_模板.xlsx`)
}

export function parseExcel<T>(
  file: File,
  columns: ExcelColumn<T>[]
): Promise<ImportResult<T>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        if (jsonData.length < 2) {
          resolve({ success: [], errors: [{ row: 1, message: 'Excel 文件为空或格式不正确', data: {} }] })
          return
        }

        const headers = jsonData[0].map(h => String(h || ''))
        const titleToKeyMap: Record<string, string> = {}
        columns.forEach(col => {
          titleToKeyMap[col.title] = String(col.key)
          if (col.required) {
            titleToKeyMap[`${col.title}*`] = String(col.key)
          }
        })

        const success: T[] = []
        const errors: { row: number; message: string; data: Partial<T> }[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const rowData = jsonData[i]
          if (rowData.every(cell => cell === null || cell === undefined || cell === '')) {
            continue
          }

          const parsedData: Partial<T> = {}
          let hasError = false
          let errorMessage = ''

          for (let j = 0; j < headers.length; j++) {
            const header = headers[j]
            const key = titleToKeyMap[header]
            if (!key) continue

            const col = columns.find(c => String(c.key) === key)
            if (!col) continue

            let value = rowData[j]

            if (col.required && (value === null || value === undefined || value === '')) {
              hasError = true
              errorMessage = `列 "${col.title}" 不能为空`
              break
            }

            if (col.parser && value !== null && value !== undefined && value !== '') {
              value = col.parser(value)
            }

            if (col.type === 'select' && col.options && value !== null && value !== undefined && value !== '') {
              const option = col.options.find(o => o.label === value || o.value === value)
              if (option) {
                value = option.value
              } else {
                hasError = true
                errorMessage = `列 "${col.title}" 的值 "${value}" 不在可选范围内`
                break
              }
            }

            if (value !== null && value !== undefined) {
              ;(parsedData as any)[key] = value
            }
          }

          if (hasError) {
            errors.push({ row: i + 1, message: errorMessage, data: parsedData })
          } else {
            success.push(parsedData as T)
          }
        }

        resolve({ success, errors })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
