#!/usr/bin/env python3
"""
简单的测试服务器，用于验证前后端连接
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

class TestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """处理CORS预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """处理GET请求"""
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'service': 'test-api',
                'version': '1.0.0'
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """处理POST请求"""
        if self.path == '/api/extract':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode())
                url = data.get('url', '')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                # 检查是否为Bilibili链接，如果是则使用嵌入式播放器
                if 'bilibili.com' in url or 'b23.tv' in url:
                    # 提取视频ID
                    import re
                    bv_match = re.search(r'BV([a-zA-Z0-9]+)', url)
                    if bv_match:
                        video_id = 'BV' + bv_match.group(1)
                        embed_url = f'https://player.bilibili.com/player.html?bvid={video_id}&autoplay=1'
                        
                        response = {
                            'success': True,
                            'title': f'Bilibili视频 - {video_id}',
                            'url': embed_url,
                            'type': 'video',
                            'platform': 'bilibili',
                            'originalUrl': url,
                            'note': '使用Bilibili嵌入式播放器',
                            'formats': [
                                {
                                    'url': embed_url,
                                    'ext': 'html',
                                    'format_note': 'embedded_player'
                                }
                            ]
                        }
                    else:
                        response = {
                            'success': False,
                            'error': '无法提取Bilibili视频ID'
                        }
                else:
                    # 其他平台的模拟响应
                    response = {
                        'success': True,
                        'title': f'测试视频 - {url}',
                        'formats': [
                            {
                                'url': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                                'ext': 'mp4',
                                'height': 720,
                                'width': 1280,
                                'vcodec': 'h264',
                                'acodec': 'aac'
                            }
                        ],
                        'duration': 30,
                        'thumbnail': 'https://sample-videos.com/img/Sample-jpg-image-50kb.jpg',
                        'uploader': '测试用户'
                    }
                
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_response = {
                    'success': False,
                    'error': str(e)
                }
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    port = 5001
    server = HTTPServer(('localhost', port), TestHandler)
    print(f'🚀 测试服务器启动在 http://localhost:{port}')
    print(f'🏥 健康检查: http://localhost:{port}/api/health')
    print(f'📖 视频解析: POST http://localhost:{port}/api/extract')
    print('🛑 按 Ctrl+C 停止服务')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n服务器已停止')
        server.shutdown()