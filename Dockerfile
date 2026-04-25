# 使用 Node 20 镜像
FROM node:20-slim

# 安装 pnpm
RUN npm install -g pnpm@latest

# 设置工作目录
WORKDIR /app

# 复制配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制整个项目 (包含 lib 和 artifacts)
COPY . .

# 安装依赖
RUN pnpm install --no-frozen-lockfile

# 编译前端项目 (使用你 package.json 里的 build 脚本)
RUN pnpm run build --filter @workspace/xiaoyugan

# 暴露端口 (Vite 预览默认通常是 4173，或者根据 Railway 映射)
EXPOSE 4173

# 启动预览模式 (使用你 package.json 里的 serve 脚本)
# --host 0.0.0.0 是必须的，否则外部无法访问
CMD ["pnpm", "--filter", "@workspace/xiaoyugan", "run", "serve"]