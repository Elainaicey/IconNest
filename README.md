# IconNest

> 你的图标，都有归处。

IconNest 是一个现代化、本地优先的图标管理工作台。你可以在同一个网页应用中收集自己的 SVG、探索常用开源图标库、整理集合与标签，并将图标交付为 SVG、PNG、React 组件、HTML 或 CSS Mask。

当前版本：`0.1.0`

## 功能

- 拖拽或批量导入 SVG，单次最多 50 个文件
- 自动净化 SVG，移除脚本、事件属性、嵌入页面和外部引用
- 搜索 Lucide、Tabler、Phosphor、Remix Icon 与 Solar 图标
- 新建、重命名、删除集合，编辑图标名称和标签
- 收藏、最近浏览、回收站、筛选、排序和批量操作
- 导出 SVG ZIP 资产包、512px PNG 或完整 JSON 备份
- 复制 SVG、HTML、React 组件和 CSS Mask
- 实时调整预览颜色、尺寸、旋转和水平翻转
- `⌘/Ctrl K` 快捷命令与 `⌘/Ctrl B` 可折叠侧栏
- 浅色、深色、响应式布局和减少动态效果支持
- IndexedDB 自动保存与可见的保存状态
- 单容器 Docker Compose 部署

## 技术栈

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- Radix Colors
- Lucide React
- fflate
- Iconify API
- Node.js 24

生产构建使用 Next.js standalone 输出。Docker 运行时只包含应用所需文件，不携带源码、构建工具或开发依赖。

## 本地开发

需要 Node.js `>= 24.11.0 <25`。

```bash
git clone https://github.com/Elainaicey/IconNest.git
cd IconNest
npm ci
npm run dev
```

常用命令：

```bash
npm run dev        # 开发服务器
npm run build      # 生产构建
npm run start      # 运行 standalone 构建
npm run typecheck  # TypeScript 检查
npm run lint       # ESLint 检查
npm test           # 构建并运行自动化测试
```

## Docker Compose 部署

生产配置只启动一个 `iconnest` 容器，并从 GitHub Container Registry 拉取预构建镜像：

```bash
sudo git clone --depth 1 https://github.com/Elainaicey/IconNest.git /opt/iconnest
cd /opt/iconnest
sudo cp .env.example .env
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps
```

服务默认只监听 `127.0.0.1:3001`，不会占用常见的 3000 端口，也不会绕过反向代理直接暴露到公网。端口和资源限制可在 `.env` 中调整。

### Caddy

```caddyfile
iconnest.ushio.cc {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3001
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

完整说明见 [`deploy/README.md`](./deploy/README.md) 和 [`deploy/Caddyfile.example`](./deploy/Caddyfile.example)。

### 更新

```bash
cd /opt/iconnest
sudo git pull --ff-only
sudo docker compose pull
sudo docker compose up -d --remove-orphans
```

## 数据与隐私

IconNest 的图标、集合、收藏和标签保存在当前浏览器的 IndexedDB 中；主题与侧栏偏好保存在 localStorage。

- 私人图标内容不会上传到 IconNest 服务器
- 容器无状态，因此不需要 Docker 数据卷
- 更新或重建容器不会删除浏览器中的图标
- 清除站点数据、更换域名、浏览器或设备会得到独立工作区
- 跨设备转移前请导出 JSON 备份，再在目标浏览器恢复
- 探索功能会通过同源 API 请求 Iconify 公共服务

## 页面与 API

| 页面 | 路径 |
| --- | --- |
| 图标库 | `/library` |
| 探索图标 | `/explore` |
| 我的收藏 | `/favorites` |
| 最近浏览 | `/recent` |
| 回收站 | `/trash` |
| 自定义集合 | `/collections/:collection` |

| 接口 | 用途 |
| --- | --- |
| `GET /api/health` | 服务健康与版本信息 |
| `GET /api/icons/search` | 校验并代理 Iconify 搜索 |
| `GET /api/icons/svg` | 校验、缓存并返回 SVG |

## 项目结构

```text
IconNest/
├─ app/                  # 页面路由、API、全局样式与元数据
├─ components/ui/        # 通用视觉组件
├─ features/library/     # 图标工作区功能、状态与交互组件
├─ lib/icons/            # 图标类型、存储、导出、API 与 SVG 工具
├─ scripts/              # standalone 构建整理脚本
├─ deploy/               # Caddy 示例和生产运维说明
├─ tests/                # 页面、API、存储与部署契约测试
├─ .github/              # CI、镜像发布与依赖更新配置
├─ Dockerfile
├─ docker-compose.yml
├─ docker-compose.build.yml
├─ next.config.ts
└─ package.json
```

## 路线图

### 0.2.0

- 可选的服务端持久化与账号系统
- 多设备工作区同步
- WebP 与多尺寸 PNG 导出
- 高级元数据批量编辑和智能去重

### 0.3.0

- 团队共享空间与权限
- Figma 插件与浏览器扩展
- 自定义 Iconify Provider
- 图标版本历史与相似度搜索

## 图标许可

探索功能基于 [Iconify API](https://iconify.design/docs/api/)。IconNest 不重新授权第三方图标；使用、分发或商用前，请查看具体图标集的许可证。

## 贡献与安全

参见 [CONTRIBUTING.md](./CONTRIBUTING.md) 与 [SECURITY.md](./SECURITY.md)。

## License

[MIT](./LICENSE)
