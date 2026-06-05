import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TrainingCourse } from '@/types'
import { mockTrainingCourses } from '@/mock/data'

export const useTrainingStore = defineStore('training', () => {
  const courses = ref<TrainingCourse[]>([...mockTrainingCourses])
  const statusFilter = ref('')

  const filteredCourses = computed(() => {
    if (!statusFilter.value) return courses.value
    return courses.value.filter(c => c.status === statusFilter.value)
  })

  const upcomingCourses = computed(() => 
    courses.value.filter(c => c.status === 'upcoming')
  )
  const ongoingCourses = computed(() => 
    courses.value.filter(c => c.status === 'ongoing')
  )
  const completedCourses = computed(() => 
    courses.value.filter(c => c.status === 'completed')
  )

  function setStatusFilter(status: string) {
    statusFilter.value = status
  }

  function addCourse(course: Omit<TrainingCourse, 'id'>) {
    const newId = `tc-${Date.now()}`
    courses.value.push({ ...course, id: newId })
  }

  function updateCourse(id: string, data: Partial<TrainingCourse>) {
    const index = courses.value.findIndex(c => c.id === id)
    if (index !== -1) {
      courses.value[index] = { ...courses.value[index], ...data }
    }
  }

  function deleteCourse(id: string) {
    const index = courses.value.findIndex(c => c.id === id)
    if (index !== -1) {
      courses.value.splice(index, 1)
    }
  }

  function enrollCourse(id: string) {
    const index = courses.value.findIndex(c => c.id === id)
    if (index !== -1) {
      courses.value[index] = {
        ...courses.value[index],
        participants: courses.value[index].participants + 1
      }
    }
  }

  return {
    courses,
    statusFilter,
    filteredCourses,
    upcomingCourses,
    ongoingCourses,
    completedCourses,
    setStatusFilter,
    addCourse,
    updateCourse,
    deleteCourse,
    enrollCourse
  }
})
