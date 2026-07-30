# IconNest

> 你的图标，都有归处。

IconNest 是一个现代化、本地优先的图标综合管理工作台。它把自己的 SVG、常用开源图标库、收藏、集合、搜索、复制与导出放进同一个清爽的网页界面中，并可通过 Docker 部署到 Ubuntu / Debian VPS。

> [!NOTE]
> 项目仍处于 `0.2.0 Preview` 打磨阶段，暂未发布正式 Release。数据结构与界面仍可能调整。

![IconNest social preview](./public/og.png)

## 0.2.0 功能

- **私人图标库**：上传并安全清理 SVG，数据保存在浏览器本地
- **多来源探索**：通过 Iconify API 搜索 Lucide、Tabler、Phosphor、Remix Icon 与 Solar
- **集合与标签**：自定义集合、修改图标名称、添加或移除标签
- **收藏与最近浏览**：快速回到常用或刚刚查看过的图标
- **批量管理**：多选、批量收藏、移动集合、导出与删除
- **筛选与排序**：按来源筛选，并按时间、名称或来源排序
- **多种交付方式**：复制 SVG、HTML、React 组件或 CSS Mask，下载 SVG
- **灵活预览**：实时调色、缩放、旋转与水平翻转
- **剪贴板导入**：直接粘贴 SVG，并自动检测重复内容
- **备份与恢复**：将完整图标库导出为 JSON，并在其他设备恢复
- **回收站**：软删除、恢复或永久移除图标
- **主题与响应式布局**：支持浅色 / 深色模式、桌面端与移动端
- **真实页面路由**：图标库、探索、收藏、最近浏览、回收站和集合均有独立 URL
- **同源服务 API**：Iconify 搜索和 SVG 获取由服务端校验、代理并缓存
- **本地优先**：不需要账号、数据库或云存储
- **Docker 部署**：提供 Dockerfile 与 Docker Compose 配置

## 技术栈

- React 19 + TypeScript
- Next.js App Router
- vinext + Vite
- Tailwind CSS 4
- Radix Colors
- Lucide React
- Iconify Search / SVG API
- Cloudflare Worker 兼容构建

## 快速开始

需要 Node.js `>= 24.11.0 <25`，推荐使用 `.nvmrc` 中锁定的 Node.js 24 LTS 版本。

```bash
git clone https://github.com/Elainaicey/IconNest.git
cd IconNest
npm install
npm run dev
```

打开终端显示的本地地址即可使用。

常用命令：

```bash
npm run dev      # 启动开发服务器
npm run build    # 生成生产构建
npm run start    # 预览生产构建
npm run lint     # 代码检查
npm test         # 构建并验证服务端输出
```

## Docker Compose 一键部署

默认配置直接从 GitHub Container Registry 拉取预构建镜像，不需要在 VPS 上编译源码。

```bash
mkdir -p iconnest && cd iconnest
curl -fsSLO https://raw.githubusercontent.com/Elainaicey/IconNest/main/docker-compose.yml
docker compose pull
docker compose up -d
```

默认访问地址为 `http://服务器IP:3000`。

如需修改端口：

```bash
ICONNEST_PORT=8080 docker compose up -d
```

更新到最新镜像：

```bash
docker compose pull
docker compose up -d
```

默认镜像：`ghcr.io/elainaicey/iconnest:latest`

生产环境建议在容器前配置 Caddy、Nginx 或 Traefik，并启用 HTTPS。镜像以非 root 用户运行，包含健康检查，并通过 GitHub Actions 自动构建 `linux/amd64` 与 `linux/arm64` 版本。

### 从源码构建

开发者需要本地构建时：

```bash
git clone https://github.com/Elainaicey/IconNest.git
cd IconNest
docker compose \
  -f docker-compose.yml \
  -f docker-compose.build.yml \
  up -d --build
```

## 数据与隐私

IconNest 使用浏览器 `localStorage` 保存图标、集合和偏好：

- 数据不会自动上传到 IconNest 服务器
- 删除浏览器站点数据会同时删除本地图标库
- 更换设备或浏览器前，请先使用侧边栏的“导出”功能备份
- SVG 上传大小上限为 256 KB；脚本、内嵌页面与危险事件属性会被移除
- 探索页通过 IconNest 同源 API 请求 Iconify 公共服务，请遵守各图标库自己的许可证

## 页面与 API

主要页面均可直接访问、刷新和分享：

| 页面 | 路径 |
| --- | --- |
| 图标库 | `/library` |
| 探索图标 | `/explore` |
| 我的收藏 | `/favorites` |
| 最近浏览 | `/recent` |
| 回收站 | `/trash` |
| 自定义集合 | `/collections/:collection` |

服务端接口：

| 接口 | 用途 |
| --- | --- |
| `GET /api/health` | 服务健康状态 |
| `GET /api/icons/search` | 校验并代理 Iconify 搜索 |
| `GET /api/icons/svg` | 校验、缓存并返回 SVG |

本地图标库没有伪装成远程数据库：客户端通过版本化存储适配器保存私有数据，服务端 API 只承担第三方网络访问。未来接入数据库时，可以替换存储适配器而不改动页面组件。

## 项目结构

```text
IconNest/
├─ app/
│  ├─ (workspace)/      # 图标库、探索、收藏、集合等页面路由
│  ├─ api/              # 健康检查与 Iconify 服务端代理
│  ├─ globals.css       # Radix 色阶、排版、响应式与主题
│  ├─ layout.tsx        # 全局元数据
│  └─ page.tsx          # 根路径重定向
├─ features/library/    # 工作区状态、视图和可复用组件
├─ lib/icons/           # 类型、目录、API 客户端、存储与 SVG 工具
├─ public/
│  └─ og.png            # 社交分享封面
├─ tests/
│  └─ rendered-html.test.mjs
├─ worker/              # Cloudflare Worker 入口
├─ .openai/             # Sites 部署声明
├─ .github/workflows/   # 自动构建并发布 GHCR 镜像
├─ Dockerfile
├─ docker-compose.yml
├─ docker-compose.build.yml
├─ vite.config.ts
└─ package.json
```

## 版本路线

### 0.2.0 Preview

- 独立页面路由和同源 Iconify API
- 模块化前端架构与版本化本地存储
- 基于 Radix 色阶的亮色 / 深色设计系统
- 页面、API 和服务端渲染自动化测试

### 0.3

- 可选 SQLite / PostgreSQL 服务端存储与多设备同步
- 账号系统和可迁移的远程工作区
- SVG 批量上传与高级元数据编辑
- PNG / WebP 多尺寸导出

### 0.4

- 团队共享空间与权限
- Figma 插件 / 浏览器扩展
- 自定义 Iconify Provider
- 图标去重、相似度搜索与版本历史

## 图标来源

探索功能基于 [Iconify API](https://iconify.design/docs/api/)。Iconify 为不同开源图标集提供统一的搜索与 SVG 获取接口。IconNest 不重新授权第三方图标；使用、分发或商用前请查看具体图标集的许可证。

## 参与贡献

欢迎提交 Issue 与 Pull Request。建议在提交前运行：

```bash
npm run lint
npm test
```

## License

[MIT](./LICENSE)
