FROM node:20-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web-student/package.json ./apps/web-student/package.json
COPY apps/web-admin/package.json ./apps/web-admin/package.json
RUN pnpm install --frozen-lockfile

COPY apps/web-student ./apps/web-student
RUN pnpm --filter @ibooking/design-tokens build
RUN pnpm --filter web-student build

FROM nginx:1.27-alpine AS runtime

COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web-student/dist /usr/share/nginx/html
