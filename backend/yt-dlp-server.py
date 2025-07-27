#!/usr/bin/env python3
"""
简单的yt-dlp后端API服务
用于解析Bilibili等平台的视频信息和播放地址

安装依赖:
pip install flask yt-dlp flask-cors

运行:
python yt-dlp-server.py

API端点:
POST /api/extract - 提取视频信息
GET /api/health - 健康检查
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import logging
import os
from urllib.parse import urlparse

app = Flask(__name__)
# 配置CORS，允许所有来源和方法
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": False
    }
})

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# yt-dlp配置
YDL_OPTS = {
    'quiet': True,
    'no_warnings': True,
    'extract_flat': False,
    'writesubtitles': False,
    'writeautomaticsub': False,
    'ignoreerrors': True,
    'socket_timeout': 30,  # 设置超时时间
    'retries': 3,  # 重试次数
    'fragment_retries': 3,  # 片段重试次数
    'skip_unavailable_fragments': True,  # 跳过不可用的片段
    'keepvideo': False,  # 不保留原始视频文件
    'noplaylist': True,  # 不下载播放列表
    # 不指定format，让yt-dlp自动选择最佳格式
}

def is_supported_url(url):
    """检查URL是否被支持"""
    supported_domains = [
        # 中国平台
        'bilibili.com', 'b23.tv',
        'douyin.com', 'iesdouyin.com',
        'kuaishou.com', 'ixigua.com',
        'weibo.com', 'miaopai.com',
        
        # 国际平台
        'youtube.com', 'youtu.be',
        'vimeo.com', 'dailymotion.com',
        'twitch.tv', 'facebook.com',
        'instagram.com', 'twitter.com',
        'tiktok.com', 'reddit.com',
        
        # 其他视频平台
        'nicovideo.jp', 'soundcloud.com',
        'mixcloud.com', 'bandcamp.com'
    ]
    
    try:
        domain = urlparse(url).netloc.lower()
        return any(supported in domain for supported in supported_domains)
    except:
        return False

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """健康检查端点"""
    if request.method == 'OPTIONS':
        return '', 200
    
    return jsonify({
        'status': 'healthy',
        'service': 'yt-dlp-api',
        'version': yt_dlp.version.__version__
    })

@app.route('/api/extract', methods=['POST', 'OPTIONS'])
def extract_video():
    """提取视频信息和播放地址"""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': '缺少URL参数'
            }), 400
        
        url = data['url'].strip()
        
        if not url:
            return jsonify({
                'success': False,
                'error': 'URL不能为空'
            }), 400
        
        # 放宽URL检查，让yt-dlp自己判断是否支持
        # if not is_supported_url(url):
        #     return jsonify({
        #         'success': False,
        #         'error': '不支持的URL格式或平台'
        #     }), 400
        
        logger.info(f"正在处理URL: {url}")
        
        # 根据平台调整配置
        opts = YDL_OPTS.copy()
        
        try:
            domain = urlparse(url).netloc.lower()
            
            if 'bilibili.com' in domain or 'b23.tv' in domain:
                # Bilibili特定配置
                opts.update({
                    'format': 'best/bestvideo+bestaudio',
                    'cookiefile': None,  # 不使用cookie文件
                })
            elif 'youtube.com' in domain or 'youtu.be' in domain:
                # YouTube特定配置
                opts.update({
                    'format': 'best[height<=1080]/best',
                })
            elif 'douyin.com' in domain or 'tiktok.com' in domain:
                # 抖音/TikTok特定配置
                opts.update({
                    'format': 'best',
                })
            else:
                # 通用配置，让yt-dlp自动选择
                opts.update({
                    'format': 'best',
                })
        except Exception as e:
            logger.warning(f"URL解析失败，使用默认配置: {e}")
            opts.update({
                'format': 'best',
            })
        
        # 使用yt-dlp提取信息
        with yt_dlp.YoutubeDL(opts) as ydl:
            try:
                logger.info(f"使用配置: {opts}")
                info = ydl.extract_info(url, download=False)
                
                # 检查info是否为None
                if not info:
                    return jsonify({
                        'success': False,
                        'error': '无法获取视频信息，可能是不支持的URL或网络问题'
                    }), 400
                
                # 处理播放列表
                if 'entries' in info and info['entries']:
                    # 如果是播放列表，只返回第一个视频
                    if info['entries'] and len(info['entries']) > 0:
                        info = info['entries'][0]
                    else:
                        return jsonify({
                            'success': False,
                            'error': '播放列表为空'
                        }), 400
                
                # 再次检查处理后的info
                if not info:
                    return jsonify({
                        'success': False,
                        'error': '无法处理视频信息'
                    }), 400
                
                # 过滤和处理格式信息
                formats = []
                if info and 'formats' in info and info['formats']:
                    for fmt in info['formats']:
                        if fmt and fmt.get('url'):
                            formats.append({
                                'format_id': fmt.get('format_id', ''),
                                'ext': fmt.get('ext', ''),
                                'quality': fmt.get('quality', ''),
                                'height': fmt.get('height', 0),
                                'width': fmt.get('width', 0),
                                'filesize': fmt.get('filesize', 0),
                                'url': fmt.get('url', ''),
                                'vcodec': fmt.get('vcodec', ''),
                                'acodec': fmt.get('acodec', ''),
                                'format_note': fmt.get('format_note', '')
                            })
                
                # 安全地构建结果
                result = {
                    'success': True,
                    'title': info.get('title', '未知标题') if info else '未知标题',
                    'duration': info.get('duration', 0) if info else 0,
                    'uploader': info.get('uploader', '') if info else '',
                    'upload_date': info.get('upload_date', '') if info else '',
                    'view_count': info.get('view_count', 0) if info else 0,
                    'like_count': info.get('like_count', 0) if info else 0,
                    'description': info.get('description', '') if info else '',
                    'thumbnail': info.get('thumbnail', '') if info else '',
                    'formats': formats,
                    'webpage_url': info.get('webpage_url', url) if info else url,
                    'extractor': info.get('extractor', '') if info else ''
                }
                
                logger.info(f"成功提取视频信息: {result['title']}")
                return jsonify(result)
                
            except yt_dlp.DownloadError as e:
                error_msg = str(e)
                logger.error(f"yt-dlp下载错误: {error_msg}")
                logger.error(f"URL: {url}")
                
                # 如果是格式错误，尝试使用更简单的配置
                if 'Requested format is not available' in error_msg:
                    logger.info("尝试使用简化配置重新提取...")
                    try:
                        simple_opts = {
                            'quiet': True,
                            'no_warnings': True,
                            'ignoreerrors': True,
                            'noplaylist': True,
                        }
                        with yt_dlp.YoutubeDL(simple_opts) as simple_ydl:
                            info = simple_ydl.extract_info(url, download=False)
                            if info:
                                logger.info("使用简化配置成功提取信息")
                                # 继续处理info...
                                if 'entries' in info and info['entries']:
                                    if info['entries'] and len(info['entries']) > 0:
                                        info = info['entries'][0]
                                
                                if not info:
                                    raise Exception("无法处理视频信息")
                                
                                # 处理格式信息
                                formats = []
                                if info and 'formats' in info and info['formats']:
                                    for fmt in info['formats']:
                                        if fmt and fmt.get('url'):
                                            formats.append({
                                                'format_id': fmt.get('format_id', ''),
                                                'ext': fmt.get('ext', ''),
                                                'quality': fmt.get('quality', ''),
                                                'height': fmt.get('height', 0),
                                                'width': fmt.get('width', 0),
                                                'filesize': fmt.get('filesize', 0),
                                                'url': fmt.get('url', ''),
                                                'vcodec': fmt.get('vcodec', ''),
                                                'acodec': fmt.get('acodec', ''),
                                                'format_note': fmt.get('format_note', '')
                                            })
                                
                                result = {
                                    'success': True,
                                    'title': info.get('title', '未知标题') if info else '未知标题',
                                    'duration': info.get('duration', 0) if info else 0,
                                    'uploader': info.get('uploader', '') if info else '',
                                    'upload_date': info.get('upload_date', '') if info else '',
                                    'view_count': info.get('view_count', 0) if info else 0,
                                    'like_count': info.get('like_count', 0) if info else 0,
                                    'description': info.get('description', '') if info else '',
                                    'thumbnail': info.get('thumbnail', '') if info else '',
                                    'formats': formats,
                                    'webpage_url': info.get('webpage_url', url) if info else url,
                                    'extractor': info.get('extractor', '') if info else '',
                                    'note': '使用简化配置提取'
                                }
                                
                                logger.info(f"成功提取视频信息: {result['title']}")
                                return jsonify(result)
                    except Exception as retry_error:
                        logger.error(f"简化配置也失败: {str(retry_error)}")
                
                return jsonify({
                    'success': False,
                    'error': f'视频提取失败: {error_msg}',
                    'url': url,
                    'error_type': 'DownloadError',
                    'suggestions': [
                        '该视频可能需要登录或有地区限制',
                        '尝试使用浏览器直接访问视频页面',
                        '检查视频是否为私有或已删除'
                    ]
                }), 400
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"提取过程中发生错误: {error_msg}")
                logger.error(f"URL: {url}")
                logger.error(f"错误类型: {type(e).__name__}")
                import traceback
                logger.error(f"堆栈跟踪: {traceback.format_exc()}")
                return jsonify({
                    'success': False,
                    'error': f'处理过程中发生错误: {error_msg}',
                    'url': url,
                    'error_type': type(e).__name__
                }), 500
                
    except Exception as e:
        logger.error(f"请求处理错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': '服务器内部错误'
        }), 500

@app.route('/api/download', methods=['POST', 'OPTIONS'])
def download_video():
    """下载视频（可选功能）"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        url = data.get('url')
        format_id = data.get('format_id', 'best')
        
        if not url:
            return jsonify({
                'success': False,
                'error': '缺少URL参数'
            }), 400
        
        logger.info(f"开始下载URL: {url}, 格式: {format_id}")
        
        # 确保下载目录存在
        downloads_dir = os.path.join(os.getcwd(), 'downloads')
        os.makedirs(downloads_dir, exist_ok=True)
        logger.info(f"下载目录: {downloads_dir}")
        
        # 根据平台调整下载配置
        download_opts = YDL_OPTS.copy()
        
        try:
            domain = urlparse(url).netloc.lower()
            
            if 'bilibili.com' in domain or 'b23.tv' in domain:
                # Bilibili下载配置 - 不指定具体格式，让yt-dlp自动选择
                download_opts.update({
                    'outtmpl': os.path.join(downloads_dir, '%(title)s.%(ext)s'),
                    'cookiefile': None,
                })
            elif 'youtube.com' in domain or 'youtu.be' in domain:
                # YouTube下载配置
                download_opts.update({
                    'format': 'best[height<=1080]/best' if format_id == 'best' else format_id,
                    'outtmpl': os.path.join(downloads_dir, '%(title)s.%(ext)s'),
                })
            else:
                # 通用下载配置
                download_opts.update({
                    'format': format_id,
                    'outtmpl': os.path.join(downloads_dir, '%(title)s.%(ext)s'),
                })
        except Exception as e:
            logger.warning(f"URL解析失败，使用默认下载配置: {e}")
            download_opts.update({
                'format': format_id,
                'outtmpl': os.path.join(downloads_dir, '%(title)s.%(ext)s'),
            })
        
        logger.info(f"使用下载配置: {download_opts}")
        
        try:
            with yt_dlp.YoutubeDL(download_opts) as ydl:
                # 先获取视频信息
                info = ydl.extract_info(url, download=False)
                if info:
                    title = info.get('title', '未知视频')
                    logger.info(f"准备下载: {title}")
                    
                    # 开始下载
                    ydl.download([url])
                    
                    # 检查文件是否真的下载了
                    downloaded_files = []
                    for file in os.listdir(downloads_dir):
                        if os.path.isfile(os.path.join(downloads_dir, file)):
                            downloaded_files.append(file)
                    
                    logger.info(f"下载目录中的文件: {downloaded_files}")
                    
                    return jsonify({
                        'success': True,
                        'message': f'下载完成: {title}',
                        'title': title,
                        'download_path': downloads_dir,
                        'files': downloaded_files
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': '无法获取视频信息'
                    }), 400
                    
        except yt_dlp.DownloadError as e:
            error_msg = str(e)
            logger.error(f"yt-dlp下载错误: {error_msg}")
            
            # 如果是格式错误，尝试使用简化配置下载
            if 'Requested format is not available' in error_msg:
                logger.info("尝试使用简化配置重新下载...")
                try:
                    simple_download_opts = {
                        'quiet': True,
                        'no_warnings': True,
                        'ignoreerrors': True,
                        'noplaylist': True,
                        'outtmpl': os.path.join(downloads_dir, '%(title)s.%(ext)s'),
                    }
                    
                    with yt_dlp.YoutubeDL(simple_download_opts) as simple_ydl:
                        info = simple_ydl.extract_info(url, download=False)
                        if info:
                            title = info.get('title', '未知视频')
                            logger.info(f"使用简化配置下载: {title}")
                            
                            simple_ydl.download([url])
                            
                            # 检查文件是否下载成功
                            downloaded_files = []
                            for file in os.listdir(downloads_dir):
                                if os.path.isfile(os.path.join(downloads_dir, file)):
                                    downloaded_files.append(file)
                            
                            logger.info(f"简化配置下载完成，文件: {downloaded_files}")
                            
                            return jsonify({
                                'success': True,
                                'message': f'下载完成: {title} (使用简化配置)',
                                'title': title,
                                'download_path': downloads_dir,
                                'files': downloaded_files,
                                'note': '使用简化配置下载'
                            })
                        else:
                            raise Exception("无法获取视频信息")
                            
                except Exception as retry_error:
                    logger.error(f"简化配置下载也失败: {str(retry_error)}")
                    return jsonify({
                        'success': False,
                        'error': f'下载失败: {error_msg}',
                        'retry_error': str(retry_error),
                        'suggestions': [
                            '该视频可能需要登录或有地区限制',
                            '尝试使用命令行工具: yt-dlp "' + url + '"',
                            '检查视频是否为私有或已删除'
                        ]
                    }), 400
            else:
                return jsonify({
                    'success': False,
                    'error': f'下载失败: {error_msg}',
                    'suggestions': [
                        '检查网络连接',
                        '尝试使用命令行工具: yt-dlp "' + url + '"',
                        '该视频可能需要特殊权限'
                    ]
                }), 400
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"下载过程中发生错误: {error_msg}")
        import traceback
        logger.error(f"堆栈跟踪: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'下载失败: {error_msg}',
            'error_type': type(e).__name__
        }), 500

@app.route('/api/formats', methods=['POST'])
def get_available_formats():
    """获取可用的视频格式"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({
                'success': False,
                'error': '缺少URL参数'
            }), 400
        
        logger.info(f"获取格式信息: {url}")
        
        with yt_dlp.YoutubeDL(YDL_OPTS) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                return jsonify({
                    'success': False,
                    'error': '无法获取视频信息'
                }), 400
            
            if 'entries' in info and info['entries']:
                info = info['entries'][0]
            
            if not info:
                return jsonify({
                    'success': False,
                    'error': '无法处理视频信息'
                }), 400
            
            formats = []
            if info and 'formats' in info and info['formats']:
                for fmt in info['formats']:
                    if fmt and fmt.get('url'):
                        formats.append({
                            'format_id': fmt.get('format_id', ''),
                            'ext': fmt.get('ext', ''),
                            'quality': fmt.get('quality', ''),
                            'height': fmt.get('height', 0),
                            'width': fmt.get('width', 0),
                            'filesize': fmt.get('filesize', 0),
                            'vcodec': fmt.get('vcodec', ''),
                            'acodec': fmt.get('acodec', ''),
                            'format_note': fmt.get('format_note', ''),
                            'fps': fmt.get('fps', 0),
                            'tbr': fmt.get('tbr', 0)
                        })
            
            return jsonify({
                'success': True,
                'formats': formats,
                'title': info.get('title', '未知标题')
            })
            
    except Exception as e:
        logger.error(f"获取格式错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'获取格式失败: {str(e)}'
        }), 500

@app.route('/api/supported-sites', methods=['GET'])
def get_supported_sites():
    """获取支持的网站列表"""
    try:
        # 获取yt-dlp支持的提取器列表
        extractors = yt_dlp.extractor.gen_extractors()
        sites = []
        
        for extractor in extractors:
            if hasattr(extractor, '_VALID_URL') and hasattr(extractor, 'IE_NAME'):
                sites.append({
                    'name': extractor.IE_NAME,
                    'description': getattr(extractor, 'IE_DESC', ''),
                    'example_url': getattr(extractor, '_TEST', {}).get('url', '') if hasattr(extractor, '_TEST') else ''
                })
        
        return jsonify({
            'success': True,
            'sites': sites[:50],  # 限制返回数量
            'total_count': len(sites)
        })
        
    except Exception as e:
        logger.error(f"获取支持网站错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'获取支持网站失败: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))  # 默认端口改为5001
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"启动yt-dlp API服务，端口: {port}")
    logger.info(f"yt-dlp版本: {yt_dlp.version.__version__}")
    
    # 尝试启动服务，如果端口被占用则尝试其他端口
    try:
        app.run(host='0.0.0.0', port=port, debug=debug)
    except OSError as e:
        if "Address already in use" in str(e) or "访问套接字" in str(e):
            logger.warning(f"端口 {port} 被占用，尝试端口 {port + 1}")
            try:
                app.run(host='0.0.0.0', port=port + 1, debug=debug)
            except OSError:
                logger.error(f"端口 {port} 和 {port + 1} 都被占用，请手动指定端口")
                logger.info("使用方法: set PORT=5002 && python yt-dlp-server.py")
        else:
            raise e