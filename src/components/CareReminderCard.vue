<template>
  <div>
    <n-card class="care-reminder-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <Cake :size="18" :color="titleColor" />
            <span>{{ title }}</span>
          </span>
          <div class="header-actions">
            <n-badge v-if="unreadCount > 0" :value="unreadCount" type="error" />
            <n-button quaternary size="small" @click="showSettingsModal = true">
              <Settings :size="16" />
            </n-button>
          </div>
        </div>
        <div class="card-subtitle">{{ subtitle }}</div>
      </template>

      <div v-if="reminders.length > 0" class="reminder-list">
        <div
          v-for="item in reminders"
          :key="`${item.employee.id}-${type}`"
          class="reminder-item"
          @click="handleItemClick(item)"
        >
          <div class="item-avatar">
            <n-avatar round :src="item.employee.avatar" :size="44" />
            <div v-if="item.daysRemaining === 0" class="avatar-badge birthday">
              <PartyPopper :size="12" />
            </div>
          </div>
          <div class="item-info">
            <div class="item-name">
              <span class="employee-name">{{ item.employee.name }}</span>
              <n-tag
                :type="item.daysRemaining === 0 ? 'error' : item.daysRemaining <= 2 ? 'warning' : 'info'"
                size="small"
              >
                {{ getDaysLabel(item.daysRemaining) }}
              </n-tag>
            </div>
            <div class="item-meta">
              <span>{{ item.employee.department }} · {{ item.employee.position }}</span>
            </div>
            <div class="item-date">
              <Calendar :size="12" />
              <span>{{ formatDate(item.date) }}</span>
              <span v-if="getYears(item)" class="item-years">
                · {{ type === 'birthday' ? `${getYears(item)}岁生日` : `入职${getYears(item)}周年` }}
              </span>
            </div>
          </div>
          <div class="item-actions">
            <n-button size="small" type="primary" @click.stop="handleSendBlessing(item)">
              <Heart :size="14" />
              <span>送祝福</span>
            </n-button>
          </div>
        </div>
      </div>

      <n-empty v-else :description="emptyText" />
    </n-card>

    <n-modal v-model:show="showBlessingModal" preset="card" :title="blessingModalTitle" style="width: 520px;">
      <div v-if="selectedItem" class="blessing-form">
        <div class="blessing-header">
          <n-avatar round :src="selectedItem.employee.avatar" :size="60" />
          <div class="blessing-info">
            <div class="blessing-name">{{ selectedItem.employee.name }}</div>
            <div class="blessing-type">
              {{ type === 'birthday' ? '生日祝福' : '入职周年祝福' }}
              <span v-if="getYears(selectedItem)">
                · {{ type === 'birthday' ? `${getYears(selectedItem)}岁` : `${getYears(selectedItem)}周年` }}
              </span>
            </div>
          </div>
          </div>
        <n-form label-placement="top">
          <n-form-item label="祝福内容">
            <n-input
              v-model:value="blessingContent"
              type="textarea"
              :rows="5"
              placeholder="请输入祝福内容..."
            />
          </n-form-item>
          <n-form-item>
            <n-space>
              <n-button size="small" @click="useDefaultBlessing">使用默认祝福语</n-button>
              <n-button size="small" v-for="tpl in quickTemplates" :key="tpl" @click="blessingContent = tpl">
                {{ tpl.substring(0, 10) }}...
              </n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBlessingModal = false">取消</n-button>
          <n-button type="primary" :disabled="!blessingContent.trim()" @click="sendBlessing">
            发送祝福
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showSettingsModal" preset="card" title="关怀提醒设置" style="width: 560px;">
      <n-form label-placement="left" label-width="140px">
        <n-form-item label="生日提醒">
          <n-space vertical>
            <n-space>
              <n-switch v-model:value="localSettings.birthdayReminderEnabled" />
              <span>开启生日提醒</span>
            </n-space>
            <n-space v-if="localSettings.birthdayReminderEnabled">
              <span>提前</span>
              <n-input-number
                v-model:value="localSettings.birthdayAdvanceDays"
                :min="1"
                :max="30"
                size="small"
                style="width: 100px;"
              />
              <span>天提醒</span>
            </n-space>
          </n-space>
        </n-form-item>
        <n-form-item label="入职周年提醒">
          <n-space vertical>
            <n-space>
              <n-switch v-model:value="localSettings.anniversaryReminderEnabled" />
              <span>开启入职周年提醒</span>
            </n-space>
            <n-space v-if="localSettings.anniversaryReminderEnabled">
              <span>提前</span>
              <n-input-number
                v-model:value="localSettings.anniversaryAdvanceDays"
                :min="1"
                :max="30"
                size="small"
                style="width: 100px;"
              />
              <span>天提醒</span>
            </n-space>
          </n-space>
        </n-form-item>
        <n-form-item label="每日自动扫描">
          <n-space>
            <n-switch v-model:value="localSettings.autoScanEnabled" />
            <span>开启每日自动扫描</span>
            <n-time-picker
              v-model:value="localSettings.scanTime"
              size="small"
              format="HH:mm"
              value-format="HH:mm"
            />
          </n-space>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSettingsModal = false">取消</n-button>
          <n-button type="primary" @click="saveSettings">保存设置</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { Cake, Heart, Calendar, Settings, PartyPopper } from 'lucide-vue-next'
import { useCareStore } from '@/stores/care'
import type { Employee } from '@/types'

interface Props {
  type: 'birthday' | 'anniversary'
}

type ReminderItem = {
  employee: Employee
  daysRemaining: number
  date: Date
} & (
  | { age: number; upcomingAge: number; years?: never; upcomingYears?: never }
  | { years: number; upcomingYears: number; age?: never; upcomingAge?: never }
)

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'view-detail', employee: Employee): void
  (e: 'blessing-sent', employee: Employee, content: string): void
}>()

const message = useMessage()
const careStore = useCareStore()

const showBlessingModal = ref(false)
const showSettingsModal = ref(false)
const selectedItem = ref<ReminderItem | null>(null)
const blessingContent = ref('')

const localSettings = ref({ ...careStore.settings })

watch(showSettingsModal, (val) => {
  if (val) {
    localSettings.value = { ...careStore.settings }
  }
})

const reminders = computed(() => {
  return props.type === 'birthday' ? careStore.thisWeekBirthdays : careStore.thisWeekAnniversaries
})

const unreadCount = computed(() => {
  return careStore.unreadReminders.filter(
    r => r.type === props.type
  ).length
})

const title = computed(() => props.type === 'birthday' ? '本周生日' : '本周入职周年')
const subtitle = computed(() => {
  const count = reminders.value.length
  return count > 0 ? `${count} 位同事需要关怀` : '本周暂无需要关怀的同事'
})
const titleColor = computed(() => props.type === 'birthday' ? '#EC4899' : '#8B5CF6')
const emptyText = computed(() => props.type === 'birthday' ? '本周没有员工过生日' : '本周没有员工入职周年')
const blessingModalTitle = computed(() => {
  if (!selectedItem.value) return ''
  return `发送${props.type === 'birthday' ? '生日' : '入职周年'}祝福`
})

const quickTemplates = [
  '生日快乐！愿你的每一天都充满阳光和欢笑！🎂🎉',
  '祝工作顺利，心想事成，生日快乐！🎁🎈',
  '入职周年快乐！感谢你的辛勤付出！🏆👏',
  '恭喜入职周年，愿我们一起成长，共创辉煌！🚀🌟'
]

function handleItemClick(item: ReminderItem) {
  emit('view-detail', item.employee)
}

function handleSendBlessing(item: ReminderItem) {
  selectedItem.value = item
  blessingContent.value = careStore.getDefaultBlessing(
    props.type,
    item.employee.name,
    getYears(item)
  )
  showBlessingModal.value = true
}

function useDefaultBlessing() {
  if (!selectedItem.value) return
  blessingContent.value = careStore.getDefaultBlessing(
    props.type,
    selectedItem.value.employee.name,
    getYears(selectedItem.value)
  )
}

function sendBlessing() {
  if (!selectedItem.value || !blessingContent.value.trim()) return
  careStore.sendMessage(
    selectedItem.value.employee.id,
    props.type,
    blessingContent.value.trim()
  )
  message.success('祝福发送成功！')
  emit('blessing-sent', selectedItem.value.employee, blessingContent.value.trim())
  showBlessingModal.value = false
  blessingContent.value = ''
}

function saveSettings() {
  careStore.updateSettings(localSettings.value)
  message.success('设置保存成功！')
  showSettingsModal.value = false
}

function getYears(item: ReminderItem): number | undefined {
  if ('upcomingAge' in item) return item.upcomingAge
  if ('upcomingYears' in item) return item.upcomingYears
  return undefined
}

function formatDate(date: Date): string {
  return careStore.formatDate(date)
}

function getDaysLabel(days: number): string {
  return careStore.getDaysLabel(days)
}
</script>

<style scoped>
.care-reminder-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-subtitle {
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
}

.reminder-list {
  max-height: 320px;
  overflow-y: auto;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.reminder-item:hover {
  background: #F5F3FF;
}

.item-avatar {
  position: relative;
}

.avatar-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.avatar-badge.birthday {
  background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);
  color: white;
}

.avatar-badge.anniversary {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  color: white;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.item-meta {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
}

.item-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #7C3AED;
}

.item-years {
  color: #EC4899;
  font-weight: 500;
}

.item-actions {
  flex-shrink: 0;
}

.blessing-form {
  padding: 8px 0;
}

.blessing-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.blessing-info {
  flex: 1;
}

.blessing-name {
  font-size: 18px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 4px;
}

.blessing-type {
  font-size: 14px;
  color: #6B7280;
}
</style>
