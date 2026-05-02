# Voidwryte

一款面向零基础编程学习者的编程主题休闲游戏。

## 游戏介绍

Voidwryte 是一款创新的编程学习游戏，通过拖拽组件的方式让玩家在游戏中学习 HTML、CSS、JavaScript 以及 Electron 和 .NET 开发技能。

## 游戏特性

### 学习模式
- 逐步引导学习 HTML 标签结构
- 拖拽组件构建网页界面
- 即时预览效果
- 提示系统帮助你理解每个步骤

### 挑战模式
- 无提示完成任务
- 追求更高分数
- 考验真正的编程能力

### 丰富内容
- 多阶段关卡设计
- 奖励任务系统
- 成就系统
- 排行榜

## 技术架构

### 前端技术
- HTML5 + CSS3 + JavaScript
- PWA 支持（Service Worker）
- LocalStorage 数据持久化
- 响应式设计

### 文件结构
```
Voidwryte/
├── index.html          # 游戏主页
├── guide.html          # 新手教程
├── levels.html         # 关卡选择
├── game.html           # 游戏主界面
├── rewards.html        # 奖励任务
├── settlement.html     # 结算页面
├── profile.html        # 个人资料
├── settings.html       # 设置页面
├── leaderboard.html    # 排行榜
├── style.css          # 样式文件
├── script.js          # 游戏逻辑
├── sw.js              # Service Worker
└── manifest.json      # PWA 配置
```

## 开始游戏

### 环境要求
- 现代浏览器（Chrome、Edge、Firefox、Safari）
- 本地服务器（用于开发）

### 启动开发服务器
```bash
# 使用 Python
python -m http.server 8000

# 或使用 VS Code Live Server 扩展
```

访问 http://localhost:8000 即可开始游戏。

## 关卡设计

### 第一阶段：HTML 基础
学习 HTML 文档结构，包括 DOCTYPE、html、head、body 等基础标签。

### 第二阶段：网页组件
学习各种网页组件，如标题、段落、图片、导航、按钮等。

### 第三阶段：表单组件
掌握表单元素，包括输入框、按钮、复选框、下拉选择等。

### 第四阶段：布局组件
学习网格布局、卡片、列表等复杂组件。

### 第五阶段：Electron 开发
进入桌面应用开发领域，学习 Electron 框架。

### 第六阶段：.NET 开发
学习 .NET 桌面应用开发。

## 游戏规则

### 评分系统
- 完美通关：所有组件顺序正确
- 普通通关：组件正确但顺序有误
- 分数由准确率和完成度计算

### 提示系统
- 每个关卡提供一次提示机会
- 提示会显示当前任务的下一个步骤

### 奖励任务
- 每日任务：每天登录和完成任务获得奖励
- 成就任务：达成特定条件解锁成就和奖励

## 数据存储

游戏数据使用 LocalStorage 存储，包括：
- 用户进度
- 已通关关卡
- 获得奖励
- 成就解锁状态
- 设置偏好

## 浏览器兼容性

| 浏览器 | 支持版本 |
|--------|----------|
| Chrome | 90+ |
| Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |

## License

MIT License
