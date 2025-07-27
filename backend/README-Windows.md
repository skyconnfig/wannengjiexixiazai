# Windows系统下的yt-dlp API服务部署指南

## 🎯 快速开始

### 前提条件
- Windows 10/11 系统
- Python 3.8+ （[下载地址](https://www.python.org/downloads/)）
- 安装Python时请勾选 "Add Python to PATH"

### ⚡ 一键部署（推荐）

1. **下载项目文件**
   ```cmd
   # 确保你有backend目录下的所有文件
   ```

2. **运行安装脚本**
   ```cmd
   # 双击运行或在命令行执行
   install-windows.bat
   ```

3. **启动服务**
   ```cmd
   # 双击运行或在命令行执行
   deploy.bat
   ```

4. **测试服务**
   ```cmd
   # 双击运行或在命令行执行
   test-api.bat
   ```

## 📋 详细部署步骤

### 步骤1: 检查Python环境

打开命令提示符（cmd），运行：
```cmd
python --version
```

如果显示Python版本号（如Python 3.9.7），说明环境正常。
如果提示"不是内部或外部命令"，请安装Python。

### 步骤2: 安装依赖

```cmd
# 升级pip
python -m pip install --upgrade pip

# 安装项目依赖
pip install flask==2.3.3 flask-cors==4.0.0 yt-dlp
```

### 步骤3: 启动服务

```cmd
# 进入backend目录
cd backend

# 启动服务
python yt-dlp-server.py
```

服务启动后会显示：
```
🚀 启动yt-dlp API服务，端口: 5000
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[你的IP]:5000
```

### 步骤4: 测试API

打开新的命令提示符窗口，运行：
```cmd
# 健康检查
curl http://localhost:5000/api/health

# 测试视频解析
curl -X POST http://localhost:5000/api/extract -H "Content-Type: application/json" -d "{\"url\":\"https://www.bilibili.com/video/BV1GJ411x7h7\"}"
```

## 🔧 Windows服务安装

如果你希望将API作为Windows服务运行（开机自启动），可以：

### 安装为Windows服务

1. **以管理员身份运行命令提示符**
   - 右键点击"命令提示符" → "以管理员身份运行"

2. **安装服务依赖**
   ```cmd
   pip install pywin32
   ```

3. **安装服务**
   ```cmd
   cd backend
   python service-windows.py install
   ```

4. **启动服务**
   ```cmd
   python service-windows.py start
   ```

### 服务管理命令

```cmd
# 启动服务
python service-windows.py start
# 或者
net start YtDlpAPI

# 停止服务
python service-windows.py stop
# 或者
net stop YtDlpAPI

# 重启服务
python service-windows.py restart

# 卸载服务
python service-windows.py remove
```

### 在服务管理器中查看

1. 按 `Win + R`，输入 `services.msc`
2. 找到 "yt-dlp API Service"
3. 可以右键进行启动、停止、重启等操作

## 🛠️ 故障排除

### 常见问题

#### 1. Python未找到
**错误**: `'python' 不是内部或外部命令`

**解决方案**:
- 重新安装Python，确保勾选"Add Python to PATH"
- 或者手动添加Python到系统PATH环境变量

#### 2. pip安装失败
**错误**: `pip install` 命令失败

**解决方案**:
```cmd
# 使用国内镜像源
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple flask flask-cors yt-dlp

# 或者升级pip
python -m pip install --upgrade pip
```

#### 3. 端口被占用
**错误**: `Address already in use`

**解决方案**:
```cmd
# 查找占用5000端口的进程
netstat -ano | findstr :5000

# 结束进程（替换PID为实际进程ID）
taskkill /PID [PID] /F
```

#### 4. 防火墙阻止
**错误**: 无法访问API

**解决方案**:
- 在Windows防火墙中允许Python程序
- 或者临时关闭防火墙测试

#### 5. yt-dlp下载失败
**错误**: 视频解析失败

**解决方案**:
```cmd
# 更新yt-dlp到最新版本
pip install --upgrade yt-dlp

# 测试yt-dlp命令行
yt-dlp --version
yt-dlp "https://www.bilibili.com/video/BV1GJ411x7h7" --dump-json
```

### 日志查看

#### 服务日志
- 位置: `backend/logs/service.log`
- 包含服务启动、停止、错误信息

#### 应用日志
- 控制台输出包含详细的请求和错误信息
- 可以重定向到文件: `python yt-dlp-server.py > app.log 2>&1`

## 🔒 安全建议

### 本地使用
- 默认配置只监听本地地址，相对安全
- 不要将服务暴露到公网

### 生产环境
如果需要在生产环境使用：

1. **添加认证**
   ```python
   # 在yt-dlp-server.py中添加API密钥验证
   ```

2. **使用HTTPS**
   ```cmd
   # 配置SSL证书
   ```

3. **限制访问**
   ```python
   # 添加IP白名单
   ```

4. **监控资源**
   ```cmd
   # 监控CPU、内存使用情况
   ```

## 📞 技术支持

### 获取帮助
- 查看日志文件排查问题
- 确保Python和依赖包版本正确
- 检查网络连接和防火墙设置

### 更新服务
```cmd
# 停止服务
python service-windows.py stop

# 更新yt-dlp
pip install --upgrade yt-dlp

# 重启服务
python service-windows.py start
```

## 🎉 完成

现在你的Windows系统上已经成功部署了yt-dlp API服务！

- **API地址**: http://localhost:5000
- **健康检查**: http://localhost:5000/api/health
- **视频解析**: POST http://localhost:5000/api/extract

可以在你的媒体播放器中使用这个API来解析Bilibili等平台的视频了。