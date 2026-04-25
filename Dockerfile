# 1. 使用 Node 官方镜像作为基础
FROM node:20-slim

# 2. 安装 pnpm
RUN npm install -g pnpm@latest

# 3. 设置工作目录
WORKDIR /app

# 4. 先复制 package 相关文件（利用 Docker 缓存加速后续部署）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 5. 复制整个项目的代码
COPY . .

# 6. 安装所有依赖
RUN pnpm install --no-frozen-lockfile

# 7. 编译前端项目
# 请确保你的 package.json 里的项目名是 xiaoyugan
RUN pnpm run build --filter xiaoyugan

# 8. 暴露端口（Vite/Next.js 默认通常是 3000 或 5173）
EXPOSE 3000

# 9. 启动命令
# 加上 --host 0.0.0.0 是为了让外部能访问到容器内的服务
CMD ["pnpm", "--filter", "xiaoyugan", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]