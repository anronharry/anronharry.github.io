// 初始化Lucide图标
lucide.createIcons();

// 暗黑模式切换功能
const darkModeToggle = document.getElementById('darkModeToggle');
const app = document.querySelector('.app');

// 检查本地存储中的暗黑模式偏好
const savedMode = localStorage.getItem('darkMode');
if (savedMode === 'true') {
    app.classList.add('dark-mode');
    // 更改图标为太阳
    updateToggleIcon(true);
}

darkModeToggle.addEventListener('click', () => {
    const isDarkMode = app.classList.toggle('dark-mode');
    // 保存偏好到本地存储
    localStorage.setItem('darkMode', isDarkMode);
    // 更新图标
    updateToggleIcon(isDarkMode);
});

// 更新切换图标（月亮/太阳）
function updateToggleIcon(isDarkMode) {
    const iconElement = darkModeToggle.querySelector('i');
    if (isDarkMode) {
        iconElement.setAttribute('data-lucide', 'sun');
    } else {
        iconElement.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons();
}

// 阅读进度指示器功能
document.addEventListener('DOMContentLoaded', function() {
    // 创建顶部进度条
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    // 创建圆形进度指示器
    const readingProgress = document.createElement('div');
    readingProgress.className = 'reading-progress';
    readingProgress.id = 'readingProgress';
    
    // 创建SVG元素用于圆形进度
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'progress-circle');
    svg.setAttribute('viewBox', '0 0 36 36');
    
    const circleBackground = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleBackground.setAttribute('class', 'progress-circle-bg');
    circleBackground.setAttribute('cx', '18');
    circleBackground.setAttribute('cy', '18');
    circleBackground.setAttribute('r', '16');
    
    const circleForeground = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleForeground.setAttribute('class', 'progress-circle-fg');
    circleForeground.setAttribute('cx', '18');
    circleForeground.setAttribute('cy', '18');
    circleForeground.setAttribute('r', '16');
    
    svg.appendChild(circleBackground);
    svg.appendChild(circleForeground);
    
    // 添加SVG到进度指示器
    readingProgress.appendChild(svg);
    
    // 创建百分比文本元素
    const percentText = document.createElement('span');
    percentText.classList.add('percent-text');
    readingProgress.appendChild(percentText);
    
    // 将圆形进度指示器添加到页面
    document.body.appendChild(readingProgress);
    
    // 点击时平滑滚动到顶部
    readingProgress.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 监听滚动事件更新进度指示器
    window.addEventListener('scroll', () => {
        // 计算滚动百分比
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        const roundedPercent = Math.min(100, Math.round(scrollPercent));
        
        // 更新顶部进度条
        progressBar.style.width = `${roundedPercent}%`;
        
        // 更新进度指示器文本
        percentText.textContent = `${roundedPercent}%`;
        
        // 更新SVG圆形进度
        const circumference = 2 * Math.PI * 16;
        circleForeground.style.strokeDasharray = `${circumference * roundedPercent / 100} ${circumference}`;
        
        // 根据滚动位置显示/隐藏指示器
        if (scrollTop > 100) {
            readingProgress.style.opacity = '1';
        } else {
            readingProgress.style.opacity = '0';
        }
    });
    
    // 初始化指示器
    window.dispatchEvent(new Event('scroll'));
});
