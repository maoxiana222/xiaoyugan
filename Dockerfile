# 基础镜像
FROM node:20-slim

# 安装 pnpm
RUN npm install -g pnpm@latest

# 设置工作目录
WORKDIR /app

# 1. 复制配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. 复制整个项目代码
COPY . .

# 3. 【关键步骤】删除干扰项：直接删掉会报错且不需要的 sandbox 项目
# 这样 pnpm 编译时就不会再扫描它的配置文件
RUN rm -rf artifacts/mockup-sandbox

# 4. 安装所有依赖
RUN pnpm install --no-frozen-lockfile

# 5. 编译前端应用
# 加上 --filter 的同时，因为 sandbox 已被删除，编译环境会变得非常干净
RUN pnpm run build --filter @workspace/xiaoyugan...

# 6. 暴露端口
EXPOSE 4173

# 7. 启动服务
CMD ["pnpm", "--filter", "@workspace/xiaoyugan", "run", "serve", "--host", "0.0.0.0"]