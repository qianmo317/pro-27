import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: '/employees',
        name: 'employees',
        component: () => import('@/views/Employees.vue'),
        meta: { title: '员工花名册' }
      },
      {
        path: '/attendance',
        name: 'attendance',
        component: () => import('@/views/Attendance.vue'),
        meta: { title: '考勤统计' }
      },
      {
        path: '/salary',
        name: 'salary',
        component: () => import('@/views/Salary.vue'),
        meta: { title: '薪资工资条' }
      },
      {
        path: '/salary-template',
        name: 'salary-template',
        component: () => import('@/views/SalaryTemplate.vue'),
        meta: { title: '薪资结构模板' }
      },
      {
        path: '/recruitment',
        name: 'recruitment',
        component: () => import('@/views/Recruitment.vue'),
        meta: { title: '招聘看板' }
      },
      {
        path: '/recruitment-requirement',
        name: 'recruitment-requirement',
        component: () => import('@/views/RecruitmentRequirement.vue'),
        meta: { title: '招聘需求' }
      },
      {
        path: '/training',
        name: 'training',
        component: () => import('@/views/Training.vue'),
        meta: { title: '培训管理' }
      },
      {
        path: '/organization',
        name: 'organization',
        component: () => import('@/views/Organization.vue'),
        meta: { title: '组织架构' }
      },
      {
        path: '/contracts',
        name: 'contracts',
        component: () => import('@/views/Contracts.vue'),
        meta: { title: '合同管理' }
      },
      {
        path: '/performance',
        name: 'performance',
        component: () => import('@/views/Performance.vue'),
        meta: { title: '绩效考核' }
      },
      {
        path: '/transfer',
        name: 'transfer',
        component: () => import('@/views/Transfer.vue'),
        meta: { title: '异动管理' }
      },
      {
        path: '/interview-schedule',
        name: 'interview-schedule',
        component: () => import('@/views/InterviewSchedule.vue'),
        meta: { title: '面试日程' }
      },
      {
        path: '/leave',
        name: 'leave',
        component: () => import('@/views/Leave.vue'),
        meta: { title: '请假管理' }
      },
      {
        path: '/overtime',
        name: 'overtime',
        component: () => import('@/views/Overtime.vue'),
        meta: { title: '加班管理' }
      },
      {
        path: '/workhours-report',
        name: 'workhours-report',
        component: () => import('@/views/WorkHoursReport.vue'),
        meta: { title: '工时统计报表' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    userStore.restoreSession()
    if (!userStore.isLoggedIn) {
      next('/login')
      return
    }
  }
  
  if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - HR 人力资源管理系统` : 'HR 人力资源管理系统'
})

export default router
