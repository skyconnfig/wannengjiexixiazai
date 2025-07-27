@echo off
chcp 65001 >nul
echo 🔧 安装yt-dlp API为Windows服务

REM 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 需要管理员权限
    echo 💡 请右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo ✅ 管理员权限确认

REM 安装pywin32
echo 📦 安装Windows服务依赖...
pip install pywin32

if %errorlevel% neq 0 (
    echo ❌ pywin32安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 安装服务
echo 🔧 安装Windows服务...
python service-windows.py install

if %errorlevel% neq 0 (
    echo ❌ 服务安装失败
    pause
    exit /b 1
)

echo ✅ 服务安装成功

REM 启动服务
echo 🚀 启动服务...
python service-windows.py start

if %errorlevel% neq 0 (
    echo ❌ 服务启动失败
    pause
    exit /b 1
)

echo ✅ 服务启动成功

echo.
echo 🎉 Windows服务安装完成！
echo.
echo 📋 服务管理命令：
echo   启动服务: python service-windows.py start
echo   停止服务: python service-windows.py stop
echo   重启服务: python service-windows.py restart
echo   卸载服务: python service-windows.py remove
echo.
echo 📍 服务地址: http://localhost:5000
echo 📊 可以在"服务"管理器中查看 "yt-dlp API Service"
echo.
pause