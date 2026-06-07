import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthDateStr: string, fromDate: Date = new Date()): number {
  const birthDate = new Date(birthDateStr)
  const from = fromDate
  
  let age = from.getFullYear() - birthDate.getFullYear()
  
  const monthDiff = from.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && from.getDate() < birthDate.getDate())) {
    age--
  }
  
  return Math.max(0, age)
}

export function calculateWorkYears(entryDateStr: string, fromDate: Date = new Date()): number {
  const entryDate = new Date(entryDateStr)
  const from = fromDate
  
  let years = from.getFullYear() - entryDate.getFullYear()
  
  const monthDiff = from.getMonth() - entryDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && from.getDate() < entryDate.getDate())) {
    years--
  }
  
  return Math.max(0, years)
}

export function getDaysUntilNextAnniversary(
  dateStr: string, 
  fromDate: Date = new Date()
): { days: number; years: number; nextDate: Date; currentAge: number } {
  const date = new Date(dateStr)
  const thisYear = fromDate.getFullYear()
  
  let nextDate = new Date(thisYear, date.getMonth(), date.getDate())
  
  if (nextDate < fromDate) {
    nextDate = new Date(thisYear + 1, date.getMonth(), date.getDate())
  }
  
  const diffTime = nextDate.getTime() - fromDate.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const currentAge = calculateAge(dateStr, fromDate)
  const years = days === 0 ? currentAge : currentAge + 1
  
  return { days, years, nextDate, currentAge }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[d.getDay()]
  return `${month}月${day}日 ${weekDay}`
}
