# stage: base
FROM registry.cn-beijing.aliyuncs.com/bogeit/bun:1.3 AS base
WORKDIR /app

# stage: install dependencies
FROM base AS install
WORKDIR /temp/dev
#COPY package.json bun.lock ./
COPY . .
RUN bun install --frozen-lockfile --registry http://registry.npmmirror.com

# stage: build application
FROM base AS build
COPY --from=install /temp/dev/node_modules ./node_modules
COPY . .
# 以后构建语句最好放到 ci 的 stages 中. 这样可以共享基础容器.
RUN bun run build -m devtest  # 测试环境构建
#RUN bun run build --mode production   # 生产模式

# stage: serve with nginx
FROM registry.cn-beijing.aliyuncs.com/bogeit/nginx:1.25.5 AS release

RUN mkdir -p /mnt/nginx/conf.d \
    && mkdir /mnt/nginx/www
WORKDIR /mnt/nginx/www
COPY --from=build /app/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]