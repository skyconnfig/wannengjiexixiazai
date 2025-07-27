@echo off
chcp 65001 >nul
echo 🚀 启动yt-dlp后端服务...

REM 检查Python环境
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装，请先安装Python
    pause
    exit /b 1
)

REM 检查依赖
echo 📦 检查依赖...
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 安装Flask...
    pip install flask flask-cors yt-dlp
)

REM 设置环境变量
set PORT=5001
set DEBUG=false

REM 启动服务
echo 📍 服务将在 http://localhost:5001 启动
echo 🏥 健康检查: http://localhost:5001/api/health
echo 📖 视频解析: POST http://localhost:5001/api/extract
echo 🛑 按 Ctrl+C 停止服务
echo.

python backend/yt-dlp-server.py

pause