import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Department } from '@/types'
import { mockDepartments } from '@/mock/data'

export const useOrganizationStore = defineStore('organization', () => {
  const departments = ref<Department[]>([...mockDepartments])
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
    function collect(deps: Department[]) {
      deps.forEach(d => {
        allKeys.push(d.id)
        if (d.children) collect(d.children)
      })
    }
    collect(departments.value)
    expandedKeys.value = allKeys
  }

  function collapseAll() {
    expandedKeys.value = []
  }

  return {
    departments,
    expandedKeys,
    toggleExpand,
    isExpanded,
    expandAll,
    collapseAll
  }
})
