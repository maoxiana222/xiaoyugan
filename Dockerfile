# 使用轻量级 Node.js 镜像
FROM node:20-slim

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 先复制全局的配置文件
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 复制所有项目代码（包括 lib 和 artifacts）
COPY . .

# 安装所有依赖（针对整个 Monorepo）
RUN pnpm install --no-frozen-lockfile

# 编译前端应用
RUN pnpm run build --filter xiaoyugan

# 暴露端口（Railway 会自动映射）
EXPOSE 3000

# 启动命令
CMD ["pnpm", "--filter", "xiaoyugan", "start"]