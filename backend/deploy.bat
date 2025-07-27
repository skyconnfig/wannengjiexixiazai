@echo off
chcp 65001 >nul
echo 🚀 开始部署yt-dlp API服务...

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装，请先安装Python 3.7+
    pause
    exit /b 1
)

REM 检查pip是否可用
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip不可用，请检查Python安装
    pause
    exit /b 1
)

echo ✅ Python环境检查通过

REM 安装依赖
echo 📦 安装Python依赖...
pip install flask flask-cors yt-dlp

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 创建下载目录
if not exist "downloads" mkdir downloads

REM 启动服务
echo 🚀 启动yt-dlp API服务...
echo 📍 服务将在 http://localhost:5000 启动
echo 🛑 按 Ctrl+C 停止服务
echo.

python yt-dlp-server.py