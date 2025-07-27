# 前后端连接问题诊断和解决方案

## 问题描述
前端在 127.0.0.1:8080 运行，但无法连接到后端服务，出现404错误。

## 诊断步骤

### 1. 检查后端服务状态

#### 方法1: 使用启动脚本
```bash
# 运行启动脚本
start-backend.bat
```

#### 方法2: 手动启动
```bash
# 设置端口并启动
set PORT=5001
python backend/yt-dlp-server.py
```

#### 方法3: 检查端口占用
```bash
# 检查端口5001是否被占用
netstat -an | findstr :5001
```

### 2. 测试后端服务

#### 使用浏览器测试
打开浏览器访问：
- 健康检查: http://localhost:5001/api/health
- 测试页面: test-backend.html

#### 使用curl测试
```bash
# 健康检查
curl http://localhost:5001/api/health

# 视频解析测试
curl -X POST http://localhost:5001/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.bilibili.com/video/BV1Jt52zDE3H"}'
```

### 3. 检查前端配置

前端会尝试以下端点（按顺序）：
1. `http://localhost:5001/api/extract` (主要端点)
2. `http://localhost:5000/api/extract` (备用端点)
3. `/api/yt-dlp/extract` (代理端点)
4. `/api/extract` (直接端点)

## 常见问题和解决方案

### 问题1: 端口被占用
**症状**: 启动后端时出现"Address already in use"或"访问套接字"错误

**解决方案**:
1. 更改端口: `set PORT=5002 && python backend/yt-dlp-server.py`
2. 或者找到占用进程并结束它
3. 后端服务会自动尝试端口5001，如果被占用会尝试5002

### 问题2: Python依赖缺失
**症状**: 启动时出现"ModuleNotFoundError"

**解决方案**:
```bash
pip install flask flask-cors yt-dlp
```

### 问题3: CORS跨域问题
**症状**: 浏览器控制台显示CORS错误

**解决方案**: 后端已配置CORS支持，确保flask-cors已安装

### 问题4: yt-dlp版本问题
**症状**: 视频解析失败

**解决方案**:
```bash
# 更新yt-dlp到最新版本
pip install --upgrade yt-dlp
```

## 完整启动流程

### 1. 启动后端服务
```bash
# 方法1: 使用启动脚本
start-backend.bat

# 方法2: 手动启动
python backend/yt-dlp-server.py
```

### 2. 验证后端服务
打开浏览器访问: http://localhost:5001/api/health

应该看到类似以下响应:
```json
{
  "status": "healthy",
  "service": "yt-dlp-api",
  "version": "2025.6.30"
}
```

### 3. 启动前端服务
确保前端在8080端口运行，然后测试Bilibili视频解析

### 4. 测试完整流程
1. 在前端输入Bilibili视频URL
2. 点击"解析"按钮
3. 检查浏览器控制台是否有错误
4. 查看解析状态显示

## 调试技巧

### 1. 浏览器开发者工具
- 打开F12开发者工具
- 查看Console标签页的错误信息
- 查看Network标签页的网络请求

### 2. 后端日志
后端服务会输出详细日志，包括：
- 请求接收信息
- 视频解析过程
- 错误信息

### 3. 测试脚本
使用提供的测试文件：
- `test-backend.html` - 后端服务测试页面
- `test-connection.js` - 连接测试脚本

## 成功标志

当一切正常工作时，你应该看到：

1. **后端启动成功**:
   ```
   INFO:__main__:启动yt-dlp API服务，端口: 5001
   * Running on all addresses (0.0.0.0)
   * Running on http://127.0.0.1:5001
   * Running on http://[::1]:5001
   ```

2. **前端解析成功**:
   - 解析状态显示"解析成功"
   - 视频开始播放或显示嵌入式播放器
   - 浏览器控制台无错误信息

3. **网络请求成功**:
   - Network标签页显示对 `/api/extract` 的POST请求返回200状态码
   - 响应包含视频信息和格式列表

## 联系支持

如果问题仍然存在，请提供：
1. 后端服务启动日志
2. 浏览器控制台错误信息
3. 测试的视频URL
4. 操作系统和Python版本信息