// 测试后端连接的简单脚本
async function testBackendConnection() {
    const endpoints = [
        'http://localhost:5001/api/health',
        'http://localhost:5000/api/health'
    ];
    
    console.log('🔍 测试后端服务连接...');
    
    for (const endpoint of endpoints) {
        try {
            console.log(`尝试连接: ${endpoint}`);
            const response = await fetch(endpoint);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint} - 连接成功`);
                console.log('响应数据:', data);
                return endpoint;
            } else {
                console.log(`❌ ${endpoint} - HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint} - 连接失败: ${error.message}`);
        }
    }
    
    console.log('❌ 所有后端服务都无法连接');
    return null;
}

async function testVideoExtraction() {
    const workingEndpoint = await testBackendConnection();
    
    if (!workingEndpoint) {
        console.log('⚠️ 无法测试视频解析，后端服务不可用');
        return;
    }
    
    const testUrl = 'https://www.bilibili.com/video/BV1Jt52zDE3H';
    const extractEndpoint = workingEndpoint.replace('/health', '/extract');
    
    console.log(`\n🎬 测试视频解析: ${testUrl}`);
    
    try {
        const response = await fetch(extractEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: testUrl })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ 视频解析成功');
            console.log(`标题: ${data.title}`);
            console.log(`时长: ${data.duration}秒`);
            console.log(`格式数量: ${data.formats ? data.formats.length : 0}`);
        } else {
            const errorData = await response.json();
            console.log('❌ 视频解析失败:', errorData.error);
        }
    } catch (error) {
        console.log('❌ 视频解析请求失败:', error.message);
    }
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
    window.testBackendConnection = testBackendConnection;
    window.testVideoExtraction = testVideoExtraction;
    
    // 页面加载时自动测试
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 开始测试后端服务...');
        testVideoExtraction();
    });
}