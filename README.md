# HR 人力资源管理系统

一款现代化的企业人力资源管理平台，采用 Vue 3 + TypeScript + Naive UI 构建，提供员工管理、考勤统计、薪资发放、招聘流程、培训管理、组织架构等核心功能。

## ✨ 功能特性

### 🔐 登录认证
- 多角色登录（管理员/HR/员工）
- 记住登录状态
- 路由权限控制

### 👥 员工花名册
- 员工信息列表展示
- 多条件搜索筛选（姓名、部门、状态）
- 新增、编辑、删除员工
- 分页展示

### 📊 考勤统计
- 考勤数据概览卡片
- 月度考勤趋势图表
- 考勤明细列表
- 异常考勤标记

### 💰 薪资工资条
- 工资条卡片展示
- 薪资详情弹窗
- 薪资汇总统计
- 月度筛选

### 📋 招聘看板
- 拖拽式候选人管理
- 多阶段招聘流程
- 候选人信息卡片
- 新增候选人

### 📚 培训管理
- 培训课程列表
- 课程状态分类（即将开始/进行中/已完成）
- 课程详情展示
- 新增课程

### 🏢 组织架构
- 树形部门展示
- 展开/收起交互
- 部门统计图表
- 人员归属展示

### 📈 数据仪表盘
- 关键指标概览
- 考勤趋势图表
- 部门人员分布
- 最新动态列表

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4.x | 渐进式 JavaScript 框架 |
| TypeScript | 5.x | JavaScript 超集 |
| Vite | 5.x | 下一代前端构建工具 |
| Naive UI | 2.x | Vue 3 组件库 |
| Pinia | 2.x | Vue 状态管理 |
| Vue Router | 4.x | Vue 路由管理 |
| ECharts | 5.x | 数据可视化图表 |
| vuedraggable | 4.x | Vue 拖拽组件 |
| Tailwind CSS | 3.x | 实用优先的 CSS 框架 |
| Lucide Vue | 0.x | 图标库 |

## 📁 项目结构

```
src/
├── assets/              # 静态资源
│   ├── styles/          # 全局样式
│   └── images/          # 图片资源
├── components/          # 公共组件
│   └── layout/          # 布局组件
│       └── MainLayout.vue
├── views/               # 页面组件
│   ├── Login.vue        # 登录页
│   ├── Dashboard.vue    # 仪表盘
│   ├── Employees.vue    # 员工花名册
│   ├── Attendance.vue   # 考勤统计
│   ├── Salary.vue       # 薪资工资条
│   ├── Recruitment.vue  # 招聘看板
│   ├── Training.vue     # 培训管理
│   └── Organization.vue # 组织架构
├── router/              # 路由配置
│   └── index.ts
├── stores/              # Pinia 状态管理
│   ├── user.ts          # 用户状态
│   ├── employee.ts      # 员工状态
│   ├── attendance.ts    # 考勤状态
│   ├── salary.ts        # 薪资状态
│   ├── recruitment.ts   # 招聘状态
│   ├── training.ts      # 培训状态
│   └── organization.ts  # 组织架构状态
├── types/               # TypeScript 类型定义
│   └── index.ts
├── mock/                # 模拟数据
│   └── data.ts
├── App.vue              # 根组件
├── main.ts              # 入口文件
└── style.css            # 全局样式
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 8.0.0

### 安装依赖

```bash
# 使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

访问 `http://localhost:5173` 即可查看应用。

### 构建生产版本

```bash
# 使用 pnpm
pnpm build

# 或使用 npm
npm run build
```

### 预览生产版本

```bash
# 使用 pnpm
pnpm preview

# 或使用 npm
npm run preview
```

### 类型检查

```bash
# 使用 pnpm
pnpm check

# 或使用 npm
npm run check
```

## 🔑 测试账号

系统预置了三个测试角色账号：

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | admin | 123456 | 系统全功能访问 |
| HR 专员 | hr | 123456 | 人事相关功能 |
| 普通员工 | employee | 123456 | 个人信息查看 |

## 🎨 设计特色

### 紫色优雅主题
- 主色调：`#7C3AED`（深紫）
- 辅助色：`#A78BFA`（中紫）、`#DDD6FE`（浅紫）
- 渐变背景、毛玻璃效果
- 精致的卡片设计和阴影层次

### 动效交互
- 页面切换淡入淡出
- 按钮悬停上浮效果
- 数字统计计数动画
- 拖拽平滑过渡
- 树形展开收起动画

### 响应式布局
- 侧边栏可收起
- 内容区域自适应
- 表格横向滚动适配

## 📦 核心依赖说明

### Naive UI
- 完整的 Vue 3 组件库
- TypeScript 友好
- 主题定制能力强

### Pinia
- Vue 官方推荐状态管理
- 模块化 Store 设计
- DevTools 支持

### ECharts
- 强大的数据可视化
- 丰富的图表类型
- 高度可定制

### vuedraggable
- 基于 Sortable.js
- 支持拖拽排序
- 支持跨列表拖拽

## 🔧 开发说明

### 新增页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在 `src/components/layout/MainLayout.vue` 中添加菜单项

### 新增 Store

1. 在 `src/stores/` 下创建状态文件
2. 使用 `defineStore` 定义 Store
3. 在组件中通过 `useXxxStore()` 使用

### 类型定义

- 所有数据类型定义在 `src/types/index.ts`
- 使用 TypeScript 接口规范数据结构
- 确保类型安全

## 📝 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- ✨ 完成登录认证功能
- ✨ 完成员工花名册模块
- ✨ 完成考勤统计模块
- ✨ 完成薪资工资条模块
- ✨ 完成招聘看板模块（拖拽）
- ✨ 完成培训管理模块
- ✨ 完成组织架构树模块
- ✨ 完成数据仪表盘

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👤 作者

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

**如果这个项目对你有帮助，欢迎给个 ⭐️ Star 支持！**
