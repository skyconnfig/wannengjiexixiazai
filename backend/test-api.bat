@echo off 
echo 🧪 测试API服务... 
timeout /t 3 /nobreak >nul 
curl -X POST http://localhost:5000/api/health 2>nul || echo ❌ 服务未响应 
pause 
