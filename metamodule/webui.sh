#!/system/bin/sh
# meta-overlayfsUltra — WebUI 启动脚本
# 在 late_start service 阶段启动 WebUI 服务器

MODDIR="${0%/*}"
WEBUI_DIR="$MODDIR/webui"
PORT=8888
LOG_FILE="/data/adb/modules/meta-overlayfsUltra/webui.log"

# 检查 WebUI 目录是否存在
if [ ! -d "$WEBUI_DIR" ]; then
    echo "[$(date)] WebUI 目录不存在，跳过启动" >> "$LOG_FILE"
    exit 0
fi

# 启动简单的 HTTP 服务器（使用 busybox httpd 或 Python）
# 这是一个占位符实现，实际可根据设备能力选择合适的服务器

# 方案 1：使用 busybox httpd（如果可用）
if command -v httpd >/dev/null 2>&1; then
    httpd -p $PORT -h "$WEBUI_DIR" -b >> "$LOG_FILE" 2>&1 &
    echo "[$(date)] WebUI 服务器已启动 (busybox httpd, 端口 $PORT)" >> "$LOG_FILE"
    exit 0
fi

# 方案 2：使用 Python（如果可用）
if command -v python3 >/dev/null 2>&1; then
    cd "$WEBUI_DIR"
    python3 -m http.server $PORT >> "$LOG_FILE" 2>&1 &
    echo "[$(date)] WebUI 服务器已启动 (Python http.server, 端口 $PORT)" >> "$LOG_FILE"
    exit 0
fi

echo "[$(date)] 无可用的 HTTP 服务器" >> "$LOG_FILE"
exit 1
