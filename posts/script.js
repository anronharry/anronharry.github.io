// 初始化Lucide图标
lucide.createIcons();

// 暗黑模式切换功能
const themeToggle = document.getElementById('themeToggle');
const app = document.querySelector('.app');

// 检查本地存储中的暗黑模式偏好
const savedMode = localStorage.getItem('darkMode');
if (savedMode === 'true') {
    app.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    const isDarkMode = app.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    lucide.createIcons();
});

// 语言选择器功能
const selectedLanguage = document.getElementById('selectedLanguage');
const languageDropdown = document.getElementById('languageDropdown');
const languageOptions = document.querySelectorAll('.language-option');
const translateOverlay = document.getElementById('translateOverlay');

// 切换下拉菜单显示
selectedLanguage.addEventListener('click', () => {
    languageDropdown.classList.toggle('show');
});

// 点击页面其他位置关闭下拉菜单
document.addEventListener('click', (event) => {
    if (!event.target.closest('.language-selector')) {
        languageDropdown.classList.remove('show');
    }
});

// 语言选择处理
languageOptions.forEach(option => {
    option.addEventListener('click', () => {
        const langCode = option.getAttribute('data-lang');
        const langText = option.querySelector('span').textContent;
        const langFlag = option.querySelector('.language-flag').src;
        
        // 更新选中语言显示
        selectedLanguage.querySelector('span').textContent = langText;
        selectedLanguage.querySelector('.language-flag').src = langFlag;
        
        // 更新选中状态
        languageOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // 关闭下拉菜单
        languageDropdown.classList.remove('show');
        
        // 调用翻译功能
        showTranslateOverlay();
        translatePage(langCode);
    });
});

async function translatePage(targetLanguage) {
    const elementsToTranslate = document.querySelectorAll('.post-title, .post-meta span, .post-content p, .post-content h2, .post-content ul li, .post-content blockquote, .post-tags .post-tag, .back-to-blogs');
    
    const translations = await Promise.all([...elementsToTranslate].map(async (element) => {
        const text = element.textContent;
        const translatedText = await translateText(text, targetLanguage);
        return { element, translatedText };
    }));

    translations.forEach(({ element, translatedText }) => {
        element.textContent = translatedText;
    });
    
    hideTranslateOverlay();
}

async function translateText(text, targetLanguage) {
    // 模拟 API 调用，替换为实际 API
    // 实际应用中使用您的 API 密钥和端点
    const apiKey = '8NWTTPN1qacyw7Vz2FaDFuqwEaHLb7WULJc5uvFc9mpEL4tMjtXkJQQJ99BCAC3pKaRXJ3w3AAAbACOGCNFR';
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';

    const response = await fetch(endpoint + '&to=' + targetLanguage, {
        method: 'POST',
        body: JSON.stringify([{'Text': text}]),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
            'Ocp-Apim-Subscription-Region': 'eastasia'
        }
    });

    const data = await response.json();
    return data[0].translations[0].text;
}

function showTranslateOverlay() {
    translateOverlay.style.display = 'flex';
    translateOverlay.innerHTML = `
        <i data-lucide="loader" size="16" class="loading-icon"></i>
        <span>Translating...</span>
    `;
    lucide.createIcons();
    
    // 添加旋转动画
    const loadingIcon = translateOverlay.querySelector('.loading-icon');
    loadingIcon.style.animation = 'spin 1s linear infinite';
}

function hideTranslateOverlay() {
    setTimeout(() => {
        translateOverlay.style.display = 'none';
    }, 500);
}

// 阅读进度指示器功能
document.addEventListener('DOMContentLoaded', () => {
    // 创建阅读进度指示器元素
    const readingProgressContainer = document.createElement('div');
    readingProgressContainer.className = 'reading-progress';
    readingProgressContainer.id = 'readingProgress';
    document.body.appendChild(readingProgressContainer);
    
    // 清空任何现有内容
    readingProgressContainer.innerHTML = '';
    
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
    readingProgressContainer.appendChild(svg);
    
    // 创建百分比文本元素
    const percentText = document.createElement('span');
    percentText.classList.add('percent-text');
    readingProgressContainer.appendChild(percentText);
    
    // 点击时平滑滚动到顶部
    readingProgressContainer.addEventListener('click', () => {
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
        
        // 更新进度指示器文本
        percentText.textContent = `${roundedPercent}%`;
        
        // 更新SVG圆形进度
        const circumference = 2 * Math.PI * 16;
        circleForeground.style.strokeDasharray = `${circumference * roundedPercent / 100} ${circumference}`;
        
        // 根据滚动位置显示/隐藏指示器
        if (scrollTop > 100) {
            readingProgressContainer.style.opacity = '1';
        } else {
            readingProgressContainer.style.opacity = '0';
        }
    });
});

// Check if we're on the index page
const isIndexPage = window.location.pathname.endsWith('Home.html') || 
window.location.pathname === '/' || 
window.location.pathname.endsWith('/');

// Only enable smooth scrolling on the index page
if (isIndexPage) {
    // Set home link as active
    document.getElementById('homeLink').classList.add('active');

    // Smooth scrolling for scroll indicator on homepage
    document.getElementById('scrollIndicator').addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({
        behavior: 'smooth'
        });
    });

    // Handle in-page navigation only on the index page
    const homeLink = document.getElementById('homeLink');
    homeLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Update active nav link on scroll (only on index page)
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        // Get all sections
        const sections = document.querySelectorAll('section');

        // Determine which section is currently in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop - 100 && 
                scrollPosition < sectionTop + sectionHeight - 100) {
                const sectionId = section.getAttribute('id');

                // Update active nav link
                document.querySelectorAll('.nav-button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.textContent.toLowerCase() === sectionId) {
                        btn.classList.add('active');
                    }
                });
            }
        });
    });
}

// Trigger scroll event to initialize the indicator
window.dispatchEvent(new Event('scroll'));
