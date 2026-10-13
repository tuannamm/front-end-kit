# Static build of the playground, served by nginx. Hash routing (#/...) means no SPA fallback config is needed.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/ui/package.json packages/ui/
COPY apps/playground/package.json apps/playground/
RUN npm ci
# git history for the changelog page (vite plugin apps/playground/changelog.ts); the repo root comes in as a named context
RUN apk add --no-cache git
COPY --from=repo .git /repo.git
ENV GIT_DIR=/repo.git
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY --from=build /app/apps/playground/dist /usr/share/nginx/html
EXPOSE 80
