## 项目概述

自学考试英语（专升本）13000 00015 历年真题刷题平台。提供 2017-2026 年历年真题的在线刷题功能，支持用户注册登录、刷题记录、错题本等功能。包含微信公众号关注引导拦截。

## 技术栈

- 前端：纯 HTML/CSS/JavaScript，无框架
- 存储：浏览器 localStorage（全静态，无需后端）
- 部署：GitHub Pages 或其他静态托管服务

## 架构设计

全静态架构，所有功能在浏览器端完成：
- **用户系统**：注册/登录信息存储在 localStorage，密码使用哈希保护
- **答题记录**：每道题的答案、判分结果、解析保存到 localStorage
- **错题本**：从本地记录中筛选错题，支持按考试/题型筛选和浏览器打印导出 PDF
- **数据可导出/导入** JSON 备份，方便换设备时迁移

## 目录结构

```
/workspace/projects/
├── AGENTS.md                 # 项目规范
├── .gitignore                # Git 忽略规则
├── deploy_dist/              # 静态站点文件（部署目录）
│   ├── index.html            # 入口页，历年真题列表
│   ├── login.html            # 登录页（纯前端）
│   ├── register.html         # 注册页（纯前端）
│   ├── profile.html          # 个人中心，显示刷题统计 + 数据导入导出
│   ├── wrong-questions.html  # 错题本，支持打印/导出 PDF
│   ├── quiz-tracker.js       # 刷题记录追踪脚本（localStorage 存储）
│   ├── follow-gate.js        # 微信公众号关注引导脚本
│   ├── js/
│   │   └── app.js            # 核心数据管理模块（用户系统 + 答题数据）
│   ├── 公众号二维码.JPG       # 公众号二维码图片
│   └── YYYY年M月.html        # 各年份真题页面（2017-2026）
```

## 核心模块

### 前端页面
- `deploy_dist/index.html` — 站点入口，历年真题列表，含用户状态显示
- `deploy_dist/login.html` — 用户登录页（纯前端 local 验证）
- `deploy_dist/register.html` — 用户注册页（纯前端）
- `deploy_dist/profile.html` — 个人中心，显示刷题统计 + 数据管理（导出/导入/清除）
- `deploy_dist/wrong-questions.html` — 错题本，按考试/题型筛选，支持浏览器打印导出 PDF
- `deploy_dist/YYYY年M月.html` — 各年份真题详情页面（含 ANSWERS 对象）
- `deploy_dist/quiz-tracker.js` — 刷题记录追踪，提交试卷时自动保存答案到 localStorage
- `deploy_dist/follow-gate.js` — 微信浏览器关注引导拦截
- `deploy_dist/js/app.js` — 核心数据管理模块

### js/app.js 核心模块

提供 `QuizApp` 全局对象，包含两个子模块：

**QuizApp.User** — 用户管理
- `register(username, password)` → 注册新用户
- `login(username, password)` → 登录验证
- `logout()` → 退出
- `getCurrent()` → 获取当前用户名
- `isLoggedIn()` → 是否已登录

**QuizApp.Data** — 数据管理
- `saveAnswer(record)` → 保存单条答题记录
- `saveExamAnswers(examInfo, answerList)` → 批量保存一次考试的所有答案
- `getWrongQuestions()` → 获取所有错题列表
- `markAsReviewed(year, month, part, num)` → 标记题目已掌握
- `getStats()` → 获取统计 { total, correct, wrong, accuracy }
- `getExamProgress(year, month)` → 获取某次考试的答题进度
- `clearAll()` → 清除当前用户数据
- `exportData()` → 导出 JSON
- `importData(jsonStr)` → 导入 JSON

### 数据存储格式

```
quiz_users           → { "username": { passwordHash, salt, createdAt } }
quiz_current_user    → "username" | null
quiz_answers_{user}  → { "2024_4_p1_1": { userAnswer, correctAnswer, isCorrect, explanation, examTitle, examYear, examMonth, part, questionNum, answeredAt, reviewed } }
```

### 真题页面结构

每个年份真题页面（如 `2024年4月.html`）包含：
1. HTML 结构：阅读原文 + 动态生成的答题区
2. `const ANSWERS = { p1, p1Explain, p2, p2Explain, ... }` 正确答案和解析
3. 两种模式：考试模式（统一判分）/ 练习模式（即时反馈）
4. 加载 `quiz-tracker.js`（保存答题记录）+ `follow-gate.js`（微信引导）

## 部署方式

### GitHub Pages（推荐）

1. 将 `deploy_dist/` 目录推送到 GitHub 仓库
2. 在仓库 Settings → Pages 中启用，选择 main 分支和 `/ (root)` 目录
3. 访问 `https://你的用户名.github.io/仓库名/` 即可使用

### 本地预览

用任意 HTTP 服务器在 `deploy_dist/` 目录启动即可：

```bash
cd deploy_dist
python3 -m http.server 8000
# 访问 http://localhost:8000
```

## 常见问题

- `follow-gate.js` 仅在微信浏览器环境内生效，普通浏览器不受影响
- 用户数据存储在浏览器 localStorage 中，**换设备/浏览器后不会同步**，建议在个人中心导出备份
- 密码使用本地哈希存储，仅在当前浏览器内有效
