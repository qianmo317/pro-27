<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <div class="page-title">内推排行榜</div>
        <div class="page-subtitle">各部门内推成绩展示，激发员工推荐热情</div>
      </div>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #EDE9FE;">
            <Trophy :size="24" color="#8B5CF6" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalReferrals }}</div>
            <div class="stat-label">总内推数</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #D1FAE5;">
            <Users :size="24" color="#10B981" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalHired }}</div>
            <div class="stat-label">成功入职</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #FEF3C7;">
            <Percent :size="24" color="#F59E0B" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ successRate }}%</div>
            <div class="stat-label">入职转化率</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon" style="background: #DBEAFE;">
            <Wallet :size="24" color="#3B82F6" />
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ totalBonus.toLocaleString() }}</div>
            <div class="stat-label">累计奖金</div>
          </div>
        </div>
      </n-card>
    </div>

    <div class="ranking-section">
      <n-card class="ranking-card" title="部门排行榜">
        <template #header-extra>
          <n-tag size="large" type="info">
            共 {{ referralStore.departmentRankings.length }} 个部门参与
          </n-tag>
        </template>
        
        <div class="podium-section">
          <div 
            v-for="(dept, index) in topThreeDepartments" 
            :key="dept.department"
            class="podium-item"
            :class="`podium-${index + 1}`"
          >
            <div class="podium-rank">
              <Medal 
                v-if="index === 0" 
                :size="48" 
                color="#F59E0B" 
              />
              <Medal 
                v-else-if="index === 1" 
                :size="40" 
                color="#9CA3AF" 
              />
              <Medal 
                v-else-if="index === 2" 
                :size="36" 
                color="#CD7F32" 
              />
            </div>
            <div class="podium-info">
              <div class="podium-dept">{{ dept.department }}</div>
              <div class="podium-stats">
                <span class="podium-hired">
                  <UserCheck :size="14" />
                  {{ dept.hiredCount }} 人入职
                </span>
                <span class="podium-referral">
                  <FileText :size="14" />
                  {{ dept.referralCount }} 次内推
                </span>
              </div>
              <div class="podium-bonus">
                ¥{{ dept.totalBonus.toLocaleString() }} 奖金
              </div>
            </div>
            <div class="podium-stand" :class="`stand-${index + 1}`">
              <span class="stand-rank">第{{ dept.rank }}名</span>
            </div>
          </div>
        </div>

        <n-data-table
          :columns="deptColumns"
          :data="otherDepartments"
          :pagination="false"
          class="dept-table"
        />
      </n-card>

      <n-card class="ranking-card" title="个人排行榜">
        <template #header-extra>
          <n-select 
            v-model:value="selectedDepartment" 
            :options="departmentFilterOptions" 
            placeholder="全部部门"
            clearable
            style="width: 150px;"
          />
        </template>

        <div class="personal-top-list">
          <div 
            v-for="(emp, index) in topThreeEmployees" 
            :key="emp.id"
            class="personal-top-item"
          >
            <div class="personal-rank" :class="`personal-rank-${index + 1}`">
              {{ index + 1 }}
            </div>
            <n-avatar round :size="50" :src="getEmployeeAvatar(emp.id)" />
            <div class="personal-info">
              <div class="personal-name">{{ emp.name }}</div>
              <div class="personal-dept">{{ getEmployeeDepartment(emp.id) }}</div>
            </div>
            <div class="personal-stats">
              <div class="stat-item">
                <span class="stat-number">{{ emp.referralCount }}</span>
                <span class="stat-label">内推</span>
              </div>
              <div class="stat-item stat-divider">|</div>
              <div class="stat-item">
                <span class="stat-number highlight">{{ emp.hiredCount }}</span>
                <span class="stat-label">入职</span>
              </div>
              <div class="stat-item stat-divider">|</div>
              <div class="stat-item">
                <span class="stat-number bonus">¥{{ emp.totalBonus.toLocaleString() }}</span>
                <span class="stat-label">奖金</span>
              </div>
            </div>
          </div>
        </div>

        <n-data-table
          :columns="empColumns"
          :data="otherEmployees"
          :pagination="false"
          class="emp-table"
        />
      </n-card>
    </div>

    <n-card class="bonus-rules-card">
      <template #header>
        <div class="card-header">
          <Award :size="20" color="#8B5CF6" />
          <span>内推奖励规则</span>
        </div>
      </template>
      <div class="bonus-rules">
        <div 
          v-for="(rule, index) in bonusRules" 
          :key="index"
          class="bonus-rule-item"
        >
          <div class="rule-icon" :style="{ background: rule.color + '20', color: rule.color }">
            <Briefcase :size="20" />
          </div>
          <div class="rule-info">
            <div class="rule-title">{{ rule.title }}</div>
            <div class="rule-desc">{{ rule.desc }}</div>
          </div>
          <div class="rule-bonus">
            <span class="bonus-amount">¥{{ rule.bonus.toLocaleString() }}</span>
            <span class="bonus-label">/人</span>
          </div>
        </div>
      </div>
      <n-alert type="info" class="rule-note">
        <template #icon>
          <Info :size="16" />
        </template>
        奖金将在候选人成功入职并通过试用期后一次性发放，如有任何疑问请联系人力资源部。
      </n-alert>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { 
  Trophy, Users, Percent, Wallet, Medal, UserCheck, 
  FileText, Award, Briefcase, Info 
} from 'lucide-vue-next'
import type { DataTableColumns } from 'naive-ui'
import { useReferralStore } from '@/stores/referral'
import { REFERRAL_BONUS_RULES, DEPARTMENT_OPTIONS } from '@/types'
import { mockEmployees } from '@/mock/data'

const referralStore = useReferralStore()
const selectedDepartment = ref<string | null>(null)

const totalReferrals = computed(() => referralStore.referrals.length)
const totalHired = computed(() => referralStore.hiredReferrals.length)
const successRate = computed(() => {
  if (totalReferrals.value === 0) return 0
  return Math.round((totalHired.value / totalReferrals.value) * 100)
})
const totalBonus = computed(() => referralStore.totalBonusPaid)

const departmentFilterOptions = DEPARTMENT_OPTIONS.map(d => ({
  label: d.label,
  value: d.value
}))

const topThreeDepartments = computed(() => 
  referralStore.departmentRankings.slice(0, 3)
)

const otherDepartments = computed(() => 
  referralStore.departmentRankings.slice(3).map((dept, index) => ({
    ...dept,
    rank: index + 4
  }))
)

const allEmployees = computed(() => {
  let employees: {
    id: string
    name: string
    referralCount: number
    hiredCount: number
    totalBonus: number
    department: string
  }[] = []
  
  referralStore.departmentRankings.forEach(dept => {
    if (selectedDepartment.value && dept.department !== selectedDepartment.value) return
    dept.employees.forEach(emp => {
      employees.push({
        ...emp,
        department: dept.department
      })
    })
  })
  
  return employees.sort((a, b) => b.hiredCount - a.hiredCount || b.referralCount - a.referralCount)
})

const topThreeEmployees = computed(() => 
  allEmployees.value.slice(0, 3)
)

const otherEmployees = computed(() => 
  allEmployees.value.slice(3).map((emp, index) => ({
    ...emp,
    rank: index + 4
  }))
)

const bonusRules = [
  {
    title: 'P4及以下岗位',
    desc: '初级、中级岗位，包含P1-P3、P4级别',
    bonus: REFERRAL_BONUS_RULES.P4_BELOW,
    color: '#3B82F6'
  },
  {
    title: 'P4-P5高级岗位',
    desc: '高级岗位，包含P4、P5级别',
    bonus: REFERRAL_BONUS_RULES.P4_P5,
    color: '#8B5CF6'
  },
  {
    title: 'P6及以上专家岗位',
    desc: '专家、资深专家岗位，包含P6及以上',
    bonus: REFERRAL_BONUS_RULES.P6_ABOVE,
    color: '#F59E0B'
  },
  {
    title: '管理岗位',
    desc: '经理、总监及以上管理岗位',
    bonus: REFERRAL_BONUS_RULES.MANAGER,
    color: '#EF4444'
  }
]

const deptColumns: DataTableColumns<any> = [
  {
    title: '排名',
    key: 'rank',
    width: 80,
    render: (row) => h('span', { class: 'rank-number' }, `第${row.rank}名`)
  },
  {
    title: '部门',
    key: 'department',
    width: 150
  },
  {
    title: '内推数',
    key: 'referralCount',
    width: 100
  },
  {
    title: '入职数',
    key: 'hiredCount',
    width: 100,
    render: (row) => h('span', { class: 'hired-count' }, row.hiredCount)
  },
  {
    title: '累计奖金',
    key: 'totalBonus',
    width: 120,
    render: (row) => h('span', { class: 'bonus-text' }, `¥${row.totalBonus.toLocaleString()}`)
  },
  {
    title: '参与员工',
    key: 'employeeCount',
    render: (row) => `${row.employees.length} 人`
  }
]

const empColumns: DataTableColumns<any> = [
  {
    title: '排名',
    key: 'rank',
    width: 80,
    render: (row) => h('span', { class: 'rank-number' }, `第${row.rank}名`)
  },
  {
    title: '员工',
    key: 'name',
    width: 150,
    render: (row) => h('div', { class: 'employee-cell' }, [
      h('n-avatar', { round: true, size: 32, src: getEmployeeAvatar(row.id) }),
      h('span', { class: 'employee-name' }, row.name)
    ])
  },
  {
    title: '部门',
    key: 'department',
    width: 120
  },
  {
    title: '内推数',
    key: 'referralCount',
    width: 100
  },
  {
    title: '入职数',
    key: 'hiredCount',
    width: 100,
    render: (row) => h('span', { class: 'hired-count' }, row.hiredCount)
  },
  {
    title: '累计奖金',
    key: 'totalBonus',
    render: (row) => h('span', { class: 'bonus-text' }, `¥${row.totalBonus.toLocaleString()}`)
  }
]

function getEmployeeAvatar(id: string): string {
  const employee = mockEmployees.find(e => e.id === id)
  return employee?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
}

function getEmployeeDepartment(id: string): string {
  const employee = mockEmployees.find(e => e.id === id)
  return employee?.department || '-'
}
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1E1B4B;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: #6B7280;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1E1B4B;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
}

.ranking-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.ranking-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.podium-section {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 24px;
  padding: 40px 20px 20px;
  margin-bottom: 24px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  max-width: 200px;
}

.podium-item.podium-1 {
  order: 2;
}

.podium-item.podium-2 {
  order: 1;
}

.podium-item.podium-3 {
  order: 3;
}

.podium-rank {
  margin-bottom: 12px;
}

.podium-info {
  margin-bottom: 12px;
}

.podium-dept {
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 8px;
}

.podium-stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6B7280;
}

.podium-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.podium-hired {
  color: #10B981;
  font-weight: 500;
}

.podium-bonus {
  font-size: 13px;
  font-weight: 600;
  color: #8B5CF6;
}

.podium-stand {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
}

.podium-stand.stand-1 {
  height: 100px;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  font-size: 16px;
}

.podium-stand.stand-2 {
  height: 80px;
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
  font-size: 14px;
}

.podium-stand.stand-3 {
  height: 60px;
  background: linear-gradient(135deg, #CD7F32 0%, #A66A28 100%);
  font-size: 14px;
}

.dept-table, .emp-table {
  margin-top: 16px;
}

.rank-number {
  font-weight: 500;
  color: #6B7280;
}

.hired-count {
  font-weight: 600;
  color: #10B981;
}

.bonus-text {
  font-weight: 600;
  color: #8B5CF6;
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-name {
  font-weight: 500;
  color: #1E1B4B;
}

.personal-top-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #F5F3FF;
  border-radius: 12px;
}

.personal-top-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
}

.personal-rank {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
}

.personal-rank-1 {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.personal-rank-2 {
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
}

.personal-rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #A66A28 100%);
}

.personal-info {
  flex: 1;
}

.personal-name {
  font-size: 15px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 2px;
}

.personal-dept {
  font-size: 12px;
  color: #6B7280;
}

.personal-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #1E1B4B;
}

.stat-number.highlight {
  color: #10B981;
}

.stat-number.bonus {
  color: #8B5CF6;
}

.stat-label {
  font-size: 11px;
  color: #6B7280;
}

.stat-divider {
  color: #E5E7EB;
  font-size: 20px;
}

.bonus-rules-card {
  border-radius: 12px;
}

.bonus-rules {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.bonus-rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #F5F3FF;
  border-radius: 10px;
}

.rule-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rule-info {
  flex: 1;
  min-width: 0;
}

.rule-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 2px;
}

.rule-desc {
  font-size: 12px;
  color: #6B7280;
  line-height: 1.4;
}

.rule-bonus {
  text-align: right;
  flex-shrink: 0;
}

.bonus-amount {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #8B5CF6;
}

.bonus-label {
  font-size: 12px;
  color: #6B7280;
}

.rule-note {
  margin-top: 8px;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ranking-section {
    grid-template-columns: 1fr;
  }
  
  .bonus-rules {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .podium-section {
    flex-direction: column;
    align-items: center;
  }
  
  .podium-item {
    max-width: 100%;
  }
  
  .podium-item.podium-1 {
    order: 1;
  }
  
  .podium-item.podium-2 {
    order: 2;
  }
  
  .podium-item.podium-3 {
    order: 3;
  }
  
  .bonus-rules {
    grid-template-columns: 1fr;
  }
  
  .personal-stats {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .stat-divider {
    display: none;
  }
}
</style>
