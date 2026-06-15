# stage: base
FROM registry.cn-beijing.aliyuncs.com/bogeit/bun:1.3 AS base
WORKDIR /app

# stage: install dependencies
FROM base AS install
WORKDIR /temp/dev
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --registry http://registry.npmmirror.com

# stage: build application
FROM base AS build
COPY --from=install /temp/dev/node_modules ./node_modules
COPY . .
RUN bun run build --mode dev
#RUN bun run build --mode production   # 生产模式

# stage: serve with nginx
FROM registry.cn-beijing.aliyuncs.com/bogeit/nginx:1.25.5 AS release

RUN mkdir -p /mnt/nginx/conf.d \
    && mkdir /mnt/nginx/www
WORKDIR /mnt/nginx/www
COPY --from=build /app/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]