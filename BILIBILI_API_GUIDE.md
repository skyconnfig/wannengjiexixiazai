# Bilibili API 支持指南

## 概述

Bilibili视频解析需要特殊的API支持，主要原因是：
1. **CORS限制** - B站API不允许跨域请求
2. **反爬虫机制** - 需要特定的请求头和参数
3. **用户认证** - 某些视频需要登录状态
4. **动态加密** - 播放地址经常变化且有加密

## 开源解决方案

### 1. 命令行工具

#### you-get
- **GitHub**: https://github.com/soimort/you-get
- **安装**: `pip install you-get`
- **使用**: `you-get https://www.bilibili.com/video/BV1234567890`
- **特点**: 支持多平台，包括B站、YouTube等

#### yt-dlp
- **GitHub**: https://github.com/yt-dlp/yt-dlp
- **安装**: `pip install yt-dlp`
- **使用**: `yt-dlp "https://www.bilibili.com/video/BV1234567890"`
- **特点**: youtube-dl的增强版，更新频繁，支持更多平台

**yt-dlp 高级用法**:
```bash
# 基本下载
yt-dlp "https://www.bilibili.com/video/BV1234567890"

# 仅提取信息（不下载）
yt-dlp --dump-json "https://www.bilibili.com/video/BV1234567890"

# 获取可用格式列表
yt-dlp -F "https://www.bilibili.com/video/BV1234567890"

# 选择特定质量
yt-dlp -f "best[height<=720]" "https://www.bilibili.com/video/BV1234567890"

# 仅下载音频
yt-dlp -x --audio-format mp3 "https://www.bilibili.com/video/BV1234567890"

# 批量下载播放列表
yt-dlp "https://space.bilibili.com/123456/video"

# 使用代理
yt-dlp --proxy socks5://127.0.0.1:1080 "URL"

# 自定义输出文件名
yt-dlp -o "%(uploader)s - %(title)s.%(ext)s" "URL"
```

**API集成示例**:
```python
import yt_dlp
import json

def get_bilibili_info(url):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            return {
                'title': info.get('title'),
                'duration': info.get('duration'),
                'uploader': info.get('uploader'),
                'view_count': info.get('view_count'),
                'formats': info.get('formats', []),
                'thumbnail': info.get('thumbnail'),
                'description': info.get('description')
            }
        except Exception as e:
            return {'error': str(e)}
```

#### BBDown
- **GitHub**: https://github.com/nilaoda/BBDown
- **特点**: 专门针对B站的下载工具，支持高质量下载

### 2. API接口项目

#### bilibili-API-collect
- **GitHub**: https://github.com/SocialSisterYi/bilibili-API-collect
- **描述**: 详细的B站API接口文档和示例
- **用途**: 了解B站API结构和调用方法

#### bilibili-api
- **GitHub**: https://github.com/Nemo2011/bilibili-api
- **描述**: Python的B站API封装库
- **安装**: `pip install bilibili-api`

### 3. Web服务解决方案

#### 自建后端代理服务

```javascript
// Node.js 示例后端代理
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/bilibili/video/:id', async (req, res) => {
    try {
        const videoId = req.params.id;
        const isAV = videoId.startsWith('av');
        const isBV = videoId.startsWith('BV');
        
        let apiUrl;
        if (isBV) {
            apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${videoId}`;
        } else if (isAV) {
            apiUrl = `https://api.bilibili.com/x/web-interface/view?aid=${videoId.replace('av', '')}`;
        }
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.bilibili.com/'
            }
        });
        
        if (response.data.code === 0) {
            // 进一步解析播放地址需要更复杂的逻辑
            res.json({
                success: true,
                data: response.data.data,
                note: '仅获取基本信息，播放地址需要额外解析'
            });
        } else {
            res.json({ success: false, error: '获取视频信息失败' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});
```

#### Docker化的解析服务

```dockerfile
# 使用you-get的Docker镜像
FROM python:3.9-slim

RUN pip install you-get yt-dlp

COPY server.py /app/
WORKDIR /app

EXPOSE 8080
CMD ["python", "server.py"]
```

## 实现建议

### 方案1: 嵌入式播放器（当前实现）
- **优点**: 简单易实现，不需要后端
- **缺点**: 功能有限，无法获取直接播放链接

### 方案2: 后端代理服务
- **优点**: 功能完整，可以获取真实播放地址
- **缺点**: 需要维护后端服务

### 方案3: 浏览器扩展
- **优点**: 可以绕过CORS限制
- **缺点**: 需要用户安装扩展

### 方案4: 混合方案
1. 优先使用嵌入式播放器
2. 提供后端API作为备选
3. 给出下载工具建议

## 法律和道德考虑

⚠️ **重要提醒**:
1. 遵守B站的使用条款
2. 仅用于个人学习和研究
3. 不要用于商业用途
4. 尊重内容创作者的版权

## 快速部署yt-dlp后端服务

### 🪟 Windows系统部署（推荐）

#### 方法1: 一键安装脚本 ⭐
```cmd
# 进入backend目录
cd backend

# 运行安装脚本（自动安装依赖）
install-windows.bat

# 启动服务
deploy.bat

# 测试API
test-api.bat
```

#### 方法2: 安装为Windows服务
```cmd
# 以管理员身份运行
install-service.bat

# 服务管理命令
net start YtDlpApiService    # 启动
net stop YtDlpApiService     # 停止
```

#### 方法3: 手动安装
```cmd
# 1. 检查Python环境（需要3.8+）
python --version

# 2. 安装依赖包
pip install flask flask-cors yt-dlp

# 3. 启动服务
python yt-dlp-server.py
```

**Windows专用文件说明:**
- `install-windows.bat` - 自动安装脚本
- `deploy.bat` - 启动服务脚本  
- `test-api.bat` - API测试脚本
- `service-windows.py` - Windows服务版本
- `install-service.bat` - 安装Windows服务
- `README-Windows.md` - 详细Windows部署指南

### Linux/Mac系统部署

#### 方法1: Docker部署
```bash
# 进入backend目录
cd backend

# 构建并启动服务
docker-compose up -d

# 检查服务状态
curl http://localhost:5000/api/health
```

#### 方法2: 直接运行
```bash
# 安装依赖
pip install flask flask-cors yt-dlp

# 运行服务
python yt-dlp-server.py
```

#### 方法3: 生产环境部署
```bash
# 使用gunicorn运行
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 yt-dlp-server:app
```

### API使用示例

```javascript
// 提取视频信息
const response = await fetch('http://localhost:5000/api/extract', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        url: 'https://www.bilibili.com/video/BV1234567890'
    })
});

const data = await response.json();
if (data.success) {
    console.log('视频标题:', data.title);
    console.log('可用格式:', data.formats);
}
```

## 推荐实现步骤

1. **第一阶段**: 使用嵌入式播放器（已实现）
2. **第二阶段**: 部署yt-dlp后端服务
3. **第三阶段**: 集成后端API到前端
4. **第四阶段**: 优化用户体验和错误处理

## 安全考虑

⚠️ **生产环境注意事项**:
1. 添加API认证和限流
2. 配置HTTPS
3. 限制允许的域名
4. 监控资源使用情况
5. 定期更新yt-dlp版本

## 相关资源

- [B站API文档](https://github.com/SocialSisterYi/bilibili-API-collect)
- [you-get文档](https://github.com/soimort/you-get)
- [yt-dlp文档](https://github.com/yt-dlp/yt-dlp)
- [BBDown使用指南](https://github.com/nilaoda/BBDown)