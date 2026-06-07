import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Department, Employee } from '@/types'
import { flatDepartments } from '@/mock/data'
import { useEmployeeStore } from './employee'

interface FlatDepartment {
  id: string
  name: string
  parentId: string | null
  manager: string
  managerId?: string
  position?: { x: number; y: number }
}

const STORAGE_KEY_LAYOUT = 'org_dept_layout'
const STORAGE_KEY_DEPARTMENTS = 'org_dept_data'

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.error('Failed to save to localStorage')
  }
}

export const useOrganizationStore = defineStore('organization', () => {
  const employeeStore = useEmployeeStore()

  const initialFlatDepts: FlatDepartment[] = loadFromStorage(STORAGE_KEY_DEPARTMENTS, flatDepartments.map(d => ({ ...d })))

  const flatDepartmentsRef = ref<FlatDepartment[]>(initialFlatDepts)

  const savedLayouts = ref<Record<string, { x: number; y: number }>>(loadFromStorage(STORAGE_KEY_LAYOUT, {}))

  const expandedKeys = ref<string[]>(['dept-1', 'dept-2'])

  function toggleExpand(deptId: string) {
    const index = expandedKeys.value.indexOf(deptId)
    if (index === -1) {
      expandedKeys.value.push(deptId)
    } else {
      expandedKeys.value.splice(index, 1)
    }
  }

  function isExpanded(deptId: string): boolean {
    return expandedKeys.value.includes(deptId)
  }

  function expandAll() {
    const allKeys: string[] = []
    flatDepartmentsRef.value.forEach(d => allKeys.push(d.id))
    expandedKeys.value = allKeys
  }

  function collapseAll() {
    expandedKeys.value = []
  }

  function getDepartmentById(id: string): FlatDepartment | undefined {
    return flatDepartmentsRef.value.find(d => d.id === id)
  }

  function getDepartmentByName(name: string): FlatDepartment | undefined {
    return flatDepartmentsRef.value.find(d => d.name === name)
  }

  function getChildDepartments(parentId: string | null): FlatDepartment[] {
    return flatDepartmentsRef.value.filter(d => d.parentId === parentId)
  }

  function getAllSubDepartmentIds(parentId: string): string[] {
    const result: string[] = []
    function collect(pid: string) {
      flatDepartmentsRef.value.forEach(d => {
        if (d.parentId === pid) {
          result.push(d.id)
          collect(d.id)
        }
      })
    }
    collect(parentId)
    return result
  }

  function getDepartmentPath(deptId: string): string[] {
    const path: string[] = []
    let current: FlatDepartment | undefined = getDepartmentById(deptId)
    while (current) {
      path.unshift(current.id)
      current = current.parentId ? getDepartmentById(current.parentId) : undefined
    }
    return path
  }

  const departments = computed<Department[]>(() => {
    return buildDepartmentTree(flatDepartmentsRef.value, employeeStore.employees, savedLayouts.value)
  })

  const departmentOptions = computed(() => {
    return flatDepartmentsRef.value
      .filter(d => d.parentId !== null)
      .map(d => ({ label: d.name, value: d.name }))
  })

  const allDepartmentOptions = computed(() => {
    return flatDepartmentsRef.value.map(d => ({ label: d.name, value: d.name }))
  })

  function buildDepartmentTree(
    depts: FlatDepartment[],
    emps: Employee[],
    layouts: Record<string, { x: number; y: number }>
  ): Department[] {
    const deptMap: Record<string, Department> = {}

    depts.forEach(dept => {
      deptMap[dept.id] = {
        ...dept,
        employeeCount: 0,
        employees: [],
        children: [],
        position: layouts[dept.id]
      }
    })

    function getSubDepartments(parentId: string | null): string[] {
      const result: string[] = []
      function collect(pid: string | null) {
        depts.forEach(d => {
          if (d.parentId === pid) {
            result.push(d.id)
            collect(d.id)
          }
        })
      }
      collect(parentId)
      return result
    }

    depts.forEach(dept => {
      const subDeptIds = getSubDepartments(dept.id)
      const subDeptNames = [dept.name, ...subDeptIds.map(id => deptMap[id]?.name).filter(Boolean)]
      const deptEmps = emps.filter(e => subDeptNames.includes(e.department))
      deptMap[dept.id].employees = deptEmps
      deptMap[dept.id].employeeCount = deptEmps.length
    })

    const rootDepartments: Department[] = []
    depts.forEach(dept => {
      if (dept.parentId === null) {
        rootDepartments.push(deptMap[dept.id])
      } else if (deptMap[dept.parentId]) {
        if (!deptMap[dept.parentId].children) {
          deptMap[dept.parentId].children = []
        }
        deptMap[dept.parentId].children!.push(deptMap[dept.id])
      }
    })

    return rootDepartments
  }

  function generateDeptId(): string {
    const maxId = Math.max(
      ...flatDepartmentsRef.value.map(d => {
        const match = d.id.match(/dept-(\d+)/)
        return match ? parseInt(match[1]) : 0
      }),
      0
    )
    return `dept-${maxId + 1}`
  }

  function addDepartment(data: {
    name: string
    parentId: string | null
    manager: string
    managerId?: string
  }) {
    const newDept: FlatDepartment = {
      id: generateDeptId(),
      name: data.name,
      parentId: data.parentId,
      manager: data.manager,
      managerId: data.managerId
    }
    flatDepartmentsRef.value.push(newDept)
    persistDepartments()
    return newDept
  }

  function updateDepartment(id: string, data: Partial<Omit<FlatDepartment, 'id'>>) {
    const index = flatDepartmentsRef.value.findIndex(d => d.id === id)
    if (index === -1) return

    const oldDept = flatDepartmentsRef.value[index]
    const oldName = oldDept.name

    flatDepartmentsRef.value[index] = {
      ...oldDept,
      ...data
    }

    if (data.name && data.name !== oldName) {
      syncEmployeeDepartment(oldName, data.name)
    }

    persistDepartments()
  }

  function deleteDepartment(id: string) {
    const dept = getDepartmentById(id)
    if (!dept) return

    const subDeptIds = getAllSubDepartmentIds(id)
    const allIdsToDelete = [id, ...subDeptIds]

    const deletedDeptNames = allIdsToDelete
      .map(did => getDepartmentById(did)?.name)
      .filter(Boolean) as string[]

    allIdsToDelete.forEach(did => {
      const idx = flatDepartmentsRef.value.findIndex(d => d.id === did)
      if (idx !== -1) {
        flatDepartmentsRef.value.splice(idx, 1)
      }
    })

    deletedDeptNames.forEach(name => {
      syncEmployeeDepartment(name, '')
    })

    persistDepartments()
  }

  function moveDepartment(id: string, newParentId: string | null) {
    const dept = getDepartmentById(id)
    if (!dept) return

    if (newParentId !== null) {
      const path = getDepartmentPath(newParentId)
      if (path.includes(id)) {
        return
      }
    }

    const index = flatDepartmentsRef.value.findIndex(d => d.id === id)
    if (index !== -1) {
      flatDepartmentsRef.value[index].parentId = newParentId
    }

    persistDepartments()
  }

  function syncEmployeeDepartment(oldName: string, newName: string) {
    employeeStore.employees.forEach(emp => {
      if (emp.department === oldName) {
        employeeStore.updateEmployee(emp.id, { department: newName })
      }
    })
  }

  function updateEmployeeDepartment(employeeId: string, departmentName: string) {
    employeeStore.updateEmployee(employeeId, { department: departmentName })
  }

  function saveNodePosition(deptId: string, position: { x: number; y: number }) {
    savedLayouts.value[deptId] = position
    persistLayout()
  }

  function clearNodePosition(deptId: string) {
    delete savedLayouts.value[deptId]
    persistLayout()
  }

  function persistDepartments() {
    saveToStorage(STORAGE_KEY_DEPARTMENTS, flatDepartmentsRef.value)
  }

  function persistLayout() {
    saveToStorage(STORAGE_KEY_LAYOUT, savedLayouts.value)
  }

  function resetToDefault() {
    flatDepartmentsRef.value = flatDepartments.map(d => ({ ...d }))
    savedLayouts.value = {}
    localStorage.removeItem(STORAGE_KEY_DEPARTMENTS)
    localStorage.removeItem(STORAGE_KEY_LAYOUT)
  }

  return {
    flatDepartments: flatDepartmentsRef,
    departments,
    expandedKeys,
    savedLayouts,
    departmentOptions,
    allDepartmentOptions,
    toggleExpand,
    isExpanded,
    expandAll,
    collapseAll,
    getDepartmentById,
    getDepartmentByName,
    getChildDepartments,
    getAllSubDepartmentIds,
    getDepartmentPath,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    moveDepartment,
    updateEmployeeDepartment,
    saveNodePosition,
    clearNodePosition,
    resetToDefault
  }
})
