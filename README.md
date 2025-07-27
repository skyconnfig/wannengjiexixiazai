# 万能下载器 v1.0 (wannengxiazaiv1.0)

🎵 **一个功能强大的在线媒体播放器和下载工具**

## ✨ 主要功能

### 🎮 播放功能
- 支持多种视频/音频格式播放 (MP4, WebM, MP3, WAV等)
- HTML5原生播放器，性能优异
- 全屏播放模式
- 播放速度控制 (0.5x - 2x)
- 音量控制和静音功能
- 进度条拖拽跳转

### 🌐 多平台支持
- **YouTube** (youtube.com, youtu.be)
- **Bilibili** (bilibili.com, b23.tv) 
- **抖音** (douyin.com)
- **Vimeo** (vimeo.com)
- **TikTok** (tiktok.com)
- **直接媒体链接** (.mp4, .mp3, .webm等)
- 更多平台持续添加中...

### ⬇️ 智能下载系统
- 优先使用yt-dlp后端API下载
- 自动格式检测和回退机制
- 支持批量下载
- 下载进度显示
- 错误处理和重试机制

### 📋 播放列表管理
- 添加/删除播放项目
- 拖拽重排序
- 自动播放下一首
- 循环播放模式
- 批量下载播放列表

### 💾 数据持久化
- 播放历史记录保存
- 播放器设置记忆
- 解析历史缓存
- 本地存储管理

### ⌨️ 键盘快捷键
- `空格` - 播放/暂停
- `F` - 全屏切换
- `M` - 静音切换
- `←/→` - 快退/快进 10秒
- `↑/↓` - 音量调节
- `1-5` - 播放速度切换
- `N/P` - 下一首/上一首
- `H` - 显示帮助

## 🛠️ 技术架构

### 前端技术
- **HTML5** - 原生video/audio元素
- **CSS3** - Flexbox布局 + 现代样式
- **JavaScript** - ES6原生语法，无框架依赖
- **响应式设计** - 支持桌面和移动设备

### 后端技术
- **Python Flask** - 轻量级Web框架
- **yt-dlp** - 强大的视频解析引擎
- **CORS支持** - 跨域请求处理
- **多格式支持** - 自动格式检测和回退

## 🚀 快速开始

### 环境要求
- Python 3.7+
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd wannengxiazaiv1.0
```

2. **安装Python依赖**
```bash
cd backend
pip install -r requirements.txt
```

3. **启动后端服务**
```bash
python yt-dlp-server.py
```

4. **打开前端页面**
- 直接打开 `index.html` 文件
- 或使用本地服务器: `python -m http.server 8000`

### Windows快速启动
双击运行 `start-backend.bat` 自动启动后端服务

## 📁 项目结构

```
wannengxiazaiv1.0/
├── index.html              # 主播放器页面
├── script.js               # 核心JavaScript逻辑
├── style.css               # 样式文件
├── backend/
│   ├── yt-dlp-server.py    # 后端API服务
│   ├── requirements.txt    # Python依赖
│   └── downloads/          # 下载文件目录
├── test-*.html             # 功能测试页面
├── .kiro/specs/            # 项目规格文档
└── README.md               # 项目说明
```

## 🎯 使用方法

### 基本播放
1. 在输入框中粘贴视频链接
2. 点击"解析"按钮
3. 等待解析完成后自动播放

### 下载视频
1. 解析视频后点击下载按钮
2. 系统会自动选择最佳下载方式
3. 文件保存在 `backend/downloads/` 目录

### 播放列表
1. 解析多个视频会自动添加到播放列表
2. 点击列表项目可直接跳转播放
3. 支持拖拽重排序和批量下载

## 🔧 API接口

### 后端API端点
- `GET /api/health` - 健康检查
- `POST /api/extract` - 视频信息提取
- `POST /api/download` - 视频下载
- `POST /api/formats` - 获取可用格式
- `GET /api/supported-sites` - 支持的网站列表

### 请求示例
```javascript
// 提取视频信息
fetch('http://localhost:5001/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=...' })
})

// 下载视频
fetch('http://localhost:5001/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        url: 'https://www.youtube.com/watch?v=...', 
        format_id: 'best' 
    })
})
```

## 🐛 故障排除

### 常见问题

**1. 后端服务启动失败**
- 检查Python版本 (需要3.7+)
- 安装依赖: `pip install flask yt-dlp flask-cors`
- 检查端口占用: `netstat -ano | findstr :5001`

**2. 视频解析失败**
- 检查网络连接
- 确认视频链接有效
- 查看浏览器控制台错误信息

**3. 下载失败**
- 确保后端服务正在运行
- 检查downloads目录权限
- 某些视频可能需要登录或有地区限制

**4. CORS错误**
- 确保后端服务已启动
- 检查防火墙设置
- 尝试重启后端服务

### 调试工具
- `test-universal-parser.html` - 解析功能测试
- `test-download.html` - 下载功能测试
- `debug.html` - 综合调试页面

## 📝 更新日志

### v1.0 (2025-07-27)
- 🎉 首次发布
- ✅ 多平台视频解析支持
- ✅ 智能下载系统
- ✅ 完整播放器功能
- ✅ 播放列表管理
- ✅ 键盘快捷键支持
- ✅ 响应式设计
- ✅ 历史记录保存

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发环境设置
1. Fork项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - 强大的视频下载工具
- [Flask](https://flask.palletsprojects.com/) - 轻量级Web框架
- 所有贡献者和用户的支持

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 [Issue](../../issues)
- 发起 [Discussion](../../discussions)

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！