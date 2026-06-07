import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WorkHoursEmployeeStat,
  WorkHoursDepartmentStat,
  WorkHoursPlanVsActual,
  OverworkedEmployee,
  WorkHoursDailyRecord
} from '@/types'
import {
  STANDARD_WORK_HOURS_PER_DAY,
  STANDARD_WORK_DAYS_PER_MONTH,
  DEFAULT_CONSECUTIVE_OVERTIME_THRESHOLD
} from '@/types'
import { mockEmployees, mockAttendanceRecords, mockOvertimeApplications, mockLeaveApplications } from '@/mock/data'
import type { Employee, AttendanceRecord, OvertimeApplication, LeaveApplication } from '@/types'
import { exportToExcel } from '@/lib/excel'
import type { ExcelColumn } from '@/lib/excel'

export const useWorkHoursStore = defineStore('workhours', () => {
  const selectedMonth = ref('2024-01')
  const consecutiveOvertimeThreshold = ref(DEFAULT_CONSECUTIVE_OVERTIME_THRESHOLD)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const filterDepartment = ref('')
  const filterOverworkedOnly = ref(false)

  function calculateDailyWorkHours(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0
    const [inHour, inMin] = checkIn.split(':').map(Number)
    const [outHour, outMin] = checkOut.split(':').map(Number)
    const inMinutes = inHour * 60 + inMin
    const outMinutes = outHour * 60 + outMin
    const diffMinutes = outMinutes - inMinutes
    const lunchBreak = 60
    const workMinutes = Math.max(0, diffMinutes - lunchBreak)
    return Math.round((workMinutes / 60) * 10) / 10
  }

  function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = []
    const date = new Date(year, month - 1, 1)
    while (date.getMonth() === month - 1) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  function isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  function getAttendanceRecordsForMonth(employeeId: string, month: string): AttendanceRecord[] {
    return mockAttendanceRecords.filter(
      r => r.employeeId === employeeId && r.date.startsWith(month)
    )
  }

  function getOvertimeForMonth(employeeId: string, month: string): OvertimeApplication[] {
    return mockOvertimeApplications.filter(
      a => a.employeeId === employeeId && 
           a.overtimeDate.startsWith(month) && 
           a.status === 'approved'
    )
  }

  function getLeaveForMonth(employeeId: string, month: string): LeaveApplication[] {
    return mockLeaveApplications.filter(
      a => a.employeeId === employeeId && 
           a.status === 'approved' &&
           ((a.startDate.startsWith(month) || a.endDate.startsWith(month)) ||
            (a.startDate <= month + '-31' && a.endDate >= month + '-01'))
    )
  }

  function calculateLeaveHoursForDate(employeeId: string, dateStr: string, leaves: LeaveApplication[]): number {
    const date = new Date(dateStr)
    for (const leave of leaves) {
      const startDate = new Date(leave.startDate)
      const endDate = new Date(leave.endDate)
      if (date >= startDate && date <= endDate) {
        const startTime = leave.startTime || '09:00'
        const endTime = leave.endTime || '18:00'
        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)
        const hours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60
        return Math.round(hours * 10) / 10
      }
    }
    return 0
  }

  function generateDailyRecords(employee: Employee, month: string): WorkHoursDailyRecord[] {
    const [year, monthNum] = month.split('-').map(Number)
    const daysInMonth = getDaysInMonth(year, monthNum)
    const attendanceRecords = getAttendanceRecordsForMonth(employee.id, month)
    const overtimeRecords = getOvertimeForMonth(employee.id, month)
    const leaveRecords = getLeaveForMonth(employee.id, month)

    const dailyRecords: WorkHoursDailyRecord[] = []

    for (const date of daysInMonth) {
      const dateStr = date.toISOString().split('T')[0]
      const attendance = attendanceRecords.find(r => r.date === dateStr)
      const overtime = overtimeRecords.find(o => o.overtimeDate === dateStr)
      const leaveHours = calculateLeaveHoursForDate(employee.id, dateStr, leaveRecords)

      if (isWeekend(date)) {
        dailyRecords.push({
          date: dateStr,
          checkIn: '',
          checkOut: '',
          workHours: 0,
          overtimeHours: overtime ? overtime.totalHours : 0,
          leaveHours: 0,
          status: 'weekend'
        })
        continue
      }

      if (leaveHours > 0) {
        dailyRecords.push({
          date: dateStr,
          checkIn: '',
          checkOut: '',
          workHours: 0,
          overtimeHours: 0,
          leaveHours,
          status: 'leave'
        })
        continue
      }

      if (attendance) {
        const workHours = calculateDailyWorkHours(attendance.checkIn, attendance.checkOut)
        const overtimeHours = overtime ? overtime.totalHours : 0
        
        let status: WorkHoursDailyRecord['status'] = 'normal'
        if (attendance.status === 'late') status = 'late'
        else if (attendance.status === 'early') status = 'early'
        else if (attendance.status === 'absent') status = 'absent'

        dailyRecords.push({
          date: dateStr,
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          workHours,
          overtimeHours,
          leaveHours: 0,
          status
        })
      } else {
        dailyRecords.push({
          date: dateStr,
          checkIn: '',
          checkOut: '',
          workHours: 0,
          overtimeHours: overtime ? overtime.totalHours : 0,
          leaveHours: 0,
          status: 'absent'
        })
      }
    }

    return dailyRecords
  }

  function calculateConsecutiveOvertimeDays(dailyRecords: WorkHoursDailyRecord[]): number {
    let maxConsecutive = 0
    let currentConsecutive = 0

    for (const record of dailyRecords) {
      if (record.overtimeHours > 0) {
        currentConsecutive++
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      } else if (record.status !== 'weekend' && record.status !== 'holiday') {
        currentConsecutive = 0
      }
    }

    return maxConsecutive
  }

  function calculateEmployeeStats(employee: Employee, month: string): WorkHoursEmployeeStat {
    const dailyRecords = generateDailyRecords(employee, month)
    
    const actualWorkHours = dailyRecords
      .filter(r => r.status !== 'weekend' && r.status !== 'holiday')
      .reduce((sum, r) => sum + r.workHours, 0)
    
    const overtimeHours = dailyRecords.reduce((sum, r) => sum + r.overtimeHours, 0)
    const leaveHours = dailyRecords.reduce((sum, r) => sum + r.leaveHours, 0)
    
    const workDays = dailyRecords.filter(r => r.status !== 'weekend' && r.status !== 'holiday').length
    const plannedWorkHours = workDays * STANDARD_WORK_HOURS_PER_DAY
    
    const presentDays = dailyRecords.filter(r => 
      r.status !== 'absent' && r.status !== 'leave' && r.status !== 'weekend' && r.status !== 'holiday'
    ).length
    const attendanceRate = workDays > 0 ? Math.round((presentDays / workDays) * 1000) / 10 : 0
    
    const consecutiveOvertimeDays = calculateConsecutiveOvertimeDays(dailyRecords)
    const isOverworked = consecutiveOvertimeDays >= consecutiveOvertimeThreshold.value

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      actualWorkHours: Math.round(actualWorkHours * 10) / 10,
      plannedWorkHours,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      leaveHours: Math.round(leaveHours * 10) / 10,
      attendanceRate,
      consecutiveOvertimeDays,
      isOverworked,
      dailyRecords
    }
  }

  const employeeStats = computed(() => {
    let stats = mockEmployees
      .filter(e => e.status !== 'inactive')
      .map(e => calculateEmployeeStats(e, selectedMonth.value))
    
    if (filterDepartment.value) {
      stats = stats.filter(s => s.department === filterDepartment.value)
    }
    
    if (filterOverworkedOnly.value) {
      stats = stats.filter(s => s.isOverworked)
    }
    
    return stats
  })

  const departmentStats = computed((): WorkHoursDepartmentStat[] => {
    const deptMap: Record<string, WorkHoursEmployeeStat[]> = {}
    
    for (const stat of employeeStats.value) {
      if (!deptMap[stat.department]) {
        deptMap[stat.department] = []
      }
      deptMap[stat.department].push(stat)
    }

    return Object.entries(deptMap).map(([department, employees]) => {
      const employeeCount = employees.length
      const totalActualWorkHours = employees.reduce((sum, e) => sum + e.actualWorkHours, 0)
      const totalPlannedWorkHours = employees.reduce((sum, e) => sum + e.plannedWorkHours, 0)
      const totalOvertimeHours = employees.reduce((sum, e) => sum + e.overtimeHours, 0)
      const totalLeaveHours = employees.reduce((sum, e) => sum + e.leaveHours, 0)
      const overworkedEmployeeCount = employees.filter(e => e.isOverworked).length

      return {
        department,
        employeeCount,
        totalActualWorkHours: Math.round(totalActualWorkHours * 10) / 10,
        totalPlannedWorkHours,
        totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
        totalLeaveHours: Math.round(totalLeaveHours * 10) / 10,
        avgActualWorkHours: Math.round((totalActualWorkHours / employeeCount) * 10) / 10,
        avgOvertimeHours: Math.round((totalOvertimeHours / employeeCount) * 10) / 10,
        overworkedEmployeeCount
      }
    })
  })

  const overworkedEmployees = computed((): OverworkedEmployee[] => {
    return employeeStats.value
      .filter(s => s.isOverworked)
      .map(s => {
        const employee = mockEmployees.find(e => e.id === s.employeeId)
        const overtimeDates = s.dailyRecords
          .filter(r => r.overtimeHours > 0)
          .map(r => r.date)
        
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (s.consecutiveOvertimeDays >= 7) riskLevel = 'high'
        else if (s.consecutiveOvertimeDays >= 5) riskLevel = 'medium'

        return {
          employeeId: s.employeeId,
          employeeName: s.employeeName,
          department: s.department,
          avatar: employee?.avatar || '',
          consecutiveDays: s.consecutiveOvertimeDays,
          totalOvertimeHours: s.overtimeHours,
          overtimeDates,
          riskLevel
        }
      })
      .sort((a, b) => b.consecutiveDays - a.consecutiveDays)
  })

  const planVsActualData = computed((): WorkHoursPlanVsActual[] => {
    const [year, monthNum] = selectedMonth.value.split('-').map(Number)
    const daysInMonth = getDaysInMonth(year, monthNum)
    
    return daysInMonth
      .filter(d => !isWeekend(d))
      .map(date => {
        const dateStr = date.toISOString().split('T')[0]
        const plannedHours = STANDARD_WORK_HOURS_PER_DAY
        const actualHours = employeeStats.value.reduce((sum, emp) => {
          const dailyRecord = emp.dailyRecords.find(r => r.date === dateStr)
          return sum + (dailyRecord?.workHours || 0)
        }, 0)
        const avgActualHours = employeeStats.value.length > 0 
          ? Math.round((actualHours / employeeStats.value.length) * 10) / 10 
          : 0

        return {
          date: dateStr.slice(5),
          plannedHours,
          actualHours: avgActualHours
        }
      })
  })

  const paginatedEmployeeStats = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return employeeStats.value.slice(start, start + pageSize.value)
  })

  const totalEmployees = computed(() => employeeStats.value.length)

  const pagination = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    itemCount: totalEmployees.value,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
    onUpdatePage: (page: number) => setCurrentPage(page),
    onUpdatePageSize: (size: number) => setPageSize(size)
  }))

  const summaryStats = computed(() => {
    const stats = employeeStats.value
    const totalActual = stats.reduce((sum, s) => sum + s.actualWorkHours, 0)
    const totalOvertime = stats.reduce((sum, s) => sum + s.overtimeHours, 0)
    const totalLeave = stats.reduce((sum, s) => sum + s.leaveHours, 0)
    const avgAttendanceRate = stats.length > 0 
      ? Math.round((stats.reduce((sum, s) => sum + s.attendanceRate, 0) / stats.length) * 10) / 10 
      : 0
    const overworkedCount = stats.filter(s => s.isOverworked).length

    return {
      totalEmployees: stats.length,
      totalActualHours: Math.round(totalActual * 10) / 10,
      totalOvertimeHours: Math.round(totalOvertime * 10) / 10,
      totalLeaveHours: Math.round(totalLeave * 10) / 10,
      avgActualHours: stats.length > 0 ? Math.round((totalActual / stats.length) * 10) / 10 : 0,
      avgOvertimeHours: stats.length > 0 ? Math.round((totalOvertime / stats.length) * 10) / 10 : 0,
      avgAttendanceRate,
      overworkedCount
    }
  })

  function setSelectedMonth(month: string) {
    selectedMonth.value = month
    currentPage.value = 1
  }

  function setConsecutiveOvertimeThreshold(threshold: number) {
    consecutiveOvertimeThreshold.value = threshold
  }

  function setCurrentPage(page: number) {
    currentPage.value = page
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  function setFilterDepartment(dept: string) {
    filterDepartment.value = dept
    currentPage.value = 1
  }

  function setFilterOverworkedOnly(value: boolean) {
    filterOverworkedOnly.value = value
    currentPage.value = 1
  }

  function exportWorkHoursSummary() {
    const exportData = employeeStats.value.map(stat => ({
      employeeId: stat.employeeId,
      employeeName: stat.employeeName,
      department: stat.department,
      position: stat.position,
      actualWorkHours: stat.actualWorkHours,
      plannedWorkHours: stat.plannedWorkHours,
      overtimeHours: stat.overtimeHours,
      leaveHours: stat.leaveHours,
      attendanceRate: stat.attendanceRate,
      consecutiveOvertimeDays: stat.consecutiveOvertimeDays,
      isOverworked: stat.isOverworked ? '是' : '否'
    }))

    const columns: ExcelColumn[] = [
      { key: 'employeeId', title: '员工ID' },
      { key: 'employeeName', title: '员工姓名' },
      { key: 'department', title: '部门' },
      { key: 'position', title: '职位' },
      { key: 'plannedWorkHours', title: '计划工时(小时)' },
      { key: 'actualWorkHours', title: '实际工时(小时)' },
      { key: 'overtimeHours', title: '加班工时(小时)' },
      { key: 'leaveHours', title: '请假工时(小时)' },
      { key: 'attendanceRate', title: '出勤率(%)' },
      { key: 'consecutiveOvertimeDays', title: '连续加班天数' },
      { key: 'isOverworked', title: '过劳风险' }
    ]

    exportToExcel(exportData, columns, `工时汇总表_${selectedMonth.value}`)
  }

  function exportWorkHoursDetail(employeeId?: string) {
    let stats = employeeStats.value
    if (employeeId) {
      stats = stats.filter(s => s.employeeId === employeeId)
    }

    const exportData: any[] = []
    stats.forEach(stat => {
      stat.dailyRecords.forEach(record => {
        exportData.push({
          employeeId: stat.employeeId,
          employeeName: stat.employeeName,
          department: stat.department,
          date: record.date,
          checkIn: record.checkIn || '-',
          checkOut: record.checkOut || '-',
          workHours: record.workHours,
          overtimeHours: record.overtimeHours,
          leaveHours: record.leaveHours,
          status: getStatusLabel(record.status)
        })
      })
    })

    const columns: ExcelColumn[] = [
      { key: 'employeeId', title: '员工ID' },
      { key: 'employeeName', title: '员工姓名' },
      { key: 'department', title: '部门' },
      { key: 'date', title: '日期' },
      { key: 'checkIn', title: '签到时间' },
      { key: 'checkOut', title: '签退时间' },
      { key: 'workHours', title: '工作时长(小时)' },
      { key: 'overtimeHours', title: '加班时长(小时)' },
      { key: 'leaveHours', title: '请假时长(小时)' },
      { key: 'status', title: '状态' }
    ]

    const suffix = employeeId ? `_${stats[0]?.employeeName || ''}` : ''
    exportToExcel(exportData, columns, `工时明细表_${selectedMonth.value}${suffix}`)
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      normal: '正常',
      late: '迟到',
      early: '早退',
      absent: '缺勤',
      leave: '请假',
      weekend: '周末',
      holiday: '节假日'
    }
    return labels[status] || status
  }

  return {
    selectedMonth,
    consecutiveOvertimeThreshold,
    currentPage,
    pageSize,
    filterDepartment,
    filterOverworkedOnly,
    employeeStats,
    departmentStats,
    overworkedEmployees,
    planVsActualData,
    paginatedEmployeeStats,
    totalEmployees,
    pagination,
    summaryStats,
    setSelectedMonth,
    setConsecutiveOvertimeThreshold,
    setCurrentPage,
    setPageSize,
    setFilterDepartment,
    setFilterOverworkedOnly,
    exportWorkHoursSummary,
    exportWorkHoursDetail,
    getStatusLabel
  }
})
