@echo off
chcp 65001 >nul
title 在线媒体播放器 - 快速启动

echo ========================================
echo    在线媒体播放器 - 快速启动脚本
echo ========================================
echo.

REM 检查Python环境
echo [1/4] 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装，请先安装Python 3.7+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python环境正常

REM 安装依赖
echo [2/4] 检查并安装依赖...
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 安装依赖包...
    pip install flask flask-cors yt-dlp
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)
echo ✅ 依赖检查完成

REM 启动测试服务器
echo [3/4] 启动后端服务...
echo 📍 服务地址: http://localhost:5001
echo 🏥 健康检查: http://localhost:5001/api/health
echo 📖 视频解析: POST http://localhost:5001/api/extract
echo.

REM 首先尝试启动完整的yt-dlp服务器
echo 尝试启动完整服务器...
timeout /t 2 /nobreak >nul
start /min python backend/yt-dlp-server.py

REM 等待服务启动
echo 等待服务启动...
timeout /t 3 /nobreak >nul

REM 测试服务是否启动成功
curl -s http://localhost:5001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务启动成功
) else (
    echo ⚠️ 完整服务启动失败，启动测试服务器...
    start /min python simple-server.py
    timeout /t 2 /nobreak >nul
)

echo [4/4] 启动前端服务...
echo 📱 前端地址: http://localhost:8080
echo.

REM 检查是否有HTTP服务器可用
python -m http.server --help >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用Python内置服务器启动前端...
    start http://localhost:8080
    python -m http.server 8080
) else (
    echo 请手动启动前端服务器
    echo 或者直接打开 index.html 文件
    pause
)

echo.
echo ========================================
echo 服务启动完成！
echo 前端: http://localhost:8080
echo 后端: http://localhost:5001
echo ========================================
pause