import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EmployeeSkill, SkillProficiency, DepartmentSkillStats } from '@/types'
import { mockEmployeeSkills } from '@/mock/data'
import { useEmployeeStore } from './employee'

const PROFICIENCY_VALUES: Record<SkillProficiency, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
}

export const useEmployeeSkillStore = defineStore('employeeSkill', () => {
  const skills = ref<EmployeeSkill[]>([...mockEmployeeSkills])

  const employeeStore = useEmployeeStore()

  function getSkillsByEmployeeId(employeeId: string): EmployeeSkill[] {
    return skills.value.filter(s => s.employeeId === employeeId)
  }

  function addSkill(skill: Omit<EmployeeSkill, 'id' | 'createdAt'>) {
    const newId = `skill-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    skills.value.push({
      ...skill,
      id: newId,
      createdAt: today
    })
  }

  function updateSkill(id: string, data: Partial<EmployeeSkill>) {
    const index = skills.value.findIndex(s => s.id === id)
    if (index !== -1) {
      skills.value[index] = { ...skills.value[index], ...data }
    }
  }

  function deleteSkill(id: string) {
    const index = skills.value.findIndex(s => s.id === id)
    if (index !== -1) {
      skills.value.splice(index, 1)
    }
  }

  function getDepartmentSkillStats(department: string): DepartmentSkillStats[] {
    const departmentEmployees = employeeStore.employees.filter(e => e.department === department)
    const departmentEmployeeIds = new Set(departmentEmployees.map(e => e.id))
    const departmentSkills = skills.value.filter(s => departmentEmployeeIds.has(s.employeeId))

    const skillMap = new Map<string, DepartmentSkillStats>()

    departmentSkills.forEach(skill => {
      const existing = skillMap.get(skill.skillName)
      const profValue = PROFICIENCY_VALUES[skill.proficiency]

      if (existing) {
        existing.totalCount++
        existing.avgProficiency += profValue
        if (skill.proficiency === 'expert') existing.expertCount++
        if (skill.proficiency === 'advanced') existing.advancedCount++
        if (skill.proficiency === 'intermediate') existing.intermediateCount++
        if (skill.proficiency === 'beginner') existing.beginnerCount++
      } else {
        skillMap.set(skill.skillName, {
          department,
          skillName: skill.skillName,
          totalCount: 1,
          avgProficiency: profValue,
          expertCount: skill.proficiency === 'expert' ? 1 : 0,
          advancedCount: skill.proficiency === 'advanced' ? 1 : 0,
          intermediateCount: skill.proficiency === 'intermediate' ? 1 : 0,
          beginnerCount: skill.proficiency === 'beginner' ? 1 : 0
        })
      }
    })

    const result = Array.from(skillMap.values())
    result.forEach(stat => {
      stat.avgProficiency = Number((stat.avgProficiency / stat.totalCount).toFixed(2))
    })

    return result.sort((a, b) => b.totalCount - a.totalCount)
  }

  const allCategories = computed(() => {
    const categories = new Set(skills.value.map(s => s.category))
    return Array.from(categories)
  })

  const allSkillNames = computed(() => {
    const names = new Set(skills.value.map(s => s.skillName))
    return Array.from(names).sort()
  })

  function getTopSkillsForRadar(department: string, topN = 8): { indicator: { name: string; max: number }[]; values: number[] } {
    const stats = getDepartmentSkillStats(department)
    const topSkills = stats.slice(0, topN)
    
    return {
      indicator: topSkills.map(s => ({ name: s.skillName, max: 4 })),
      values: topSkills.map(s => s.avgProficiency)
    }
  }

  function isSkillExists(employeeId: string, skillName: string): boolean {
    return skills.value.some(s => s.employeeId === employeeId && s.skillName === skillName)
  }

  return {
    skills,
    allCategories,
    allSkillNames,
    getSkillsByEmployeeId,
    addSkill,
    updateSkill,
    deleteSkill,
    getDepartmentSkillStats,
    getTopSkillsForRadar,
    isSkillExists
  }
})
