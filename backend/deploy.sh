#!/bin/bash

# yt-dlp API服务部署脚本

echo "🚀 开始部署yt-dlp API服务..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查docker-compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose未安装，请先安装docker-compose"
    exit 1
fi

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🔍 检查服务状态..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ 服务启动成功！"
    echo "📍 API地址: http://localhost:5000"
    echo "🏥 健康检查: http://localhost:5000/api/health"
    echo "📖 使用方法: POST http://localhost:5000/api/extract"
else
    echo "❌ 服务启动失败，请检查日志:"
    docker-compose logs
    exit 1
fi

echo "🎉 部署完成！"