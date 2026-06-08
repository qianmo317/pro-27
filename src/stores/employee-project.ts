import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EmployeeProject } from '@/types'
import { mockEmployeeProjects } from '@/mock/data'

export const useEmployeeProjectStore = defineStore('employeeProject', () => {
  const projects = ref<EmployeeProject[]>([...mockEmployeeProjects])

  function getProjectsByEmployeeId(employeeId: string): EmployeeProject[] {
    return projects.value
      .filter(p => p.employeeId === employeeId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  function addProject(project: Omit<EmployeeProject, 'id' | 'createdAt'>) {
    const newId = `project-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    projects.value.push({
      ...project,
      id: newId,
      createdAt: today
    })
  }

  function updateProject(id: string, data: Partial<EmployeeProject>) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
    }
  }

  function deleteProject(id: string) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }
  }

  const allRoles = computed(() => {
    const roles = new Set(projects.value.map(p => p.role))
    return Array.from(roles).sort()
  })

  return {
    projects,
    allRoles,
    getProjectsByEmployeeId,
    addProject,
    updateProject,
    deleteProject
  }
})
