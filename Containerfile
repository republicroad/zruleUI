# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3 AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
# COPY package.json bun.lock /temp/dev/
COPY . /temp/dev/
# RUN cd /temp/dev  && bun install --frozen-lockfile --registry http://registry.npmmirror.com
RUN cd /temp/dev  && bun install --frozen-lockfile --registry http://registry.npmmirror.com --verbose


FROM base AS prerelease
COPY . .
# 复制外层依赖
COPY --from=install /temp/dev/node_modules node_modules
# # 复制workspace依赖
# COPY --from=install /temp/dev/jdm-editor/packages/jdm-editor/node_modules jdm-editor/packages/jdm-editor/node_modules
# [optional] tests & build
# RUN bun test
RUN bun run build --mode dev

# Stage : Serve with Nginx
FROM nginx:alpine AS release
# Copy static files to Nginx web root
COPY --from=prerelease /app/dist /usr/share/nginx/html
# COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
