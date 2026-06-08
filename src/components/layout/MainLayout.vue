<template>
  <n-layout has-sider style="min-height: 100vh;">
    <n-layout-sider
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      inverted
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="sider-header">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <Users :size="24" color="#fff" />
          </div>
          <span v-if="!collapsed" class="logo-text">HR 系统</span>
        </div>
      </div>
      
      <n-menu
        :value="activeKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :indent="24"
        @update:value="handleMenuClick"
        class="sidebar-menu"
      />
    </n-layout-sider>
    
    <n-layout>
      <n-layout-header style="background: #fff; border-bottom: 1px solid #EDE9FE; overflow: visible;">
        <div class="header-content">
          <div class="header-left">
            <span class="page-title">{{ currentPageTitle }}</span>
          </div>
          <div class="header-right">
            <n-space align="center">
              <n-badge :value="totalNotificationCount" type="info">
                <n-button quaternary circle>
                  <Bell :size="20" />
                </n-button>
              </n-badge>
              <n-dropdown :options="userOptions" @select="handleUserAction">
                <div class="user-info">
                  <n-avatar round :src="userStore.currentUser?.avatar" :size="36" />
                  <div class="user-text" v-if="!collapsed">
                    <span class="user-name">{{ userStore.currentUser?.name }}</span>
                    <span class="user-role">{{ roleLabel }}</span>
                  </div>
                </div>
              </n-dropdown>
            </n-space>
          </div>
        </div>
      </n-layout-header>
      
      <n-layout-content content-style="background: #F5F3FF; min-height: calc(100vh - 64px);">
        <router-view :key="$route.path" />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Users, 
  LayoutDashboard, 
  UserCheck, 
  CalendarCheck, 
  Wallet, 
  Briefcase, 
  GraduationCap, 
  Building2,
  FileText,
  Bell,
  LogOut,
  Settings,
  Award,
  ArrowRightLeft,
  ClipboardList,
  CalendarDays,
  CalendarOff,
  Clock,
  Layers,
  BarChart3,
  UserPlus,
  Trophy
} from 'lucide-vue-next'
import { useContractStore } from '@/stores/contract'
import { useUserStore } from '@/stores/user'
import type { MenuOption, DropdownOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const contractStore = useContractStore()

const collapsed = ref(false)

const activeKey = computed(() => route.path)

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/employees': '员工花名册',
    '/attendance': '考勤统计',
    '/workhours-report': '工时统计报表',
    '/salary': '薪资工资条',
    '/salary-template': '薪资结构模板',
    '/recruitment': '招聘看板',
    '/recruitment-requirement': '招聘需求',
    '/employee-referral': '员工内推',
    '/referral-ranking': '内推排行榜',
    '/interview-schedule': '面试日程',
    '/training': '培训管理',
    '/organization': '组织架构',
    '/contracts': '合同管理',
    '/performance': '绩效考核',
    '/transfer': '异动管理',
    '/leave': '请假管理',
    '/overtime': '加班管理'
  }
  return titles[route.path] || '仪表盘'
})

const roleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    hr: 'HR 专员',
    employee: '普通员工'
  }
  return roleMap[userStore.currentUser?.role || ''] || ''
})

import { h } from 'vue'

const totalNotificationCount = computed(() => 5 + contractStore.expiringCount)

const menuOptions: MenuOption[] = [
  {
    label: '仪表盘',
    key: '/dashboard',
    icon: () => h(LayoutDashboard as any, { size: 20 }) as any
  },
  {
    label: '员工花名册',
    key: '/employees',
    icon: () => h(UserCheck as any, { size: 20 }) as any
  },
  {
    label: '合同管理',
    key: '/contracts',
    icon: () => h(FileText as any, { size: 20 }) as any
  },
  {
    label: '考勤统计',
    key: '/attendance',
    icon: () => h(CalendarCheck as any, { size: 20 }) as any
  },
  {
    label: '请假管理',
    key: '/leave',
    icon: () => h(CalendarOff as any, { size: 20 }) as any
  },
  {
    label: '加班管理',
    key: '/overtime',
    icon: () => h(Clock as any, { size: 20 }) as any
  },
  {
    label: '工时统计报表',
    key: '/workhours-report',
    icon: () => h(BarChart3 as any, { size: 20 }) as any
  },
  {
    label: '薪资管理',
    key: 'salary-group',
    icon: () => h(Wallet as any, { size: 20 }) as any,
    children: [
      {
        label: '薪资工资条',
        key: '/salary',
        icon: () => h(Wallet as any, { size: 18 }) as any
      },
      {
        label: '薪资结构模板',
        key: '/salary-template',
        icon: () => h(Layers as any, { size: 18 }) as any
      }
    ]
  },
  {
        label: '招聘管理',
        key: 'recruitment-group',
        icon: () => h(Briefcase as any, { size: 20 }) as any,
        children: [
          {
            label: '招聘看板',
            key: '/recruitment',
            icon: () => h(Briefcase as any, { size: 18 }) as any
          },
          {
            label: '招聘需求',
            key: '/recruitment-requirement',
            icon: () => h(ClipboardList as any, { size: 18 }) as any
          },
          {
            label: '员工内推',
            key: '/employee-referral',
            icon: () => h(UserPlus as any, { size: 18 }) as any
          },
          {
            label: '内推排行榜',
            key: '/referral-ranking',
            icon: () => h(Trophy as any, { size: 18 }) as any
          },
          {
            label: '面试日程',
            key: '/interview-schedule',
            icon: () => h(CalendarDays as any, { size: 18 }) as any
          }
        ]
      },
  {
    label: '培训管理',
    key: '/training',
    icon: () => h(GraduationCap as any, { size: 20 }) as any
  },
  {
    label: '组织架构',
    key: '/organization',
    icon: () => h(Building2 as any, { size: 20 }) as any
  },
  {
    label: '绩效考核',
    key: '/performance',
    icon: () => h(Award as any, { size: 20 }) as any
  },
  {
    label: '异动管理',
    key: '/transfer',
    icon: () => h(ArrowRightLeft as any, { size: 20 }) as any
  }
]

const userOptions: DropdownOption[] = [
  {
    label: '个人设置',
    key: 'settings',
    icon: () => h(Settings as any, { size: 16 }) as any
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(LogOut as any, { size: 16 }) as any,
    props: {
      style: 'color: #EF4444;'
    }
  }
]

function handleMenuClick(key: string) {
  router.push(key as any)
}

function handleUserAction(key: string) {
  if (key === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

onMounted(() => {
  contractStore.startAutoRefresh(30)
})

onUnmounted(() => {
  contractStore.stopAutoRefresh()
})
</script>

<style scoped>
.sider-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.sidebar-menu {
  border: none;
  background: transparent;
  margin-top: 8px;
}

.sidebar-menu :deep(.n-menu-item) {
  color: #E9D5FF !important;
  font-weight: 500;
}

.sidebar-menu :deep(.n-menu-item:hover) {
  color: #FFFFFF !important;
}

.sidebar-menu :deep(.n-menu-item--active) {
  color: #FFFFFF !important;
  background: #7C3AED !important;
}

.sidebar-menu :deep(.n-menu-item-content-header) {
  color: inherit;
}

.sidebar-menu :deep(.n-menu-item-content__icon) {
  color: inherit;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-right {
  padding-top: 6px;
}

.header-left .page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1E1B4B;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: #F5F3FF;
}

.user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.user-role {
  font-size: 12px;
  color: #7C3AED;
}
</style>
