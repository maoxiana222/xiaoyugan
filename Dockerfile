# 使用轻量级 Node 镜像
FROM node:20-slim

# 安装 pnpm
RUN npm install -g pnpm@latest

# 设置工作目录
WORKDIR /app

# 1. 仅复制必要配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. 复制所有项目代码
COPY . .

# 3. 安装依赖 (使用 --no-frozen-lockfile 确保跳过版本锁死校验)
RUN pnpm install --no-frozen-lockfile

# 4. 精准编译：只编译 xiaoyugan 及其依赖的 lib，三个点 ... 非常关键
RUN pnpm run build --filter @workspace/xiaoyugan...

# 5. 暴露端口
EXPOSE 4173

# 6. 启动命令：使用预览模式并监听所有地址
CMD ["pnpm", "--filter", "@workspace/xiaoyugan", "run", "serve", "--host", "0.0.0.0"]