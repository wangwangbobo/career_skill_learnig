// 学习技能管理中心 - 交互逻辑
class SkillLearningManager {
    constructor() {
        this.skills = [];
        this.learningPaths = [];
        this.courses = [];
        this.userProgress = {};
        this.init();
    }

    init() {
        this.initializeData();
        this.bindEvents();
        this.animateProgressBars();
        this.updateStats();
        this.loadRecommendations();
    }

    // 初始化示例数据
    initializeData() {
        this.skills = [
            {
                id: 1,
                name: 'React 开发',
                category: 'programming',
                progress: 75,
                weeklyHours: 8,
                level: 'intermediate',
                icon: 'fab fa-react',
                color: '#61DAFB'
            },
            {
                id: 2,
                name: 'UI/UX 设计',
                category: 'design',
                progress: 45,
                weeklyHours: 5,
                level: 'beginner',
                icon: 'fab fa-figma',
                color: '#F24E1E'
            },
            {
                id: 3,
                name: '数据分析',
                category: 'data',
                progress: 30,
                weeklyHours: 3,
                level: 'beginner',
                icon: 'fas fa-chart-line',
                color: '#10B981'
            }
        ];

        this.courses = [
            {
                id: 1,
                title: 'React Hooks 深度解析',
                description: '深入学习 React Hooks，掌握现代 React 开发的核心技能',
                rating: 4.8,
                students: 2341,
                duration: '12 小时',
                level: 'intermediate',
                category: 'programming',
                thumbnail: 'https://via.placeholder.com/300x180/4F46E5/FFFFFF?text=React+Advanced',
                badge: '推荐'
            },
            {
                id: 2,
                title: 'Figma 设计系统构建',
                description: '学习如何在 Figma 中构建可扩展的设计系统',
                rating: 4.6,
                students: 1852,
                duration: '8 小时',
                level: 'intermediate',
                category: 'design',
                thumbnail: 'https://via.placeholder.com/300x180/06B6D4/FFFFFF?text=Figma+Mastery',
                badge: '热门'
            },
            {
                id: 3,
                title: 'Python 数据分析实战',
                description: '使用 Pandas、NumPy 等工具进行数据分析',
                rating: 4.9,
                students: 856,
                duration: '16 小时',
                level: 'beginner',
                category: 'data',
                thumbnail: 'https://via.placeholder.com/300x180/10B981/FFFFFF?text=Python+Data',
                badge: '新课程'
            }
        ];
    }

    // 绑定事件监听器
    bindEvents() {
        // 配置模态框
        const configBtn = document.getElementById('configBtn');
        const configModal = document.getElementById('configModal');
        const cancelConfig = document.getElementById('cancelConfig');
        const saveConfig = document.getElementById('saveConfig');
        const modalCloses = document.querySelectorAll('.modal-close');

        configBtn?.addEventListener('click', () => this.showModal('configModal'));
        cancelConfig?.addEventListener('click', () => this.hideModal('configModal'));
        saveConfig?.addEventListener('click', () => this.saveConfiguration());

        // 添加技能模态框
        const addSkillBtn = document.querySelector('.add-skill-btn');
        const addSkillModal = document.getElementById('addSkillModal');
        const cancelAddSkill = document.getElementById('cancelAddSkill');
        const saveAddSkill = document.getElementById('saveAddSkill');

        addSkillBtn?.addEventListener('click', () => this.showModal('addSkillModal'));
        cancelAddSkill?.addEventListener('click', () => this.hideModal('addSkillModal'));
        saveAddSkill?.addEventListener('click', () => this.addNewSkill());

        // 关闭模态框
        modalCloses.forEach(close => {
            close.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // 点击模态框外部关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // 继续学习按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('continue-btn')) {
                const skillCard = e.target.closest('.progress-card');
                const skillName = skillCard.querySelector('.progress-title').textContent;
                this.continueSkillLearning(skillName);
            }
        });

        // 课程操作按钮
        document.addEventListener('click', (e) => {
            if (e.target.textContent === '开始学习') {
                const courseCard = e.target.closest('.course-card');
                const courseTitle = courseCard.querySelector('.course-title').textContent;
                this.startCourse(courseTitle);
            }
            if (e.target.textContent === '加入计划') {
                const courseCard = e.target.closest('.course-card');
                const courseTitle = courseCard.querySelector('.course-title').textContent;
                this.addToPlan(courseTitle);
            }
        });

        // 刷新推荐
        const refreshBtn = document.getElementById('refreshRecommendations');
        refreshBtn?.addEventListener('click', () => this.refreshRecommendations());

        // 创建学习路径
        const createPathBtn = document.getElementById('createPathBtn');
        createPathBtn?.addEventListener('click', () => this.createLearningPath());

        // 水平选择器
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('level-btn')) {
                const container = e.target.parentElement;
                container.querySelectorAll('.level-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });

        // 侧边栏菜单切换
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-link')) {
                document.querySelectorAll('.sidebar-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.closest('.sidebar-item').classList.add('active');
            }
        });

        // 移动端导航
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-nav-item')) {
                document.querySelectorAll('.mobile-nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.closest('.mobile-nav-item').classList.add('active');
            }
        });
    }

    // 显示模态框
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // 隐藏模态框
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // 动画化进度条
    animateProgressBars() {
        setTimeout(() => {
            const progressFills = document.querySelectorAll('.progress-fill');
            progressFills.forEach(fill => {
                const progress = fill.getAttribute('data-progress');
                if (progress) {
                    fill.style.width = progress + '%';
                }
            });
        }, 500);
    }

    // 更新统计数据
    updateStats() {
        const totalSkills = this.skills.length;
        const avgProgress = Math.round(
            this.skills.reduce((sum, skill) => sum + skill.progress, 0) / totalSkills
        );
        const weeklyHours = this.skills.reduce((sum, skill) => sum + skill.weeklyHours, 0);

        // 更新统计显示（如果需要动态更新）
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 3) {
            statNumbers[0].textContent = totalSkills;
            statNumbers[1].textContent = avgProgress + '%';
            statNumbers[2].textContent = weeklyHours + 'h';
        }
    }

    // 加载推荐课程
    loadRecommendations() {
        // 这里可以调用AI API获取个性化推荐
        console.log('🤖 正在加载AI推荐课程...');
        
        // 模拟API调用延迟
        setTimeout(() => {
            console.log('✅ AI推荐课程加载完成');
            this.displayNotification('AI推荐已更新', '根据您的学习记录为您推荐了新课程', 'success');
        }, 1000);
    }

    // 刷新推荐
    refreshRecommendations() {
        const refreshBtn = document.getElementById('refreshRecommendations');
        const originalContent = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 刷新中...';
        refreshBtn.disabled = true;

        setTimeout(() => {
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
            this.displayNotification('推荐已刷新', '为您找到了新的学习内容', 'success');
        }, 2000);
    }

    // 继续技能学习
    continueSkillLearning(skillName) {
        console.log(`📚 继续学习: ${skillName}`);
        this.displayNotification('开始学习', `正在为您准备 ${skillName} 的学习内容`, 'info');
        
        // 这里可以跳转到具体的学习页面或启动学习模块
        setTimeout(() => {
            this.updateSkillProgress(skillName, 5); // 模拟学习进度增加
        }, 1000);
    }

    // 开始课程
    startCourse(courseTitle) {
        console.log(`🎓 开始课程: ${courseTitle}`);
        this.displayNotification('课程已开始', `正在为您加载 ${courseTitle}`, 'success');
    }

    // 添加到学习计划
    addToPlan(courseTitle) {
        console.log(`📝 添加到计划: ${courseTitle}`);
        this.displayNotification('已添加到计划', `${courseTitle} 已加入您的学习计划`, 'success');
    }

    // 更新技能进度
    updateSkillProgress(skillName, increment) {
        const skill = this.skills.find(s => s.name === skillName);
        if (skill) {
            skill.progress = Math.min(100, skill.progress + increment);
            // 更新UI中的进度条
            this.refreshProgressDisplay();
            this.displayNotification('进度更新', `${skillName} 进度 +${increment}%`, 'success');
        }
    }

    // 刷新进度显示
    refreshProgressDisplay() {
        const progressCards = document.querySelectorAll('.progress-card');
        progressCards.forEach((card, index) => {
            if (this.skills[index]) {
                const progressFill = card.querySelector('.progress-fill');
                const progressText = card.querySelector('.progress-text');
                const skill = this.skills[index];
                
                if (progressFill && progressText) {
                    progressFill.style.width = skill.progress + '%';
                    progressText.textContent = skill.progress + '%';
                }
            }
        });
    }

    // 保存配置
    saveConfiguration() {
        const dailyGoal = document.querySelector('#configModal input[type="number"]').value;
        const dailyReminder = document.querySelector('#dailyReminder').checked;
        const difficulty = document.querySelector('#configModal select').value;

        const config = {
            dailyGoal: parseInt(dailyGoal),
            dailyReminder,
            difficulty,
            timestamp: new Date().toISOString()
        };

        // 保存到本地存储
        localStorage.setItem('skillLearningConfig', JSON.stringify(config));
        
        this.hideModal('configModal');
        this.displayNotification('设置已保存', '您的学习偏好已更新', 'success');
        
        console.log('💾 配置已保存:', config);
    }

    // 添加新技能
    addNewSkill() {
        const skillName = document.querySelector('#addSkillModal input[type="text"]').value;
        const skillCategory = document.querySelector('#addSkillModal select').value;
        const skillLevel = document.querySelector('#addSkillModal .level-btn.active').dataset.level;
        const skillGoal = document.querySelector('#addSkillModal textarea').value;

        if (!skillName.trim()) {
            this.displayNotification('输入错误', '请输入技能名称', 'error');
            return;
        }

        const newSkill = {
            id: Date.now(),
            name: skillName,
            category: skillCategory,
            progress: 0,
            weeklyHours: 0,
            level: skillLevel,
            goal: skillGoal,
            createdAt: new Date().toISOString()
        };

        this.skills.push(newSkill);
        this.hideModal('addSkillModal');
        
        // 清空表单
        document.querySelector('#addSkillModal input[type="text"]').value = '';
        document.querySelector('#addSkillModal textarea').value = '';
        
        this.displayNotification('技能已添加', `${skillName} 已加入您的学习列表`, 'success');
        this.updateStats();
        
        console.log('➕ 新技能已添加:', newSkill);
    }

    // 创建学习路径
    createLearningPath() {
        this.displayNotification('路径规划中', 'AI正在为您分析最佳学习路径...', 'info');
        
        setTimeout(() => {
            this.displayNotification('路径已创建', '个性化学习路径已生成', 'success');
        }, 3000);
    }

    // 显示通知
    displayNotification(title, message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // 添加样式
        const style = document.createElement('style');
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    border-left: 4px solid var(--primary-color);
                    max-width: 400px;
                    z-index: 3000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-success {
                    border-left-color: var(--success-color);
                }
                .notification-error {
                    border-left-color: var(--error-color);
                }
                .notification-content {
                    flex: 1;
                }
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .notification-message {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: var(--text-light);
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => notification.classList.add('show'), 100);

        // 关闭按钮事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // 自动关闭
        setTimeout(() => {
            if (document.body.contains(notification)) {
                this.removeNotification(notification);
            }
        }, 5000);
    }

    // 移除通知
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }

    // 获取用户学习数据
    getUserLearningData() {
        return {
            skills: this.skills,
            totalStudyTime: this.skills.reduce((sum, skill) => sum + skill.weeklyHours, 0),
            averageProgress: Math.round(
                this.skills.reduce((sum, skill) => sum + skill.progress, 0) / this.skills.length
            ),
            lastActivity: new Date().toISOString()
        };
    }
}

// 工具函数
const utils = {
    // 格式化数字
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    },

    // 格式化时间
    formatDuration(hours) {
        if (hours < 1) {
            return Math.round(hours * 60) + ' 分钟';
        }
        return Math.round(hours) + ' 小时';
    },

    // 获取技能等级颜色
    getLevelColor(level) {
        const colors = {
            'beginner': '#10B981',
            'intermediate': '#F59E0B', 
            'advanced': '#EF4444',
            'expert': '#8B5CF6'
        };
        return colors[level] || '#6B7280';
    },

    // 获取技能等级文本
    getLevelText(level) {
        const texts = {
            'beginner': '入门',
            'intermediate': '初级',
            'advanced': '中级',
            'expert': '高级'
        };
        return texts[level] || '未知';
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 学习技能管理中心初始化开始...');
    
    const skillManager = new SkillLearningManager();
    
    // 将管理器实例暴露到全局，便于调试和扩展
    window.skillManager = skillManager;
    window.utils = utils;
    
    console.log('✅ 学习技能管理中心初始化完成!');
    
    // 显示欢迎通知
    setTimeout(() => {
        skillManager.displayNotification(
            '欢迎回来！', 
            '您的个性化学习中心已准备就绪', 
            'success'
        );
    }, 1000);
});