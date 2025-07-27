// 在线媒体播放器 - 基础JavaScript代码
// 全局变量
let currentMedia = null;
let playlist = [];
let currentIndex = 0;

// DOM元素引用
const elements = {
    urlInput: null,
    parseBtn: null,
    fileInput: null,
    fileBtn: null,
    videoPlayer: null,
    audioPlayer: null,
    placeholder: null,
    customControls: null,
    playPauseBtn: null,
    progressBar: null,
    currentTime: null,
    duration: null,
    volumeBar: null,
    muteBtn: null,
    downloadBtn: null,
    fullscreenBtn: null,
    playlistEl: null,
    clearPlaylistBtn: null,
    notification: null,
    loading: null
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    console.log('在线媒体播放器已初始化');
});

// 初始化DOM元素引用
function initializeElements() {
    elements.urlInput = document.getElementById('urlInput');
    elements.parseBtn = document.getElementById('parseBtn');
    elements.fileInput = document.getElementById('fileInput');
    elements.fileBtn = document.getElementById('fileBtn');
    elements.videoPlayer = document.getElementById('videoPlayer');
    elements.audioPlayer = document.getElementById('audioPlayer');
    elements.placeholder = document.getElementById('placeholder');
    elements.customControls = document.getElementById('customControls');
    elements.playPauseBtn = document.getElementById('playPauseBtn');
    elements.progressBar = document.getElementById('progressBar');
    elements.currentTime = document.getElementById('currentTime');
    elements.duration = document.getElementById('duration');
    elements.volumeBar = document.getElementById('volumeBar');
    elements.muteBtn = document.getElementById('muteBtn');
    elements.downloadBtn = document.getElementById('downloadBtn');
    elements.fullscreenBtn = document.getElementById('fullscreenBtn');
    elements.playlistEl = document.getElementById('playlist');
    elements.clearPlaylistBtn = document.getElementById('clearPlaylistBtn');
    elements.notification = document.getElementById('notification');
    elements.loading = document.getElementById('loading');
    elements.parseStatus = document.getElementById('parseStatus');
    elements.parseStatusText = document.getElementById('parseStatusText');
    elements.helpBtn = document.getElementById('helpBtn');
}

// 设置事件监听器
function setupEventListeners() {
    console.log('设置事件监听器');
    console.log('解析按钮元素:', elements.parseBtn);
    
    // 文件选择按钮
    elements.fileBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // 文件输入变化
    elements.fileInput.addEventListener('change', handleFileSelect);

    // URL解析按钮
    if (elements.parseBtn) {
        elements.parseBtn.addEventListener('click', handleUrlParse);
        console.log('解析按钮事件监听器已添加');
    } else {
        console.error('解析按钮元素未找到');
    }

    // 回车键解析
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUrlParse();
        }
    });

    // 播放/暂停按钮
    elements.playPauseBtn.addEventListener('click', togglePlayPause);

    // 进度条
    elements.progressBar.addEventListener('input', handleProgressChange);

    // 音量控制
    elements.volumeBar.addEventListener('input', handleVolumeChange);
    elements.muteBtn.addEventListener('click', toggleMute);

    // 下载按钮
    elements.downloadBtn.addEventListener('click', handleDownload);

    // 全屏按钮
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // 键盘快捷键支持
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // 播放速度控制
    setupPlaybackSpeedControl();

    // 全屏状态变化监听
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // 清空播放列表
    elements.clearPlaylistBtn.addEventListener('click', clearPlaylist);

    // 下载全部按钮
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAllPlaylistItems);

    // 关闭通知
    document.getElementById('closeNotification').addEventListener('click', hideNotification);

    // 平台信息切换
    document.getElementById('togglePlatformInfo').addEventListener('click', togglePlatformInfo);

    // 拖拽区域事件
    setupDropZone();

    // 下载模态框事件
    setupDownloadModal();

    // 帮助按钮
    elements.helpBtn.addEventListener('click', showSupportedPlatforms);

    // 帮助按钮
    document.getElementById('helpBtn').addEventListener('click', showHelpModal);
    document.getElementById('closeHelpModal').addEventListener('click', hideHelpModal);
    
    // 点击模态框外部关闭
    document.getElementById('helpModal').addEventListener('click', (e) => {
        if (e.target.id === 'helpModal') {
            hideHelpModal();
        }
    });
}

// 显示通知
function showNotification(message, type = 'success', duration = null) {
    const notificationText = document.getElementById('notificationText');
    notificationText.textContent = message;
    
    elements.notification.className = `notification ${type}`;
    elements.notification.style.display = 'flex';
    
    // 添加动画效果
    elements.notification.style.animation = 'slideInRight 0.3s ease-out';
    
    // 根据类型设置不同的自动隐藏时间
    let hideDelay = duration;
    if (!hideDelay) {
        switch (type) {
            case 'info':
                hideDelay = 2000;
                break;
            case 'success':
                hideDelay = 3000;
                break;
            case 'warning':
                hideDelay = 4000;
                break;
            case 'error':
                hideDelay = 5000;
                break;
            default:
                hideDelay = 3000;
        }
    }
    
    // 清除之前的定时器
    if (window.notificationTimer) {
        clearTimeout(window.notificationTimer);
    }
    
    // 设置新的定时器
    window.notificationTimer = setTimeout(hideNotification, hideDelay);
}

// 隐藏通知
function hideNotification() {
    elements.notification.style.display = 'none';
}

// 显示加载状态
function showLoading(message = '正在处理...') {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = message;
    }
    elements.loading.style.display = 'flex';
    elements.loading.style.animation = 'fadeIn 0.3s ease-in';
}

// 隐藏加载状态
function hideLoading() {
    elements.loading.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        elements.loading.style.display = 'none';
    }, 300);
}

// 更新加载状态文本
function updateLoadingText(message) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = message;
    }
}

// 显示解析状态
function showParsingStatus(message, type = 'loading', details = null) {
    let statusElement = document.getElementById('parsingStatus');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'parsingStatus';
        statusElement.className = 'parsing-status';
        
        // 插入到输入区域下方
        const inputSection = document.querySelector('.input-section');
        inputSection.appendChild(statusElement);
    }
    
    let iconHtml = '';
    switch (type) {
        case 'loading':
            iconHtml = '<div class="parsing-spinner"></div>';
            break;
        case 'success':
            iconHtml = '<div class="parsing-icon success">✅</div>';
            break;
        case 'error':
            iconHtml = '<div class="parsing-icon error">❌</div>';
            break;
        case 'warning':
            iconHtml = '<div class="parsing-icon warning">⚠️</div>';
            break;
        default:
            iconHtml = '<div class="parsing-icon">ℹ️</div>';
    }
    
    let detailsHtml = '';
    if (details) {
        if (Array.isArray(details)) {
            detailsHtml = `
                <div class="parsing-details">
                    <ul>
                        ${details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            detailsHtml = `<div class="parsing-details">${details}</div>`;
        }
    }
    
    statusElement.innerHTML = `
        <div class="parsing-status-content ${type}">
            ${iconHtml}
            <div class="parsing-content">
                <span class="parsing-message">${message}</span>
                ${detailsHtml}
            </div>
        </div>
    `;
    
    statusElement.style.display = 'block';
    
    // 自动隐藏成功和警告消息
    if (type === 'success' || type === 'warning') {
        setTimeout(() => {
            hideParsingStatus();
        }, 5000);
    }
}

// 隐藏解析状态
function hideParsingStatus() {
    const statusElement = document.getElementById('parsingStatus');
    if (statusElement) {
        statusElement.style.display = 'none';
    }
}

// 保存解析历史
function saveParseHistory(parseResult) {
    let parseHistory = JSON.parse(localStorage.getItem('parseHistory') || '[]');
    
    // 避免重复
    parseHistory = parseHistory.filter(item => item.originalUrl !== parseResult.originalUrl);
    
    // 添加到开头
    parseHistory.unshift({
        ...parseResult,
        timestamp: Date.now()
    });

    // 限制历史记录数量
    if (parseHistory.length > 20) {
        parseHistory = parseHistory.slice(0, 20);
    }

    localStorage.setItem('parseHistory', JSON.stringify(parseHistory));
}

// 保存播放历史
function savePlayHistory(mediaInfo) {
    let playHistory = JSON.parse(localStorage.getItem('playHistory') || '[]');
    
    const historyItem = {
        url: mediaInfo.url,
        title: mediaInfo.title,
        type: mediaInfo.type,
        platform: mediaInfo.platform || 'direct',
        originalUrl: mediaInfo.originalUrl || mediaInfo.url,
        timestamp: Date.now(),
        duration: mediaInfo.duration || 0,
        thumbnail: mediaInfo.thumbnail || null
    };
    
    // 避免重复
    playHistory = playHistory.filter(item => item.url !== mediaInfo.url);
    
    // 添加到开头
    playHistory.unshift(historyItem);
    
    // 限制历史记录数量
    if (playHistory.length > 50) {
        playHistory = playHistory.slice(0, 50);
    }
    
    localStorage.setItem('playHistory', JSON.stringify(playHistory));
}

// 获取播放历史
function getPlayHistory() {
    return JSON.parse(localStorage.getItem('playHistory') || '[]');
}

// 清除播放历史
function clearPlayHistory() {
    localStorage.removeItem('playHistory');
    showNotification('播放历史已清除', 'info');
}

// 保存播放器设置
function savePlayerSettings(settings) {
    const currentSettings = JSON.parse(localStorage.getItem('playerSettings') || '{}');
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem('playerSettings', JSON.stringify(newSettings));
}

// 获取播放器设置
function getPlayerSettings() {
    return JSON.parse(localStorage.getItem('playerSettings') || '{}');
}

// 从URL检测平台
function detectPlatformFromUrl(url) {
    if (!url) return 'unknown';
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) {
        return 'bilibili';
    } else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'youtube';
    } else if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com')) {
        return 'douyin';
    } else if (lowerUrl.includes('vimeo.com')) {
        return 'vimeo';
    } else if (lowerUrl.includes('tiktok.com')) {
        return 'tiktok';
    }
    
    return 'unknown';
}

// 恢复播放器设置
function restorePlayerSettings() {
    const settings = getPlayerSettings();
    
    // 恢复音量设置
    if (settings.volume !== undefined && elements.volumeBar) {
        elements.volumeBar.value = settings.volume * 100;
        if (currentMedia) {
            currentMedia.volume = settings.volume;
        }
    }
    
    // 恢复播放速度设置
    if (settings.playbackRate !== undefined && currentMedia) {
        currentMedia.playbackRate = settings.playbackRate;
    }
}

// 更新解析状态显示
function updateParseStatus(message, type) {
    if (!message) {
        elements.parseStatus.style.display = 'none';
        return;
    }

    elements.parseStatusText.textContent = message;
    elements.parseStatus.className = `parse-status ${type}`;
    elements.parseStatus.style.display = 'flex';
}

// 显示支持的平台信息
function showSupportedPlatforms() {
    const supportedPlatforms = [
        '✅ 直接媒体链接 (MP4, WebM, MP3, WAV等)',
        '✅ YouTube (youtube.com, youtu.be)',
        '🔄 Bilibili (嵌入式播放器)',
        '📋 抖音 (提供下载建议)',
        '✅ Vimeo (vimeo.com)',
        '✅ 通用HTTP媒体文件'
    ];

    const message = '支持的平台和格式：\n\n' + supportedPlatforms.join('\n');
    
    // 创建模态框显示信息
    const modal = document.createElement('div');
    modal.className = 'platform-help-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>支持的平台和格式</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <ul class="platform-list">
                    <li class="supported">✅ 直接媒体链接 (MP4, WebM, MP3, WAV等)</li>
                    <li class="supported">✅ YouTube (youtube.com, youtu.be)</li>
                    <li class="partial">⚠️ Bilibili (需要API支持)</li>
                    <li class="partial">⚠️ 抖音 (需要特殊处理)</li>
                    <li class="supported">✅ 通用HTTP媒体文件</li>
                </ul>
                <div class="help-note">
                    <p><strong>使用提示：</strong></p>
                    <p>• 直接媒体链接可以立即播放</p>
                    <p>• YouTube链接将使用嵌入式播放器</p>
                    <p>• 部分平台需要额外的API支持</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 添加关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 显示帮助模态框
function showHelpModal() {
    document.getElementById('helpModal').style.display = 'flex';
}

// 隐藏帮助模态框
function hideHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

// 格式化时间显示
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const mediaType = file.type.startsWith('video/') ? 'video' : 'audio';
    
    loadMedia(url, mediaType, file.name);
    addToPlaylist(url, file.name, mediaType);
}

// 处理URL解析
async function handleUrlParse() {
    console.log('解析按钮被点击');
    const url = elements.urlInput.value.trim();
    console.log('输入的URL:', url);
    
    if (!url) {
        showNotification('请输入有效的URL', 'error');
        return;
    }

    // 基本URL格式验证
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showParsingStatus('URL格式错误', 'error', ['URL必须以 http:// 或 https:// 开头']);
        showNotification('请输入完整的URL（包含 http:// 或 https://）', 'error');
        return;
    }

    showLoading();
    showParsingStatus('正在分析URL类型...', 'loading');
    
    try {
        // 检查是否为直接媒体URL
        if (isDirectMediaUrl(url)) {
            showParsingStatus('检测到直接媒体链接，正在验证...', 'loading');
            const mediaType = getMediaTypeFromUrl(url);
            const title = getFilenameFromUrl(url);
            
            // 尝试验证链接有效性
            try {
                const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                showParsingStatus('直接媒体链接验证成功，正在加载...', 'loading');
            } catch (verifyError) {
                showParsingStatus('无法验证链接，但将尝试加载...', 'warning', 
                    ['由于CORS限制，无法验证链接有效性', '如果播放失败，请检查链接是否正确']);
            }
            
            loadMedia(url, mediaType, title);
            addToPlaylist(url, title, mediaType);
            
            showParsingStatus(`成功加载: ${title}`, 'success');
            showNotification(`成功加载: ${title}`, 'success');
            
            // 清空输入框
            elements.urlInput.value = '';
        } else {
            // 首先尝试使用后端API解析任何URL
            showParsingStatus('正在尝试解析视频链接...', 'loading', ['使用yt-dlp后端服务解析']);
            
            let parseResult = await tryYtDlpAPI(url);
            
            // 如果后端API失败，再尝试前端平台特定解析
            if (!parseResult.success) {
                const platform = detectPlatform(url);
                if (platform) {
                    const platformName = getPlatformName(platform);
                    showParsingStatus(`后端解析失败，尝试${platformName}前端解析...`, 'loading');
                    
                    parseResult = await parseVideoUrl(url);
                } else {
                    showParsingStatus('未识别的平台，尝试通用解析...', 'loading', 
                        ['将尝试作为直接媒体链接处理', '如果失败，请检查URL格式']);
                    
                    parseResult = await parseVideoUrl(url);
                }
            }
            if (parseResult.success) {
                let successDetails = [];
                if (parseResult.note) {
                    successDetails.push(`解析方式: ${parseResult.note}`);
                }
                if (parseResult.platform) {
                    successDetails.push(`平台: ${getPlatformName(parseResult.platform)}`);
                }
                if (parseResult.warning) {
                    successDetails.push(`⚠️ ${parseResult.warning}`);
                }
                
                showParsingStatus(`解析成功: ${parseResult.title}`, 'success', successDetails);
                
                loadMedia(parseResult.url, parseResult.type, parseResult.title, {
                    platform: parseResult.platform,
                    originalUrl: parseResult.originalUrl,
                    note: parseResult.note
                });
                addToPlaylist(parseResult.url, parseResult.title, parseResult.type);
                showNotification(`解析成功: ${parseResult.title}`, 'success');
                
                // 保存解析历史
                saveParseHistory(parseResult);
                
                // 清空输入框
                elements.urlInput.value = '';
            } else {
                // 显示详细的错误信息和建议
                let errorDetails = [];
                if (parseResult.suggestions && parseResult.suggestions.length > 0) {
                    errorDetails = parseResult.suggestions;
                }
                
                showParsingStatus(`解析失败: ${parseResult.error}`, 'error', errorDetails);
                
                // 如果有开源解决方案，显示额外信息
                if (parseResult.openSourceSolutions) {
                    setTimeout(() => {
                        showOpenSourceSolutions(parseResult);
                    }, 2000);
                }
                
                throw new Error(parseResult.error || '解析失败');
            }
        }
    } catch (error) {
        console.error('URL解析错误:', error);
        
        // 如果还没有显示错误状态，显示通用错误
        const currentStatus = document.getElementById('parsingStatus');
        if (!currentStatus || !currentStatus.innerHTML.includes('error')) {
            showParsingStatus(`解析失败: ${error.message}`, 'error', [
                '请检查URL格式是否正确',
                '确认网络连接正常',
                '某些平台可能需要特殊处理'
            ]);
        }
        
        showNotification(`解析失败: ${error.message}`, 'error');
    } finally {
        hideLoading();
        // 错误状态不自动隐藏，成功状态5秒后隐藏
        const currentStatus = document.getElementById('parsingStatus');
        if (currentStatus && currentStatus.innerHTML.includes('success')) {
            setTimeout(hideParsingStatus, 5000);
        }
    }
}

// 检查是否为直接媒体URL
function isDirectMediaUrl(url) {
    const mediaExtensions = ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.m4a'];
    return mediaExtensions.some(ext => url.toLowerCase().includes(ext));
}

// 从URL获取媒体类型
function getMediaTypeFromUrl(url) {
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    const audioExtensions = ['.mp3', '.wav', '.m4a'];
    
    const lowerUrl = url.toLowerCase();
    
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
        return 'video';
    } else if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
        return 'audio';
    }
    
    return 'video'; // 默认为视频
}

// 从URL获取文件名
function getFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        return pathname.split('/').pop() || 'Unknown Media';
    } catch {
        return 'Unknown Media';
    }
}

// URL解析功能
async function parseVideoUrl(url) {
    try {
        // 首先尝试后端API解析
        const backendResult = await tryYtDlpAPI(url);
        if (backendResult.success) {
            return backendResult;
        }
        
        // 如果后端失败，检测平台类型进行前端解析
        const platform = detectPlatform(url);
        
        if (!platform) {
            return {
                success: false,
                error: '无法解析此URL。\n\n建议：\n• 确保URL格式正确\n• 检查网络连接\n• 尝试启动后端服务以获得更好的解析支持\n• 支持的平台：YouTube, Bilibili, 抖音, Vimeo等',
                suggestions: [
                    '检查URL格式是否正确',
                    '确认网络连接正常',
                    '启动后端yt-dlp服务以获得更好支持',
                    '尝试直接访问原始页面'
                ]
            };
        }

        // 根据平台解析URL
        switch (platform) {
            case 'youtube':
                return await parseYouTubeUrl(url);
            case 'bilibili':
                return await parseBilibiliUrl(url);
            case 'douyin':
                return await parseDouyinUrl(url);
            case 'vimeo':
                return await parseVimeoUrl(url);
            case 'dailymotion':
                return await parseDailymotionUrl(url);
            case 'generic':
                return await parseGenericUrl(url);
            default:
                return {
                    success: false,
                    error: `暂不支持 ${getPlatformName(platform)} 平台`
                };
        }
    } catch (error) {
        console.error('URL解析错误:', error);
        return {
            success: false,
            error: error.message || '解析过程中发生错误'
        };
    }
}

// 检测视频平台
function detectPlatform(url) {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'youtube';
    } else if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) {
        return 'bilibili';
    } else if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com')) {
        return 'douyin';
    } else if (lowerUrl.includes('vimeo.com')) {
        return 'vimeo';
    } else if (lowerUrl.includes('dailymotion.com')) {
        return 'dailymotion';
    } else if (lowerUrl.match(/\.(mp4|webm|ogg|mp3|wav|m4a|flv|avi|mov|mkv)(\?|$)/)) {
        return 'generic';
    } else if (lowerUrl.startsWith('http') && (lowerUrl.includes('video') || lowerUrl.includes('media'))) {
        return 'generic'; // 尝试作为通用媒体链接处理
    }
    
    return null;
}

// YouTube URL解析
async function parseYouTubeUrl(url) {
    try {
        // 提取视频ID
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            throw new Error('无法提取YouTube视频ID，请检查链接格式');
        }

        // 尝试多种方法获取视频信息
        try {
            // 方法1: 尝试使用YouTube oEmbed API获取标题
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oembedUrl);
            
            if (response.ok) {
                const data = await response.json();
                
                // 注意：由于CORS限制，实际项目中需要后端API支持获取直接视频流
                // 这里返回嵌入式播放器链接作为替代方案
                const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;
                
                return {
                    success: true,
                    url: embedUrl,
                    type: 'video',
                    title: data.title || `YouTube视频 - ${videoId}`,
                    platform: 'youtube',
                    originalUrl: url,
                    thumbnail: data.thumbnail_url,
                    author: data.author_name,
                    note: '使用YouTube嵌入式播放器'
                };
            }
        } catch (apiError) {
            console.warn('YouTube API调用失败，使用备用方案:', apiError);
        }

        // 备用方案：返回基本信息
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;
        
        return {
            success: true,
            url: embedUrl,
            type: 'video',
            title: `YouTube视频 - ${videoId}`,
            platform: 'youtube',
            originalUrl: url,
            note: '使用YouTube嵌入式播放器'
        };
    } catch (error) {
        return {
            success: false,
            error: `YouTube解析失败: ${error.message}`
        };
    }
}

// 提取YouTube视频ID
function extractYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

// Bilibili URL解析
async function parseBilibiliUrl(url) {
    try {
        // 提取BV号或AV号
        const videoId = extractBilibiliVideoId(url);
        if (!videoId) {
            throw new Error('无法提取Bilibili视频ID，请检查链接格式');
        }

        // 方法1: 尝试使用Bilibili嵌入式播放器
        try {
            let embedUrl;
            if (videoId.startsWith('BV')) {
                embedUrl = `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=1`;
            } else if (videoId.startsWith('av')) {
                const aid = videoId.replace('av', '');
                embedUrl = `https://player.bilibili.com/player.html?aid=${aid}&autoplay=1`;
            }

            if (embedUrl) {
                return {
                    success: true,
                    url: embedUrl,
                    type: 'video',
                    title: `Bilibili视频 - ${videoId}`,
                    platform: 'bilibili',
                    originalUrl: url,
                    note: '使用Bilibili嵌入式播放器'
                };
            }
        } catch (embedError) {
            console.warn('Bilibili嵌入式播放器加载失败:', embedError);
        }

        // 方法2: 尝试使用开源API（需要后端支持）
        try {
            const apiResult = await tryBilibiliOpenSourceAPI(videoId, url);
            if (apiResult.success) {
                return apiResult;
            }
        } catch (apiError) {
            console.warn('开源API调用失败:', apiError);
        }

        // 如果所有方法都失败，返回详细的解决方案
        return {
            success: false,
            error: 'Bilibili视频解析失败。由于B站的反爬虫机制，需要特殊的API支持。',
            platform: 'bilibili',
            videoId: videoId,
            openSourceSolutions: [
                {
                    name: 'you-get',
                    description: 'Python工具，支持B站视频下载',
                    command: `you-get ${url}`,
                    github: 'https://github.com/soimort/you-get'
                },
                {
                    name: 'yt-dlp',
                    description: 'youtube-dl的增强版，支持B站',
                    command: `yt-dlp "${url}"`,
                    github: 'https://github.com/yt-dlp/yt-dlp'
                },
                {
                    name: 'BBDown',
                    description: '专门的B站下载工具',
                    command: `BBDown ${url}`,
                    github: 'https://github.com/nilaoda/BBDown'
                },
                {
                    name: 'bilibili-API-collect',
                    description: 'B站API接口整理',
                    github: 'https://github.com/SocialSisterYi/bilibili-API-collect'
                }
            ],
            suggestions: [
                '使用后端代理服务器调用B站API',
                '部署开源的B站解析服务',
                '使用浏览器扩展绕过限制',
                '访问原始页面观看'
            ]
        };
    } catch (error) {
        return {
            success: false,
            error: `Bilibili解析失败: ${error.message}`
        };
    }
}

// 尝试使用开源API解析Bilibili视频
async function tryBilibiliOpenSourceAPI(videoId, originalUrl) {
    // 方法1: 尝试调用后端yt-dlp服务
    try {
        const ytDlpResult = await tryYtDlpAPI(originalUrl);
        if (ytDlpResult.success) {
            return ytDlpResult;
        }
    } catch (error) {
        console.warn('yt-dlp API调用失败:', error);
    }
    
    // 方法2: 尝试获取视频基本信息（仅信息，不含播放地址）
    try {
        const infoUrl = videoId.startsWith('BV') 
            ? `https://api.bilibili.com/x/web-interface/view?bvid=${videoId}`
            : `https://api.bilibili.com/x/web-interface/view?aid=${videoId.replace('av', '')}`;
        
        // 注意：由于CORS限制，这个请求在浏览器中会失败
        // 实际使用时需要通过后端代理
        const response = await fetch(infoUrl);
        
        if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
                return {
                    success: false,
                    error: '获取到视频信息，但播放地址解析需要后端支持',
                    videoInfo: data.data,
                    needsBackend: true,
                    suggestions: [
                        '部署yt-dlp后端服务',
                        '使用命令行工具下载',
                        '访问原始页面观看'
                    ]
                };
            }
        }
    } catch (error) {
        console.warn('B站API调用失败:', error);
    }

    return { success: false, error: '开源API调用失败' };
}

// 尝试调用yt-dlp后端API
async function tryYtDlpAPI(url) {
    // 尝试多个可能的后端地址
    const possibleEndpoints = [
        'http://localhost:5001/api/extract',  // 本地开发服务 (端口5001)
        'http://127.0.0.1:5001/api/extract',  // 备用本地地址
        'http://localhost:5000/api/extract',  // 备用端口5000
        '/api/extract'                        // 直接API
    ];
    
    for (const backendUrl of possibleEndpoints) {
        try {
            console.log(`尝试连接: ${backendUrl}`);
        
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ url: url }),
                timeout: 30000,  // 30秒超时
                mode: 'cors'     // 明确指定CORS模式
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.formats && data.formats.length > 0) {
                    // 选择最佳格式
                    const bestFormat = selectBestFormat(data.formats);
                    
                    console.log('yt-dlp解析成功:', {
                        title: data.title,
                        formats: data.formats.length,
                        bestFormat: bestFormat
                    });
                    
                    return {
                        success: true,
                        url: bestFormat.url,
                        type: 'video',
                        title: data.title || `Bilibili视频`,
                        platform: 'bilibili',
                        originalUrl: url,
                        duration: data.duration,
                        thumbnail: data.thumbnail,
                        uploader: data.uploader,
                        note: '通过yt-dlp后端服务解析',
                        formats: data.formats,
                        bestFormat: bestFormat
                    };
                } else if (data.success) {
                    // 如果解析成功但没有格式，使用嵌入式播放器
                    console.log('yt-dlp解析成功但无直接格式，使用嵌入式播放器');
                    
                    const videoId = extractBilibiliVideoId(url);
                    if (videoId) {
                        let embedUrl;
                        if (videoId.startsWith('BV')) {
                            embedUrl = `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=1`;
                        } else if (videoId.startsWith('av')) {
                            const aid = videoId.replace('av', '');
                            embedUrl = `https://player.bilibili.com/player.html?aid=${aid}&autoplay=1`;
                        }
                        
                        if (embedUrl) {
                            return {
                                success: true,
                                url: embedUrl,
                                type: 'video',
                                title: data.title || `Bilibili视频`,
                                platform: 'bilibili',
                                originalUrl: url,
                                duration: data.duration,
                                thumbnail: data.thumbnail,
                                uploader: data.uploader,
                                note: '使用Bilibili嵌入式播放器'
                            };
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`后端服务 ${backendUrl} 调用失败:`, error);
            
            // 记录详细的错误信息
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('网络连接错误，可能是后端服务未启动或CORS问题');
            } else if (error.name === 'AbortError') {
                console.error('请求超时');
            } else {
                console.error('其他错误:', error.message);
            }
            
            continue; // 继续尝试下一个端点
        }
    }
    
    // 所有端点都失败了，返回详细的错误信息和解决方案
    return {
        success: false,
        error: '无法连接到yt-dlp后端服务。请检查服务是否正在运行。',
        suggestions: [
            '检查后端服务是否启动：python backend/yt-dlp-server.py',
            '确认服务运行在正确端口：http://localhost:5001',
            '检查防火墙设置是否阻止了连接',
            '尝试重启后端服务',
            '检查浏览器控制台的详细错误信息'
        ],
        deploymentGuide: {
            title: '部署yt-dlp后端服务',
            steps: [
                '1. 安装依赖: pip install yt-dlp flask flask-cors',
                '2. 启动服务: python backend/yt-dlp-server.py',
                '3. 验证服务: curl http://localhost:5001/api/health',
                '4. 检查CORS配置'
            ],
            testedEndpoints: possibleEndpoints
        }
    };
}

// 选择最佳视频格式
function selectBestFormat(formats) {
    // 优先选择mp4格式，质量适中的视频
    const mp4Formats = formats.filter(f => 
        f.ext === 'mp4' && 
        f.vcodec !== 'none' && 
        f.acodec !== 'none'
    );
    
    if (mp4Formats.length > 0) {
        // 按质量排序，选择720p或最接近的
        mp4Formats.sort((a, b) => {
            const aHeight = a.height || 0;
            const bHeight = b.height || 0;
            
            // 优先720p
            if (aHeight === 720) return -1;
            if (bHeight === 720) return 1;
            
            // 其次选择接近720p的
            return Math.abs(aHeight - 720) - Math.abs(bHeight - 720);
        });
        
        return mp4Formats[0];
    }
    
    // 如果没有mp4，选择最佳可用格式
    return formats.find(f => f.vcodec !== 'none' && f.acodec !== 'none') || formats[0];
}

// 提取Bilibili视频ID
function extractBilibiliVideoId(url) {
    const patterns = [
        /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
        /bilibili\.com\/video\/(av\d+)/,
        /b23\.tv\/([a-zA-Z0-9]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

// 抖音URL解析
async function parseDouyinUrl(url) {
    try {
        // 提取抖音视频ID
        const videoId = extractDouyinVideoId(url);
        
        if (!videoId) {
            throw new Error('无法提取抖音视频ID，请检查链接格式');
        }

        // 抖音由于反爬虫机制，无法直接解析
        // 提供详细的解决方案建议
        return {
            success: false,
            error: '抖音视频由于平台限制无法直接解析播放。\n\n推荐的解决方案：\n1. 使用专门的抖音下载工具\n2. 在抖音App中观看\n3. 使用支持抖音的第三方工具',
            platform: 'douyin',
            videoId: videoId,
            suggestions: [
                '使用 yt-dlp 工具: yt-dlp "' + url + '"',
                '使用在线下载网站（注意安全）',
                '在抖音官方App中观看',
                '使用浏览器扩展工具'
            ],
            note: '由于抖音的反爬虫机制，直接解析较为困难'
        };
    } catch (error) {
        return {
            success: false,
            error: `抖音解析失败: ${error.message}`,
            suggestions: [
                '检查链接格式是否正确',
                '尝试使用完整的抖音分享链接',
                '使用专门的抖音下载工具'
            ]
        };
    }
}

// 提取抖音视频ID
function extractDouyinVideoId(url) {
    const patterns = [
        /douyin\.com\/video\/(\d+)/,
        /v\.douyin\.com\/([a-zA-Z0-9]+)/,
        /iesdouyin\.com\/share\/video\/(\d+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

// Vimeo URL解析
async function parseVimeoUrl(url) {
    try {
        const videoId = extractVimeoVideoId(url);
        if (!videoId) {
            throw new Error('无法提取Vimeo视频ID，请检查链接格式');
        }

        // 使用Vimeo oEmbed API获取视频信息
        try {
            const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
            const response = await fetch(oembedUrl);
            
            if (response.ok) {
                const data = await response.json();
                
                // 返回嵌入式播放器链接
                const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
                
                return {
                    success: true,
                    url: embedUrl,
                    type: 'video',
                    title: data.title || `Vimeo视频 - ${videoId}`,
                    platform: 'vimeo',
                    originalUrl: url,
                    thumbnail: data.thumbnail_url,
                    author: data.author_name,
                    note: '使用Vimeo嵌入式播放器'
                };
            }
        } catch (apiError) {
            console.warn('Vimeo API调用失败，使用备用方案:', apiError);
        }

        // 备用方案
        const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        
        return {
            success: true,
            url: embedUrl,
            type: 'video',
            title: `Vimeo视频 - ${videoId}`,
            platform: 'vimeo',
            originalUrl: url,
            note: '使用Vimeo嵌入式播放器'
        };
    } catch (error) {
        return {
            success: false,
            error: `Vimeo解析失败: ${error.message}`
        };
    }
}

// 提取Vimeo视频ID
function extractVimeoVideoId(url) {
    const patterns = [
        /vimeo\.com\/(\d+)/,
        /vimeo\.com\/video\/(\d+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

// Dailymotion URL解析
async function parseDailymotionUrl(url) {
    try {
        // 提取Dailymotion视频ID
        const videoId = extractDailymotionVideoId(url);
        if (!videoId) {
            throw new Error('无法提取Dailymotion视频ID，请检查链接格式');
        }

        // 使用嵌入式播放器
        const embedUrl = `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
        
        return {
            success: true,
            url: embedUrl,
            type: 'video',
            title: `Dailymotion视频 - ${videoId}`,
            platform: 'dailymotion',
            originalUrl: url,
            note: '使用Dailymotion嵌入式播放器'
        };
    } catch (error) {
        return {
            success: false,
            error: `Dailymotion解析失败: ${error.message}`
        };
    }
}

// 提取Dailymotion视频ID
function extractDailymotionVideoId(url) {
    const patterns = [
        /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
        /dai\.ly\/([a-zA-Z0-9]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

// 通用URL解析（用于直接媒体链接）
async function parseGenericUrl(url) {
    try {
        // 首先尝试HEAD请求验证URL
        try {
            const response = await fetch(url, { 
                method: 'HEAD',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || '';
            let mediaType = 'video'; // 默认为视频
            
            // 根据Content-Type判断媒体类型
            if (contentType.startsWith('video/')) {
                mediaType = 'video';
            } else if (contentType.startsWith('audio/')) {
                mediaType = 'audio';
            } else {
                // 如果Content-Type不明确，根据URL扩展名判断
                mediaType = getMediaTypeFromUrl(url);
            }
            
            return {
                success: true,
                url: url,
                type: mediaType,
                title: getFilenameFromUrl(url),
                platform: 'direct',
                originalUrl: url,
                contentType: contentType,
                note: '直接媒体链接'
            };
        } catch (fetchError) {
            // 如果HEAD请求失败，可能是CORS问题，尝试直接使用URL
            console.warn('HEAD请求失败，尝试直接使用URL:', fetchError);
            
            // 根据URL扩展名判断类型
            const mediaType = getMediaTypeFromUrl(url);
            
            return {
                success: true,
                url: url,
                type: mediaType,
                title: getFilenameFromUrl(url),
                platform: 'direct',
                originalUrl: url,
                note: '直接链接（未验证可访问性）',
                warning: '由于CORS限制，无法验证链接有效性'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: `通用解析失败: ${error.message}`,
            suggestions: [
                '检查URL是否正确',
                '确认文件服务器支持CORS',
                '尝试使用直接的媒体文件链接',
                '检查网络连接'
            ]
        };
    }
}

// 获取支持的平台列表
function getSupportedPlatforms() {
    return [
        { name: 'YouTube', domains: ['youtube.com', 'youtu.be'] },
        { name: 'Bilibili', domains: ['bilibili.com', 'b23.tv'] },
        { name: '抖音', domains: ['douyin.com', 'iesdouyin.com'] },
        { name: '直接链接', domains: ['支持 MP4, WebM, MP3 等格式'] }
    ];
}

// 获取平台显示名称
function getPlatformName(platform) {
    const platformNames = {
        'youtube': 'YouTube',
        'bilibili': 'Bilibili',
        'douyin': '抖音',
        'vimeo': 'Vimeo',
        'dailymotion': 'Dailymotion',
        'generic': '直接链接',
        'direct': '直接链接'
    };
    return platformNames[platform] || platform;
}

// 获取平台解析提示
function getPlatformParsingHints(platform) {
    const hints = {
        'youtube': [
            '使用YouTube嵌入式播放器',
            '支持自动播放和控制',
            '需要网络连接'
        ],
        'bilibili': [
            '优先尝试嵌入式播放器',
            '如果失败，将尝试API解析',
            '某些视频可能需要登录'
        ],
        'douyin': [
            '抖音有反爬虫机制',
            '将提供下载建议',
            '推荐使用专门工具'
        ],
        'vimeo': [
            '使用Vimeo嵌入式播放器',
            '支持高质量播放',
            '部分视频可能有地区限制'
        ],
        'dailymotion': [
            '使用Dailymotion嵌入式播放器',
            '支持基本播放控制'
        ],
        'generic': [
            '验证链接可访问性',
            '检查CORS支持',
            '自动检测媒体类型'
        ]
    };
    
    return hints[platform] || [];
}

// 显示开源解决方案
function showOpenSourceSolutions(parseResult) {
    if (!parseResult.openSourceSolutions) return;
    
    const modal = document.createElement('div');
    modal.className = 'opensource-solutions-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>开源解决方案</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>由于平台限制，推荐使用以下开源工具：</strong></p>
                <div class="solutions-grid">
                    ${parseResult.openSourceSolutions.map(solution => `
                        <div class="solution-card">
                            <h4>${solution.name}</h4>
                            <p>${solution.description}</p>
                            ${solution.command ? `<code>${solution.command}</code>` : ''}
                            ${solution.github ? `<a href="${solution.github}" target="_blank">GitHub</a>` : ''}
                        </div>
                    `).join('')}
                </div>
                ${parseResult.suggestions ? `
                    <div class="suggestions">
                        <h4>其他建议：</h4>
                        <ul>
                            ${parseResult.suggestions.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 切换平台信息显示
function togglePlatformInfo() {
    const details = document.getElementById('platformDetails');
    const toggle = document.getElementById('togglePlatformInfo');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        toggle.textContent = '🔽';
    } else {
        details.style.display = 'none';
        toggle.textContent = 'ℹ️';
    }
}

// 设置拖拽区域
function setupDropZone() {
    const dropZone = document.getElementById('dropZone');
    
    // 防止默认拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // 高亮拖拽区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // 处理文件拖拽
    dropZone.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('dropZone').classList.add('drag-over');
}

function unhighlight(e) {
    document.getElementById('dropZone').classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    // 检查是否有文件
    if (files.length > 0) {
        handleFiles(files);
    } else {
        // 检查是否有文本（可能是URL）
        const text = dt.getData('text/plain');
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
            elements.urlInput.value = text;
            handleUrlParse();
        }
    }
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            const mediaType = file.type.startsWith('video/') ? 'video' : 'audio';
            
            loadMedia(url, mediaType, file.name);
            addToPlaylist(url, file.name, mediaType);
        } else {
            showNotification(`不支持的文件格式: ${file.name}`, 'error');
        }
    });
}

// 基础功能框架已完成
console.log('基础JavaScript框架已加载');

// 加载媒体文件
function loadMedia(url, type, title, options = {}) {
    // 隐藏占位符
    elements.placeholder.style.display = 'none';
    
    // 停止当前播放
    if (currentMedia) {
        currentMedia.pause();
        currentMedia.currentTime = 0;
    }

    // 清除之前的iframe（如果有）
    const existingIframe = elements.placeholder.parentElement.querySelector('iframe');
    if (existingIframe) {
        existingIframe.remove();
    }

    // 检查是否为嵌入式链接（如YouTube embed、Bilibili embed等）
    if (url.includes('/embed/') || 
        url.includes('player.bilibili.com') || 
        options.platform === 'youtube' || 
        options.platform === 'bilibili') {
        loadEmbeddedMedia(url, title, options);
        return;
    }

    // 根据类型选择播放器
    if (type === 'video') {
        elements.audioPlayer.style.display = 'none';
        elements.videoPlayer.style.display = 'block';
        currentMedia = elements.videoPlayer;
    } else {
        elements.videoPlayer.style.display = 'none';
        elements.audioPlayer.style.display = 'block';
        currentMedia = elements.audioPlayer;
    }

    // 设置媒体源并添加错误处理
    console.log('设置媒体源:', url);
    currentMedia.src = url;
    
    // 添加加载事件监听器
    currentMedia.addEventListener('loadstart', () => {
        console.log('开始加载媒体');
        showNotification('正在加载视频...', 'info');
    });
    
    currentMedia.addEventListener('canplay', () => {
        console.log('媒体可以播放');
        showNotification('视频加载完成', 'success');
    });
    
    currentMedia.addEventListener('error', (e) => {
        console.error('媒体加载错误:', e);
        handleMediaLoadError(url, title, options);
    });
    
    currentMedia.load();

    // 显示自定义控制栏
    elements.customControls.style.display = 'block';

    // 设置媒体事件监听器
    setupMediaEventListeners();

    // 保存播放历史
    savePlayHistory({
        url: url,
        title: title,
        type: type,
        platform: options.platform,
        originalUrl: options.originalUrl,
        duration: options.duration,
        thumbnail: options.thumbnail
    });

    showNotification(`已加载: ${title}`, 'success');
}

// 处理媒体加载错误
function handleMediaLoadError(url, title, options) {
    console.log('处理媒体加载错误:', { url, title, options });
    
    // 如果是通过yt-dlp解析的Bilibili视频，尝试使用嵌入式播放器作为备用方案
    if (options.platform === 'bilibili' && options.originalUrl) {
        console.log('尝试使用Bilibili嵌入式播放器');
        
        // 提取视频ID
        const videoId = extractBilibiliVideoId(options.originalUrl);
        if (videoId) {
            let embedUrl;
            if (videoId.startsWith('BV')) {
                embedUrl = `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=1`;
            } else if (videoId.startsWith('av')) {
                const aid = videoId.replace('av', '');
                embedUrl = `https://player.bilibili.com/player.html?aid=${aid}&autoplay=1`;
            }
            
            if (embedUrl) {
                showNotification('直接播放失败，使用嵌入式播放器', 'warning');
                loadEmbeddedMedia(embedUrl, title, { ...options, note: '使用嵌入式播放器' });
                return;
            }
        }
    }
    
    // 显示错误信息和建议
    elements.placeholder.style.display = 'block';
    elements.videoPlayer.style.display = 'none';
    elements.audioPlayer.style.display = 'none';
    elements.customControls.style.display = 'none';
    
    elements.placeholder.innerHTML = `
        <div class="error-container" style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <h3 style="color: #333; margin-bottom: 10px;">视频加载失败</h3>
            <p style="margin-bottom: 10px;"><strong>标题:</strong> ${title}</p>
            <p style="margin-bottom: 20px;"><strong>原因:</strong> 视频源无法访问或格式不支持</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 15px;">建议解决方案:</h4>
                <ul style="text-align: left; display: inline-block;">
                    <li>检查网络连接</li>
                    <li>尝试刷新页面</li>
                    <li>使用其他视频链接</li>
                    ${options.originalUrl ? `<li><a href="${options.originalUrl}" target="_blank" style="color: #007bff;">在原网站观看</a></li>` : ''}
                </ul>
            </div>
            <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">重试</button>
        </div>
    `;
    
    showNotification(`视频加载失败: ${title}`, 'error');
}

// 显示嵌入式视频下载选项
function showEmbeddedVideoDownloadOptions(mediaInfo) {
    console.log('显示嵌入式视频下载选项:', mediaInfo);
    
    const platform = mediaInfo.platform || 'unknown';
    const title = mediaInfo.title || '未知视频';
    const originalUrl = mediaInfo.originalUrl || mediaInfo.url;
    
    let downloadOptions = [];
    let platformName = '';
    let instructions = '';
    
    switch (platform) {
        case 'bilibili':
            platformName = 'Bilibili';
            downloadOptions = [
                {
                    name: 'yt-dlp',
                    description: '推荐的命令行工具，支持多种格式',
                    command: `yt-dlp "${originalUrl}"`,
                    install: 'pip install yt-dlp',
                    url: 'https://github.com/yt-dlp/yt-dlp'
                },
                {
                    name: 'you-get',
                    description: 'Python工具，专门支持中国视频网站',
                    command: `you-get "${originalUrl}"`,
                    install: 'pip install you-get',
                    url: 'https://github.com/soimort/you-get'
                },
                {
                    name: 'BBDown',
                    description: '专门的Bilibili下载工具',
                    command: `BBDown "${originalUrl}"`,
                    install: '从GitHub下载可执行文件',
                    url: 'https://github.com/nilaoda/BBDown'
                },
                {
                    name: '后端API下载',
                    description: '使用本地yt-dlp服务下载',
                    command: '点击下方按钮尝试API下载',
                    install: '确保后端服务正在运行',
                    url: null,
                    isAction: true
                }
            ];
            instructions = 'Bilibili视频由于版权保护，无法直接下载。推荐使用以下工具：';
            break;
            
        case 'youtube':
            platformName = 'YouTube';
            downloadOptions = [
                {
                    name: 'yt-dlp',
                    description: '最强大的YouTube下载工具',
                    command: `yt-dlp "${originalUrl}"`,
                    install: 'pip install yt-dlp',
                    url: 'https://github.com/yt-dlp/yt-dlp'
                },
                {
                    name: '在线下载网站',
                    description: '使用在线YouTube下载服务',
                    command: '复制视频链接到下载网站',
                    install: '无需安装，直接使用',
                    url: null
                }
            ];
            instructions = 'YouTube视频可以使用以下方式下载：';
            break;
            
        default:
            platformName = '当前平台';
            downloadOptions = [
                {
                    name: 'yt-dlp',
                    description: '通用视频下载工具',
                    command: `yt-dlp "${originalUrl}"`,
                    install: 'pip install yt-dlp',
                    url: 'https://github.com/yt-dlp/yt-dlp'
                }
            ];
            instructions = '嵌入式视频无法直接下载，推荐使用：';
            break;
    }
    
    // 创建下载选项模态框
    const modal = document.createElement('div');
    modal.className = 'download-options-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📥 ${platformName}视频下载选项</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="video-info">
                    <h4>📺 ${title}</h4>
                    <p><strong>原始链接:</strong> <a href="${originalUrl}" target="_blank">${originalUrl}</a></p>
                </div>
                
                <div class="instructions">
                    <p>${instructions}</p>
                </div>
                
                <div class="download-options">
                    ${downloadOptions.map((option, index) => `
                        <div class="download-option">
                            <div class="option-header">
                                <h4>${option.name}</h4>
                                <span class="option-description">${option.description}</span>
                            </div>
                            <div class="option-details">
                                <div class="command-section">
                                    <strong>使用方法:</strong>
                                    <div class="command-box">
                                        <code>${option.command}</code>
                                        <button onclick="copyToClipboard('${option.command.replace(/'/g, "\\'")}', this)" class="copy-btn">复制</button>
                                    </div>
                                </div>
                                <div class="install-section">
                                    <strong>安装方法:</strong> ${option.install}
                                </div>
                                ${option.url ? `
                                    <div class="link-section">
                                        <a href="${option.url}" target="_blank" class="external-link">📖 查看文档</a>
                                    </div>
                                ` : ''}
                                ${option.isAction ? `
                                    <div class="action-section">
                                        <button onclick="tryBackendDownload('${originalUrl}', '${title}')" class="action-btn">🚀 尝试下载</button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-note">
                    <h4>⚠️ 重要提醒</h4>
                    <ul>
                        <li>请遵守相关平台的使用条款和版权规定</li>
                        <li>仅用于个人学习和研究目的</li>
                        <li>使用第三方工具时注意安全</li>
                        <li>某些视频可能需要登录或有地区限制</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // ESC键关闭
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    showNotification(`${platformName}视频下载选项已显示`, 'info');
            platformName = 'YouTube';
            downloadOptions = [
                {
                    name: 'yt-dlp',
                    description: '最强大的YouTube下载工具',
                    command: `yt-dlp "${originalUrl}"`,
                    install: 'pip install yt-dlp',
                    url: 'https://github.com/yt-dlp/yt-dlp'
                },
                {
                    name: '在线下载网站',
                    description: '使用在线YouTube下载服务',
                    command: '复制视频链接到下载网站',
                    install: '无需安装，直接使用',
                    url: null
                }
            ];
            instructions = 'YouTube视频可以使用以下方式下载：';
            break;
            
        default:
            platformName = '当前平台';
            downloadOptions = [
                {
                    name: 'yt-dlp',
                    description: '通用视频下载工具',
                    command: `yt-dlp "${originalUrl}"`,
                    install: 'pip install yt-dlp',
                    url: 'https://github.com/yt-dlp/yt-dlp'
                }
            ];
            instructions = '嵌入式视频无法直接下载，推荐使用：';
            break;
    }
    
    // 创建下载选项模态框
    const modal = document.createElement('div');
    modal.className = 'download-options-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📥 ${platformName}视频下载选项</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="video-info">
                    <h4>📺 ${title}</h4>
                    <p><strong>原始链接:</strong> <a href="${originalUrl}" target="_blank">${originalUrl}</a></p>
                </div>
                
                <div class="instructions">
                    <p>${instructions}</p>
                </div>
                
                <div class="download-options">
                    ${downloadOptions.map((option, index) => `
                        <div class="download-option">
                            <div class="option-header">
                                <h4>${option.name}</h4>
                                <span class="option-description">${option.description}</span>
                            </div>
                            <div class="option-details">
                                <div class="command-section">
                                    <strong>使用方法:</strong>
                                    <div class="command-box">
                                        <code>${option.command}</code>
                                        <button onclick="copyToClipboard('${option.command.replace(/'/g, "\\'")}', this)" class="copy-btn">复制</button>
                                    </div>
                                </div>
                                <div class="install-section">
                                    <strong>安装方法:</strong> ${option.install}
                                </div>
                                ${option.url ? `
                                    <div class="link-section">
                                        <a href="${option.url}" target="_blank" class="external-link">📖 查看文档</a>
                                    </div>
                                ` : ''}
                                ${option.action ? `
                                    <div class="action-section">
                                        <button onclick="downloadOptions[${index}].action()" class="action-btn">🚀 尝试下载</button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-note">
                    <h4>⚠️ 重要提醒</h4>
                    <ul>
                        <li>请遵守相关平台的使用条款和版权规定</li>
                        <li>仅用于个人学习和研究目的</li>
                        <li>使用第三方工具时注意安全</li>
                        <li>某些视频可能需要登录或有地区限制</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 保存下载选项到全局变量供按钮使用
    window.downloadOptions = downloadOptions;
    
    // 添加关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // ESC键关闭
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
                    url: 'https://github.com/yt-dlp/yt-dlp'
                }
            ];
            instructions = '嵌入式视频无法直接下载，建议使用：';
    }
    
    // 创建下载选项模态框
    const modal = document.createElement('div');
    modal.className = 'download-options-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📥 ${platformName}视频下载选项</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="video-info">
                    <h4>🎬 ${title}</h4>
                    <p><strong>平台:</strong> ${platformName}</p>
                    <p><strong>链接:</strong> <a href="${originalUrl}" target="_blank">${originalUrl}</a></p>
                </div>
                
                <div class="download-notice">
                    <p><strong>ℹ️ 说明:</strong> ${instructions}</p>
                </div>
                
                <div class="download-methods">
                    ${downloadOptions.map((option, index) => `
                        <div class="download-method">
                            <div class="method-header">
                                <h4>${index + 1}. ${option.name}</h4>
                                ${option.url ? `<a href="${option.url}" target="_blank" class="method-link">📖 文档</a>` : ''}
                            </div>
                            <p class="method-description">${option.description}</p>
                            ${option.install ? `<p class="method-install"><strong>安装:</strong> <code>${option.install}</code></p>` : ''}
                            <p class="method-command"><strong>使用:</strong> <code>${option.command}</code></p>
                            <button onclick="copyToClipboard('${option.command.replace(/'/g, "\\'")}', this)" class="copy-btn">📋 复制命令</button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="download-tips">
                    <h4>💡 使用提示:</h4>
                    <ul>
                        <li>推荐使用 <strong>yt-dlp</strong>，功能最强大且更新频繁</li>
                        <li>命令行工具需要先安装Python环境</li>
                        <li>请遵守视频平台的使用条款和版权规定</li>
                        <li>仅用于个人学习和研究目的</li>
                    </ul>
                </div>
                
                <div class="quick-actions">
                    <button onclick="window.open('${originalUrl}', '_blank')" class="action-btn">🔗 在原网站观看</button>
                    <button onclick="testBackendDownload('${originalUrl}')" class="action-btn">🔧 尝试后端下载</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    showNotification(`${platformName}视频下载选项已显示`, 'info');
}

// 复制到剪贴板
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ 已复制';
        button.style.background = '#48bb78';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
        
        showNotification('命令已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制', 'error');
    });
}

// 测试后端下载
async function testBackendDownload(url) {
    try {
        showNotification('正在尝试后端下载...', 'info');
        
        const response = await fetch('http://localhost:5001/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showNotification('后端下载成功！请检查downloads文件夹', 'success');
            } else {
                showNotification(`后端下载失败: ${data.error}`, 'error');
            }
        } else {
            showNotification('后端下载服务不可用', 'error');
        }
    } catch (error) {
        console.error('后端下载测试失败:', error);
        showNotification('后端下载服务连接失败', 'error');
    }
}

// 加载嵌入式媒体（如YouTube）
function loadEmbeddedMedia(url, title, options = {}) {
    console.log('加载嵌入式媒体:', { url, title, options });
    
    // 保存当前媒体信息用于下载
    currentMediaInfo = {
        url: url,
        title: title,
        originalUrl: options.originalUrl || url,
        platform: options.platform,
        type: 'embedded',
        ...options
    };
    
    // 隐藏原生播放器
    elements.videoPlayer.style.display = 'none';
    elements.audioPlayer.style.display = 'none';
    
    // 显示自定义控制栏（用于下载按钮等）
    elements.customControls.style.display = 'block';

    // 创建iframe容器
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'iframe-container';
    
    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.borderRadius = '15px';
    
    iframeContainer.appendChild(iframe);

    // 插入iframe到媒体容器
    const mediaContainer = elements.placeholder.parentElement;
    mediaContainer.appendChild(iframe);

    // 设置当前媒体为null（因为使用iframe）
    currentMedia = null;

    // 显示平台信息
    if (options.platform) {
        showNotification(`已加载${getPlatformName(options.platform)}视频: ${title}`, 'success');
    } else {
        showNotification(`已加载: ${title}`, 'success');
    }
}

// 设置媒体播放器事件监听器
function setupMediaEventListeners() {
    if (!currentMedia) return;

    // 移除之前的监听器
    currentMedia.removeEventListener('loadedmetadata', updateDuration);
    currentMedia.removeEventListener('timeupdate', updateProgress);
    currentMedia.removeEventListener('ended', handleMediaEnded);
    currentMedia.removeEventListener('error', handleMediaError);

    // 添加新的监听器
    currentMedia.addEventListener('loadedmetadata', updateDuration);
    currentMedia.addEventListener('timeupdate', updateProgress);
    currentMedia.addEventListener('ended', handleMediaEnded);
    currentMedia.addEventListener('error', handleMediaError);
}

// 更新时长显示
function updateDuration() {
    if (currentMedia && currentMedia.duration) {
        elements.duration.textContent = formatTime(currentMedia.duration);
        elements.progressBar.max = currentMedia.duration;
    }
}

// 更新播放进度
function updateProgress() {
    if (currentMedia) {
        elements.currentTime.textContent = formatTime(currentMedia.currentTime);
        elements.progressBar.value = currentMedia.currentTime;
    }
}

// 播放/暂停切换
function togglePlayPause() {
    if (!currentMedia) return;

    if (currentMedia.paused) {
        currentMedia.play();
        elements.playPauseBtn.querySelector('.play-icon').style.display = 'none';
        elements.playPauseBtn.querySelector('.pause-icon').style.display = 'inline';
    } else {
        currentMedia.pause();
        elements.playPauseBtn.querySelector('.play-icon').style.display = 'inline';
        elements.playPauseBtn.querySelector('.pause-icon').style.display = 'none';
    }
}

// 处理进度条变化
function handleProgressChange() {
    if (currentMedia) {
        currentMedia.currentTime = elements.progressBar.value;
    }
}

// 处理音量变化
function handleVolumeChange() {
    if (currentMedia) {
        currentMedia.volume = elements.volumeBar.value / 100;
        updateMuteButton();
    }
}

// 静音切换
function toggleMute() {
    if (!currentMedia) return;

    if (currentMedia.muted) {
        currentMedia.muted = false;
        elements.volumeBar.value = currentMedia.volume * 100;
    } else {
        currentMedia.muted = true;
        elements.volumeBar.value = 0;
    }
    updateMuteButton();
}

// 更新静音按钮显示
function updateMuteButton() {
    if (!currentMedia) return;

    if (currentMedia.muted || currentMedia.volume === 0) {
        elements.muteBtn.textContent = '🔇';
    } else if (currentMedia.volume < 0.5) {
        elements.muteBtn.textContent = '🔉';
    } else {
        elements.muteBtn.textContent = '🔊';
    }
}

// 处理媒体播放结束
function handleMediaEnded() {
    // 重置播放按钮
    elements.playPauseBtn.querySelector('.play-icon').style.display = 'inline';
    elements.playPauseBtn.querySelector('.pause-icon').style.display = 'none';

    // 使用增强的结束处理（如果可用）
    if (typeof handleMediaEndedEnhanced === 'function') {
        handleMediaEndedEnhanced();
    } else {
        // 自动播放下一首（如果有）
        playNext();
    }
}

// 处理媒体加载错误
function handleMediaError(event) {
    console.error('媒体加载错误:', event);
    showNotification('媒体文件加载失败，请检查文件格式或网络连接', 'error');
}

// 全局变量存储当前播放的媒体信息
let currentMediaInfo = null;

// 全局变量存储当前媒体信息
let currentMediaInfo = null;

// 下载当前媒体
async function handleDownload() {
    console.log('下载按钮被点击');
    console.log('currentMedia:', currentMedia);
    console.log('currentMediaInfo:', currentMediaInfo);
    
    // 优先检查是否有原始URL可以通过后端下载
    if (currentMediaInfo && currentMediaInfo.originalUrl) {
        console.log('尝试使用后端API下载原始URL:', currentMediaInfo.originalUrl);
        const success = await tryBackendDownload(currentMediaInfo.originalUrl, currentMediaInfo.title);
        if (success) {
            return;
        }
    }
    
    // 检查是否有嵌入式播放器正在播放
    const iframe = document.querySelector('.media-container iframe');
    if (iframe && currentMediaInfo) {
        console.log('检测到嵌入式播放器，显示下载选项');
        showEmbeddedVideoDownloadOptions(currentMediaInfo);
        return;
    }
    
    // 检查是否有直接媒体播放
    if (!currentMedia || !currentMedia.src) {
        showNotification('没有可下载的媒体文件', 'error');
        return;
    }

    const mediaUrl = currentMedia.src;
    const filename = getFilenameFromUrl(mediaUrl);

    // 检查是否为嵌入式链接（如YouTube、Vimeo等）
    if (mediaUrl.includes('/embed/') || 
        mediaUrl.includes('youtube.com/embed') || 
        mediaUrl.includes('player.vimeo.com') ||
        mediaUrl.includes('player.bilibili.com') ||
        mediaUrl.includes('dailymotion.com/embed')) {
        
        showDownloadAlternatives(mediaUrl);
        return;
    }

    // 检查是否为blob URL（本地文件）
    if (mediaUrl.startsWith('blob:')) {
        downloadBlobUrl(mediaUrl, filename);
        return;
    }

    // 检查文件大小限制（可选）
    try {
        const sizeCheck = await checkFileSize(mediaUrl);
        if (sizeCheck.tooLarge) {
            const proceed = confirm(`文件较大 (${formatFileSize(sizeCheck.size)})，下载可能需要较长时间。是否继续？`);
            if (!proceed) {
                return;
            }
        }
    } catch (error) {
        console.warn('无法检查文件大小:', error);
    }

    // 检查是否为同源URL或支持CORS
    try {
        await downloadWithProgress(mediaUrl, filename);
    } catch (error) {
        console.error('高级下载失败，尝试简单下载:', error);
        fallbackDownload(mediaUrl, filename);
    }
}

// 下载取消控制
let downloadController = null;

// 使用进度跟踪下载
async function downloadWithProgress(url, filename) {
    try {
        // 创建新的AbortController用于取消下载
        downloadController = new AbortController();
        
        showDownloadModal(filename);
        updateDownloadStatus('正在连接服务器...', 'loading');

        const response = await fetch(url, {
            signal: downloadController.signal
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        
        updateDownloadSize(total);
        updateDownloadStatus('正在下载...', 'loading');

        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;
        let startTime = Date.now();

        while (true) {
            // 检查是否被取消
            if (downloadController.signal.aborted) {
                throw new Error('下载已取消');
            }
            
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            received += value.length;
            
            // 更新进度
            if (total > 0) {
                const percent = Math.round((received / total) * 100);
                updateDownloadProgress(percent);
                
                // 计算下载速度
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = received / elapsed;
                updateDownloadSpeed(speed);
            }
        }

        // 创建Blob并下载
        const blob = new Blob(chunks);
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(blobUrl);
        
        updateDownloadStatus('下载完成！', 'success');
        showNotification('文件下载完成', 'success');
        
        setTimeout(hideDownloadModal, 2000);
        
    } catch (error) {
        if (error.name === 'AbortError' || error.message === '下载已取消') {
            updateDownloadStatus('下载已取消', 'error');
            showNotification('下载已取消', 'warning');
        } else {
            updateDownloadStatus(`下载失败: ${error.message}`, 'error');
            throw error;
        }
    } finally {
        downloadController = null;
    }
}

// 下载blob URL（本地文件）
function downloadBlobUrl(blobUrl, filename) {
    try {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('开始下载本地文件...', 'success');
    } catch (error) {
        console.error('Blob下载错误:', error);
        showNotification('本地文件下载失败', 'error');
    }
}

// 备用下载方法
function fallbackDownload(url, filename) {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('开始下载...（如果没有开始，请右键保存）', 'warning');
    } catch (error) {
        console.error('备用下载失败:', error);
        showNotification('下载失败，请右键点击播放器选择"保存视频"', 'error');
    }
}

// 显示下载模态框
function showDownloadModal(filename) {
    const modal = document.getElementById('downloadModal');
    const filenameEl = document.getElementById('downloadFilename');
    
    filenameEl.textContent = filename;
    modal.style.display = 'flex';
    
    // 重置进度
    updateDownloadProgress(0);
    updateDownloadSize(0);
    updateDownloadSpeed(0);
}

// 隐藏下载模态框
function hideDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.style.display = 'none';
}

// 更新下载进度
function updateDownloadProgress(percent) {
    const progressFill = document.getElementById('downloadProgressFill');
    const percentText = document.getElementById('downloadPercent');
    
    progressFill.style.width = `${percent}%`;
    percentText.textContent = `${percent}%`;
}

// 更新下载大小显示
function updateDownloadSize(bytes) {
    const sizeEl = document.getElementById('downloadSize');
    
    if (bytes > 0) {
        const size = formatFileSize(bytes);
        sizeEl.textContent = `大小: ${size}`;
    } else {
        sizeEl.textContent = '大小: 未知';
    }
}

// 更新下载速度
function updateDownloadSpeed(bytesPerSecond) {
    const speedEl = document.getElementById('downloadSpeed');
    const speed = formatFileSize(bytesPerSecond);
    speedEl.textContent = `${speed}/s`;
}

// 更新下载状态
function updateDownloadStatus(message, type = 'loading') {
    const statusEl = document.getElementById('downloadStatus');
    statusEl.textContent = message;
    statusEl.className = `download-status ${type}`;
}

// 检查文件大小
async function checkFileSize(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
            return { size: 0, tooLarge: false };
        }

        const contentLength = response.headers.get('content-length');
        const size = contentLength ? parseInt(contentLength, 10) : 0;
        
        // 设置大文件阈值为50MB
        const threshold = 50 * 1024 * 1024;
        const tooLarge = size > threshold;
        
        return { size, tooLarge };
    } catch (error) {
        console.warn('无法获取文件大小:', error);
        return { size: 0, tooLarge: false };
    }
}

// 显示下载替代方案
function showDownloadAlternatives(mediaUrl) {
    let platform = '未知平台';
    let suggestions = [];
    let additionalInfo = '';
    
    if (mediaUrl.includes('youtube.com/embed')) {
        platform = 'YouTube';
        suggestions = [
            '使用 yt-dlp 工具: <code>yt-dlp "视频URL"</code>',
            '使用浏览器扩展如 Video DownloadHelper',
            '访问原始YouTube页面并使用第三方下载网站',
            '使用在线下载服务（注意选择可信网站）'
        ];
        additionalInfo = 'YouTube是最容易下载的平台之一，推荐使用yt-dlp工具。';
    } else if (mediaUrl.includes('player.vimeo.com')) {
        platform = 'Vimeo';
        suggestions = [
            '使用 yt-dlp 工具: <code>yt-dlp "视频URL"</code>',
            '访问原始Vimeo页面查看下载选项',
            '使用专门的Vimeo下载工具',
            '检查视频是否提供原生下载选项'
        ];
        additionalInfo = 'Vimeo部分视频提供原生下载选项，请先检查原始页面。';
    } else if (mediaUrl.includes('player.bilibili.com')) {
        platform = 'Bilibili';
        suggestions = [
            '使用 you-get 工具: <code>you-get "视频URL"</code>',
            '使用 yt-dlp 工具: <code>yt-dlp "视频URL"</code>',
            '使用 BBDown 专门工具',
            '使用浏览器扩展如 Bilibili Helper',
            '使用在线Bilibili下载网站'
        ];
        additionalInfo = 'Bilibili需要特殊工具，推荐使用you-get或BBDown。某些视频可能需要登录。';
    } else if (mediaUrl.includes('douyin.com') || mediaUrl.includes('iesdouyin.com')) {
        platform = '抖音';
        suggestions = [
            '使用 yt-dlp 工具: <code>yt-dlp "分享链接"</code>',
            '使用专门的抖音下载工具',
            '在抖音App中保存到本地',
            '使用第三方抖音下载网站（注意安全）',
            '截屏录制（质量较低）'
        ];
        additionalInfo = '抖音由于反爬虫机制，下载较为困难。建议使用最新版本的下载工具。';
    } else if (mediaUrl.includes('dailymotion.com/embed')) {
        platform = 'Dailymotion';
        suggestions = [
            '使用 yt-dlp 工具: <code>yt-dlp "视频URL"</code>',
            '访问原始Dailymotion页面',
            '使用第三方下载网站'
        ];
    }
    
    // 创建自定义模态框显示建议
    const modal = document.createElement('div');
    modal.className = 'download-alternatives-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${platform} 下载建议</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>${platform}视频无法直接下载。</strong></p>
                ${additionalInfo ? `<p class="platform-info">${additionalInfo}</p>` : ''}
                <p><strong>推荐的下载方法：</strong></p>
                <ol class="suggestions-list">
                    ${suggestions.map(s => `<li>${s}</li>`).join('')}
                </ol>
                ${platform === 'Bilibili' ? `
                    <div class="api-solutions">
                        <p><strong>🔧 开源API解决方案：</strong></p>
                        <div class="solution-grid">
                            <div class="solution-item">
                                <h4>you-get</h4>
                                <p>Python工具，支持B站视频下载</p>
                                <code>pip install you-get</code>
                            </div>
                            <div class="solution-item">
                                <h4>yt-dlp</h4>
                                <p>youtube-dl增强版</p>
                                <code>pip install yt-dlp</code>
                            </div>
                            <div class="solution-item">
                                <h4>BBDown</h4>
                                <p>专门的B站下载工具</p>
                                <a href="https://github.com/nilaoda/BBDown" target="_blank">GitHub</a>
                            </div>
                            <div class="solution-item">
                                <h4>bilibili-API-collect</h4>
                                <p>B站API接口文档</p>
                                <a href="https://github.com/SocialSisterYi/bilibili-API-collect" target="_blank">GitHub</a>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <div class="modal-note">
                    <p><strong>⚠️ 重要提醒：</strong></p>
                    <ul>
                        <li>请遵守相关平台的使用条款和版权规定</li>
                        <li>仅用于个人学习和研究目的</li>
                        <li>使用第三方工具时注意安全</li>
                    </ul>
                </div>
                <div class="tool-installation">
                    <p><strong>工具安装提示：</strong></p>
                    <p>yt-dlp安装: <code>pip install yt-dlp</code></p>
                    <p>you-get安装: <code>pip install you-get</code></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 设置下载模态框事件
function setupDownloadModal() {
    const cancelBtn = document.getElementById('cancelDownload');
    const modal = document.getElementById('downloadModal');
    
    // 取消下载按钮
    cancelBtn.addEventListener('click', () => {
        cancelDownload();
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            cancelDownload();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            cancelDownload();
        }
    });
}

// 取消下载
function cancelDownload() {
    if (downloadController) {
        downloadController.abort();
    }
    hideDownloadModal();
}

// 下载播放列表中的指定项目
async function downloadPlaylistItem(index) {
    if (index < 0 || index >= playlist.length) return;
    
    const item = playlist[index];
    const mediaUrl = item.url;
    const filename = item.title || getFilenameFromUrl(mediaUrl);

    // 检查是否为嵌入式链接
    if (mediaUrl.includes('/embed/') || mediaUrl.includes('youtube.com/embed')) {
        showNotification('嵌入式视频无法直接下载', 'warning');
        return;
    }

    // 检查是否为blob URL
    if (mediaUrl.startsWith('blob:')) {
        downloadBlobUrl(mediaUrl, filename);
        return;
    }

    // 尝试高级下载
    try {
        await downloadWithProgress(mediaUrl, filename);
    } catch (error) {
        console.error('播放列表项下载失败，尝试备用方案:', error);
        fallbackDownload(mediaUrl, filename);
    }
}

// 下载播放列表中的所有项目
async function downloadAllPlaylistItems() {
    if (playlist.length === 0) {
        showNotification('播放列表为空', 'warning');
        return;
    }

    const downloadableItems = playlist.filter(item => 
        !item.url.includes('/embed/') && !item.url.includes('youtube.com/embed')
    );

    if (downloadableItems.length === 0) {
        showNotification('播放列表中没有可下载的项目', 'warning');
        return;
    }

    if (downloadableItems.length !== playlist.length) {
        const skipped = playlist.length - downloadableItems.length;
        showNotification(`将跳过 ${skipped} 个嵌入式视频，开始下载其余 ${downloadableItems.length} 个文件`, 'info');
    }

    showNotification(`开始批量下载 ${downloadableItems.length} 个文件...`, 'info');

    // 逐个下载，避免同时下载太多文件
    for (let i = 0; i < downloadableItems.length; i++) {
        const item = downloadableItems[i];
        const filename = item.title || getFilenameFromUrl(item.url);
        
        try {
            showNotification(`正在下载 ${i + 1}/${downloadableItems.length}: ${filename}`, 'info');
            
            if (item.url.startsWith('blob:')) {
                downloadBlobUrl(item.url, filename);
            } else {
                await downloadWithProgress(item.url, filename);
            }
            
            // 下载间隔，避免服务器压力
            if (i < downloadableItems.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error(`下载失败: ${filename}`, error);
            fallbackDownload(item.url, filename);
        }
    }

    showNotification('批量下载完成！', 'success');
}

// 全屏切换
function toggleFullscreen() {
    if (!currentMedia) return;

    if (!document.fullscreenElement) {
        if (currentMedia.requestFullscreen) {
            currentMedia.requestFullscreen();
        } else if (currentMedia.webkitRequestFullscreen) {
            currentMedia.webkitRequestFullscreen();
        } else if (currentMedia.msRequestFullscreen) {
            currentMedia.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// 处理全屏状态变化
function handleFullscreenChange() {
    const isFullscreen = !!(document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement);
    
    if (elements.fullscreenBtn) {
        elements.fullscreenBtn.innerHTML = isFullscreen ? '⛶' : '⛶';
        elements.fullscreenBtn.title = isFullscreen ? '退出全屏 (F)' : '全屏播放 (F)';
    }
    
    // 在全屏模式下隐藏/显示控制栏
    if (elements.customControls) {
        if (isFullscreen) {
            elements.customControls.classList.add('fullscreen-controls');
            // 3秒后自动隐藏控制栏
            setTimeout(() => {
                if (document.fullscreenElement) {
                    elements.customControls.classList.add('controls-hidden');
                }
            }, 3000);
        } else {
            elements.customControls.classList.remove('fullscreen-controls', 'controls-hidden');
        }
    }
    
    showNotification(isFullscreen ? '已进入全屏模式' : '已退出全屏模式', 'info');
}

// 键盘快捷键处理
function handleKeyboardShortcuts(event) {
    // 如果用户正在输入框中输入，不处理快捷键
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // 防止默认行为（某些情况下）
    const preventDefault = () => {
        event.preventDefault();
        event.stopPropagation();
    };
    
    switch (event.code) {
        case 'Space': // 空格键 - 播放/暂停
            preventDefault();
            togglePlayPause();
            break;
            
        case 'KeyF': // F键 - 全屏切换
            preventDefault();
            toggleFullscreen();
            break;
            
        case 'KeyM': // M键 - 静音切换
            preventDefault();
            toggleMute();
            break;
            
        case 'ArrowLeft': // 左箭头 - 后退10秒
            preventDefault();
            if (currentMedia) {
                currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
                showNotification('后退10秒', 'info');
            }
            break;
            
        case 'ArrowRight': // 右箭头 - 前进10秒
            preventDefault();
            if (currentMedia) {
                currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
                showNotification('前进10秒', 'info');
            }
            break;
            
        case 'ArrowUp': // 上箭头 - 音量增加
            preventDefault();
            if (currentMedia) {
                const newVolume = Math.min(1, currentMedia.volume + 0.1);
                currentMedia.volume = newVolume;
                elements.volumeBar.value = newVolume * 100;
                showNotification(`音量: ${Math.round(newVolume * 100)}%`, 'info');
            }
            break;
            
        case 'ArrowDown': // 下箭头 - 音量减少
            preventDefault();
            if (currentMedia) {
                const newVolume = Math.max(0, currentMedia.volume - 0.1);
                currentMedia.volume = newVolume;
                elements.volumeBar.value = newVolume * 100;
                showNotification(`音量: ${Math.round(newVolume * 100)}%`, 'info');
            }
            break;
            
        case 'Digit1': // 数字键1 - 0.5x速度
            preventDefault();
            setPlaybackSpeed(0.5);
            break;
            
        case 'Digit2': // 数字键2 - 1x速度
            preventDefault();
            setPlaybackSpeed(1);
            break;
            
        case 'Digit3': // 数字键3 - 1.25x速度
            preventDefault();
            setPlaybackSpeed(1.25);
            break;
            
        case 'Digit4': // 数字键4 - 1.5x速度
            preventDefault();
            setPlaybackSpeed(1.5);
            break;
            
        case 'Digit5': // 数字键5 - 2x速度
            preventDefault();
            setPlaybackSpeed(2);
            break;
            
        case 'KeyN': // N键 - 下一个
            preventDefault();
            playNext();
            break;
            
        case 'KeyP': // P键 - 上一个
            preventDefault();
            playPrevious();
            break;
            
        case 'Escape': // ESC键 - 退出全屏
            if (document.fullscreenElement) {
                preventDefault();
                toggleFullscreen();
            }
            break;
            
        case 'KeyH': // H键 - 显示帮助
            preventDefault();
            showKeyboardShortcutsHelp();
            break;
    }
}// 播
放列表管理功能

// 添加到播放列表
function addToPlaylist(url, title, type) {
    const item = {
        url: url,
        title: title,
        type: type,
        id: Date.now() + Math.random()
    };

    playlist.push(item);
    renderPlaylist();
    
    // 如果这是第一个项目，设置为当前播放
    if (playlist.length === 1) {
        currentIndex = 0;
        updatePlaylistActiveItem();
    }
}

// 渲染播放列表
function renderPlaylist() {
    elements.playlistEl.innerHTML = '';

    playlist.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.dataset.index = index;

        li.innerHTML = `
            <div class="playlist-item-drag-handle" title="拖拽重排序">⋮⋮</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${item.title}</div>
                <div class="playlist-item-url">${item.url}</div>
            </div>
            <div class="playlist-item-actions">
                <button class="playlist-item-download" onclick="downloadPlaylistItem(${index})" title="下载">⬇</button>
                <button class="playlist-item-remove" onclick="removeFromPlaylist(${index})" title="删除">×</button>
            </div>
        `;

        // 添加拖拽功能
        li.draggable = true;
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);

        // 点击播放
        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('playlist-item-remove')) {
                playPlaylistItem(index);
            }
        });

        elements.playlistEl.appendChild(li);
    });

    updatePlaylistActiveItem();
}

// 播放播放列表中的指定项目
function playPlaylistItem(index) {
    if (index < 0 || index >= playlist.length) return;

    currentIndex = index;
    const item = playlist[index];
    loadMedia(item.url, item.type, item.title);
    updatePlaylistActiveItem();
}

// 更新播放列表中的活跃项目
function updatePlaylistActiveItem() {
    const items = elements.playlistEl.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 从播放列表中移除项目
function removeFromPlaylist(index) {
    if (index < 0 || index >= playlist.length) return;

    playlist.splice(index, 1);

    // 调整当前索引
    if (index < currentIndex) {
        currentIndex--;
    } else if (index === currentIndex && playlist.length > 0) {
        // 如果删除的是当前播放项目，播放下一个或上一个
        if (currentIndex >= playlist.length) {
            currentIndex = playlist.length - 1;
        }
        if (playlist.length > 0) {
            const item = playlist[currentIndex];
            loadMedia(item.url, item.type, item.title);
        }
    } else if (playlist.length === 0) {
        // 如果播放列表为空，重置播放器
        resetPlayer();
    }

    renderPlaylist();
}

// 播放下一首
function playNext() {
    if (playlist.length === 0) return;

    currentIndex = (currentIndex + 1) % playlist.length;
    const item = playlist[currentIndex];
    loadMedia(item.url, item.type, item.title);
    updatePlaylistActiveItem();
}

// 播放上一首
function playPrevious() {
    if (playlist.length === 0) return;

    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const item = playlist[currentIndex];
    loadMedia(item.url, item.type, item.title);
    updatePlaylistActiveItem();
}

// 清空播放列表
function clearPlaylist() {
    playlist = [];
    currentIndex = 0;
    renderPlaylist();
    resetPlayer();
    showNotification('播放列表已清空', 'success');
}

// 拖拽重排序相关变量
let draggedIndex = -1;

// 拖拽开始
function handleDragStart(e) {
    draggedIndex = parseInt(e.target.dataset.index);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

// 拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const targetIndex = parseInt(e.currentTarget.dataset.index);
    if (targetIndex !== draggedIndex) {
        e.currentTarget.classList.add('drag-over');
    }
}

// 拖拽放置
function handleDrop(e) {
    e.preventDefault();
    const targetIndex = parseInt(e.currentTarget.dataset.index);
    
    if (draggedIndex !== -1 && targetIndex !== draggedIndex) {
        // 重新排序播放列表
        const draggedItem = playlist[draggedIndex];
        playlist.splice(draggedIndex, 1);
        playlist.splice(targetIndex, 0, draggedItem);
        
        // 更新当前播放索引
        if (currentIndex === draggedIndex) {
            currentIndex = targetIndex;
        } else if (draggedIndex < currentIndex && targetIndex >= currentIndex) {
            currentIndex--;
        } else if (draggedIndex > currentIndex && targetIndex <= currentIndex) {
            currentIndex++;
        }
        
        renderPlaylist();
        showNotification('播放列表已重新排序', 'success');
    }
    
    // 清除拖拽状态
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// 拖拽结束
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    draggedIndex = -1;
}

// 重置播放器
function resetPlayer() {
    if (currentMedia) {
        currentMedia.pause();
        currentMedia.src = '';
        currentMedia.style.display = 'none';
    }

    elements.placeholder.style.display = 'flex';
    elements.customControls.style.display = 'none';
    
    // 重置控制按钮状态
    elements.playPauseBtn.querySelector('.play-icon').style.display = 'inline';
    elements.playPauseBtn.querySelector('.pause-icon').style.display = 'none';
    elements.currentTime.textContent = '00:00';
    elements.duration.textContent = '00:00';
    elements.progressBar.value = 0;

    currentMedia = null;
}

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // 检查是否在输入框中，如果是则不处理快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    switch(e.code) {
        case 'Space':
            e.preventDefault();
            if (currentMedia) {
                togglePlayPause();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (currentMedia) {
                currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (currentMedia) {
                currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (currentMedia) {
                elements.volumeBar.value = Math.min(100, parseInt(elements.volumeBar.value) + 10);
                handleVolumeChange();
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (currentMedia) {
                elements.volumeBar.value = Math.max(0, parseInt(elements.volumeBar.value) - 10);
                handleVolumeChange();
            }
            break;
        case 'KeyN':
            // N键：下一首
            e.preventDefault();
            playNext();
            break;
        case 'KeyP':
            // P键：上一首
            e.preventDefault();
            playPrevious();
            break;
        case 'KeyS':
            // S键：随机播放
            e.preventDefault();
            if (window.getPlayMode) {
                const currentMode = window.getPlayMode();
                if (currentMode !== 'random') {
                    // 模拟点击播放模式按钮直到到达随机模式
                    const playModeBtn = document.getElementById('playModeBtn');
                    if (playModeBtn) {
                        while (window.getPlayMode() !== 'random') {
                            playModeBtn.click();
                        }
                    }
                }
            }
            break;
        case 'KeyL':
            // L键：循环模式
            e.preventDefault();
            if (window.getPlayMode) {
                const currentMode = window.getPlayMode();
                if (currentMode !== 'loop') {
                    const playModeBtn = document.getElementById('playModeBtn');
                    if (playModeBtn) {
                        while (window.getPlayMode() !== 'loop') {
                            playModeBtn.click();
                        }
                    }
                }
            }
            break;
    }
});

console.log('在线媒体播放器完全加载完成！');

// 增强播放功能

// 播放速度控制
function createPlaybackSpeedControl() {
    const speedContainer = document.createElement('div');
    speedContainer.className = 'speed-container';
    speedContainer.innerHTML = `
        <button id="speedBtn" class="control-btn" title="播放速度">1x</button>
        <div id="speedMenu" class="speed-menu" style="display: none;">
            <div class="speed-option" data-speed="0.5">0.5x</div>
            <div class="speed-option" data-speed="0.75">0.75x</div>
            <div class="speed-option" data-speed="1" class="active">1x</div>
            <div class="speed-option" data-speed="1.25">1.25x</div>
            <div class="speed-option" data-speed="1.5">1.5x</div>
            <div class="speed-option" data-speed="2">2x</div>
        </div>
    `;

    // 插入到控制栏中
    const controlRow = document.querySelector('.control-row');
    controlRow.insertBefore(speedContainer, elements.fullscreenBtn);

    // 添加事件监听器
    const speedBtn = document.getElementById('speedBtn');
    const speedMenu = document.getElementById('speedMenu');
    const speedOptions = speedMenu.querySelectorAll('.speed-option');

    speedBtn.addEventListener('click', () => {
        speedMenu.style.display = speedMenu.style.display === 'none' ? 'block' : 'none';
    });

    speedOptions.forEach(option => {
        option.addEventListener('click', () => {
            const speed = parseFloat(option.dataset.speed);
            setPlaybackSpeed(speed);
            speedBtn.textContent = `${speed}x`;
            
            // 更新活跃状态
            speedOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            speedMenu.style.display = 'none';
        });
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (!speedContainer.contains(e.target)) {
            speedMenu.style.display = 'none';
        }
    });
}

// 设置播放速度
function setPlaybackSpeed(speed) {
    if (currentMedia) {
        currentMedia.playbackRate = speed;
        showNotification(`播放速度设置为 ${speed}x`, 'success');
    }
}

// 添加播放模式控制（循环、随机等）
function createPlayModeControl() {
    const modeContainer = document.createElement('div');
    modeContainer.className = 'mode-container';
    modeContainer.innerHTML = `
        <button id="playModeBtn" class="control-btn" title="播放模式">🔁</button>
    `;

    // 插入到播放列表区域
    const playlistHeader = document.querySelector('.playlist-header');
    playlistHeader.appendChild(modeContainer);

    const playModeBtn = document.getElementById('playModeBtn');
    let playMode = 'sequence'; // sequence, loop, random

    playModeBtn.addEventListener('click', () => {
        switch(playMode) {
            case 'sequence':
                playMode = 'loop';
                playModeBtn.textContent = '🔂';
                playModeBtn.title = '单曲循环';
                showNotification('播放模式：单曲循环', 'success');
                break;
            case 'loop':
                playMode = 'random';
                playModeBtn.textContent = '🔀';
                playModeBtn.title = '随机播放';
                showNotification('播放模式：随机播放', 'success');
                break;
            case 'random':
                playMode = 'sequence';
                playModeBtn.textContent = '🔁';
                playModeBtn.title = '顺序播放';
                showNotification('播放模式：顺序播放', 'success');
                break;
        }
    });

    // 将播放模式暴露给全局
    window.getPlayMode = () => playMode;
}

// 增强的播放结束处理
function handleMediaEndedEnhanced() {
    const playMode = window.getPlayMode ? window.getPlayMode() : 'sequence';
    
    switch(playMode) {
        case 'loop':
            // 单曲循环
            if (currentMedia) {
                currentMedia.currentTime = 0;
                currentMedia.play();
            }
            break;
        case 'random':
            // 随机播放
            if (playlist.length > 1) {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * playlist.length);
                } while (randomIndex === currentIndex && playlist.length > 1);
                playPlaylistItem(randomIndex);
            }
            break;
        default:
            // 顺序播放
            playNext();
            break;
    }
}

// 添加音频可视化（简单的音量指示器）
function createVolumeIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'volume-indicator';
    indicator.innerHTML = `
        <div class="volume-bars">
            <div class="volume-bar"></div>
            <div class="volume-bar"></div>
            <div class="volume-bar"></div>
            <div class="volume-bar"></div>
            <div class="volume-bar"></div>
        </div>
    `;

    // 插入到音量控制旁边
    const volumeContainer = document.querySelector('.volume-container');
    volumeContainer.appendChild(indicator);

    // 更新音量指示器
    function updateVolumeIndicator() {
        if (!currentMedia) return;
        
        const volume = currentMedia.muted ? 0 : currentMedia.volume;
        const bars = indicator.querySelectorAll('.volume-bar');
        
        bars.forEach((bar, index) => {
            if (index < Math.floor(volume * 5)) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    // 定期更新指示器
    setInterval(updateVolumeIndicator, 100);
}

// 添加媒体信息显示
function showMediaInfo(title, url, type) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'media-info';
    infoContainer.innerHTML = `
        <div class="media-title">${title}</div>
        <div class="media-type">${type.toUpperCase()}</div>
    `;

    // 插入到播放器上方
    const mediaContainer = document.querySelector('.media-container');
    const existingInfo = mediaContainer.querySelector('.media-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    mediaContainer.appendChild(infoContainer);

    // 3秒后淡出
    setTimeout(() => {
        infoContainer.style.opacity = '0.7';
    }, 3000);
}

// 增强的媒体加载函数
function loadMediaEnhanced(url, type, title) {
    loadMedia(url, type, title);
    showMediaInfo(title, url, type);
    
    // 保存到播放历史
    saveToHistory(url, title, type);
}

// 播放历史管理
function saveToHistory(url, title, type) {
    let history = JSON.parse(localStorage.getItem('mediaHistory') || '[]');
    
    // 避免重复
    history = history.filter(item => item.url !== url);
    
    // 添加到开头
    history.unshift({
        url: url,
        title: title,
        type: type,
        timestamp: Date.now()
    });

    // 限制历史记录数量
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem('mediaHistory', JSON.stringify(history));
}

// 获取播放历史
function getPlayHistory() {
    return JSON.parse(localStorage.getItem('mediaHistory') || '[]');
}

// 保存解析历史
function saveParseHistory(parseResult) {
    let parseHistory = JSON.parse(localStorage.getItem('parseHistory') || '[]');
    
    // 避免重复
    parseHistory = parseHistory.filter(item => item.originalUrl !== parseResult.originalUrl);
    
    // 添加到开头
    parseHistory.unshift({
        ...parseResult,
        timestamp: Date.now()
    });

    // 限制历史记录数量
    if (parseHistory.length > 20) {
        parseHistory = parseHistory.slice(0, 20);
    }

    localStorage.setItem('parseHistory', JSON.stringify(parseHistory));
}

// 获取解析历史
function getParseHistory() {
    return JSON.parse(localStorage.getItem('parseHistory') || '[]');
}

// 初始化增强功能
function initEnhancedFeatures() {
    createPlaybackSpeedControl();
    createPlayModeControl();
    createVolumeIndicator();
    
    // 替换原来的媒体结束处理
    if (currentMedia) {
        currentMedia.removeEventListener('ended', handleMediaEnded);
        currentMedia.addEventListener('ended', handleMediaEndedEnhanced);
    }
    
    console.log('增强播放功能已初始化');
}

// 在页面加载完成后初始化增强功能
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initEnhancedFeatures, 1000); // 延迟1秒确保基础功能已加载
});
// 
复制到剪贴板
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.style.background = '#48bb78';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
        
        showNotification('命令已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制', 'error');
    });
}

// 尝试通过后端API下载
async function tryBackendDownload(url, title) {
    showNotification('正在尝试通过后端API下载...', 'info');
    
    try {
        const response = await fetch('http://localhost:5001/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url: url,
                format_id: 'best'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showNotification('下载请求已发送到后端服务', 'success');
                showNotification('文件将保存到后端服务的downloads目录', 'info');
            } else {
                throw new Error(data.error || '下载失败');
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('后端下载失败:', error);
        showNotification(`后端下载失败: ${error.message}`, 'error');
        showNotification('请尝试使用命令行工具下载', 'warning');
    }
}// 复制到剪贴板

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.style.background = '#48bb78';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
        
        showNotification('命令已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制', 'error');
    });
}

// 尝试通过后端API下载
async function tryBackendDownload(url, title) {
    showNotification('正在尝试通过后端API下载...', 'info');
    
    try {
        const response = await fetch('http://localhost:5001/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url: url,
                format_id: 'best'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showNotification('下载请求已发送到后端服务', 'success');
                showNotification('文件将保存到后端服务的downloads目录', 'info');
            } else {
                throw new Error(data.error || '下载失败');
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('后端下载失败:', error);
        showNotification(`后端下载失败: ${error.message}`, 'error');
        showNotification('请尝试使用命令行工具下载', 'warning');
    }
}// 复制到剪贴板

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.style.background = '#48bb78';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
        
        showNotification('命令已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制', 'error');
    });
}

// 尝试通过后端API下载
async function tryBackendDownload(url, title) {
    showNotification('正在尝试通过后端API下载...', 'info');
    
    try {
        const response = await fetch('http://localhost:5001/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url: url,
                format_id: 'best'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showNotification('下载请求已发送到后端服务', 'success');
                showNotification('文件将保存到后端服务的downloads目录', 'info');
            } else {
                throw new Error(data.error || '下载失败');
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('后端下载失败:', error);
        showNotification(`后端下载失败: ${error.message}`, 'error');
        showNotification('请尝试使用命令行工具下载', 'warning');
    }
}