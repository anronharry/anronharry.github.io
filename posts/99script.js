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
    try {
        const elementsToTranslate = document.querySelectorAll('.post-title, .post-meta span, .post-content p, .post-content h2, .post-content ul li, .post-content blockquote, .post-tags .post-tag, .back-to-blogs');
        
        // 使用限制并发的方式进行翻译，避免同时发送大量请求
        const results = [];
        const batchSize = 5; // 每批处理的元素数量
        
        for (let i = 0; i < elementsToTranslate.length; i += batchSize) {
            const batch = Array.from(elementsToTranslate).slice(i, i + batchSize);
            const batchPromises = batch.map(async (element) => {
                if (element.textContent.trim()) {
                    const text = element.textContent;
                    try {
                        const translatedText = await translateText(text, targetLanguage);
                        return { element, translatedText };
                    } catch (error) {
                        console.error(`翻译错误: ${text}`, error);
                        return { element, translatedText: text }; // 保留原文
                    }
                }
                return { element, translatedText: element.textContent };
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // 添加小延迟，避免API限制
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        results.forEach(({ element, translatedText }) => {
            if (translatedText) {
                element.textContent = translatedText;
            }
        });
    } catch (error) {
        console.error('翻译过程出错:', error);
        showTranslationError('翻译过程发生错误，请稍后再试');
    } finally {
        hideTranslateOverlay();
    }
}

async function translateText(text, targetLanguage) {
    if (!text || text.trim() === '') {
        return text;
    }
    
    // 将langCode映射到各API支持的格式
    const baiduLangCode = mapToBaiduLanguageCode(targetLanguage);
    const microsoftLangCode = mapToMicrosoftLanguageCode(targetLanguage);
    
    // 优先使用百度翻译API
    try {
        const baiduTranslation = await translateWithBaidu(text, baiduLangCode);
        return baiduTranslation;
    } catch (error) {
        console.warn('百度翻译失败，使用Microsoft翻译作为备用', error);
        try {
            // 如果百度翻译失败，则使用Microsoft翻译
            return await translateWithMicrosoft(text, microsoftLangCode);
        } catch (msError) {
            console.error('所有翻译服务均失败', msError);
            throw new Error('翻译服务暂不可用');
        }
    }
}

// 百度翻译API需要的签名生成函数
function generateBaiduSign(text, appid, salt, secretKey) {
    // 百度API签名规则: appid + q + salt + 密钥
    const str = appid + text + salt + secretKey;
    return md5(str);
}

// 假设已引入md5库，如果没有，需要添加md5实现或引入库
function md5(string) {
    // 这里应该是实际的MD5实现
    // 如果没有MD5库，可以使用：
    // return CryptoJS.MD5(string).toString();
    // 或其他MD5实现
    
    // 简单示例，实际应用中请替换为真正的MD5实现
    console.warn('请实现或引入MD5函数');
    return string; // 这只是占位符，实际使用需要替换
}

async function translateWithBaidu(text, targetLanguage) {
    // 替换为实际的百度翻译API密钥和appid
    const appid = '20250310002297728'; // 需要替换为实际的APPID
    const secretKey = 'Lp9wW_zrgk8qSGj8MBBn'; // 需要替换为实际的密钥
    const salt = Date.now().toString();
    const baiduEndpoint = 'https://api.fanyi.baidu.com/api/trans/vip/translate';
    
    const sign = generateBaiduSign(text, appid, salt, secretKey);
    
    try {
        const response = await fetch(baiduEndpoint, {
            method: 'POST',
            body: new URLSearchParams({
                q: text,
                from: 'auto',
                to: targetLanguage,
                appid: appid,
                salt: salt,
                sign: sign
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error_code) {
            throw new Error(`百度翻译错误: ${data.error_code} - ${data.error_msg}`);
        }
        
        // 检查返回的结果是否包含翻译
        if (!data.trans_result || data.trans_result.length === 0) {
            throw new Error('百度翻译返回空结果');
        }
        
        return data.trans_result[0].dst;
    } catch (error) {
        console.error('百度翻译API调用失败:', error);
        throw error;
    }
}

async function translateWithMicrosoft(text, targetLanguage) {
    // 替换为实际的Microsoft Translator API密钥
    const apiKey = '8NWTTPN1qacyw7Vz2FaDFuqwEaHLb7WULJc5uvFc9mpEL4tMjtXkJQQJ99BCAC3pKaRXJ3w3AAAbACOGCNFR';
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
    
    try {
        const response = await fetch(`${endpoint}?api-version=3.0&to=${targetLanguage}`, {
            method: 'POST',
            body: JSON.stringify([{'Text': text}]),
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiKey,
                'Ocp-Apim-Subscription-Region': 'eastasia'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0 || !data[0].translations || data[0].translations.length === 0) {
            throw new Error('Microsoft翻译返回空结果');
        }
        
        return data[0].translations[0].text;
    } catch (error) {
        console.error('Microsoft翻译API调用失败:', error);
        throw error;
    }
}

// 语言代码映射函数
function mapToBaiduLanguageCode(langCode) {
    // 百度翻译API支持的语言代码可能与网站使用的不同
    const baiduMap = {
        'en': 'en',
        'zh': 'zh',
        'jp': 'jp',
        // 添加更多语言映射...
    };
    return baiduMap[langCode] || langCode;
}

function mapToMicrosoftLanguageCode(langCode) {
    // Microsoft翻译API支持的语言代码可能与网站使用的不同
    const msMap = {
        'en': 'en',
        'zh': 'zh-Hans',
        'jp': 'ja',
        // 添加更多语言映射...
    };
    return msMap[langCode] || langCode;
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

function showTranslationError(message) {
    translateOverlay.innerHTML = `
        <i data-lucide="alert-triangle" size="16" class="error-icon"></i>
        <span>${message}</span>
    `;
    lucide.createIcons();
    
    setTimeout(() => {
        translateOverlay.style.display = 'none';
    }, 3000);
}
