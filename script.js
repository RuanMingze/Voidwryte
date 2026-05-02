const GameLoader = {
    elements: {},
    
    init: function() {
        this.cacheElements();
        this.bindEvents();
        this.loadUserData();
        
        // 检查会话存储，确定是否需要显示加载动画
        const hasVisited = sessionStorage.getItem('game_loaded');
        if (hasVisited) {
            // 直接显示主页
            this.elements.loadingScreen.classList.add('hidden');
            this.elements.mainMenu.classList.remove('hidden');
        } else {
            // 显示加载动画
            this.simulateLoading();
            sessionStorage.setItem('game_loaded', 'true');
        }
    },
    
    cacheElements: function() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            loadingBar: document.getElementById('loading-bar'),
            loadingText: document.getElementById('loading-text'),
            mainMenu: document.getElementById('main-menu'),
            btnStartGame: document.getElementById('btn-start-game'),
            btnTutorial: document.getElementById('btn-tutorial'),
            btnLevels: document.getElementById('btn-levels'),
            btnRewards: document.getElementById('btn-rewards'),
            btnProfile: document.getElementById('btn-profile'),
            btnLeaderboard: document.getElementById('btn-leaderboard'),
            btnSettings: document.getElementById('btn-settings'),
            statLevelsCompleted: document.getElementById('stat-levels-completed'),
            statTotalScore: document.getElementById('stat-total-score'),
            statAchievements: document.getElementById('stat-achievements')
        };
    },
    
    bindEvents: function() {
        const self = this;
        this.elements.btnStartGame.addEventListener('click', function() {
            const userData = GameStorage.getUserData();
            if (userData.settings && userData.settings.showTutorial === false) {
                // 已经看过教程，直接去关卡选择
                Game.navigateTo('levels.html');
            } else {
                // 第一次玩，去新手教程
                Game.navigateTo('guide.html');
            }
        });
        this.elements.btnTutorial.addEventListener('click', function() {
            Game.navigateTo('guide.html');
        });
        this.elements.btnLevels.addEventListener('click', function() {
            Game.navigateTo('levels.html');
        });
        this.elements.btnRewards.addEventListener('click', function() {
            Game.navigateTo('rewards.html');
        });
        this.elements.btnProfile.addEventListener('click', function() {
            Game.navigateTo('profile.html');
        });
        this.elements.btnLeaderboard.addEventListener('click', function() {
            Game.navigateTo('leaderboard.html');
        });
        this.elements.btnSettings.addEventListener('click', function() {
            Game.navigateTo('settings.html');
        });
    },
    
    loadUserData: function() {
        GameStorage.init();
        const userData = GameStorage.getUserData();
        this.elements.statLevelsCompleted.textContent = userData.completedLevels.length;
        this.elements.statTotalScore.textContent = userData.totalScore;
        this.elements.statAchievements.textContent = userData.achievements.length;
    },
    
    simulateLoading: function() {
        const loadingSteps = [
            { progress: 20, text: '正在初始化开发环境...' },
            { progress: 40, text: '正在加载游戏资源...' },
            { progress: 60, text: '正在编译代码模块...' },
            { progress: 80, text: '正在准备关卡数据...' },
            { progress: 100, text: '准备就绪！' }
        ];
        
        let stepIndex = 0;
        const self = this;
        
        function updateLoading() {
            if (stepIndex < loadingSteps.length) {
                const step = loadingSteps[stepIndex];
                self.elements.loadingBar.style.width = step.progress + '%';
                self.elements.loadingText.textContent = step.text;
                stepIndex++;
                setTimeout(updateLoading, 600);
            } else {
                setTimeout(function() {
                    self.elements.loadingScreen.classList.add('hidden');
                    self.elements.mainMenu.classList.remove('hidden');
                }, 500);
            }
        }
        
        updateLoading();
    }
};

const GameStorage = {
    STORAGE_KEY: 'voidwryte_user_data',
    DEFAULT_DATA: {
        username: '开发者',
        avatar: 'code',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        totalScore: 0,
        completedLevels: [],
        unlockedLevels: [1],
        currentLevel: null,
        levelProgress: {},
        achievements: [],
        dailyTasks: [],
        dailyTasksLastReset: null,
        hintsRemaining: 5,
        totalHintsUsed: 0,
        perfectCompletions: 0,
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 80,
            musicVolume: 50,
            showTutorial: true
        },
        gameHistory: [],
        unlockedMaterials: ['material_1', 'material_2', 'material_3', 'material_4', 'material_5'],
        unlockedBadges: []
    },
    
    init: function() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULT_DATA));
            this.resetDailyTasks();
        }
        this.checkDailyTasksReset();
    },
    
    getUserData: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : this.DEFAULT_DATA;
    },
    
    saveUserData: function(userData) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    },
    
    updateUserData: function(updates) {
        const userData = this.getUserData();
        Object.assign(userData, updates);
        this.saveUserData(userData);
        return userData;
    },
    
    checkDailyTasksReset: function() {
        const userData = this.getUserData();
        const today = new Date().toDateString();
        if (userData.dailyTasksLastReset !== today) {
            this.resetDailyTasks();
        }
    },
    
    resetDailyTasks: function() {
        const userData = this.getUserData();
        const today = new Date().toDateString();
        userData.dailyTasks = [
            { id: 'daily_1', title: '完成一个关卡', description: '通关任意关卡', icon: 'gamepad', type: 'gold', target: 1, progress: 0, completed: false, claimed: false, reward: { type: 'score', amount: 50 } },
            { id: 'daily_2', title: '连续登录', description: '每天登录游戏', icon: 'calendar-check', type: 'green', target: 1, progress: 0, completed: false, claimed: false, reward: { type: 'hints', amount: 2 } },
            { id: 'daily_3', title: '收集素材', description: '使用5个不同素材', icon: 'images', type: 'purple', target: 5, progress: 0, completed: false, claimed: false, reward: { type: 'score', amount: 30 } },
            { id: 'daily_4', title: '完美通关', description: '获得一次完美评价', icon: 'star', type: 'gold', target: 1, progress: 0, completed: false, claimed: false, reward: { type: 'badge', badgeId: 'perfect_starter', amount: 1 } }
        ];
        userData.dailyTasksLastReset = today;
        this.saveUserData(userData);
    },
    
    addXP: function(amount) {
        const userData = this.getUserData();
        userData.xp += amount;
        let levelsGained = 0;
        while (userData.xp >= userData.xpToNextLevel) {
            userData.xp -= userData.xpToNextLevel;
            userData.level++;
            userData.xpToNextLevel = Math.floor(userData.xpToNextLevel * 1.5);
            levelsGained++;
        }
        this.saveUserData(userData);
        return { xp: userData.xp, level: userData.level, levelsGained: levelsGained };
    },
    
    addScore: function(amount) {
        const userData = this.getUserData();
        userData.totalScore += amount;
        this.saveUserData(userData);
        return userData.totalScore;
    },
    
    completeLevel: function(levelId, score, perfect) {
        const userData = this.getUserData();
        if (!userData.completedLevels.includes(levelId)) {
            userData.completedLevels.push(levelId);
        }
        const nextLevel = levelId + 1;
        if (!userData.unlockedLevels.includes(nextLevel)) {
            userData.unlockedLevels.push(nextLevel);
        }
        userData.totalScore += score;
        if (perfect) {
            userData.perfectCompletions++;
        }
        this.saveUserData(userData);
        this.updateDailyTaskProgress('daily_1', 1);
        if (perfect) {
            this.updateDailyTaskProgress('daily_4', 1);
        }
        return userData;
    },
    
    updateDailyTaskProgress: function(taskId, increment) {
        const userData = this.getUserData();
        const task = userData.dailyTasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.progress = Math.min(task.progress + increment, task.target);
            if (task.progress >= task.target) {
                task.completed = true;
            }
            this.saveUserData(userData);
        }
    },
    
    claimDailyTask: function(taskId) {
        const userData = this.getUserData();
        const task = userData.dailyTasks.find(t => t.id === taskId);
        if (task && task.completed && !task.claimed) {
            task.claimed = true;
            if (task.reward.type === 'score') {
                userData.totalScore += task.reward.amount;
            } else if (task.reward.type === 'hints') {
                userData.hintsRemaining += task.reward.amount;
            } else if (task.reward.type === 'badge') {
                if (!userData.unlockedBadges.includes(task.reward.badgeId)) {
                    userData.unlockedBadges.push(task.reward.badgeId);
                }
            }
            this.saveUserData(userData);
            return true;
        }
        return false;
    },
    
    unlockAchievement: function(achievementId) {
        const userData = this.getUserData();
        if (!userData.achievements.includes(achievementId)) {
            userData.achievements.push(achievementId);
            if (!userData.unlockedBadges.includes(achievementId)) {
                userData.unlockedBadges.push(achievementId);
            }
            this.saveUserData(userData);
            return true;
        }
        return false;
    },
    
    addToHistory: function(action, details) {
        const userData = this.getUserData();
        userData.gameHistory.unshift({
            date: new Date().toISOString(),
            action: action,
            details: details
        });
        if (userData.gameHistory.length > 50) {
            userData.gameHistory = userData.gameHistory.slice(0, 50);
        }
        this.saveUserData(userData);
    }
};

const Game = {
    currentPage: 'index',
    
    navigateTo: function(page, params = {}) {
        const basePath = window.location.pathname.replace(/\/[^\/]*$/, '');
        let fullUrl;
        
        if (page.includes('?')) {
            const [baseUrl, queryString] = page.split('?');
            const pathPart = baseUrl.replace('.html', '');
            fullUrl = basePath + '/' + pathPart + '?' + queryString;
        } else {
            const pathPart = page.replace('.html', '');
            fullUrl = basePath + '/' + pathPart;
        }
        
        window.location.href = fullUrl;
    },
    
    showNotification: function(title, message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 4000);
    },
    
    createConfetti: function() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti';
        document.body.appendChild(confettiContainer);
        
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 2 + 's';
            piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confettiContainer.appendChild(piece);
        }
        
        setTimeout(function() {
            confettiContainer.remove();
        }, 5000);
    }
};

const LevelData = {
    phases: [
        {
            id: 'website',
            name: '网站制作阶段',
            description: '学习HTML/CSS基础，制作各类网站',
            icon: 'globe',
            levels: [
                { id: 1, name: 'HTML基础', description: '学习HTML文档的基本结构', difficulty: 1, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_35'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_35'], reward: 100 },
                { id: 2, name: 'head与body', description: '学习head和body标签的作用', difficulty: 2, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_36', 'material_38', 'material_34'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_36', 'material_38', 'material_34'], reward: 150 },
                { id: 3, name: 'script标签', description: '学习如何使用JavaScript', difficulty: 2, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_37', 'material_34', 'material_1', 'material_2'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_37', 'material_34', 'material_1', 'material_2'], reward: 150 },
                { id: 4, name: '完整页面', description: '构建完整的HTML页面', difficulty: 3, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_36', 'material_35', 'material_34', 'material_6', 'material_4'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_36', 'material_35', 'material_34', 'material_6', 'material_4'], reward: 200 },
                { id: 5, name: '完整项目', description: '制作一个完整的网页项目', difficulty: 3, mode: 'challenge', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_39', 'material_38', 'material_34', 'material_6', 'material_3', 'material_5', 'material_8'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_39', 'material_38', 'material_34', 'material_6', 'material_3', 'material_5', 'material_8'], reward: 200 }
            ]
        },
        {
            id: 'electron',
            name: 'Electron APP制作阶段',
            description: '使用Electron框架开发桌面应用程序',
            icon: 'desktop',
            hasTutorial: true,
            tutorialKey: 'electron_tutorial',
            levels: [
                { id: 6, name: '记事本APP', description: '开发一个简易的桌面记事本应用', difficulty: 3, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_37', 'material_1', 'material_18', 'material_21', 'material_22', 'material_26'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_37', 'material_34', 'material_1', 'material_18', 'material_21'], reward: 250 },
                { id: 7, name: '音乐播放器', description: '制作带有播放列表的音乐播放器', difficulty: 4, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_37', 'material_11', 'material_14', 'material_15', 'material_21', 'material_22', 'material_29', 'material_30'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_37', 'material_34', 'material_21', 'material_15', 'material_14', 'material_30'], reward: 300 },
                { id: 8, name: '文件管理器', description: '开发支持文件夹浏览的文件管理器', difficulty: 4, mode: 'challenge', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_1', 'material_4', 'material_16', 'material_19', 'material_21', 'material_22', 'material_23'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_21', 'material_4', 'material_22'], reward: 300 },
                { id: 9, name: '天气应用', description: '创建实时天气查询桌面程序', difficulty: 5, mode: 'challenge', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_1', 'material_2', 'material_3', 'material_11', 'material_16', 'material_21', 'material_26', 'material_27', 'material_28'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_21', 'material_1', 'material_11', 'material_27', 'material_3'], reward: 350 },
                { id: 10, name: '任务管理', description: '开发功能完善的待办事项管理工具', difficulty: 5, mode: 'challenge', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_1', 'material_2', 'material_3', 'material_4', 'material_16', 'material_18', 'material_19', 'material_20', 'material_21', 'material_22', 'material_26', 'material_30'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_21', 'material_1', 'material_4', 'material_20', 'material_22', 'material_30'], reward: 400 }
            ]
        },
        {
            id: 'dotnet',
            name: '.NET APP制作阶段',
            description: '使用.NET技术开发Windows应用程序',
            icon: 'window-maximize',
            hasTutorial: true,
            tutorialKey: 'dotnet_tutorial',
            levels: [
                { id: 11, name: '计算器', description: '开发标准型与科学型计算器', difficulty: 4, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_37', 'material_16', 'material_17', 'material_18', 'material_21', 'material_22', 'material_23', 'material_24', 'material_29'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_37', 'material_34', 'material_21', 'material_16', 'material_23', 'material_24'], reward: 400 },
                { id: 12, name: '图片查看器', description: '创建支持多种格式的图片查看工具', difficulty: 5, mode: 'learn', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_1', 'material_2', 'material_3', 'material_11', 'material_16', 'material_21', 'material_22', 'material_23', 'material_29', 'material_30'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_21', 'material_11', 'material_22', 'material_30'], reward: 450 },
                { id: 13, name: '备忘录', description: '开发可分类的桌面备忘录应用', difficulty: 5, mode: 'challenge', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_1', 'material_2', 'material_3', 'material_4', 'material_16', 'material_18', 'material_19', 'material_20', 'material_21', 'material_22', 'material_26'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_21', 'material_1', 'material_4', 'material_20', 'material_18', 'material_22'], reward: 450 },
                { id: 14, name: '系统监控', description: '制作实时监控系统资源的小工具', difficulty: 6, mode: 'challenge', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_1', 'material_2', 'material_3', 'material_16', 'material_21', 'material_26', 'material_28', 'material_29', 'material_30'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_21', 'material_1', 'material_30', 'material_28', 'material_3'], reward: 500 },
                { id: 15, name: '代码编辑器', description: '开发支持语法高亮的代码编辑器', difficulty: 6, mode: 'challenge', availableMaterials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_1', 'material_2', 'material_16', 'material_18', 'material_21', 'material_22', 'material_23', 'material_26', 'material_29'], requiredOrder: ['material_31', 'material_32', 'material_33', 'material_34', 'material_21', 'material_1', 'material_18', 'material_22', 'material_26', 'material_23'], reward: 550 }
            ]
        }
    ],
    
    getLevelById: function(levelId) {
        for (const phase of this.phases) {
            const level = phase.levels.find(l => l.id === levelId);
            if (level) {
                return { ...level, phaseId: phase.id, phaseName: phase.name };
            }
        }
        return null;
    },
    
    getPhaseById: function(phaseId) {
        return this.phases.find(p => p.id === phaseId);
    },
    
    getLevelObjectives: function(levelId) {
        const materialNames = {
            'material_1': '标题区块',
            'material_2': '内容区块',
            'material_3': '卡片组件',
            'material_4': '列表容器',
            'material_5': '网格布局',
            'material_6': '顶部导航',
            'material_7': '侧边导航',
            'material_8': '底部导航',
            'material_9': '标签页',
            'material_10': '面包屑',
            'material_11': '图片展示',
            'material_12': '图文卡片',
            'material_13': '视频容器',
            'material_14': '音频播放器',
            'material_15': '轮播组件',
            'material_16': '文本输入框',
            'material_17': '密码输入框',
            'material_18': '文本域',
            'material_19': '复选框组',
            'material_20': '下拉选择框',
            'material_21': '主要按钮',
            'material_22': '次要按钮',
            'material_23': '图标按钮',
            'material_24': '按钮组',
            'material_25': '浮动按钮',
            'material_26': '提示消息',
            'material_27': '成功提示',
            'material_28': '警告提示',
            'material_29': '加载动画',
            'material_30': '进度条',
            'material_31': '!DOCTYPE声明',
            'material_32': 'html标签',
            'material_33': 'head标签',
            'material_34': 'body标签',
            'material_35': 'title标签',
            'material_36': 'meta标签',
            'material_37': 'script标签',
            'material_38': 'style标签',
            'material_39': 'link标签',
            'material_40': 'div容器'
        };
        
        const levelObjectiveDetails = {
            1: {
                materials: ['material_31', 'material_32', 'material_33', 'material_34', 'material_35'],
                hints: [
                    '从HTML标签分类中找到"!DOCTYPE声明"，放在开头',
                    '添加"html标签"作为根容器',
                    '在html标签内添加"head标签"',
                    '添加"body标签"作为页面内容区域',
                    '在head标签内添加"title标签"设置标题'
                ]
            },
            2: {
                materials: ['material_31', 'material_32', 'material_33', 'material_36', 'material_38', 'material_34'],
                hints: [
                    '添加"!DOCTYPE声明"开始HTML文档',
                    '添加"html标签"作为根标签',
                    '添加"head标签"到html标签内',
                    '在head标签内添加"meta标签"设置编码',
                    '添加"style标签"用于写CSS样式',
                    '最后添加"body标签"作为内容区域'
                ]
            },
            3: {
                materials: ['material_31', 'material_32', 'material_33', 'material_37', 'material_34', 'material_1', 'material_2'],
                hints: [
                    '基础HTML结构：!DOCTYPE → html → head → body',
                    '在head标签内添加"script标签"用于写JavaScript',
                    '在body标签内添加"标题区块"',
                    '在body标签内添加"内容区块"'
                ]
            },
            4: {
                materials: ['material_31', 'material_32', 'material_33', 'material_36', 'material_35', 'material_34', 'material_6', 'material_4'],
                hints: [
                    '构建完整的HTML文档结构',
                    '包含meta和title标签',
                    '在body标签内添加"顶部导航"',
                    '在body标签内添加"列表容器"'
                ]
            },
            5: {
                materials: ['material_31', 'material_32', 'material_33', 'material_39', 'material_38', 'material_34', 'material_6', 'material_3', 'material_5', 'material_8'],
                hints: [
                    '构建完整HTML文档',
                    '在head标签内添加"link标签"引用样式',
                    '在head标签内添加"style标签"写样式',
                    'body标签内包含：顶部导航、卡片组件、网格布局、底部导航'
                ]
            }
        };
        
        const defaultDetails = {
            materials: ['material_21', 'material_1', 'material_18', 'material_22', 'material_26', 'material_23'],
            hints: [
                '从左侧素材区找到"主要按钮"，作为主要操作入口',
                '从左侧素材区找到"标题区块"，显示功能标题',
                '从左侧素材区找到"文本域"，用于输入内容',
                '从左侧素材区找到"次要按钮"，作为辅助操作',
                '从左侧素材区找到"提示消息"，显示操作反馈',
                '从左侧素材区找到"图标按钮"，作为快捷操作'
            ]
        };
        
        const details = levelObjectiveDetails[levelId] || defaultDetails;
        const objectives = details.materials.map((matId, index) => ({
            id: `obj_${index + 1}`,
            materialId: matId,
            text: `${index + 1}. 添加 ${materialNames[matId] || '组件'}`,
            hint: details.hints[index] || `从左侧素材区找到相关组件并添加`,
            completed: false
        }));
        
        return objectives;
    }
};

const MaterialsData = {
    categories: [
        {
            id: 'html',
            name: 'HTML标签',
            icon: 'code',
            items: [
                { id: 'material_31', name: '!DOCTYPE声明', type: 'html', icon: 'exclamation-circle', code: '<!DOCTYPE html>' },
                { id: 'material_32', name: 'html标签', type: 'html', icon: 'folder-open', code: '<html lang="zh-CN">\n</html>' },
                { id: 'material_33', name: 'head标签', type: 'html', icon: 'brain', code: '<head>\n    <title>页面标题</title>\n</head>' },
                { id: 'material_34', name: 'body标签', type: 'html', icon: 'address-card', code: '<body>\n    <h1>页面内容</h1>\n</body>' },
                { id: 'material_35', name: 'title标签', type: 'html', icon: 'heading', code: '<title>我的页面</title>' },
                { id: 'material_36', name: 'meta标签', type: 'html', icon: 'keyboard', code: '<meta charset="UTF-8">' },
                { id: 'material_37', name: 'script标签', type: 'html', icon: 'terminal', code: '<script>\n    console.log("Hello");\n</script>' },
                { id: 'material_38', name: 'style标签', type: 'html', icon: 'palette', code: '<style>\n    body { color: #333; }\n</style>' },
                { id: 'material_39', name: 'link标签', type: 'html', icon: 'link', code: '<link rel="stylesheet" href="style.css">' },
                { id: 'material_40', name: 'div容器', type: 'html', icon: 'square', code: '<div class="container">\n</div>' }
            ]
        },
        {
            id: 'layout',
            name: '布局元素',
            icon: 'th-large',
            items: [
                { id: 'material_1', name: '标题区块', type: 'layout', icon: 'heading', code: '<div class="header-section"><h1>标题文字</h1></div>' },
                { id: 'material_2', name: '内容区块', type: 'layout', icon: 'square', code: '<div class="content-section"><p>内容文字</p></div>' },
                { id: 'material_3', name: '卡片组件', type: 'layout', icon: 'layer-group', code: '<div class="card"><h3>卡片标题</h3><p>卡片内容</p></div>' },
                { id: 'material_4', name: '列表容器', type: 'layout', icon: 'list', code: '<ul class="item-list"><li>列表项1</li><li>列表项2</li></ul>' },
                { id: 'material_5', name: '网格布局', type: 'layout', icon: 'grid-2x2', code: '<div class="grid-layout"><div>项目1</div><div>项目2</div></div>' }
            ]
        },
        {
            id: 'navigation',
            name: '导航元素',
            icon: 'compass',
            items: [
                { id: 'material_6', name: '顶部导航', type: 'nav', icon: 'bars', code: '<nav class="top-nav"><a href="#">首页</a><a href="#">关于我们</a></nav>' },
                { id: 'material_7', name: '侧边导航', type: 'nav', icon: 'outdent', code: '<aside class="sidebar"><nav><a href="#">菜单一</a><a href="#">菜单二</a></nav></aside>' },
                { id: 'material_8', name: '底部导航', type: 'nav', icon: 'arrow-up', code: '<footer class="bottom-nav"><a href="#">首页</a><a href="#">我的</a></footer>' },
                { id: 'material_9', name: '标签页', type: 'nav', icon: 'folder', code: '<div class="tabs"><button>标签1</button><button>标签2</button></div>' },
                { id: 'material_10', name: '面包屑', type: 'nav', icon: 'caret-right', code: '<nav class="breadcrumb"><a href="#">首页</a> > <a href="#">分类</a></nav>' }
            ]
        },
        {
            id: 'content',
            name: '内容组件',
            icon: 'newspaper',
            items: [
                { id: 'material_11', name: '图片展示', type: 'content', icon: 'image', code: '<div class="image-box"><img src="placeholder.jpg" alt="图片描述"></div>' },
                { id: 'material_12', name: '图文卡片', type: 'content', icon: 'id-card', code: '<div class="media-card"><img src="thumb.jpg"><div class="media-info"><h4>标题</h4><p>描述文字</p></div></div>' },
                { id: 'material_13', name: '视频容器', type: 'content', icon: 'video', code: '<div class="video-container"><video controls><source src="video.mp4"></video></div>' },
                { id: 'material_14', name: '音频播放器', type: 'content', icon: 'music', code: '<div class="audio-player"><audio controls><source src="audio.mp3"></audio></div>' },
                { id: 'material_15', name: '轮播组件', type: 'content', icon: 'images', code: '<div class="carousel"><div class="slides"><div class="slide active">1</div><div class="slide">2</div></div></div>' }
            ]
        },
        {
            id: 'form',
            name: '表单元素',
            icon: 'edit',
            items: [
                { id: 'material_16', name: '文本输入框', type: 'form', icon: 'font', code: '<input type="text" class="text-input" placeholder="请输入文字">' },
                { id: 'material_17', name: '密码输入框', type: 'form', icon: 'key', code: '<input type="password" class="password-input" placeholder="请输入密码">' },
                { id: 'material_18', name: '文本域', type: 'form', icon: 'align-left', code: '<textarea class="textarea-input" placeholder="请输入详细内容"></textarea>' },
                { id: 'material_19', name: '复选框组', type: 'form', icon: 'check-square', code: '<div class="checkbox-group"><label><input type="checkbox">选项1</label><label><input type="checkbox">选项2</label></div>' },
                { id: 'material_20', name: '下拉选择框', type: 'form', icon: 'chevron-down', code: '<select class="select-input"><option>选项1</option><option>选项2</option></select>' }
            ]
        },
        {
            id: 'button',
            name: '按钮组件',
            icon: 'hand-pointer',
            items: [
                { id: 'material_21', name: '主要按钮', type: 'button', icon: 'mouse', code: '<button class="btn btn-primary">主要操作</button>' },
                { id: 'material_22', name: '次要按钮', type: 'button', icon: 'hand-paper', code: '<button class="btn btn-secondary">次要操作</button>' },
                { id: 'material_23', name: '图标按钮', type: 'button', icon: 'search', code: '<button class="btn btn-icon"><i class="fas fa-search"></i></button>' },
                { id: 'material_24', name: '按钮组', type: 'button', icon: 'object-group', code: '<div class="btn-group"><button>左</button><button>中</button><button>右</button></div>' },
                { id: 'material_25', name: '浮动按钮', type: 'button', icon: 'plus-circle', code: '<button class="btn btn-float"><i class="fas fa-plus"></i></button>' }
            ]
        },
        {
            id: 'feedback',
            name: '反馈组件',
            icon: 'comment',
            items: [
                { id: 'material_26', name: '提示消息', type: 'feedback', icon: 'info-circle', code: '<div class="alert alert-info">这是一条提示信息</div>' },
                { id: 'material_27', name: '成功提示', type: 'feedback', icon: 'check-circle', code: '<div class="alert alert-success">操作成功！</div>' },
                { id: 'material_28', name: '警告提示', type: 'feedback', icon: 'exclamation-triangle', code: '<div class="alert alert-warning">请注意此警告</div>' },
                { id: 'material_29', name: '加载动画', type: 'feedback', icon: 'spinner', code: '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>' },
                { id: 'material_30', name: '进度条', type: 'feedback', icon: 'chart-bar', code: '<div class="progress-bar"><div class="progress-fill" style="width: 60%"></div></div>' }
            ]
        }
    ],
    
    getMaterialById: function(materialId) {
        for (const category of this.categories) {
            const material = category.items.find(item => item.id === materialId);
            if (material) return material;
        }
        return null;
    },
    
    getMaterialsByCategory: function(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.items : [];
    }
};

const AchievementsData = {
    achievements: [
        { id: 'first_step', name: '第一步', description: '完成第一个关卡', icon: 'shoe-prints', requirement: { type: 'levels_completed', count: 1 } },
        { id: 'website_master', name: '网站大师', description: '完成所有网站制作关卡', icon: 'globe', requirement: { type: 'phase_completed', phase: 'website' } },
        { id: 'electron_dev', name: 'Electron开发者', description: '完成Electron APP阶段', icon: 'desktop', requirement: { type: 'phase_completed', phase: 'electron' } },
        { id: 'dotnet_dev', name: '.NET开发者', description: '完成.NET APP阶段', icon: 'window-maximize', requirement: { type: 'phase_completed', phase: 'dotnet' } },
        { id: 'perfect_starter', name: '完美起步', description: '获得第一次完美通关', icon: 'star', requirement: { type: 'perfect_count', count: 1 } },
        { id: 'perfectionist', name: '完美主义者', description: '获得10次完美通关', icon: 'crown', requirement: { type: 'perfect_count', count: 10 } },
        { id: 'hint_5', name: '勤学好问', description: '累计使用50次提示', icon: 'lightbulb', requirement: { type: 'hints_used', count: 50 } },
        { id: 'score_1000', name: '千分达人', description: '累计获得1000积分', icon: 'trophy', requirement: { type: 'total_score', count: 1000 } },
        { id: 'score_5000', name: '五千强者', description: '累计获得5000积分', icon: 'medal', requirement: { type: 'total_score', count: 5000 } },
        { id: 'level_10', name: '十级学者', description: '用户等级达到10级', icon: 'arrow-up', requirement: { type: 'user_level', level: 10 } },
        { id: 'all_materials', name: '素材收集家', description: '解锁所有素材', icon: 'images', requirement: { type: 'materials_unlocked', count: 30 } },
        { id: 'daily_streak', name: '连续作战', description: '完成7天每日任务', icon: 'fire', requirement: { type: 'daily_streak', days: 7 } }
    ],
    
    checkAchievements: function() {
        const userData = GameStorage.getUserData();
        const newlyUnlocked = [];
        
        for (const achievement of this.achievements) {
            if (userData.achievements.includes(achievement.id)) continue;
            
            let unlocked = false;
            
            switch (achievement.requirement.type) {
                case 'levels_completed':
                    if (userData.completedLevels.length >= achievement.requirement.count) {
                        unlocked = true;
                    }
                    break;
                case 'phase_completed':
                    const phase = LevelData.getPhaseById(achievement.requirement.phase);
                    if (phase) {
                        const allLevelIds = phase.levels.map(l => l.id);
                        unlocked = allLevelIds.every(id => userData.completedLevels.includes(id));
                    }
                    break;
                case 'perfect_count':
                    if (userData.perfectCompletions >= achievement.requirement.count) {
                        unlocked = true;
                    }
                    break;
                case 'hints_used':
                    if (userData.totalHintsUsed >= achievement.requirement.count) {
                        unlocked = true;
                    }
                    break;
                case 'total_score':
                    if (userData.totalScore >= achievement.requirement.count) {
                        unlocked = true;
                    }
                    break;
                case 'user_level':
                    if (userData.level >= achievement.requirement.level) {
                        unlocked = true;
                    }
                    break;
                case 'materials_unlocked':
                    if (userData.unlockedMaterials.length >= achievement.requirement.count) {
                        unlocked = true;
                    }
                    break;
            }
            
            if (unlocked) {
                GameStorage.unlockAchievement(achievement.id);
                newlyUnlocked.push(achievement);
            }
        }
        
        return newlyUnlocked;
    },
    
    getAchievementProgress: function(achievement) {
        const userData = GameStorage.getUserData();
        let current = 0;
        let target = 0;
        
        switch (achievement.requirement.type) {
            case 'levels_completed':
                current = userData.completedLevels.length;
                target = achievement.requirement.count;
                break;
            case 'perfect_count':
                current = userData.perfectCompletions;
                target = achievement.requirement.count;
                break;
            case 'hints_used':
                current = userData.totalHintsUsed;
                target = achievement.requirement.count;
                break;
            case 'total_score':
                current = userData.totalScore;
                target = achievement.requirement.count;
                break;
            case 'user_level':
                current = userData.level;
                target = achievement.requirement.level;
                break;
            case 'materials_unlocked':
                current = userData.unlockedMaterials.length;
                target = achievement.requirement.count;
                break;
            default:
                current = userData.completedLevels.length;
                target = 1;
        }
        
        return {
            current: current,
            target: target,
            percentage: Math.min((current / target) * 100, 100)
        };
    }
};

const LeaderboardData = {
    boards: {
        global: [
            { rank: 1, username: 'CodeMaster', avatar: 'code', score: 9850, title: '编程大师' },
            { rank: 2, username: 'WebWizard', avatar: 'magic', score: 8720, title: '网页巫师' },
            { rank: 3, username: 'DevNinja', avatar: 'ninja', score: 7650, title: '开发忍者' },
            { rank: 4, username: 'ByteRunner', avatar: 'running', score: 6430, title: '字节跑者' },
            { rank: 5, username: 'StackOverflow', avatar: 'stack', score: 5890, title: '堆栈达人' },
            { rank: 6, username: 'GitMaster', avatar: 'git', score: 5120, title: 'Git大师' },
            { rank: 7, username: 'ReactRookie', avatar: 'react', score: 4560, title: 'React新手' },
            { rank: 8, username: 'NodeNovice', avatar: 'node', score: 3890, title: 'Node学者' },
            { rank: 9, username: 'TypeTiger', avatar: 'tiger', score: 3240, title: '类型老虎' },
            { rank: 10, username: 'DebugDuke', avatar: 'bug', score: 2780, title: '调试公爵' }
        ],
        weekly: [
            { rank: 1, username: 'FrontendFan', avatar: 'front', score: 2450, title: '前端爱好者' },
            { rank: 2, username: 'CSSWizard', avatar: 'css', score: 2180, title: 'CSS巫师' },
            { rank: 3, username: 'HTMLHero', avatar: 'html', score: 1920, title: 'HTML英雄' },
            { rank: 4, username: 'JSJedi', avatar: 'jedi', score: 1650, title: 'JS绝地' },
            { rank: 5, username: 'VueVirtuoso', avatar: 'vue', score: 1420, title: 'Vue大师' }
        ],
        friends: []
    },
    
    getBoard: function(type) {
        const userData = GameStorage.getUserData();
        if (type === 'friends') {
            return this.boards.friends.length > 0 ? this.boards.friends : null;
        }
        const userEntry = {
            rank: this.calculateUserRank(type, userData.totalScore),
            username: userData.username,
            avatar: userData.avatar,
            score: userData.totalScore,
            title: this.getTitleForLevel(userData.level)
        };
        return { entries: this.boards[type], userEntry: userEntry };
    },
    
    calculateUserRank: function(type, score) {
        const board = this.boards[type];
        let rank = board.length + 1;
        for (let i = 0; i < board.length; i++) {
            if (score > board[i].score) {
                rank = i + 1;
                break;
            }
        }
        return rank;
    },
    
    getTitleForLevel: function(level) {
        if (level >= 20) return '编程传奇';
        if (level >= 15) return '代码大师';
        if (level >= 10) return '开发专家';
        if (level >= 5) return '编程进阶';
        return '初学者';
    }
};

function initGuidePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const phase = urlParams.get('phase');
    
    if (phase === 'electron' || phase === 'dotnet') {
        initPhaseTutorial(phase);
        return;
    }
    
    const guideSteps = document.querySelectorAll('.guide-step[data-step]');
    const stepIndicators = document.querySelectorAll('.guide-step-indicator');
    let currentStep = 0;
    
    const prevBtn = document.getElementById('guide-prev');
    const nextBtn = document.getElementById('guide-next');
    const skipBtn = document.getElementById('guide-skip');
    const stepInfo = document.getElementById('guide-step-info');
    
    function showStep(index) {
        guideSteps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });
        stepIndicators.forEach((indicator, i) => {
            indicator.classList.remove('active', 'completed');
            if (i === index) indicator.classList.add('active');
            if (i < index) indicator.classList.add('completed');
        });
        
        if (stepInfo) {
            stepInfo.textContent = `${index + 1} / ${guideSteps.length}`;
        }
        
        prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
        
        if (index === guideSteps.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-play"></i> 开始游戏';
        } else {
            nextBtn.innerHTML = '下一步 <i class="fas fa-arrow-right"></i>';
        }
    }
    
    function nextStep() {
        if (currentStep < guideSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            GameStorage.updateUserData({ settings: { ...GameStorage.getUserData().settings, showTutorial: false } });
            Game.navigateTo('levels.html');
        }
    }
    
    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    }
    
    function skipGuide() {
        GameStorage.updateUserData({ settings: { ...GameStorage.getUserData().settings, showTutorial: false } });
        Game.navigateTo('levels.html');
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (skipBtn) skipBtn.addEventListener('click', skipGuide);
    
    showStep(0);
}

function initPhaseTutorial(phase) {
    const electronTutorial = document.getElementById('electron-tutorial');
    const dotnetTutorial = document.getElementById('dotnet-tutorial');
    const guideSteps = document.querySelectorAll('.guide-step[data-step]');
    
    guideSteps.forEach(step => step.style.display = 'none');
    
    const prevBtn = document.getElementById('guide-prev');
    const nextBtn = document.getElementById('guide-next');
    const skipBtn = document.getElementById('guide-skip');
    const stepInfo = document.getElementById('guide-step-info');
    const stepIndicators = document.querySelectorAll('.guide-step-indicator');
    
    stepIndicators.forEach(indicator => indicator.style.display = 'none');
    
    if (phase === 'electron') {
        electronTutorial.style.display = 'block';
        electronTutorial.classList.add('active');
        document.querySelector('.page-title').textContent = 'Electron入门教程';
    } else {
        dotnetTutorial.style.display = 'block';
        dotnetTutorial.classList.add('active');
        document.querySelector('.page-title').textContent = '.NET入门教程';
    }
    
    if (stepInfo) {
        stepInfo.textContent = '1 / 1';
    }
    
    prevBtn.style.visibility = 'hidden';
    nextBtn.innerHTML = '<i class="fas fa-play"></i> 开始学习';
    
    function completePhaseTutorial() {
        const userData = GameStorage.getUserData();
        const tutorialKey = phase === 'electron' ? 'electron_tutorial' : 'dotnet_tutorial';
        
        if (!userData.completedTutorials) {
            userData.completedTutorials = [];
        }
        
        if (!userData.completedTutorials.includes(tutorialKey)) {
            userData.completedTutorials.push(tutorialKey);
            GameStorage.updateUserData(userData);
        }
        
        const levelId = phase === 'electron' ? 6 : 11;
        Game.navigateTo('game.html?level=' + levelId);
    }
    
    function skipPhaseTutorial() {
        const userData = GameStorage.getUserData();
        const tutorialKey = phase === 'electron' ? 'electron_tutorial' : 'dotnet_tutorial';
        
        if (!userData.completedTutorials) {
            userData.completedTutorials = [];
        }
        
        if (!userData.completedTutorials.includes(tutorialKey)) {
            userData.completedTutorials.push(tutorialKey);
            GameStorage.updateUserData(userData);
        }
        
        Game.navigateTo('levels.html');
    }
    
    if (nextBtn) nextBtn.addEventListener('click', completePhaseTutorial);
    if (skipBtn) skipBtn.addEventListener('click', skipPhaseTutorial);
}

function initLevelsPage() {
    const userData = GameStorage.getUserData();
    const phasesContainer = document.getElementById('levels-phases');
    
    if (!phasesContainer) return;
    
    phasesContainer.innerHTML = '';
    
    LevelData.phases.forEach(phase => {
        const completedLevels = phase.levels.filter(l => userData.completedLevels.includes(l.id)).length;
        const totalLevels = phase.levels.length;
        const progressPercent = Math.round((completedLevels / totalLevels) * 100);
        
        const phaseEl = document.createElement('div');
        phaseEl.className = 'level-phase';
        phaseEl.innerHTML = `
            <div class="phase-header">
                <div class="phase-icon ${phase.id}">
                    <i class="fas fa-${phase.icon}"></i>
                </div>
                <div class="phase-info">
                    <h3>${phase.name}</h3>
                    <p>${phase.description}</p>
                </div>
                <div class="phase-progress">
                    <div class="phase-progress-value">${completedLevels}/${totalLevels}</div>
                    <div class="phase-progress-label">完成进度</div>
                </div>
            </div>
            <div class="level-grid" id="phase-${phase.id}-levels"></div>
        `;
        
        phasesContainer.appendChild(phaseEl);
        
        const levelsGrid = document.getElementById(`phase-${phase.id}-levels`);
        
        phase.levels.forEach(level => {
            const isLocked = !userData.unlockedLevels.includes(level.id);
            const isCompleted = userData.completedLevels.includes(level.id);
            const isCurrent = userData.unlockedLevels.includes(level.id) && !isCompleted;
            
            const levelCard = document.createElement('div');
            levelCard.className = `level-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
            
            let statusIcon = 'fa-lock';
            let statusClass = 'locked';
            if (isCompleted) {
                statusIcon = 'fa-check-circle';
                statusClass = 'completed';
            } else if (isCurrent) {
                statusIcon = 'fa-play-circle';
                statusClass = 'current';
            }
            
            const difficultyStars = Array(6).fill(0).map((_, i) => 
                `<i class="fas fa-star ${i < level.difficulty ? '' : 'empty'}"></i>`
            ).join('');
            
            const modeClass = level.mode === 'learn' ? 'learn-mode' : 'challenge-mode';
            const modeText = level.mode === 'learn' ? '学习模式' : '挑战模式';
            const modeIcon = level.mode === 'learn' ? 'fa-graduation-cap' : 'fa-trophy';
            
            levelCard.innerHTML = `
                <div class="level-card-header">
                    <div class="level-number">${level.id}</div>
                    <div class="level-card-title">
                        <h4>${level.name}</h4>
                        <span class="mode-badge">
                            <i class="fas ${modeIcon}"></i>
                            ${modeText}
                        </span>
                        <span>${isLocked ? '未解锁' : (isCompleted ? '已通关' : '可挑战')}</span>
                    </div>
                    <div class="level-status-icon ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                    </div>
                </div>
                <div class="level-card-description">${level.description}</div>
                <div class="level-card-footer">
                    <div class="level-difficulty">${difficultyStars}</div>
                    <div class="level-reward">
                        <i class="fas fa-coins"></i>
                        <span>+${level.reward}</span>
                    </div>
                </div>
            `;
            
            if (!isLocked) {
                levelCard.addEventListener('click', function() {
                    const userData = GameStorage.getUserData();
                    const isFirstLevelInPhase = phase.levels[0].id === level.id;
                    
                    if (phase.hasTutorial && isFirstLevelInPhase && !userData.completedTutorials.includes(phase.tutorialKey)) {
                        // 需要先完成阶段教程
                        Game.navigateTo('guide.html?phase=' + phase.id);
                    } else {
                        Game.navigateTo('game.html?level=' + level.id);
                    }
                });
            }
            
            levelsGrid.appendChild(levelCard);
        });
    });
}

function showHintsInfo() {
    const userData = GameStorage.getUserData();
    Game.showNotification('提示次数', '您目前剩余 ' + userData.hintsRemaining + ' 次提示机会', 'info');
}

function initGamePage() {
    console.log('initGamePage called');
    const urlParams = new URLSearchParams(window.location.search);
    const levelId = parseInt(urlParams.get('level')) || 1;
    console.log('Level ID:', levelId);
    
    const level = LevelData.getLevelById(levelId);
    console.log('Level data:', level);
    if (!level) {
        console.log('Level not found, navigating to levels.html');
        Game.navigateTo('levels.html');
        return;
    }
    
    const userData = GameStorage.getUserData();
    console.log('User data:', userData);
    if (!userData.unlockedLevels.includes(levelId)) {
        console.log('Level not unlocked');
        Game.showNotification('未解锁', '请先完成前置关卡', 'warning');
        Game.navigateTo('levels.html');
        return;
    }
    
    document.getElementById('current-level-name').textContent = level.name;
    document.getElementById('current-level-phase').textContent = level.phaseName;
    console.log('Level name set:', level.name);
    
    initObjectives(levelId);
    console.log('Objectives initialized');
    initMaterialsPanel(levelId);
    console.log('Materials panel initialized');
    initEditorArea();
    console.log('Editor area initialized');
    initPreviewArea();
    console.log('Preview area initialized');
    initHintSystem();
    console.log('Hint system initialized');
    initGameControls(levelId);
    console.log('Game controls initialized');
    
    const resetEditorBtn = document.getElementById('reset-editor-btn');
    if (resetEditorBtn) {
        resetEditorBtn.addEventListener('click', function() {
            const dropZone = document.getElementById('editor-drop-zone');
            const items = dropZone.querySelectorAll('.dropped-item');
            items.forEach(item => item.remove());
            
            const placeholder = dropZone.querySelector('.editor-placeholder');
            if (placeholder) placeholder.style.display = 'block';
            
            document.querySelectorAll('.objective-item').forEach(obj => {
                obj.classList.remove('completed');
                obj.querySelector('.objective-checkbox i').style.display = 'none';
            });
            
            updatePreview();
        });
    }
}

function initObjectives(levelId) {
    const objectivesContainer = document.getElementById('objectives-list');
    if (!objectivesContainer) return;
    
    const level = LevelData.getLevelById(levelId);
    const objectives = LevelData.getLevelObjectives(levelId);
    const isLearnMode = level.mode === 'learn';
    
    objectivesContainer.innerHTML = '';
    
    objectives.forEach(obj => {
        const objEl = document.createElement('div');
        objEl.className = 'objective-item';
        objEl.dataset.objectiveId = obj.id;
        
        if (isLearnMode) {
            // 学习模式：显示详细步骤
            objEl.innerHTML = `
                <div class="objective-checkbox">
                    <i class="fas fa-check" style="display: none;"></i>
                </div>
                <div class="objective-text">
                    <p>${obj.text}</p>
                    <span class="objective-hint">${obj.hint}</span>
                </div>
            `;
        } else {
            // 挑战模式：只显示任务名称，不显示详细提示
            objEl.innerHTML = `
                <div class="objective-checkbox">
                    <i class="fas fa-check" style="display: none;"></i>
                </div>
                <div class="objective-text">
                    <p>${obj.text}</p>
                </div>
            `;
        }
        
        objectivesContainer.appendChild(objEl);
    });
}

function initMaterialsPanel(levelId) {
    const categoriesContainer = document.getElementById('material-categories');
    if (!categoriesContainer) return;
    
    const level = LevelData.getLevelById(levelId);
    if (!level) return;
    
    const availableMaterials = level.availableMaterials || [];
    const requiredOrder = level.requiredOrder || [];
    
    categoriesContainer.innerHTML = '';
    
    // 为每个素材计算使用次数（requiredOrder中的出现次数）
    const usageCount = {};
    requiredOrder.forEach(matId => {
        usageCount[matId] = (usageCount[matId] || 0) + 1;
    });
    
    // 打乱顺序：只对HTML标签分类进行打乱
    const shuffledMaterials = [...availableMaterials];
    
    // Fisher-Yates 洗牌算法
    for (let i = shuffledMaterials.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledMaterials[i], shuffledMaterials[j]] = [shuffledMaterials[j], shuffledMaterials[i]];
    }
    
    MaterialsData.categories.forEach(category => {
        let categoryItems = category.items.filter(item => shuffledMaterials.includes(item.id));
        
        // 对HTML标签分类保持打乱顺序
        if (category.id === 'html') {
            categoryItems = categoryItems.sort((a, b) => {
                const indexA = shuffledMaterials.indexOf(a.id);
                const indexB = shuffledMaterials.indexOf(b.id);
                return indexA - indexB;
            });
        }
        
        if (categoryItems.length === 0) return;
        
        const categoryEl = document.createElement('div');
        categoryEl.className = 'material-category';
        categoryEl.innerHTML = `
            <div class="category-header">
                <div class="category-title">
                    <i class="fas fa-${category.icon}"></i>
                    <span>${category.name}</span>
                </div>
                <div class="category-count">${categoryItems.length}</div>
            </div>
            <div class="category-items" id="category-${category.id}-items"></div>
        `;
        
        categoriesContainer.appendChild(categoryEl);
        
        const headerEl = categoryEl.querySelector('.category-header');
        const itemsEl = document.getElementById(`category-${category.id}-items`);
        
        headerEl.addEventListener('click', function() {
            itemsEl.classList.toggle('expanded');
        });
        
        categoryItems.forEach(material => {
            const maxUses = usageCount[material.id] || 1;
            const materialEl = document.createElement('div');
            materialEl.className = 'material-item';
            materialEl.draggable = true;
            materialEl.dataset.materialId = material.id;
            materialEl.dataset.usesRemaining = maxUses;
            materialEl.dataset.maxUses = maxUses;
            
            const usesHtml = maxUses > 1 ? `<span class="uses-badge">x${maxUses}</span>` : '';
            
            materialEl.innerHTML = `
                <i class="fas fa-${material.icon} material-icon"></i>
                <span class="material-label">${material.name}</span>
                ${usesHtml}
            `;
            
            materialEl.addEventListener('dragstart', handleDragStart);
            materialEl.addEventListener('dragend', handleDragEnd);
            
            itemsEl.appendChild(materialEl);
        });
    });
    
    const firstCategory = categoriesContainer.querySelector('.material-category');
    if (firstCategory) {
        const firstItems = firstCategory.querySelector('.category-items');
        if (firstItems) firstItems.classList.add('expanded');
    }
}

let draggedMaterial = null;
let lastAddTime = 0;

function handleDragStart(e) {
    draggedMaterial = e.target.closest('.material-item');
    draggedMaterial.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', draggedMaterial.dataset.materialId);
}

function handleDragEnd(e) {
    if (draggedMaterial) {
        draggedMaterial.classList.remove('dragging');
        draggedMaterial = null;
    }
}

function initEditorArea() {
    const dropZone = document.getElementById('editor-drop-zone');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const materialId = e.dataTransfer.getData('text/plain');
        if (materialId) {
            addMaterialToEditor(materialId);
        }
    });
}

function addMaterialToEditor(materialId) {
    const now = Date.now();
    if (now - lastAddTime < 100) { // 防抖，防止重复添加
        return;
    }
    lastAddTime = now;
    
    const material = MaterialsData.getMaterialById(materialId);
    if (!material) return;
    
    // 从素材区删除或减少使用次数
    const materialItemInPanel = document.querySelector(`.material-item[data-material-id="${materialId}"]`);
    if (materialItemInPanel) {
        let usesRemaining = parseInt(materialItemInPanel.dataset.usesRemaining) || 1;
        usesRemaining--;
        
        if (usesRemaining <= 0) {
            // 从素材区完全删除
            materialItemInPanel.remove();
            
            // 更新分类计数
            const categoryContainer = materialItemInPanel.closest('.material-category');
            if (categoryContainer) {
                const countEl = categoryContainer.querySelector('.category-count');
                if (countEl) {
                    const currentCount = parseInt(countEl.textContent) || 0;
                    countEl.textContent = Math.max(0, currentCount - 1);
                }
                
                // 如果分类没有素材了，隐藏整个分类
                const remainingItems = categoryContainer.querySelectorAll('.material-item');
                if (remainingItems.length === 0) {
                    categoryContainer.remove();
                }
            }
        } else {
            // 减少使用次数
            materialItemInPanel.dataset.usesRemaining = usesRemaining;
            const usesBadge = materialItemInPanel.querySelector('.uses-badge');
            if (usesBadge) {
                usesBadge.textContent = `x${usesRemaining}`;
            }
            
            // 如果只剩1次了，移除badge
            if (usesRemaining === 1) {
                const maxUses = parseInt(materialItemInPanel.dataset.maxUses) || 1;
                if (maxUses > 1 && usesBadge) {
                    usesBadge.remove();
                }
            }
        }
    }
    
    const dropZone = document.getElementById('editor-drop-zone');
    const placeholder = dropZone.querySelector('.editor-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    
    const itemId = 'item_' + Date.now();
    const itemEl = document.createElement('div');
    itemEl.className = 'dropped-item';
    itemEl.dataset.itemId = itemId;
    itemEl.dataset.materialId = materialId;
    itemEl.innerHTML = `
        <div class="item-preview">
            <i class="fas fa-${material.icon}"></i>
        </div>
        <div class="item-content">
            <div class="item-title">${material.name}</div>
            <div class="item-code">${material.code.substring(0, 50)}${material.code.length > 50 ? '...' : ''}</div>
        </div>
        <div class="item-actions">
            <button class="move-up" title="上移"><i class="fas fa-arrow-up"></i></button>
            <button class="move-down" title="下移"><i class="fas fa-arrow-down"></i></button>
            <button class="delete" title="删除"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    itemEl.draggable = true;
    itemEl.addEventListener('dragstart', function(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.itemId);
        e.dataTransfer.setData('application/type', 'editor-item');
    });
    
    itemEl.addEventListener('dragend', function(e) {
        this.classList.remove('dragging');
    });
    
    const deleteBtn = itemEl.querySelector('.delete');
    deleteBtn.addEventListener('click', function() {
        const materialId = itemEl.dataset.materialId;
        
        // 将组件放回素材区
        restoreMaterialToPanel(materialId);
        
        itemEl.remove();
        checkEditorEmpty();
    });
    
    const moveUpBtn = itemEl.querySelector('.move-up');
    moveUpBtn.addEventListener('click', function() {
        const prev = itemEl.previousElementSibling;
        if (prev) {
            dropZone.insertBefore(itemEl, prev);
            updatePreview();
        }
    });
    
    const moveDownBtn = itemEl.querySelector('.move-down');
    moveDownBtn.addEventListener('click', function() {
        const next = itemEl.nextElementSibling;
        if (next) {
            dropZone.insertBefore(next, itemEl);
            updatePreview();
        }
    });
    
    dropZone.appendChild(itemEl);
    updatePreview();
    
    GameStorage.updateDailyTaskProgress('daily_3', 1);
}

function restoreMaterialToPanel(materialId) {
    const material = MaterialsData.getMaterialById(materialId);
    if (!material) return;
    
    // 检查素材区是否已经有这个组件
    const existingMaterial = document.querySelector(`.material-item[data-material-id="${materialId}"]`);
    
    if (existingMaterial) {
        // 如果存在，增加使用次数
        let usesRemaining = parseInt(existingMaterial.dataset.usesRemaining) || 0;
        const maxUses = parseInt(existingMaterial.dataset.maxUses) || 1;
        usesRemaining = Math.min(usesRemaining + 1, maxUses);
        existingMaterial.dataset.usesRemaining = usesRemaining;
        
        // 更新使用次数徽章
        let usesBadge = existingMaterial.querySelector('.uses-badge');
        if (maxUses > 1 && usesRemaining > 1) {
            if (usesBadge) {
                usesBadge.textContent = `x${usesRemaining}`;
            } else {
                usesBadge = document.createElement('span');
                usesBadge.className = 'uses-badge';
                usesBadge.textContent = `x${usesRemaining}`;
                existingMaterial.appendChild(usesBadge);
            }
        }
        
        // 更新分类计数
        const categoryContainer = existingMaterial.closest('.material-category');
        if (categoryContainer) {
            const countEl = categoryContainer.querySelector('.category-count');
            if (countEl) {
                const currentCount = parseInt(countEl.textContent) || 0;
                countEl.textContent = currentCount + 1;
            }
        }
    } else {
        // 如果不存在，重新创建组件
        // 映射material.type到正确的category.id
        const typeToCategoryId = {
            'html': 'html',
            'layout': 'layout',
            'nav': 'navigation',
            'content': 'content',
            'form': 'form',
            'button': 'button',
            'feedback': 'feedback'
        };
        const categoryId = typeToCategoryId[material.type] || material.type;
        const itemsContainer = document.getElementById(`category-${categoryId}-items`) || 
                              document.querySelector('.category-items');
        
        if (itemsContainer) {
            const materialEl = document.createElement('div');
            materialEl.className = 'material-item';
            materialEl.draggable = true;
            materialEl.dataset.materialId = materialId;
            materialEl.dataset.usesRemaining = 1;
            materialEl.dataset.maxUses = 1;
            
            materialEl.innerHTML = `
                <i class="fas fa-${material.icon} material-icon"></i>
                <span class="material-label">${material.name}</span>
            `;
            
            materialEl.addEventListener('dragstart', handleDragStart);
            materialEl.addEventListener('dragend', handleDragEnd);
            
            itemsContainer.appendChild(materialEl);
            
            // 更新分类计数
            const categoryContainer = itemsContainer.closest('.material-category');
            if (categoryContainer) {
                const countEl = categoryContainer.querySelector('.category-count');
                if (countEl) {
                    const currentCount = parseInt(countEl.textContent) || 0;
                    countEl.textContent = currentCount + 1;
                }
            }
            
            // 展开分类
            itemsContainer.classList.add('expanded');
        }
    }
}

function checkEditorEmpty() {
    const dropZone = document.getElementById('editor-drop-zone');
    const placeholder = dropZone.querySelector('.editor-placeholder');
    const items = dropZone.querySelectorAll('.dropped-item');
    
    if (items.length === 0 && placeholder) {
        placeholder.style.display = 'block';
    }
}

function initPreviewArea() {
    initPreviewToggle();
    updatePreview();
}

function initPreviewToggle() {
    const previewViewBtn = document.getElementById('btn-preview-view');
    const codeViewBtn = document.getElementById('btn-code-view');
    const previewTitle = document.getElementById('preview-title');
    
    if (!previewViewBtn || !codeViewBtn) return;
    
    let currentView = 'preview';
    
    function setView(view) {
        currentView = view;
        const previewContainer = document.getElementById('preview-frame-container');
        const codeContainer = document.getElementById('code-view-container');
        const warning = document.getElementById('preview-warning');
        const warningText = warning ? warning.querySelector('span') : null;
        
        previewViewBtn.classList.toggle('active', view === 'preview');
        codeViewBtn.classList.toggle('active', view === 'code');
        
        const dropZone = document.getElementById('editor-drop-zone');
        const items = dropZone.querySelectorAll('.dropped-item');
        const hasItems = items.length > 0;
        
        if (!hasItems) {
            previewContainer.style.display = 'none';
            codeContainer.style.display = 'none';
            if (warning) {
                warning.style.display = 'flex';
                if (warningText) warningText.textContent = '请拖动素材到编辑区';
            }
        } else {
            warning.style.display = 'none';
            previewContainer.style.display = view === 'preview' ? 'block' : 'none';
            codeContainer.style.display = view === 'code' ? 'block' : 'none';
        }
        
        previewTitle.textContent = view === 'preview' ? '实时预览' : '代码视图';
        
        if (view === 'code') {
            updateCodeView();
        }
    }
    
    previewViewBtn.addEventListener('click', function() {
        setView('preview');
    });
    
    codeViewBtn.addEventListener('click', function() {
        setView('code');
    });
}

function checkOrderCorrectness() {
    const dropZone = document.getElementById('editor-drop-zone');
    const items = dropZone.querySelectorAll('.dropped-item');
    const levelId = parseInt(new URLSearchParams(window.location.search).get('level')) || 1;
    const level = LevelData.getLevelById(levelId);
    
    if (!level) return false;
    
    const materialsInOrder = Array.from(items).map(item => item.dataset.materialId);
    const requiredOrder = level.requiredOrder || [];
    
    if (materialsInOrder.length !== requiredOrder.length) return false;
    
    for (let i = 0; i < requiredOrder.length; i++) {
        if (materialsInOrder[i] !== requiredOrder[i]) {
            return false;
        }
    }
    
    return true;
}

function updateCodeView() {
    const codeDisplay = document.getElementById('code-display');
    if (!codeDisplay) return;
    
    const dropZone = document.getElementById('editor-drop-zone');
    const items = dropZone.querySelectorAll('.dropped-item');
    
    let code = '';
    
    items.forEach(item => {
        const materialId = item.dataset.materialId;
        const material = MaterialsData.getMaterialById(materialId);
        if (material && material.code) {
            code += material.code + '\n\n';
        }
    });
    
    codeDisplay.textContent = code || '// 拖拽素材到编辑区生成代码';
}

function updatePreview() {
    const previewFrame = document.getElementById('preview-iframe');
    if (!previewFrame) return;
    
    const dropZone = document.getElementById('editor-drop-zone');
    const items = dropZone.querySelectorAll('.dropped-item');
    const hasItems = items.length > 0;
    
    const orderCorrect = checkOrderCorrectness();
    const previewContainer = document.getElementById('preview-frame-container');
    const codeContainer = document.getElementById('code-view-container');
    const warning = document.getElementById('preview-warning');
    const warningText = warning ? warning.querySelector('span') : null;
    const currentView = document.getElementById('btn-code-view')?.classList.contains('active') ? 'code' : 'preview';
    
    if (!hasItems) {
        if (previewContainer) previewContainer.style.display = 'none';
        if (codeContainer) codeContainer.style.display = 'none';
        if (warning) {
            warning.style.display = 'flex';
            if (warningText) warningText.textContent = '请拖动素材到编辑区';
        }
        return;
    }
    
    if (warning) warning.style.display = 'none';
    
    if (currentView === 'code') {
        previewContainer.style.display = 'none';
        codeContainer.style.display = 'block';
        updateCodeView();
    } else {
        previewContainer.style.display = 'block';
        codeContainer.style.display = 'none';
    }
    
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #f5f5f5; }
                .preview-item { margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .preview-item h1 { color: #333; font-size: 24px; margin-bottom: 10px; }
                .preview-item p { color: #666; line-height: 1.6; }
                .preview-item h3 { color: #444; margin-bottom: 8px; }
                .preview-item ul { padding-left: 20px; }
                .preview-item li { margin-bottom: 5px; color: #555; }
                .preview-item nav { display: flex; gap: 15px; padding: 10px; background: #333; }
                .preview-item nav a { color: white; text-decoration: none; }
                .preview-item button { padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; }
                .preview-item input, .preview-item textarea { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; width: 100%; margin-bottom: 10px; }
                .preview-item img { max-width: 100%; border-radius: 8px; }
                .preview-item .card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; }
                .preview-item .alert { padding: 12px; border-radius: 6px; margin-bottom: 10px; }
                .preview-item .alert-info { background: #e3f2fd; color: #1976d2; }
                .preview-item .alert-success { background: #e8f5e9; color: #388e3c; }
            </style>
        </head>
        <body>
    `;
    
    items.forEach(item => {
        const materialId = item.dataset.materialId;
        const material = MaterialsData.getMaterialById(materialId);
        if (material) {
            let displayCode = material.code;
            if (material.type === 'layout') {
                displayCode = `<div class="preview-item">${displayCode}</div>`;
            } else if (material.type === 'nav') {
                displayCode = `<div class="preview-item">${displayCode}</div>`;
            } else if (material.type === 'content') {
                displayCode = `<div class="preview-item">${displayCode}</div>`;
            } else if (material.type === 'form') {
                displayCode = `<div class="preview-item">${displayCode}</div>`;
            } else if (material.type === 'button') {
                displayCode = `<div class="preview-item">${displayCode}</div>`;
            } else if (material.type === 'feedback') {
                displayCode = `<div class="preview-item">${displayCode}</div>`;
            }
            htmlContent += displayCode;
        }
    });
    
    htmlContent += '</body></html>';
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    previewFrame.src = url;
    
    previewFrame.onload = function() {
        URL.revokeObjectURL(url);
    };
}

function initHintSystem() {
    const hintBtn = document.getElementById('hint-btn');
    const hintContent = document.getElementById('hint-content');
    const hintText = document.getElementById('hint-text');
    const hintsRemaining = document.getElementById('hints-remaining-inline');
    
    const levelId = parseInt(new URLSearchParams(window.location.search).get('level')) || 1;
    const userData = GameStorage.getUserData();
    
    if (!userData.levelHintsUsed) {
        userData.levelHintsUsed = {};
    }
    
    const hintUsedInLevel = userData.levelHintsUsed[levelId] || false;
    
    if (hintsRemaining) {
        hintsRemaining.textContent = hintUsedInLevel ? '0' : '1';
    }
    
    if (hintBtn && hintContent) {
        hintBtn.disabled = hintUsedInLevel;
        if (hintUsedInLevel) {
            hintBtn.style.opacity = '0.5';
            hintBtn.style.cursor = 'not-allowed';
        }
        
        hintBtn.addEventListener('click', function() {
            if (hintUsedInLevel) {
                Game.showNotification('提示已使用', '每个关卡只能获取一次提示', 'warning');
                return;
            }
            
            const objectives = document.querySelectorAll('.objective-item:not(.completed)');
            if (objectives.length > 0) {
                const firstObjective = objectives[0];
                const hintSpan = firstObjective.querySelector('.objective-hint');
                hintText.textContent = hintSpan.textContent;
                hintContent.classList.add('visible');
                
                userData.levelHintsUsed[levelId] = true;
                userData.hintsRemaining = Math.max(0, userData.hintsRemaining - 1);
                userData.totalHintsUsed++;
                GameStorage.saveUserData(userData);
                
                if (hintsRemaining) hintsRemaining.textContent = '0';
                hintBtn.disabled = true;
                hintBtn.style.opacity = '0.5';
                hintBtn.style.cursor = 'not-allowed';
                
                AchievementsData.checkAchievements();
            }
        });
    }
    
    const closeHintBtn = document.getElementById('close-hint-btn');
    if (closeHintBtn && hintContent) {
        closeHintBtn.addEventListener('click', function() {
            hintContent.classList.remove('visible');
        });
    }
}

function initGameControls(levelId) {
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const level = LevelData.getLevelById(levelId);
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            const dropZone = document.getElementById('editor-drop-zone');
            const items = dropZone.querySelectorAll('.dropped-item');
            items.forEach(item => item.remove());
            
            const placeholder = dropZone.querySelector('.editor-placeholder');
            if (placeholder) placeholder.style.display = 'block';
            
            document.querySelectorAll('.objective-item').forEach(obj => {
                obj.classList.remove('completed');
                obj.querySelector('.objective-checkbox').innerHTML = '<i class="fas fa-check" style="display: none;"></i>';
            });
            
            updatePreview();
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const dropZone = document.getElementById('editor-drop-zone');
            const items = dropZone.querySelectorAll('.dropped-item');
            
            if (items.length === 0) {
                Game.showNotification('提交失败', '请先添加素材到编辑区', 'error');
                return;
            }
            
            const materialsInOrder = [];
            items.forEach(item => {
                materialsInOrder.push(item.dataset.materialId);
            });
            
            const requiredOrder = level.requiredOrder || [];
            const requiredMaterials = level.availableMaterials || [];
            
            let correctCount = 0;
            let orderCorrect = true;
            
            for (let i = 0; i < requiredOrder.length; i++) {
                const requiredMaterial = requiredOrder[i];
                const placedMaterial = materialsInOrder[i];
                
                if (placedMaterial === requiredMaterial) {
                    correctCount++;
                } else {
                    orderCorrect = false;
                }
            }
            
            const hasExtraMaterials = materialsInOrder.length > requiredOrder.length;
            const hasWrongMaterials = materialsInOrder.some(matId => !requiredMaterials.includes(matId));
            
            let successRate = 0;
            let isPerfect = false;
            let feedbackMessage = '';
            
            if (hasWrongMaterials) {
                feedbackMessage = '请使用正确的素材组合';
                Game.showNotification('提交失败', feedbackMessage, 'error');
                return;
            }
            
            if (materialsInOrder.length !== requiredOrder.length) {
                feedbackMessage = `素材数量不正确，需要 ${requiredOrder.length} 个素材`;
                Game.showNotification('提交失败', feedbackMessage, 'error');
                return;
            }
            
            if (orderCorrect) {
                isPerfect = true;
                successRate = 1;
                feedbackMessage = '完美！所有目标都已正确完成';
            } else {
                successRate = correctCount / requiredOrder.length;
                feedbackMessage = '顺序部分正确，继续加油！';
            }
            
            const completedCount = Math.round(successRate * requiredOrder.length);
            const totalObjectives = requiredOrder.length;
            
            document.querySelectorAll('.objective-item').forEach((obj, index) => {
                if (index < completedCount) {
                    obj.classList.add('completed');
                    obj.querySelector('.objective-checkbox').innerHTML = '<i class="fas fa-check"></i>';
                } else {
                    obj.classList.remove('completed');
                    obj.querySelector('.objective-checkbox').innerHTML = '<i class="fas fa-check" style="display: none;"></i>';
                }
            });
            
            const score = Math.round(level.reward * successRate);
            const isLearnMode = level.mode === 'learn';
            
            GameStorage.completeLevel(levelId, score, isPerfect);
            
            let actualScore = 0;
            let xpGained = 0;
            
            if (isLearnMode) {
                // 学习模式：只发放经验，不发放积分
                actualScore = 0;
                xpGained = Math.round(level.reward / 2);
            } else {
                // 挑战模式：发放积分和经验
                actualScore = score;
                xpGained = Math.round(score / 2);
                GameStorage.addScore(actualScore);
            }
            
            const result = GameStorage.addXP(xpGained);
            
            const newAchievements = AchievementsData.checkAchievements();
            
            const settlementData = {
                levelId: levelId,
                levelName: level.name,
                score: actualScore,
                perfect: isPerfect,
                itemsUsed: materialsInOrder.length,
                totalItems: requiredOrder.length,
                xpGained: xpGained,
                levelUp: result.levelsGained > 0,
                newLevel: result.level,
                newAchievements: newAchievements,
                unlockedMaterials: level.availableMaterials ? level.availableMaterials.slice(0, 3) : [],
                isLearnMode: isLearnMode
            };
            
            localStorage.setItem('settlementData', JSON.stringify(settlementData));
            Game.navigateTo('settlement.html');
        });
    }
}

function initSettlementPage() {
    const settlementData = JSON.parse(localStorage.getItem('settlementData') || '{}');
    
    if (!settlementData.levelId) {
        Game.navigateTo('levels.html');
        return;
    }
    
    const iconEl = document.getElementById('settlement-icon');
    const titleEl = document.getElementById('settlement-title');
    const subtitleEl = document.getElementById('settlement-subtitle');
    const scoreEl = document.getElementById('settlement-score');
    const itemsEl = document.getElementById('settlement-items');
    const rewardsList = document.getElementById('rewards-list');
    
    if (settlementData.perfect) {
        iconEl.className = 'settlement-icon perfect';
        iconEl.innerHTML = '<i class="fas fa-trophy"></i>';
        titleEl.textContent = '完美通关！';
        subtitleEl.textContent = '太棒了！你完美地完成了这个关卡';
        Game.createConfetti();
    } else if (settlementData.score >= settlementData.unlockedMaterials?.length * 50) {
        iconEl.className = 'settlement-icon great';
        iconEl.innerHTML = '<i class="fas fa-star"></i>';
        titleEl.textContent = '优秀通关！';
        subtitleEl.textContent = '做得很好，继续保持！';
    } else {
        iconEl.className = 'settlement-icon success';
        iconEl.innerHTML = '<i class="fas fa-check"></i>';
        titleEl.textContent = '通关成功！';
        subtitleEl.textContent = '恭喜你完成了这个关卡';
    }
    
    scoreEl.textContent = '+' + settlementData.score;
    itemsEl.textContent = `${settlementData.itemsUsed}/${settlementData.totalItems}`;
    
    rewardsList.innerHTML = '';
    
    const xpItem = document.createElement('div');
    xpItem.className = 'reward-item';
    xpItem.innerHTML = '<i class="fas fa-bolt"></i><span>经验值 +' + settlementData.xpGained + '</span>';
    rewardsList.appendChild(xpItem);
    
    if (settlementData.levelUp) {
        const levelItem = document.createElement('div');
        levelItem.className = 'reward-item';
        levelItem.innerHTML = '<i class="fas fa-arrow-up"></i><span>等级提升至 Lv.' + settlementData.newLevel + '</span>';
        rewardsList.appendChild(levelItem);
    }
    
    if (settlementData.unlockedMaterials && settlementData.unlockedMaterials.length > 0) {
        settlementData.unlockedMaterials.forEach(matId => {
            const material = MaterialsData.getMaterialById(matId);
            if (material) {
                const matItem = document.createElement('div');
                matItem.className = 'reward-item';
                matItem.innerHTML = '<i class="fas fa-' + material.icon + '"></i><span>解锁素材：' + material.name + '</span>';
                rewardsList.appendChild(matItem);
            }
        });
    }
    
    if (settlementData.newAchievements && settlementData.newAchievements.length > 0) {
        settlementData.newAchievements.forEach(achievement => {
            const achItem = document.createElement('div');
            achItem.className = 'reward-item';
            achItem.innerHTML = '<i class="fas fa-' + achievement.icon + '"></i><span>成就解锁：' + achievement.name + '</span>';
            rewardsList.appendChild(achItem);
        });
    }
    
    const nextBtn = document.getElementById('next-level-btn');
    const replayBtn = document.getElementById('replay-btn');
    const menuBtn = document.getElementById('menu-btn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const nextLevelId = settlementData.levelId + 1;
            const nextLevel = LevelData.getLevelById(nextLevelId);
            if (nextLevel) {
                Game.navigateTo('game.html?level=' + nextLevelId);
            } else {
                Game.navigateTo('levels.html');
            }
        });
    }
    
    if (replayBtn) {
        replayBtn.addEventListener('click', function() {
            Game.navigateTo('game.html?level=' + settlementData.levelId);
        });
    }
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            Game.navigateTo('levels.html');
        });
    }
}

function initRewardsPage() {
    const userData = GameStorage.getUserData();
    
    const dailyTasksContainer = document.getElementById('daily-tasks-list');
    if (dailyTasksContainer) {
        dailyTasksContainer.innerHTML = '';
        
        userData.dailyTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'daily-task-item' + (task.completed ? ' completed' : '');
            taskEl.innerHTML = `
                <div class="task-icon ${task.type}">
                    <i class="fas fa-${task.icon}"></i>
                </div>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                </div>
                <div class="task-progress">
                    <div class="task-progress-value">${task.progress}/${task.target}</div>
                    <div class="task-progress-label">进度</div>
                </div>
                <div class="task-reward">
                    <i class="fas fa-${task.reward.type === 'score' ? 'coins' : (task.reward.type === 'hints' ? 'lightbulb' : 'medal')}"></i>
                    <span>+${task.reward.amount || ''}${task.reward.type === 'badge' ? '徽章' : task.reward.amount}</span>
                </div>
                <button class="task-claim-btn ${task.completed && !task.claimed ? 'claimable' : ''}" ${!task.completed || task.claimed ? 'disabled' : ''}>
                    ${task.claimed ? '已领取' : '领取'}
                </button>
            `;
            
            const claimBtn = taskEl.querySelector('.task-claim-btn');
            claimBtn.addEventListener('click', function() {
                if (GameStorage.claimDailyTask(task.id)) {
                    Game.showNotification('奖励领取', '奖励已发放到您的账户', 'success');
                    initRewardsPage();
                }
            });
            
            dailyTasksContainer.appendChild(taskEl);
        });
    }
    
    initAchievementsSection();
}

function initAchievementsSection() {
    const achievementsContainer = document.getElementById('achievements-grid');
    if (!achievementsContainer) return;
    
    const userData = GameStorage.getUserData();
    achievementsContainer.innerHTML = '';
    
    AchievementsData.achievements.forEach(achievement => {
        const isUnlocked = userData.achievements.includes(achievement.id);
        const progress = AchievementsData.getAchievementProgress(achievement);
        
        const achEl = document.createElement('div');
        achEl.className = 'achievement-item' + (isUnlocked ? ' unlocked' : ' locked');
        achEl.innerHTML = `
            <div class="achievement-badge">
                <i class="fas fa-${achievement.icon}"></i>
                ${!isUnlocked ? '<i class="fas fa-lock lock-overlay"></i>' : ''}
            </div>
            <div class="achievement-title">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-progress">
                <div class="achievement-progress-bar" style="width: ${progress.percentage}%"></div>
            </div>
        `;
        
        achievementsContainer.appendChild(achEl);
    });
}

function initProfilePage() {
    const userData = GameStorage.getUserData();
    
    document.getElementById('profile-name').textContent = userData.username;
    document.getElementById('profile-level').textContent = 'Lv.' + userData.level;
    document.getElementById('profile-xp-fill').style.width = (userData.xp / userData.xpToNextLevel * 100) + '%';
    document.getElementById('profile-xp-text').textContent = userData.xp + ' / ' + userData.xpToNextLevel + ' XP';
    
    const levelTitles = ['编程新手', '代码学徒', '编程入门', '开发新手', '编程进阶', '开发工程师', '高级开发者', '技术达人', '代码专家', '编程大师', '代码大师', '技术专家', '资深工程师', '架构师', '技术总监', '首席开发者', '编程传奇'];
    document.getElementById('profile-title').textContent = levelTitles[Math.min(userData.level - 1, levelTitles.length - 1)] || '编程新手';
    
    document.getElementById('stat-levels').textContent = userData.completedLevels.length;
    document.getElementById('stat-score').textContent = userData.totalScore;
    document.getElementById('stat-hints').textContent = userData.hintsRemaining;
    document.getElementById('stat-achievements-count').textContent = userData.achievements.length;
    
    initBadgesSection();
    initHistorySection();
}

function initBadgesSection() {
    const badgesContainer = document.getElementById('badges-grid');
    if (!badgesContainer) return;
    
    const userData = GameStorage.getUserData();
    badgesContainer.innerHTML = '';
    
    const allBadges = [
        { id: 'first_step', name: '第一步', icon: 'shoe-prints' },
        { id: 'website_master', name: '网站大师', icon: 'globe' },
        { id: 'electron_dev', name: 'Electron开发者', icon: 'desktop' },
        { id: 'dotnet_dev', name: '.NET开发者', icon: 'window-maximize' },
        { id: 'perfect_starter', name: '完美起步', icon: 'star' },
        { id: 'perfectionist', name: '完美主义者', icon: 'crown' },
        { id: 'hint_5', name: '勤学好问', icon: 'lightbulb' },
        { id: 'score_1000', name: '千分达人', icon: 'trophy' },
        { id: 'score_5000', name: '五千强者', icon: 'medal' },
        { id: 'level_10', name: '十级学者', icon: 'arrow-up' },
        { id: 'all_materials', name: '素材收集家', icon: 'images' },
        { id: 'daily_streak', name: '连续作战', icon: 'fire' }
    ];
    
    allBadges.forEach(badge => {
        const isUnlocked = userData.unlockedBadges.includes(badge.id);
        const badgeEl = document.createElement('div');
        badgeEl.className = 'badge-item' + (isUnlocked ? '' : ' locked');
        badgeEl.innerHTML = `
            <i class="fas fa-${badge.icon}"></i>
            <div class="badge-tooltip">${badge.name}</div>
        `;
        badgesContainer.appendChild(badgeEl);
    });
}

function initHistorySection() {
    const historyContainer = document.getElementById('history-list');
    if (!historyContainer) return;
    
    const userData = GameStorage.getUserData();
    historyContainer.innerHTML = '';
    
    if (userData.gameHistory.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">暂无游戏记录</p>';
        return;
    }
    
    userData.gameHistory.slice(0, 10).forEach(record => {
        const date = new Date(record.date);
        const dateStr = date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const historyEl = document.createElement('div');
        historyEl.className = 'history-item';
        historyEl.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div class="history-info">
                <div class="history-title">${record.details}</div>
                <div class="history-date">${dateStr}</div>
            </div>
        `;
        historyContainer.appendChild(historyEl);
    });
}

function initSettingsPage() {
    const userData = GameStorage.getUserData();
    const settings = userData.settings;
    
    const soundToggle = document.getElementById('sound-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const soundVolume = document.getElementById('sound-volume');
    const musicVolume = document.getElementById('music-volume');
    
    if (soundToggle) {
        soundToggle.checked = settings.soundEnabled;
        soundToggle.addEventListener('change', function() {
            GameStorage.updateUserData({
                settings: { ...GameStorage.getUserData().settings, soundEnabled: this.checked }
            });
        });
    }
    
    if (musicToggle) {
        musicToggle.checked = settings.musicEnabled;
        musicToggle.addEventListener('change', function() {
            GameStorage.updateUserData({
                settings: { ...GameStorage.getUserData().settings, musicEnabled: this.checked }
            });
        });
    }
    
    if (soundVolume) {
        soundVolume.value = settings.soundVolume;
        soundVolume.addEventListener('input', function() {
            GameStorage.updateUserData({
                settings: { ...GameStorage.getUserData().settings, soundVolume: parseInt(this.value) }
            });
        });
    }
    
    if (musicVolume) {
        musicVolume.value = settings.musicVolume;
        musicVolume.addEventListener('input', function() {
            GameStorage.updateUserData({
                settings: { ...GameStorage.getUserData().settings, musicVolume: parseInt(this.value) }
            });
        });
    }
    
    const usernameInput = document.getElementById('username-input');
    if (usernameInput) {
        usernameInput.value = userData.username;
        usernameInput.addEventListener('change', function() {
            GameStorage.updateUserData({ username: this.value });
            Game.showNotification('保存成功', '用户名已更新', 'success');
        });
    }
    
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        if (option.dataset.avatar === userData.avatar) {
            option.classList.add('selected');
        }
        option.addEventListener('click', function() {
            avatarOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            GameStorage.updateUserData({ avatar: this.dataset.avatar });
        });
    });
    
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', function() {
            showConfirmModal('重置进度', '确定要重置所有游戏进度吗？此操作不可撤销。', function() {
                localStorage.setItem(GameStorage.STORAGE_KEY, JSON.stringify(GameStorage.DEFAULT_DATA));
                GameStorage.resetDailyTasks();
                Game.showNotification('重置成功', '游戏进度已重置', 'success');
                setTimeout(function() {
                    Game.navigateTo('index.html');
                }, 1500);
            });
        });
    }
}

function initLeaderboardPage() {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    const listContainer = document.getElementById('leaderboard-list');
    
    let currentTab = 'global';
    
    function renderLeaderboard(type) {
        const boardData = LeaderboardData.getBoard(type);
        if (!boardData) return;
        
        listContainer.innerHTML = '';
        
        boardData.entries.forEach(entry => {
            const rankClass = entry.rank <= 3 ? `top-${entry.rank}` : '';
            const itemEl = document.createElement('div');
            itemEl.className = `leaderboard-item ${rankClass}`;
            itemEl.innerHTML = `
                <div class="leaderboard-rank">${entry.rank}</div>
                <div class="leaderboard-avatar">
                    <i class="fas fa-${entry.avatar === 'code' ? 'code' : 'user'}"></i>
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${entry.username}</div>
                    <div class="leaderboard-title">${entry.title}</div>
                </div>
                <div class="leaderboard-score">
                    <div class="leaderboard-score-value">${entry.score.toLocaleString()}</div>
                    <div class="leaderboard-score-label">积分</div>
                </div>
            `;
            listContainer.appendChild(itemEl);
        });
        
        if (boardData.userEntry) {
            const userEl = document.createElement('div');
            userEl.className = 'leaderboard-item';
            userEl.style.borderColor = 'var(--primary-color)';
            userEl.style.marginTop = '1rem';
            userEl.innerHTML = `
                <div class="leaderboard-rank" style="background: var(--primary-color);">${boardData.userEntry.rank}</div>
                <div class="leaderboard-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${boardData.userEntry.username} (你)</div>
                    <div class="leaderboard-title">${boardData.userEntry.title}</div>
                </div>
                <div class="leaderboard-score">
                    <div class="leaderboard-score-value">${boardData.userEntry.score.toLocaleString()}</div>
                    <div class="leaderboard-score-label">积分</div>
                </div>
            `;
            listContainer.appendChild(userEl);
        }
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            renderLeaderboard(currentTab);
        });
    });
    
    renderLeaderboard(currentTab);
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal confirm-modal">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="modal-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="modal-text">
                    <p>${message}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="modal-cancel">取消</button>
                <button class="btn btn-primary" id="modal-confirm">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#modal-cancel');
    const confirmBtn = modal.querySelector('#modal-confirm');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', function() {
        onConfirm();
        closeModal();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
        }).then(function() {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('ServiceWorker registration successful:', registration.scope);
                    })
                    .catch(function(err) {
                        console.log('ServiceWorker registration failed:', err);
                    });
            });
        });
    }
    
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // 移除 .html 扩展名，支持服务器隐藏扩展名的情况
    if (currentPage.endsWith('.html')) {
        currentPage = currentPage.slice(0, -5);
    }
    
    switch (currentPage) {
        case 'guide':
            initGuidePage();
            break;
        case 'levels':
            initLevelsPage();
            break;
        case 'game':
            initGamePage();
            break;
        case 'settlement':
            initSettlementPage();
            break;
        case 'rewards':
            initRewardsPage();
            break;
        case 'profile':
            initProfilePage();
            break;
        case 'settings':
            initSettingsPage();
            break;
        case 'leaderboard':
            initLeaderboardPage();
            break;
    }
});
