"""
Windows服务版本的yt-dlp API服务

安装为Windows服务:
pip install pywin32
python service-windows.py install

启动服务:
python service-windows.py start

停止服务:
python service-windows.py stop

卸载服务:
python service-windows.py remove
"""

import sys
import os
import servicemanager
import win32serviceutil
import win32service
import win32event
import subprocess
import time
import logging

class YtDlpService(win32serviceutil.ServiceFramework):
    _svc_name_ = "YtDlpAPI"
    _svc_display_name_ = "yt-dlp API Service"
    _svc_description_ = "yt-dlp video extraction API service for media player"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.process = None
        
        # 设置日志
        log_path = os.path.join(os.path.dirname(__file__), 'logs', 'service.log')
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        
        logging.basicConfig(
            filename=log_path,
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.logger.info("正在停止yt-dlp API服务...")
        
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.process.kill()
            except Exception as e:
                self.logger.error(f"停止进程时出错: {e}")
        
        win32event.SetEvent(self.hWaitStop)
        self.logger.info("yt-dlp API服务已停止")

    def SvcDoRun(self):
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_, '')
        )
        self.logger.info("yt-dlp API服务正在启动...")
        self.main()

    def main(self):
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            server_script = os.path.join(script_dir, 'yt-dlp-server.py')
            
            if not os.path.exists(server_script):
                self.logger.error(f"服务器脚本不存在: {server_script}")
                return
            
            # 启动Flask应用
            self.logger.info(f"启动服务器脚本: {server_script}")
            self.process = subprocess.Popen(
                [sys.executable, server_script],
                cwd=script_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.logger.info("yt-dlp API服务已启动")
            
            # 等待停止信号
            win32event.WaitForSingleObject(self.hWaitStop, win32event.INFINITE)
            
        except Exception as e:
            self.logger.error(f"服务运行时出错: {e}")
            servicemanager.LogErrorMsg(f"yt-dlp API服务错误: {e}")

if __name__ == '__main__':
    if len(sys.argv) == 1:
        # 如果没有参数，显示帮助信息
        print("yt-dlp API Windows服务管理")
        print("")
        print("用法:")
        print("  python service-windows.py install    - 安装服务")
        print("  python service-windows.py start      - 启动服务")
        print("  python service-windows.py stop       - 停止服务")
        print("  python service-windows.py restart    - 重启服务")
        print("  python service-windows.py remove     - 卸载服务")
        print("")
        print("注意: 需要管理员权限运行")
    else:
        win32serviceutil.HandleCommandLine(YtDlpService)