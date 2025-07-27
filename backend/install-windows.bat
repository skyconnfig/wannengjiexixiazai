@echo off
chcp 65001 >nul
echo 🔧 Windows环境下的yt-dlp API服务安装脚本

echo.
echo 📋 安装步骤：
echo 1. 检查Python环境
echo 2. 安装依赖包
echo 3. 测试服务
echo 4. 创建启动脚本
echo.

REM 检查Python版本
echo 🐍 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo.
    echo ❌ Python未安装或不在PATH中
    echo 📥 请从以下地址下载安装Python 3.7+:
    echo    https://www.python.org/downloads/
    echo.
    echo ⚠️  安装时请勾选 "Add Python to PATH"
    pause
    exit /b 1
)

echo ✅ Python环境正常

REM 升级pip
echo 📦 升级pip...
python -m pip install --upgrade pip

REM 安装依赖
echo 📦 安装项目依赖...
pip install flask==2.3.3 flask-cors==4.0.0 yt-dlp

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 创建必要目录
if not exist "downloads" mkdir downloads
if not exist "logs" mkdir logs

REM 测试yt-dlp
echo 🧪 测试yt-dlp...
yt-dlp --version
if %errorlevel% neq 0 (
    echo ❌ yt-dlp测试失败
    pause
    exit /b 1
)

echo ✅ yt-dlp测试通过

REM 创建服务测试脚本
echo 📝 创建测试脚本...
echo @echo off > test-api.bat
echo echo 🧪 测试API服务... >> test-api.bat
echo timeout /t 3 /nobreak ^>nul >> test-api.bat
echo curl -X POST http://localhost:5000/api/health 2^>nul ^|^| echo ❌ 服务未响应 >> test-api.bat
echo pause >> test-api.bat

REM 创建Windows服务安装脚本（可选）
echo 📝 创建Windows服务脚本...
(
echo import sys
echo import os
echo import servicemanager
echo import win32serviceutil
echo import win32service
echo import win32event
echo import subprocess
echo.
echo class YtDlpService^(win32serviceutil.ServiceFramework^):
echo     _svc_name_ = "YtDlpAPI"
echo     _svc_display_name_ = "yt-dlp API Service"
echo     _svc_description_ = "yt-dlp video extraction API service"
echo.
echo     def __init__^(self, args^):
echo         win32serviceutil.ServiceFramework.__init__^(self, args^)
echo         self.hWaitStop = win32event.CreateEvent^(None, 0, 0, None^)
echo         self.process = None
echo.
echo     def SvcStop^(self^):
echo         self.ReportServiceStatus^(win32service.SERVICE_STOP_PENDING^)
echo         if self.process:
echo             self.process.terminate^(^)
echo         win32event.SetEvent^(self.hWaitStop^)
echo.
echo     def SvcDoRun^(self^):
echo         servicemanager.LogMsg^(servicemanager.EVENTLOG_INFORMATION_TYPE,
echo                               servicemanager.PYS_SERVICE_STARTED,
echo                               ^(self._svc_name_, ''^^)^)
echo         self.main^(^)
echo.
echo     def main^(self^):
echo         script_dir = os.path.dirname^(os.path.abspath^(__file__^^)^)
echo         server_script = os.path.join^(script_dir, 'yt-dlp-server.py'^)
echo         self.process = subprocess.Popen^([sys.executable, server_script]^)
echo         win32event.WaitForSingleObject^(self.hWaitStop, win32event.INFINITE^)
echo.
echo if __name__ == '__main__':
echo     win32serviceutil.HandleCommandLine^(YtDlpService^)
) > service-windows.py

echo.
echo 🎉 安装完成！
echo.
echo 📋 使用说明：
echo   • 运行服务: deploy.bat
echo   • 测试API: test-api.bat
echo   • 安装为Windows服务: python service-windows.py install
echo   • 启动Windows服务: python service-windows.py start
echo.
echo 📍 API地址: http://localhost:5000
echo 🏥 健康检查: http://localhost:5000/api/health
echo 📖 提取视频: POST http://localhost:5000/api/extract
echo.
pause