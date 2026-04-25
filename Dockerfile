# 基础镜像
FROM node:20-slim

# 安装 pnpm
RUN npm install -g pnpm@latest

# 设置容器内工作目录
WORKDIR /app

# 1. 先复制依赖配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. 复制整个项目代码
COPY . .

# 3. 安装所有依赖 (针对 Monorepo 结构)
RUN pnpm install --no-frozen-lockfile

# 4. 仅编译前端项目及其依赖包，跳过无关的 sandbox
RUN pnpm run build --filter @workspace/xiaoyugan...

# 5. 暴露 Vite 预览端口
EXPOSE 4173

# 6. 启动前端服务 (使用预览模式并强制监听所有 IP)
CMD ["pnpm", "--filter", "@workspace/xiaoyugan", "run", "serve", "--host", "0.0.0.0"]