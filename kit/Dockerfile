# Static build of the playground, served by nginx. Hash routing (#/...) means no SPA fallback config is needed.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/ui/package.json packages/ui/
COPY apps/playground/package.json apps/playground/
# Optional: install through a closer registry (e.g. the Nexus npm group); npm swaps the lockfile's npmjs host for it
ARG NPM_REGISTRY
RUN npm ci ${NPM_REGISTRY:+--registry=$NPM_REGISTRY}
# git history for the changelog page (vite plugin apps/playground/changelog.ts); the repo root comes in as a named context
RUN apk add --no-cache git
COPY --from=repo .git /repo.git
ENV GIT_DIR=/repo.git
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY --from=build /app/apps/playground/dist /usr/share/nginx/html
EXPOSE 80
