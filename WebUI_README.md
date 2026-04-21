# meta-overlayfsUltra WebUI

## 概述

meta-overlayfsUltra WebUI 是一个基于 React + TailwindCSS 的现代化管理界面，用于配置和监控 meta-overlayfsUltra 元模块的运行状态。

## 功能特性

### 1. 挂载状态监控
- 实时显示所有分区（system、vendor、product 等）的 OverlayFS 挂载状态
- 显示挂载源（source）和目标路径（target）
- 用不同的颜色标识已挂载和未挂载的分区

### 2. 隐藏策略管理
- **挂载源伪装**：所有 overlay 挂载源设为 `KSU`，与原生 KernelSU 无法区分
- **命名空间隔离**：`unshare(CLONE_NEWNS)` 创建私有挂载命名空间
- **SELinux 镜像**：`chcon --reference` 复制原生分区上下文
- **进程伪装**：`prctl(PR_SET_NAME)` 将进程名改为 `kworker/u:0`

每个策略都可以单独启用/禁用，实时反映到模块配置中。

### 3. 读写覆盖层管理
- 为特定分区启用读写覆盖层（upperdir/workdir）
- 支持实时系统编辑，修改将持久保存在 ext4 镜像中
- 显示各分区的读写层启用状态

### 4. 系统信息
- 显示模块版本、运行状态
- 提供项目 GitHub 仓库链接
- 实时统计已挂载分区数、已启用策略数等

## 访问 WebUI

### 本地访问
在设备上通过浏览器访问：
```
http://localhost:8888
```

### 远程访问（通过 ADB）
```bash
adb forward tcp:8888 tcp:8888
# 然后在 PC 浏览器中访问：http://localhost:8888
```

## 项目结构

```
meta-overlayfsUltra-webui/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx          # 主仪表板页面
│   │   ├── components/           # shadcn/ui 组件库
│   │   ├── App.tsx               # 应用入口
│   │   ├── index.css             # 全局样式
│   │   └── main.tsx              # React 入口
│   ├── public/
│   │   └── index.html
│   └── package.json
├── dist/
│   └── public/                   # 构建输出（静态文件）
└── server/
    └── index.ts                  # 占位符（web-static 不使用）
```

## 开发指南

### 本地开发

```bash
# 进入项目目录
cd /home/ubuntu/meta-overlayfsUltra-webui

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# 访问 http://localhost:5173

# 构建生产版本
pnpm build
# 输出到 dist/public/
```

### 集成到模块

构建后的静态文件已复制到模块的 `webui/` 目录：
```
/home/ubuntu/meta-overlayfsUltra/webui/
├── index.html
├── assets/
│   ├── index-*.css
│   └── index-*.js
└── __manus__/
```

### 技术栈

- **前端框架**：React 19 + Wouter（轻量级路由）
- **UI 组件库**：shadcn/ui（基于 Radix UI）
- **样式系统**：Tailwind CSS 4 + OKLCH 色彩空间
- **图标库**：Lucide React
- **表单处理**：React Hook Form + Zod

## 后续扩展

### 计划功能
1. **实时数据同步**：通过 WebSocket 实时更新挂载状态
2. **配置持久化**：将用户设置保存到模块配置文件
3. **日志查看**：显示模块运行日志和错误信息
4. **高级配置**：支持自定义隐藏策略参数
5. **多语言支持**：英文、中文等多语言界面

### 与模块后端的交互

WebUI 可以通过以下方式与模块后端通信：

1. **Shell 脚本调用**：通过 `su -c 'ksu ...'` 执行模块命令
2. **配置文件读写**：直接修改 `/data/adb/modules/meta-overlayfsUltra/` 下的配置文件
3. **API 代理**：如果升级到 web-db-user 可使用后端 API

## 许可证

GPL-3.0 — 与 meta-overlayfsUltra 主项目保持一致
