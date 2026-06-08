<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">员工花名册</div>
      <n-space>
        <n-button @click="handleExport">
          <template #icon>
            <Download :size="16" />
          </template>
          批量导出
        </n-button>
        <n-button @click="showBatchImport = true">
          <template #icon>
            <Upload :size="16" />
          </template>
          批量导入
        </n-button>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon>
            <Plus :size="16" />
          </template>
          新增员工
        </n-button>
      </n-space>
    </div>
    
    <n-card class="filter-card">
      <n-space :size="16" wrap>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索姓名、邮箱、职位..."
          style="width: 280px;"
          clearable
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
        
        <n-select
          v-model:value="filterDepartment"
          placeholder="选择部门"
          style="width: 160px;"
          clearable
          :options="departmentOptions"
        />
        
        <n-select
          v-model:value="filterStatus"
          placeholder="选择状态"
          style="width: 140px;"
          clearable
          :options="statusOptions"
        />
      </n-space>
    </n-card>
    
    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="employeeStore.paginatedEmployees"
        :pagination="employeeStore.pagination"
        :bordered="false"
        remote
        size="large"
      />
    </n-card>
    
    <n-modal v-model:show="showAddModal" preset="card" title="新增员工" style="width: 600px;">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="姓名" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-select v-model:value="formData.gender" placeholder="请选择性别" :options="genderOptions" />
        </n-form-item>
        <n-form-item label="电话" path="phone">
          <n-input v-model:value="formData.phone" placeholder="请输入电话" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="formData.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="部门" path="department">
          <n-select v-model:value="formData.department" placeholder="请选择部门" :options="departmentOptions" />
        </n-form-item>
        <n-form-item label="职位" path="position">
          <n-input v-model:value="formData.position" placeholder="请输入职位" />
        </n-form-item>
        <n-form-item label="出生日期" path="birthday">
          <n-date-picker v-model:value="formData.birthday" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="入职日期" path="entryDate">
          <n-date-picker v-model:value="formData.entryDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="formData.status" placeholder="请选择状态" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <n-modal v-model:show="showViewModal" preset="card" title="员工详情" style="width: 900px;">
      <div v-if="currentEmployee" class="employee-detail">
        <div class="detail-header">
          <div class="detail-avatar">
            <img :src="currentEmployee.avatar" alt="" />
          </div>
          <div class="detail-info">
            <div class="detail-name">{{ currentEmployee.name }}</div>
            <div class="detail-position">{{ currentEmployee.department }} · {{ currentEmployee.position }}</div>
            <n-tag :type="currentEmployee.status === 'active' ? 'success' : currentEmployee.status === 'probation' ? 'warning' : 'error'" size="small">
              {{ currentEmployee.status === 'active' ? '正式' : currentEmployee.status === 'probation' ? '试用' : '离职' }}
            </n-tag>
          </div>
        </div>

        <n-descriptions :column="2" bordered class="detail-desc">
          <n-descriptions-item label="性别">{{ currentEmployee.gender === 'male' ? '男' : '女' }}</n-descriptions-item>
          <n-descriptions-item label="电话">{{ currentEmployee.phone }}</n-descriptions-item>
          <n-descriptions-item label="邮箱">{{ currentEmployee.email }}</n-descriptions-item>
          <n-descriptions-item label="出生日期">
            {{ currentEmployee.birthday || '未设置' }}
            <span v-if="currentEmployee.birthday" class="age-tag">
              ({{ calculateAge(currentEmployee.birthday) }} 岁)
            </span>
          </n-descriptions-item>
          <n-descriptions-item label="入职日期">{{ currentEmployee.entryDate }}</n-descriptions-item>
          <n-descriptions-item label="工龄">{{ calculateWorkYears(currentEmployee.entryDate) }} 年</n-descriptions-item>
        </n-descriptions>

        <n-tabs v-model:value="activeDetailTab" type="line" style="margin-top: 20px;">
          <n-tab-pane name="contract" tab="合同信息">
            <div v-if="currentContract" class="current-contract">
              <div class="section-title">
                <span>当前合同</span>
                <n-tag :type="contractStatusTypes[currentContract.status]" size="small">
                  {{ contractStatusLabels[currentContract.status] }}
                </n-tag>
              </div>
              <n-card size="small" class="contract-card">
                <n-descriptions :column="2" :bordered="false" size="small">
                  <n-descriptions-item label="合同类型">{{ contractTypeLabels[currentContract.type] }}</n-descriptions-item>
                  <n-descriptions-item label="合同编号">{{ currentContract.id }}</n-descriptions-item>
                  <n-descriptions-item label="合同期限">{{ currentContract.startDate }} 至 {{ currentContract.endDate }}</n-descriptions-item>
                  <n-descriptions-item label="薪资约定">¥ {{ currentContract.salaryAgreement.toLocaleString() }}</n-descriptions-item>
                </n-descriptions>
                <n-alert v-if="currentContract.status === 'expiring'" type="warning" size="small" class="contract-warning">
                  此合同将在 {{ getDaysRemaining(currentContract.endDate) }} 天后到期，请及时处理续签事宜。
                </n-alert>
              </n-card>
            </div>

            <div v-else class="no-contract">
              <n-alert type="info" :bordered="false">
                该员工暂无有效合同
              </n-alert>
            </div>

            <div class="contract-timeline">
              <div class="section-title">合同时间线</div>
              <n-timeline v-if="employeeContracts.length > 0" :type="timelineType">
                <n-timeline-item
                  v-for="(contract, index) in employeeContracts"
                  :key="contract.id"
                  :type="getTimelineItemType(contract, index)"
                  :title="`${contractTypeLabels[contract.type]}合同`"
                  :time="`${contract.startDate} ~ ${contract.endDate}`"
                >
                  <div class="timeline-content">
                    <div class="timeline-id">合同编号：{{ contract.id }}</div>
                    <div class="timeline-salary">薪资：¥ {{ contract.salaryAgreement.toLocaleString() }}</div>
                    <n-tag size="small" :type="contractStatusTypes[contract.status]">
                      {{ contractStatusLabels[contract.status] }}
                    </n-tag>
                    <div v-if="contract.remarks" class="timeline-remarks">{{ contract.remarks }}</div>
                  </div>
                </n-timeline-item>
              </n-timeline>
              <div v-else class="no-history">
                <n-empty description="暂无历史合同记录" />
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="attachments" tab="档案附件">
            <AttachmentManager
              v-if="currentEmployee"
              owner-type="employee"
              :owner-id="currentEmployee.id"
              title="员工档案附件"
              :allowed-categories="['id_card', 'education_certificate', 'medical_report', 'resignation_proof', 'labor_contract', 'other']"
            />
          </n-tab-pane>
          
          <n-tab-pane name="performance" tab="绩效考核">
            <div v-if="currentEmployee" class="performance-section">
              <div class="section-header">
                <span class="section-title">绩效考核得分趋势</span>
              </div>
              <n-card class="chart-card">
                <div ref="trendChartRef" class="trend-chart"></div>
              </n-card>
              
              <div class="section-header" style="margin-top: 24px;">
                <span class="section-title">历次考核记录</span>
              </div>
              <div v-if="employeeAppraisals.length > 0" class="appraisal-list">
                <div 
                  v-for="appraisal in employeeAppraisals" 
                  :key="appraisal.id" 
                  class="appraisal-item"
                  @click="showAppraisalDetail(appraisal)"
                >
                  <div class="appraisal-main">
                    <div class="appraisal-info">
                      <div class="appraisal-period">{{ appraisal.period }}</div>
                      <div class="appraisal-plan">{{ appraisal.planName }}</div>
                      <div class="appraisal-supervisor">评分人: {{ appraisal.supervisorName }}</div>
                    </div>
                    <div class="appraisal-score">
                      <div class="score-value" :style="{ color: getGradeColor(appraisal.grade) }">
                        {{ appraisal.totalScore }}
                      </div>
                      <n-tag :type="getGradeTagType(appraisal.grade)" size="small">
                        {{ getGradeLabel(appraisal.grade) }}
                      </n-tag>
                    </div>
                  </div>
                  <div class="appraisal-suggestion">
                    <n-alert :type="getGradeTagType(appraisal.grade)" :bordered="false" size="small">
                      {{ appraisal.salaryAdjustmentSuggestion }}
                      <span v-if="appraisal.salaryAdjustmentAmount > 0" class="adjustment-amount">
                        建议调薪: ¥{{ appraisal.salaryAdjustmentAmount.toLocaleString() }}
                      </span>
                    </n-alert>
                  </div>
                </div>
              </div>
              <div v-else class="no-appraisal">
                <n-empty description="暂无考核记录" />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="transfer" tab="异动记录">
            <div v-if="currentEmployee" class="transfer-section">
              <div class="section-header">
                <span class="section-title">员工异动时间线</span>
                <n-button type="primary" size="small" @click="openAddTransferModal">
                  <template #icon>
                    <Plus :size="14" />
                  </template>
                  新增异动
                </n-button>
              </div>

              <div v-if="employeeTransfers.length > 0" class="transfer-timeline">
                <n-timeline :type="timelineType">
                  <n-timeline-item
                    v-for="(transfer, index) in employeeTransfers"
                    :key="transfer.id"
                    :type="getTransferTimelineType(transfer, index)"
                    :title="getTransferTypeLabel(transfer.type)"
                    :time="transfer.effectiveDate"
                  >
                    <div class="timeline-content">
                      <div class="transfer-info">
                        <div class="transfer-path">
                          <span class="transfer-before">
                            {{ transfer.beforeDepartment }} · {{ transfer.beforePosition }}
                          </span>
                          <span class="transfer-arrow">→</span>
                          <span class="transfer-after">
                            {{ transfer.afterDepartment }} · {{ transfer.afterPosition }}
                          </span>
                        </div>
                        <div class="transfer-reason">异动原因：{{ transfer.reason }}</div>
                        <div v-if="transfer.remarks" class="transfer-remarks">备注：{{ transfer.remarks }}</div>
                        <div class="transfer-meta">
                          <n-tag :type="transfer.status === 'effective' ? 'success' : transfer.status === 'pending' ? 'warning' : 'default'" size="small">
                            {{ transfer.status === 'effective' ? '已生效' : transfer.status === 'pending' ? '待生效' : '已取消' }}
                          </n-tag>
                          <span class="transfer-operator">操作人：{{ transfer.createdBy }}</span>
                        </div>
                      </div>
                    </div>
                  </n-timeline-item>
                </n-timeline>
              </div>
              <div v-else class="no-transfer">
                <n-empty description="暂无异动记录" />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="leave" tab="休假信息">
            <div v-if="currentEmployee" class="leave-section">
              <div class="section-header">
                <span class="section-title">假期余额</span>
              </div>
              
              <div v-if="employeeLeaveBalance" class="leave-balance">
                <n-grid :cols="2" :x-gap="20" :y-gap="20">
                  <n-grid-item>
                    <n-card class="balance-card" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%); color: white;">
                      <div class="balance-content">
                        <div class="balance-icon">
                          <CalendarDays :size="28" color="#fff" />
                        </div>
                        <div class="balance-info">
                          <div class="balance-label">年假</div>
                          <div class="balance-value">剩余 <strong>{{ employeeLeaveBalance.annualLeaveRemaining }}</strong> 天</div>
                          <div class="balance-detail">
                            已用 {{ employeeLeaveBalance.annualLeaveUsed }} / 共 {{ employeeLeaveBalance.annualLeaveTotal }} 天
                          </div>
                        </div>
                      </div>
                    </n-card>
                  </n-grid-item>
                  <n-grid-item>
                    <n-card class="balance-card" style="background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); color: white;">
                      <div class="balance-content">
                        <div class="balance-icon">
                          <Clock :size="28" color="#fff" />
                        </div>
                        <div class="balance-info">
                          <div class="balance-label">调休</div>
                          <div class="balance-value">剩余 <strong>{{ employeeLeaveBalance.compensatoryLeaveRemaining }}</strong> 天</div>
                          <div class="balance-detail">
                            已用 {{ employeeLeaveBalance.compensatoryLeaveUsed }} / 共 {{ employeeLeaveBalance.compensatoryLeaveTotal }} 天
                          </div>
                        </div>
                      </div>
                    </n-card>
                  </n-grid-item>
                </n-grid>
              </div>

              <div class="section-header" style="margin-top: 24px;">
                <span class="section-title">请假历史</span>
              </div>
              
              <div v-if="employeeLeaves.length > 0" class="leave-history">
                <div 
                  v-for="leave in employeeLeaves" 
                  :key="leave.id" 
                  class="leave-item"
                >
                  <div class="leave-header">
                    <div class="leave-main">
                      <n-tag :style="{ backgroundColor: getLeaveTypeColor(leave.leaveType), color: '#fff' }" size="small">
                        {{ getLeaveTypeLabel(leave.leaveType) }}
                      </n-tag>
                      <span class="leave-dates">{{ leave.startDate }} ~ {{ leave.endDate }}</span>
                      <span class="leave-days">{{ leave.totalDays }} 天</span>
                    </div>
                    <n-tag :style="{ backgroundColor: getLeaveStatusColor(leave.status), color: '#fff' }" size="small">
                      {{ getLeaveStatusLabel(leave.status) }}
                    </n-tag>
                  </div>
                  <div class="leave-reason">事由：{{ leave.reason }}</div>
                  <div v-if="leave.approvalComment" class="leave-comment">
                    审批意见：{{ leave.approvalComment }}
                  </div>
                  <div class="leave-footer">
                    <span>申请时间：{{ leave.createdAt }}</span>
                    <span v-if="leave.approverName">审批人：{{ leave.approverName }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="no-leave">
                <n-empty description="暂无请假记录" />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="skills" tab="技能标签">
            <div v-if="currentEmployee" class="skills-section">
              <div class="section-header">
                <span class="section-title">
                  <Tag :size="16" style="margin-right: 6px; vertical-align: middle;" />
                  技能标签
                </span>
                <n-space>
                  <n-button type="primary" size="small" @click="openTeamSkillModal">
                    <template #icon>
                      <BarChart3 :size="14" />
                    </template>
                    团队技术能力
                  </n-button>
                  <n-button type="primary" size="small" @click="openAddSkillModal">
                    <template #icon>
                      <Plus :size="14" />
                    </template>
                    添加技能
                  </n-button>
                </n-space>
              </div>

              <div v-if="employeeSkills.length > 0" class="skills-list">
                <div 
                  v-for="skill in employeeSkills" 
                  :key="skill.id" 
                  class="skill-item"
                >
                  <div class="skill-main">
                    <div class="skill-info">
                      <div class="skill-name-row">
                        <span class="skill-name">{{ skill.skillName }}</span>
                        <n-tag 
                          size="small" 
                          type="info"
                          style="margin-left: 8px;"
                        >
                          {{ skill.category }}
                        </n-tag>
                      </div>
                      <div class="skill-meta">
                        <n-tag 
                          size="small" 
                          :style="{ 
                            backgroundColor: getSkillProficiencyColor(skill.proficiency) + '20',
                            color: getSkillProficiencyColor(skill.proficiency),
                            border: '1px solid ' + getSkillProficiencyColor(skill.proficiency) + '40'
                          }"
                        >
                          {{ getSkillProficiencyLabel(skill.proficiency) }}
                        </n-tag>
                        <span v-if="skill.yearsOfExperience" class="skill-years">
                          {{ skill.yearsOfExperience }} 年经验
                        </span>
                      </div>
                    </div>
                    <div class="skill-actions">
                      <n-button size="small" quaternary @click="openEditSkillModal(skill)">
                        <template #icon>
                          <Edit :size="14" />
                        </template>
                      </n-button>
                      <n-button size="small" quaternary style="color: #EF4444;" @click="handleDeleteSkill(skill.id)">
                        <template #icon>
                          <Trash2 :size="14" />
                        </template>
                      </n-button>
                    </div>
                  </div>
                  <div class="skill-progress">
                    <div 
                      class="skill-progress-bar" 
                      :style="{ 
                        width: `${skill.proficiency === 'expert' ? 100 : skill.proficiency === 'advanced' ? 75 : skill.proficiency === 'intermediate' ? 50 : 25}%`,
                        backgroundColor: getSkillProficiencyColor(skill.proficiency)
                      }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-else class="no-skills">
                <n-empty description="暂无技能标签，点击上方按钮添加" />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="projects" tab="项目经历">
            <div v-if="currentEmployee" class="projects-section">
              <div class="section-header">
                <span class="section-title">
                  <Briefcase :size="16" style="margin-right: 6px; vertical-align: middle;" />
                  项目经历
                </span>
                <n-button type="primary" size="small" @click="openAddProjectModal">
                  <template #icon>
                    <Plus :size="14" />
                  </template>
                  添加项目
                </n-button>
              </div>

              <div v-if="employeeProjects.length > 0" class="projects-table">
                <n-data-table
                  :columns="projectColumns"
                  :data="employeeProjects"
                  :bordered="false"
                  size="medium"
                />
              </div>

              <div v-if="employeeProjects.length > 0" class="projects-cards">
                <div 
                  v-for="project in employeeProjects" 
                  :key="project.id" 
                  class="project-card"
                >
                  <div class="project-header">
                    <div class="project-title-row">
                      <span class="project-name">{{ project.projectName }}</span>
                      <n-tag size="small" type="primary">{{ project.role }}</n-tag>
                    </div>
                    <div class="project-dates">
                      <CalendarDays :size="14" style="margin-right: 4px; vertical-align: middle;" />
                      {{ project.startDate }} ~ {{ project.endDate }}
                    </div>
                  </div>
                  <div class="project-description">
                    <div class="project-label">项目描述</div>
                    <div class="project-content">{{ project.description }}</div>
                  </div>
                  <div class="project-achievements">
                    <div class="project-label">项目成果</div>
                    <div class="project-content achievements">{{ project.achievements }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="no-projects">
                <n-empty description="暂无项目经历，点击上方按钮添加" />
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showViewModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <n-modal v-model:show="showAppraisalDetailModal" preset="card" title="考核详情" style="width: 680px;">
      <div v-if="selectedAppraisal" class="appraisal-detail-modal">
        <div class="detail-header">
          <div class="detail-info">
            <div class="detail-period">{{ selectedAppraisal.period }}</div>
            <div class="detail-plan">{{ selectedAppraisal.planName }}</div>
            <div class="detail-meta">
              员工: {{ selectedAppraisal.employeeName }} · 
              部门: {{ selectedAppraisal.department }} · 
              评分人: {{ selectedAppraisal.supervisorName }}
            </div>
          </div>
          <div class="detail-score">
            <div class="score-label">总分</div>
            <div class="score-value" :style="{ color: getGradeColor(selectedAppraisal.grade) }">
              {{ selectedAppraisal.totalScore }}
            </div>
            <n-tag :type="getGradeTagType(selectedAppraisal.grade)" size="small">
              {{ getGradeLabel(selectedAppraisal.grade) }}
            </n-tag>
          </div>
        </div>
        
        <n-divider />
        
        <div class="kpi-scores">
          <div class="section-title">KPI 评分明细</div>
          <div class="kpi-score-list">
            <div v-for="score in selectedAppraisal.scores" :key="score.kpiId" class="kpi-score-item">
              <div class="kpi-info">
                <span class="kpi-name">{{ score.kpiName }}</span>
                <span class="kpi-weight">权重 {{ score.weight }}%</span>
              </div>
              <div class="kpi-score-bar">
                <div 
                  class="score-progress" 
                  :style="{ width: `${score.score}%`, backgroundColor: getGradeColor(selectedAppraisal.grade) }"
                ></div>
              </div>
              <div class="kpi-score-value">
                <span class="raw-score">{{ score.score }} 分</span>
                <span class="weighted-score">加权 {{ score.weightedScore.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <n-divider />
        
        <div class="comments-section">
          <div class="section-title">评语</div>
          <n-card size="small" :bordered="false" style="background: #F9FAFB;">
            {{ selectedAppraisal.comments || '暂无评语' }}
          </n-card>
        </div>
        
        <n-divider />
        
        <div class="suggestion-section">
          <div class="section-title">调薪建议</div>
          <n-alert :type="getGradeTagType(selectedAppraisal.grade)" :bordered="false">
            <div class="suggestion-content">
              <span>{{ selectedAppraisal.salaryAdjustmentSuggestion }}</span>
              <span v-if="selectedAppraisal.salaryAdjustmentAmount > 0" class="adjustment-amount">
                建议调薪金额: ¥{{ selectedAppraisal.salaryAdjustmentAmount.toLocaleString() }}
              </span>
            </div>
          </n-alert>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAppraisalDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showEditModal" preset="card" title="编辑员工" style="width: 600px;">
      <n-form
        ref="editFormRef"
        :model="editFormData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="姓名" path="name">
          <n-input v-model:value="editFormData.name" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-select v-model:value="editFormData.gender" placeholder="请选择性别" :options="genderOptions" />
        </n-form-item>
        <n-form-item label="电话" path="phone">
          <n-input v-model:value="editFormData.phone" placeholder="请输入电话" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="editFormData.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="部门" path="department">
          <n-select v-model:value="editFormData.department" placeholder="请选择部门" :options="departmentOptions" />
        </n-form-item>
        <n-form-item label="职位" path="position">
          <n-input v-model:value="editFormData.position" placeholder="请输入职位" />
        </n-form-item>
        <n-form-item label="出生日期" path="birthday">
          <n-date-picker v-model:value="editFormData.birthday" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="入职日期" path="entryDate">
          <n-date-picker v-model:value="editFormData.entryDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="editFormData.status" placeholder="请选择状态" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showAddTransferModal" preset="card" title="新增异动" style="width: 680px;">
      <n-form
        ref="transferFormRef"
        :model="transferFormData"
        :rules="transferFormRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="员工姓名">
          <n-input :value="currentEmployee?.name" disabled />
        </n-form-item>
        <n-form-item label="异动类型" path="type">
          <n-select v-model:value="transferFormData.type" placeholder="请选择异动类型" :options="transferTypeOptions" />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="异动前部门" path="beforeDepartment">
              <n-select v-model:value="transferFormData.beforeDepartment" placeholder="请选择部门" :options="departmentOptions" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="异动前职位" path="beforePosition">
              <n-input v-model:value="transferFormData.beforePosition" placeholder="请输入职位" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="异动后部门" path="afterDepartment">
              <n-select v-model:value="transferFormData.afterDepartment" placeholder="请选择部门" :options="departmentOptions" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="异动后职位" path="afterPosition">
              <n-input v-model:value="transferFormData.afterPosition" placeholder="请输入职位" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="异动原因" path="reason">
          <n-input v-model:value="transferFormData.reason" type="textarea" placeholder="请输入异动原因" :rows="3" />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="生效日期" path="effectiveDate">
              <n-date-picker v-model:value="transferFormData.effectiveDate" type="date" style="width: 100%;" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="状态" path="status">
              <n-select v-model:value="transferFormData.status" placeholder="请选择状态" :options="transferStatusOptions" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="备注">
          <n-input v-model:value="transferFormData.remarks" type="textarea" placeholder="请输入备注信息" :rows="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddTransferModal = false">取消</n-button>
          <n-button type="primary" @click="handleAddTransfer">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    <BatchImport
      v-model:show="showBatchImport"
      title="批量导入员工"
      :columns="employeeImportColumns"
      template-file-name="员工信息"
      :example-data="employeeExampleData"
      :validate-fn="validateEmployees"
      :on-import="handleBatchImport"
      @success="handleImportSuccess"
    />

    <n-modal v-model:show="showSkillModal" preset="card" :title="editingSkill ? '编辑技能' : '添加技能'" style="width: 500px;">
      <n-form
        ref="skillFormRef"
        :model="skillFormData"
        :rules="skillFormRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="技能名称" path="skillName">
          <n-input 
            v-model:value="skillFormData.skillName" 
            placeholder="请输入技能名称，如：Vue.js" 
            :options="skillStore.allSkillNames.map(name => ({ label: name, value: name }))"
          />
        </n-form-item>
        <n-form-item label="技能分类" path="category">
          <n-select 
            v-model:value="skillFormData.category" 
            placeholder="请选择技能分类" 
            :options="skillCategoryOptions" 
          />
        </n-form-item>
        <n-form-item label="熟练度" path="proficiency">
          <n-select 
            v-model:value="skillFormData.proficiency" 
            placeholder="请选择熟练度" 
            :options="skillProficiencyOptions.map(opt => ({ label: opt.label, value: opt.value }))"
          />
        </n-form-item>
        <n-form-item label="使用年限">
          <n-input-number 
            v-model:value="skillFormData.yearsOfExperience" 
            :min="0" 
            :max="50" 
            placeholder="请输入使用年限"
            style="width: 100%;"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSkillModal = false">取消</n-button>
          <n-button type="primary" @click="handleSkillSubmit">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showProjectModal" preset="card" :title="editingProject ? '编辑项目经历' : '添加项目经历'" style="width: 680px;">
      <n-form
        ref="projectFormRef"
        :model="projectFormData"
        :rules="projectFormRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="项目名称" path="projectName">
          <n-input v-model:value="projectFormData.projectName" placeholder="请输入项目名称" />
        </n-form-item>
        <n-form-item label="担任角色" path="role">
          <n-input 
            v-model:value="projectFormData.role" 
            placeholder="请输入担任角色，如：前端技术负责人" 
            :options="projectStore.allRoles.map(role => ({ label: role, value: role }))"
          />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="开始时间" path="startDate">
              <n-date-picker v-model:value="projectFormData.startDate" type="date" style="width: 100%;" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="结束时间">
              <n-date-picker v-model:value="projectFormData.endDate" type="date" style="width: 100%;" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="项目描述">
          <n-input v-model:value="projectFormData.description" type="textarea" placeholder="请输入项目描述" :rows="3" />
        </n-form-item>
        <n-form-item label="项目成果">
          <n-input v-model:value="projectFormData.achievements" type="textarea" placeholder="请输入项目成果，突出数据量化的成果" :rows="3" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showProjectModal = false">取消</n-button>
          <n-button type="primary" @click="handleProjectSubmit">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showTeamSkillModal" preset="card" title="团队技术能力分布" style="width: 900px;">
      <div class="team-skill-modal">
        <div class="team-skill-header">
          <div class="team-skill-filter">
            <span class="filter-label">选择部门：</span>
            <n-select 
              v-model:value="selectedDepartmentForRadar" 
              :options="departmentOptionsForRadar" 
              style="width: 200px;"
            />
          </div>
        </div>
        
        <n-grid :cols="2" :x-gap="20" style="margin-top: 16px;">
          <n-grid-item>
            <n-card title="技术能力雷达图" size="small">
              <div ref="radarChartRef" class="radar-chart"></div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="技能分布详情" size="small">
              <div v-if="skillStatsForDepartment.length > 0" class="skill-stats-list">
                <div 
                  v-for="stat in skillStatsForDepartment.slice(0, 10)" 
                  :key="stat.skillName" 
                  class="skill-stat-item"
                >
                  <div class="skill-stat-header">
                    <span class="skill-stat-name">{{ stat.skillName }}</span>
                    <span class="skill-stat-count">{{ stat.totalCount }} 人掌握</span>
                  </div>
                  <div class="skill-stat-bar">
                    <div 
                      class="skill-stat-progress" 
                      :style="{ 
                        width: `${(stat.totalCount / Math.max(...skillStatsForDepartment.map(s => s.totalCount))) * 100}%` 
                      }"
                    ></div>
                  </div>
                  <div class="skill-stat-meta">
                    <n-tag v-if="stat.expertCount > 0" size="small" type="success">专家 {{ stat.expertCount }}</n-tag>
                    <n-tag v-if="stat.advancedCount > 0" size="small" type="info">精通 {{ stat.advancedCount }}</n-tag>
                    <n-tag v-if="stat.intermediateCount > 0" size="small" type="warning">熟悉 {{ stat.intermediateCount }}</n-tag>
                    <n-tag v-if="stat.beginnerCount > 0" size="small" type="default">入门 {{ stat.beginnerCount }}</n-tag>
                  </div>
                </div>
              </div>
              <div v-else>
                <n-empty description="暂无技能数据" />
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showTeamSkillModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showImportResult" preset="card" title="导入结果" style="width: 600px;">
      <div class="import-result-modal">
        <n-result
          v-if="importResultData.successCount > 0"
          status="success"
          :title="`成功导入 ${importResultData.successCount} 条数据`"
        />
        <n-result
          v-else
          status="warning"
          title="导入失败"
          sub-title="所有数据均存在错误，请检查后重试"
        />
        <div v-if="importResultData.errors.length > 0" class="error-list">
          <div class="section-title">错误明细（{{ importResultData.errors.length }} 条）</div>
          <div class="error-table">
            <n-data-table
              :columns="importErrorColumns"
              :data="importResultData.errors"
              :bordered="false"
              size="small"
              :max-height="300"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showImportResult = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, nextTick, onMounted } from 'vue'
import { Plus, Search, Edit, Trash2, Eye, ArrowRightLeft, CalendarDays, Clock, Download, Upload, Briefcase, Tag, BarChart3, X, Check } from 'lucide-vue-next'
import * as echarts from 'echarts'
import { useEmployeeStore } from '@/stores/employee'
import { useContractStore } from '@/stores/contract'
import { usePerformanceStore } from '@/stores/performance'
import { useEmployeeTransferStore } from '@/stores/employee-transfer'
import { useLeaveStore } from '@/stores/leave'
import { useEmployeeSkillStore } from '@/stores/employee-skill'
import { useEmployeeProjectStore } from '@/stores/employee-project'
import { useMessage, useDialog, NTag, NSpace, NButton, NTimeline, NTimelineItem, NRow, NCol, NEmpty, NDataTable } from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns, DialogReactive } from 'naive-ui'
import type { Employee, Contract, PerformanceAppraisal, PerformanceResultGrade, EmployeeTransfer, TransferType, LeaveApplication, LeaveType, LeaveStatus, EmployeeSkill, SkillProficiency, EmployeeProject } from '@/types'
import { PERFORMANCE_GRADE_LABELS, PERFORMANCE_GRADE_COLORS, TRANSFER_TYPE_OPTIONS, TRANSFER_TYPE_LABELS, TRANSFER_STATUS_OPTIONS, TRANSFER_TYPE_COLORS, LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS, LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS, SKILL_PROFICIENCY_OPTIONS, SKILL_PROFICIENCY_LABELS, SKILL_PROFICIENCY_COLORS, SKILL_CATEGORY_OPTIONS } from '@/types'
import { useOrganizationStore } from '@/stores/organization'
import AttachmentManager from '@/components/AttachmentManager.vue'
import BatchImport from '@/components/BatchImport.vue'
import { calculateWorkYears, calculateAge } from '@/lib/utils'
import { exportToExcel, validatePhone, validateEmail, type ExcelColumn } from '@/lib/excel'

const employeeStore = useEmployeeStore()
const contractStore = useContractStore()
const performanceStore = usePerformanceStore()
const transferStore = useEmployeeTransferStore()
const leaveStore = useLeaveStore()
const skillStore = useEmployeeSkillStore()
const projectStore = useEmployeeProjectStore()
const organizationStore = useOrganizationStore()
const message = useMessage()
const dialog = useDialog()

function formatDate(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const searchKeyword = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const showAddTransferModal = ref(false)
const showBatchImport = ref(false)
const showImportResult = ref(false)
const currentEmployee = ref<Employee | null>(null)
const activeDetailTab = ref('contract')

const importResultData = ref({
  successCount: 0,
  errors: [] as { row: number; message: string; data: Partial<Employee> }[]
})

const showSkillModal = ref(false)
const showProjectModal = ref(false)
const showTeamSkillModal = ref(false)
const editingSkill = ref<EmployeeSkill | null>(null)
const editingProject = ref<EmployeeProject | null>(null)
const selectedDepartmentForRadar = ref('技术部')
const radarChartRef = ref<HTMLElement | null>(null)

const skillFormRef = ref<FormInst | null>(null)
const projectFormRef = ref<FormInst | null>(null)

const skillFormData = ref<Partial<EmployeeSkill>>({
  skillName: '',
  category: '前端开发',
  proficiency: 'intermediate' as SkillProficiency,
  yearsOfExperience: 1
})

const projectFormData = ref<Partial<EmployeeProject>>({
  projectName: '',
  role: '',
  startDate: null,
  endDate: null,
  description: '',
  achievements: ''
})

const skillFormRules: FormRules = {
  skillName: [{ required: true, message: '请输入技能名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择技能分类', trigger: 'change' }],
  proficiency: [{ required: true, message: '请选择熟练度', trigger: 'change' }]
}

const projectFormRules: FormRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  role: [{ required: true, message: '请输入担任角色', trigger: 'blur' }],
  startDate: [{ required: true, type: 'number', message: '请选择开始时间', trigger: 'change' }]
}

const employeeSkills = computed(() => {
  if (!currentEmployee.value) return []
  return skillStore.getSkillsByEmployeeId(currentEmployee.value.id)
})

const employeeProjects = computed(() => {
  if (!currentEmployee.value) return []
  return projectStore.getProjectsByEmployeeId(currentEmployee.value.id)
})

const skillCategoryOptions = SKILL_CATEGORY_OPTIONS
const skillProficiencyOptions = SKILL_PROFICIENCY_OPTIONS
const departmentOptionsForRadar = computed(() => organizationStore.departmentOptions)

const projectColumns: DataTableColumns<EmployeeProject> = [
  { title: '项目名称', key: 'projectName', ellipsis: { tooltip: true } },
  { title: '担任角色', key: 'role', width: 140 },
  { 
    title: '起止时间', 
    key: 'time',
    width: 200,
    render: (row) => `${row.startDate} ~ ${row.endDate}`
  },
  {
    title: '项目成果',
    key: 'achievements',
    ellipsis: { tooltip: true },
    render: (row) => h('span', { style: { color: '#10B981' } }, row.achievements)
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row) => h(NSpace as any, { size: 'small' }, {
      default: () => [
        h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleEditProject(row) }, {
          icon: () => h(Edit as any, { size: 14 })
        }),
        h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleDeleteProject(row.id), style: 'color: #EF4444;' }, {
          icon: () => h(Trash2 as any, { size: 14 })
        })
      ]
    })
  }
]

const skillStatsForDepartment = computed(() => {
  if (!selectedDepartmentForRadar.value) return []
  return skillStore.getDepartmentSkillStats(selectedDepartmentForRadar.value)
})

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

const statusOptions = [
  { label: '正式', value: 'active' },
  { label: '试用', value: 'probation' },
  { label: '离职', value: 'inactive' }
]

const employeeImportColumns = computed<ExcelColumn<Employee>[]>(() => [
  { key: 'name', title: '姓名', required: true, type: 'string' },
  { key: 'gender', title: '性别', required: true, type: 'select', options: genderOptions },
  { key: 'phone', title: '手机号', required: true, type: 'string' },
  { key: 'email', title: '邮箱', required: true, type: 'string' },
  { key: 'department', title: '部门', required: true, type: 'select', options: organizationStore.departmentOptions },
  { key: 'position', title: '职位', required: true, type: 'string' },
  { key: 'birthday', title: '出生日期', type: 'string' },
  { key: 'entryDate', title: '入职日期', required: true, type: 'string' },
  { key: 'status', title: '状态', required: true, type: 'select', options: statusOptions }
])

const employeeExampleData: Partial<Employee>[] = [
  {
    name: '示例员工',
    gender: 'male',
    phone: '13800138000',
    email: 'example@company.com',
    department: '技术部',
    position: '前端工程师',
    birthday: '1995-01-01',
    entryDate: '2024-01-01',
    status: 'probation'
  }
]

const importErrorColumns: DataTableColumns = [
  { title: '行号', key: 'row', width: 80 },
  { title: '姓名', key: 'name', render: (row: any) => row.data?.name || '' },
  { title: '错误信息', key: 'message', render: (row: any) => h('span', { style: { color: '#EF4444' } }, row.message) }
]

const employeeExportColumns: ExcelColumn<Employee>[] = [
  { key: 'id', title: '员工编号' },
  { key: 'name', title: '姓名' },
  {
    key: 'gender',
    title: '性别',
    formatter: (value: string) => (value === 'male' ? '男' : '女')
  },
  { key: 'phone', title: '手机号' },
  { key: 'email', title: '邮箱' },
  { key: 'department', title: '部门' },
  { key: 'position', title: '职位' },
  { key: 'birthday', title: '出生日期' },
  { key: 'entryDate', title: '入职日期' },
  {
    key: 'status',
    title: '状态',
    formatter: (value: string) => {
      const map: Record<string, string> = { active: '正式', probation: '试用', inactive: '离职' }
      return map[value] || value
    }
  }
]

async function validateEmployees(data: Partial<Employee>[]) {
  const success: Partial<Employee>[] = []
  const errors: { row: number; message: string; data: Partial<Employee> }[] = []

  const phoneSet = new Set<string>()
  const emailSet = new Set<string>()

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2
    let hasError = false
    let errorMessage = ''

    if (row.phone) {
      if (!validatePhone(row.phone)) {
        hasError = true
        errorMessage = `手机号 "${row.phone}" 格式不正确`
      } else if (employeeStore.isPhoneExists(row.phone)) {
        hasError = true
        errorMessage = `手机号 "${row.phone}" 已存在`
      } else if (phoneSet.has(row.phone)) {
        hasError = true
        errorMessage = `手机号 "${row.phone}" 在导入文件中重复`
      }
    }

    if (!hasError && row.email) {
      if (!validateEmail(row.email)) {
        hasError = true
        errorMessage = `邮箱 "${row.email}" 格式不正确`
      } else if (employeeStore.isEmailExists(row.email)) {
        hasError = true
        errorMessage = `邮箱 "${row.email}" 已存在`
      } else if (emailSet.has(row.email)) {
        hasError = true
        errorMessage = `邮箱 "${row.email}" 在导入文件中重复`
      }
    }

    if (hasError) {
      errors.push({ row: rowNum, message: errorMessage, data: row })
    } else {
      if (row.phone) phoneSet.add(row.phone)
      if (row.email) emailSet.add(row.email)
      success.push(row)
    }
  }

  return { success, errors }
}

function handleBatchImport(data: Partial<Employee>[]) {
  const employees = data.map(emp => ({
    ...emp,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}-${Math.random()}`
  })) as Omit<Employee, 'id'>[]

  employeeStore.batchAddEmployees(employees)
}

function handleImportSuccess(result: { successCount: number; errors: any[] }) {
  importResultData.value = result
  showImportResult.value = true
}

function handleExport() {
  const dataToExport = employeeStore.filteredEmployees
  const dateStr = new Date().toISOString().split('T')[0]
  exportToExcel(dataToExport, employeeExportColumns, `员工花名册_${dateStr}`)
  message.success(`成功导出 ${dataToExport.length} 条数据`)
}

const employeeContracts = computed(() => {
  if (!currentEmployee.value) return []
  return contractStore.getContractsByEmployeeId(currentEmployee.value.id)
})

const currentContract = computed(() => {
  if (!currentEmployee.value) return null
  return contractStore.getCurrentContract(currentEmployee.value.id)
})

const employeeAppraisals = computed(() => {
  if (!currentEmployee.value) return []
  return performanceStore.getAppraisalsByEmployeeId(currentEmployee.value.id)
})

const employeeTransfers = computed(() => {
  if (!currentEmployee.value) return []
  return transferStore.getTransfersByEmployeeId(currentEmployee.value.id)
})

const employeeLeaveBalance = computed(() => {
  if (!currentEmployee.value) return null
  return leaveStore.getLeaveBalance(currentEmployee.value.id)
})

const employeeLeaves = computed(() => {
  if (!currentEmployee.value) return []
  return leaveStore.getApplicationsByEmployeeId(currentEmployee.value.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const trendChartRef = ref<HTMLElement | null>(null)
const showAppraisalDetailModal = ref(false)
const selectedAppraisal = ref<PerformanceAppraisal | null>(null)

function getGradeLabel(grade: PerformanceResultGrade): string {
  return PERFORMANCE_GRADE_LABELS[grade]
}

function getGradeColor(grade: PerformanceResultGrade): string {
  return PERFORMANCE_GRADE_COLORS[grade]
}

function getGradeTagType(grade: PerformanceResultGrade): any {
  const typeMap: Record<PerformanceResultGrade, any> = {
    excellent: 'success',
    good: 'info',
    qualified: 'warning',
    needs_improvement: 'error'
  }
  return typeMap[grade]
}

function showAppraisalDetail(appraisal: PerformanceAppraisal) {
  selectedAppraisal.value = appraisal
  showAppraisalDetailModal.value = true
}

function initTrendChart() {
  if (!trendChartRef.value || !currentEmployee.value) return
  
  const chart = echarts.init(trendChartRef.value)
  const appraisals = employeeAppraisals.value
  
  if (appraisals.length === 0) {
    chart.setOption({
      title: { text: '暂无考核数据', left: 'center', top: 'center', textStyle: { color: '#9CA3AF' } }
    })
    return
  }
  
  const periods = appraisals.map(a => a.period)
  const scores = appraisals.map(a => a.totalScore)
  const gradeColors = appraisals.map(a => getGradeColor(a.grade))
  
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        const appraisal = appraisals[data.dataIndex]
        return `<div style="padding: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div>得分: <span style="color: ${getGradeColor(appraisal.grade)}; font-weight: 600;">${data.value}</span></div>
          <div>等级: ${getGradeLabel(appraisal.grade)}</div>
        </div>`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: periods,
      axisLabel: { fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { fontSize: 12 }
    },
    series: [{
      type: 'line',
      data: scores.map((score, i) => ({
        value: score,
        itemStyle: { color: gradeColors[i] }
      })),
      smooth: true,
      symbol: 'circle',
      symbolSize: 10,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#7C3AED' },
            { offset: 1, color: '#A78BFA' }
          ]
        }
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(124, 58, 237, 0.3)' },
            { offset: 1, color: 'rgba(124, 58, 237, 0.05)' }
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 12,
        fontWeight: 600,
        formatter: '{c}'
      }
    }]
  })
}

const contractTypeLabels: Record<string, string> = {
  fulltime: '全职',
  parttime: '兼职',
  intern: '实习'
}

const contractStatusLabels: Record<string, string> = {
  active: '生效中',
  expiring: '即将到期',
  expired: '已到期',
  terminated: '已终止'
}

const contractStatusTypes: Record<string, any> = {
  active: 'success',
  expiring: 'warning',
  expired: 'error',
  terminated: 'default'
}

function getDaysRemaining(endDate: string): number {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const timelineType = 'line'

const transferTypeOptions = TRANSFER_TYPE_OPTIONS
const transferStatusOptions = TRANSFER_STATUS_OPTIONS
const transferFormRef = ref<FormInst | null>(null)

const transferFormData = ref<Partial<EmployeeTransfer>>({
  type: 'department_change' as TransferType,
  beforeDepartment: '',
  beforePosition: '',
  afterDepartment: '',
  afterPosition: '',
  reason: '',
  effectiveDate: null,
  status: 'pending' as EmployeeTransfer['status'],
  remarks: ''
})

const transferFormRules: FormRules = {
  type: [{ required: true, message: '请选择异动类型', trigger: 'change' }],
  beforeDepartment: [{ required: true, message: '请选择异动前部门', trigger: 'change' }],
  beforePosition: [{ required: true, message: '请输入异动前职位', trigger: 'blur' }],
  afterDepartment: [{ required: true, message: '请选择异动后部门', trigger: 'change' }],
  afterPosition: [{ required: true, message: '请输入异动后职位', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入异动原因', trigger: 'blur' }],
  effectiveDate: [{ required: true, type: 'number', message: '请选择生效日期', trigger: ['change', 'blur'] }]
}

function getTransferTypeLabel(type: TransferType): string {
  return TRANSFER_TYPE_LABELS[type]
}

function getTransferTimelineType(transfer: EmployeeTransfer, index: number): any {
  if (index === 0 && transfer.status === 'effective') {
    return 'success'
  }
  if (transfer.status === 'pending') return 'warning'
  if (transfer.status === 'cancelled') return 'default'
  return 'default'
}

function getLeaveTypeLabel(type: LeaveType): string {
  return LEAVE_TYPE_LABELS[type]
}

function getLeaveTypeColor(type: LeaveType): string {
  return LEAVE_TYPE_COLORS[type]
}

function getLeaveStatusLabel(status: LeaveStatus): string {
  return LEAVE_STATUS_LABELS[status]
}

function getLeaveStatusColor(status: LeaveStatus): string {
  return LEAVE_STATUS_COLORS[status]
}

function openAddTransferModal() {
  if (currentEmployee.value) {
    transferFormData.value = {
      type: 'department_change' as TransferType,
      beforeDepartment: currentEmployee.value.department,
      beforePosition: currentEmployee.value.position,
      afterDepartment: currentEmployee.value.department,
      afterPosition: currentEmployee.value.position,
      reason: '',
      effectiveDate: null,
      status: 'pending' as EmployeeTransfer['status'],
      remarks: ''
    }
  }
  showAddTransferModal.value = true
}

function handleAddTransfer() {
  transferFormRef.value?.validate((errors) => {
    if (!errors && currentEmployee.value) {
      const effectiveDate = typeof transferFormData.value.effectiveDate === 'number'
        ? formatDate(transferFormData.value.effectiveDate as number)
        : transferFormData.value.effectiveDate || ''
      
      const today = new Date().toISOString().split('T')[0]
      let status = transferFormData.value.status || 'pending'
      if (status === 'pending' && effectiveDate <= today) {
        status = 'effective'
      }

      transferStore.addTransfer({
        employeeId: currentEmployee.value.id,
        employeeName: currentEmployee.value.name,
        type: transferFormData.value.type as TransferType,
        beforeDepartment: transferFormData.value.beforeDepartment || '',
        beforePosition: transferFormData.value.beforePosition || '',
        afterDepartment: transferFormData.value.afterDepartment || '',
        afterPosition: transferFormData.value.afterPosition || '',
        reason: transferFormData.value.reason || '',
        effectiveDate,
        status,
        createdAt: today,
        createdBy: '李人事',
        remarks: transferFormData.value.remarks
      })
      message.success('异动记录创建成功')
      showAddTransferModal.value = false
    }
  })
}

function getTimelineItemType(contract: Contract, index: number): any {
  if (index === 0 && (contract.status === 'active' || contract.status === 'expiring')) {
    return 'success'
  }
  if (contract.status === 'expiring') return 'warning'
  if (contract.status === 'expired') return 'default'
  if (contract.status === 'terminated') return 'error'
  return 'default'
}

const formRef = ref<FormInst | null>(null)
const editFormRef = ref<FormInst | null>(null)

const editFormData = ref<Partial<Employee>>({
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  department: '',
  position: '',
  birthday: null,
  entryDate: null,
  status: 'probation'
})

const formData = ref<Partial<Employee>>({
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  department: '',
  position: '',
  birthday: null,
  entryDate: null,
  status: 'probation'
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  entryDate: [{ required: true, type: 'number', message: '请选择入职日期', trigger: ['change', 'blur'] }]
}

const departments = computed(() => employeeStore.departments)
const departmentOptions = computed(() => organizationStore.departmentOptions)

watch([searchKeyword, filterDepartment, filterStatus], () => {
  employeeStore.setSearchKeyword(searchKeyword.value)
  employeeStore.setFilterDepartment(filterDepartment.value)
  employeeStore.setFilterStatus(filterStatus.value)
})

watch([activeDetailTab, showViewModal], ([tab, visible]) => {
  if (visible && tab === 'performance') {
    nextTick(() => {
      initTrendChart()
    })
  }
})

const columns: DataTableColumns<Employee> = [
  {
    title: '员工信息',
    key: 'name',
    width: 200,
    render: (row) => {
      return h('div', { class: 'employee-info' }, [
        h('img', { src: row.avatar, class: 'employee-avatar' }),
        h('div', { class: 'employee-details' }, [
          h('div', { class: 'employee-name' }, row.name),
          h('div', { class: 'employee-email' }, row.email)
        ])
      ]) as any
    }
  },
  {
    title: '部门',
    key: 'department'
  },
  {
    title: '职位',
    key: 'position'
  },
  {
    title: '出生日期',
    key: 'birthday',
    render: (row) => row.birthday || '未设置'
  },
  {
    title: '入职日期',
    key: 'entryDate'
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      const typeMap: Record<string, any> = {
        active: 'success',
        probation: 'warning',
        inactive: 'error'
      }
      const labelMap: Record<string, string> = {
        active: '正式',
        probation: '试用',
        inactive: '离职'
      }
      return h(NTag as any, { type: typeMap[row.status], size: 'small' }, { default: () => labelMap[row.status] }) as any
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) => {
      return h(NSpace as any, { size: 'small' }, {
        default: () => [
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleView(row) }, {
            icon: () => h(Eye as any, { size: 14 })
          }),
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleTransfer(row) }, {
            icon: () => h(ArrowRightLeft as any, { size: 14 })
          }),
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleEdit(row) }, {
            icon: () => h(Edit as any, { size: 14 })
          }),
          h(NButton as any, { size: 'small', quaternary: true, onClick: () => handleDelete(row.id) }, {
            icon: () => h(Trash2 as any, { size: 14 }),
            style: 'color: #EF4444;'
          })
        ]
      }) as any
    }
  }
]

function handleView(employee: Employee) {
  currentEmployee.value = employee
  activeDetailTab.value = 'contract'
  showViewModal.value = true
}

function handleTransfer(employee: Employee) {
  currentEmployee.value = employee
  activeDetailTab.value = 'transfer'
  showViewModal.value = true
}

function handleEdit(employee: Employee) {
  currentEmployee.value = employee
  editFormData.value = {
    name: employee.name,
    gender: employee.gender,
    phone: employee.phone,
    email: employee.email,
    department: employee.department,
    position: employee.position,
    birthday: employee.birthday,
    entryDate: employee.entryDate,
    status: employee.status
  }
  showEditModal.value = true
}

function handleEditSubmit() {
  editFormRef.value?.validate((errors) => {
    if (!errors && currentEmployee.value) {
      const entryDate = typeof editFormData.value.entryDate === 'number' 
        ? formatDate(editFormData.value.entryDate as number)
        : editFormData.value.entryDate || currentEmployee.value.entryDate
      
      const birthday = typeof editFormData.value.birthday === 'number'
        ? formatDate(editFormData.value.birthday as number)
        : editFormData.value.birthday
      
      employeeStore.updateEmployee(currentEmployee.value.id, {
        ...editFormData.value,
        entryDate,
        birthday
      })
      message.success('编辑成功')
      showEditModal.value = false
    }
  })
}

function handleDelete(id: string) {
  const d = dialog.warning({
    title: '确认删除',
    content: '确定要删除该员工吗？此操作不可恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      employeeStore.deleteEmployee(id)
      message.success('删除成功')
      d.destroy()
    }
  })
}

function handleAdd() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const entryDate = typeof formData.value.entryDate === 'number' 
        ? formatDate(formData.value.entryDate as number)
        : formData.value.entryDate || ''
      
      const birthday = typeof formData.value.birthday === 'number'
        ? formatDate(formData.value.birthday as number)
        : formData.value.birthday
      
      employeeStore.addEmployee({
        ...formData.value,
        entryDate,
        birthday,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      } as Omit<Employee, 'id'>)
      message.success('新增成功')
      showAddModal.value = false
      resetForm()
    }
  })
}

function resetForm() {
  formData.value = {
    name: '',
    gender: 'male',
    phone: '',
    email: '',
    department: '',
    position: '',
    birthday: null,
    entryDate: null,
    status: 'probation'
  }
}

function getSkillProficiencyLabel(proficiency: SkillProficiency): string {
  return SKILL_PROFICIENCY_LABELS[proficiency]
}

function getSkillProficiencyColor(proficiency: SkillProficiency): string {
  return SKILL_PROFICIENCY_COLORS[proficiency]
}

function openAddSkillModal() {
  editingSkill.value = null
  skillFormData.value = {
    skillName: '',
    category: '前端开发',
    proficiency: 'intermediate' as SkillProficiency,
    yearsOfExperience: 1
  }
  showSkillModal.value = true
}

function openEditSkillModal(skill: EmployeeSkill) {
  editingSkill.value = skill
  skillFormData.value = { ...skill }
  showSkillModal.value = true
}

function handleSkillSubmit() {
  skillFormRef.value?.validate((errors) => {
    if (!errors && currentEmployee.value) {
      if (editingSkill.value) {
        skillStore.updateSkill(editingSkill.value.id, skillFormData.value)
        message.success('技能更新成功')
      } else {
        if (skillStore.isSkillExists(currentEmployee.value.id, skillFormData.value.skillName || '')) {
          message.error('该技能已存在')
          return
        }
        skillStore.addSkill({
          employeeId: currentEmployee.value.id,
          employeeName: currentEmployee.value.name,
          skillName: skillFormData.value.skillName || '',
          category: skillFormData.value.category || '',
          proficiency: skillFormData.value.proficiency as SkillProficiency,
          yearsOfExperience: skillFormData.value.yearsOfExperience
        })
        message.success('技能添加成功')
      }
      showSkillModal.value = false
    }
  })
}

function handleDeleteSkill(id: string) {
  const d = dialog.warning({
    title: '确认删除',
    content: '确定要删除该技能吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      skillStore.deleteSkill(id)
      message.success('删除成功')
      d.destroy()
    }
  })
}

function openAddProjectModal() {
  editingProject.value = null
  projectFormData.value = {
    projectName: '',
    role: '',
    startDate: null,
    endDate: null,
    description: '',
    achievements: ''
  }
  showProjectModal.value = true
}

function handleEditProject(project: EmployeeProject) {
  editingProject.value = project
  projectFormData.value = { ...project }
  showProjectModal.value = true
}

function handleProjectSubmit() {
  projectFormRef.value?.validate((errors) => {
    if (!errors && currentEmployee.value) {
      const startDate = typeof projectFormData.value.startDate === 'number'
        ? formatDate(projectFormData.value.startDate as number)
        : projectFormData.value.startDate || ''
      
      const endDate = typeof projectFormData.value.endDate === 'number'
        ? formatDate(projectFormData.value.endDate as number)
        : projectFormData.value.endDate || ''

      if (editingProject.value) {
        projectStore.updateProject(editingProject.value.id, {
          ...projectFormData.value,
          startDate,
          endDate
        })
        message.success('项目经历更新成功')
      } else {
        projectStore.addProject({
          employeeId: currentEmployee.value.id,
          employeeName: currentEmployee.value.name,
          projectName: projectFormData.value.projectName || '',
          role: projectFormData.value.role || '',
          startDate,
          endDate,
          description: projectFormData.value.description || '',
          achievements: projectFormData.value.achievements || ''
        })
        message.success('项目经历添加成功')
      }
      showProjectModal.value = false
    }
  })
}

function handleDeleteProject(id: string) {
  const d = dialog.warning({
    title: '确认删除',
    content: '确定要删除该项目经历吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      projectStore.deleteProject(id)
      message.success('删除成功')
      d.destroy()
    }
  })
}

function openTeamSkillModal() {
  if (currentEmployee.value) {
    selectedDepartmentForRadar.value = currentEmployee.value.department
  }
  showTeamSkillModal.value = true
  nextTick(() => {
    initRadarChart()
  })
}

function initRadarChart() {
  if (!radarChartRef.value) return
  
  const chart = echarts.init(radarChartRef.value)
  const radarData = skillStore.getTopSkillsForRadar(selectedDepartmentForRadar.value, 8)
  
  if (radarData.indicator.length === 0) {
    chart.setOption({
      title: { text: '暂无技能数据', left: 'center', top: 'center', textStyle: { color: '#9CA3AF' } }
    })
    return
  }
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['平均熟练度'],
      bottom: 0
    },
    radar: {
      indicator: radarData.indicator,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#4B5563',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: ['#E5E7EB']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#F9FAFB', '#F3F4F6']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#D1D5DB'
        }
      }
    },
    series: [{
      name: '团队技术能力',
      type: 'radar',
      data: [
        {
          value: radarData.values,
          name: '平均熟练度',
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: '#7C3AED'
          },
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { offset: 0, color: 'rgba(124, 58, 237, 0.5)' },
              { offset: 1, color: 'rgba(124, 58, 237, 0.1)' }
            ])
          },
          itemStyle: {
            color: '#7C3AED'
          }
        }
      ]
    }]
  }
  
  chart.setOption(option)
}

watch(selectedDepartmentForRadar, () => {
  if (showTeamSkillModal.value) {
    nextTick(() => {
      initRadarChart()
    })
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.employee-details {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.employee-email {
  font-size: 12px;
  color: #6B7280;
}

.employee-detail {
  text-align: left;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EDE9FE;
}

.detail-avatar {
  flex-shrink: 0;
}

.detail-avatar img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid #7C3AED;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-name {
  font-size: 20px;
  font-weight: 700;
  color: #1E1B4B;
}

.detail-position {
  font-size: 14px;
  color: #6B7280;
}

.detail-desc {
  margin-bottom: 24px;
}

.current-contract {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.contract-card {
  background: linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%);
  border: 1px solid #EDE9FE;
}

.contract-warning {
  margin-top: 12px;
}

.no-contract {
  margin-bottom: 24px;
}

.contract-timeline {
  margin-top: 24px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}

.timeline-id {
  font-size: 13px;
  color: #374151;
}

.timeline-salary {
  font-size: 13px;
  color: #059669;
  font-weight: 500;
}

.timeline-remarks {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
  font-style: italic;
}

.no-history {
  padding: 20px 0;
}

.performance-section {
  padding: 8px 0;
}

.section-header {
  margin-bottom: 12px;
}

.chart-card {
  background: #fff;
  margin-bottom: 20px;
}

.trend-chart {
  height: 280px;
  width: 100%;
}

.appraisal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appraisal-item {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.appraisal-item:hover {
  border-color: #7C3AED;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
}

.appraisal-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.appraisal-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.appraisal-period {
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.appraisal-plan {
  font-size: 13px;
  color: #6B7280;
}

.appraisal-supervisor {
  font-size: 12px;
  color: #9CA3AF;
}

.appraisal-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.score-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.no-appraisal {
  padding: 40px 0;
}

.appraisal-detail-modal {
  padding: 8px 0;
}

.appraisal-detail-modal .detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.appraisal-detail-modal .detail-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.appraisal-detail-modal .detail-period {
  font-size: 18px;
  font-weight: 700;
  color: #1E1B4B;
}

.appraisal-detail-modal .detail-plan {
  font-size: 14px;
  color: #6B7280;
}

.appraisal-detail-modal .detail-meta {
  font-size: 13px;
  color: #9CA3AF;
}

.appraisal-detail-modal .detail-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.appraisal-detail-modal .score-label {
  font-size: 13px;
  color: #6B7280;
}

.appraisal-detail-modal .score-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.kpi-score-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kpi-score-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

.kpi-name {
  font-weight: 500;
  color: #1E1B4B;
  font-size: 14px;
}

.kpi-weight {
  font-size: 12px;
  color: #7C3AED;
}

.kpi-score-bar {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.score-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.kpi-score-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 100px;
  gap: 2px;
}

.raw-score {
  font-weight: 600;
  color: #1E1B4B;
  font-size: 14px;
}

.weighted-score {
  font-size: 12px;
  color: #7C3AED;
  font-weight: 500;
}

.suggestion-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.adjustment-amount {
  font-weight: 600;
  color: #7C3AED;
  margin-left: 16px;
}

.transfer-section {
  padding: 8px 0;
}

.transfer-timeline {
  padding: 12px 0;
}

.transfer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
}

.transfer-path {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.transfer-before {
  color: #6B7280;
}

.transfer-arrow {
  color: #7C3AED;
  font-weight: 600;
}

.transfer-after {
  color: #1E1B4B;
  font-weight: 500;
}

.transfer-reason {
  font-size: 13px;
  color: #374151;
}

.transfer-remarks {
  font-size: 12px;
  color: #6B7280;
  font-style: italic;
}

.transfer-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.transfer-operator {
  font-size: 12px;
  color: #9CA3AF;
}

.no-transfer {
  padding: 40px 0;
}

.leave-section {
  padding: 8px 0;
}

.leave-balance {
  margin-bottom: 24px;
}

.balance-card {
  border: none;
}

.balance-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.balance-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.balance-info {
  flex: 1;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.balance-value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}

.balance-value strong {
  font-size: 28px;
}

.balance-detail {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.leave-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leave-item {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}

.leave-item:hover {
  border-color: #7C3AED;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
}

.leave-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.leave-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.leave-dates {
  font-size: 14px;
  font-weight: 500;
  color: #1E1B4B;
}

.leave-days {
  font-size: 13px;
  color: #7C3AED;
  font-weight: 500;
}

.leave-reason {
  font-size: 13px;
  color: #374151;
  margin-bottom: 8px;
}

.leave-comment {
  font-size: 13px;
  color: #6B7280;
  background: #F9FAFB;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.leave-footer {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9CA3AF;
}

.no-leave {
  padding: 40px 0;
}

.age-tag {
  color: #6B7280;
  font-size: 13px;
  margin-left: 4px;
}

.import-result-modal {
  text-align: left;
}

.import-result-modal .error-list {
  margin-top: 20px;
}

.import-result-modal .section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 12px;
}

.import-result-modal .error-table {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.skills-section {
  padding: 8px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}

.skill-item:hover {
  border-color: #7C3AED;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
}

.skill-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.skill-info {
  flex: 1;
}

.skill-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.skill-name {
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
}

.skill-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.skill-years {
  font-size: 13px;
  color: #6B7280;
}

.skill-actions {
  display: flex;
  gap: 4px;
}

.skill-progress {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
}

.skill-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.no-skills {
  padding: 40px 0;
}

.projects-section {
  padding: 8px 0;
}

.projects-table {
  margin-bottom: 24px;
}

.projects-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: #7C3AED;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
}

.project-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EDE9FE;
}

.project-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.project-name {
  font-size: 18px;
  font-weight: 700;
  color: #1E1B4B;
}

.project-dates {
  font-size: 13px;
  color: #7C3AED;
  font-weight: 500;
}

.project-description,
.project-achievements {
  margin-bottom: 12px;
}

.project-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.project-content {
  font-size: 14px;
  color: #4B5563;
  line-height: 1.6;
}

.project-content.achievements {
  color: #10B981;
  font-weight: 500;
}

.no-projects {
  padding: 40px 0;
}

.team-skill-modal {
  text-align: left;
}

.team-skill-header {
  margin-bottom: 16px;
}

.team-skill-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.radar-chart {
  height: 320px;
  width: 100%;
}

.skill-stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.skill-stat-item {
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.skill-stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.skill-stat-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E1B4B;
}

.skill-stat-count {
  font-size: 12px;
  color: #7C3AED;
  font-weight: 500;
}

.skill-stat-bar {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.skill-stat-progress {
  height: 100%;
  background: linear-gradient(90deg, #7C3AED, #A78BFA);
  border-radius: 3px;
  transition: width 0.3s;
}

.skill-stat-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
