FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache chromium chromium-chromedriver

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache chromium chromium-chromedriver \
  && apk add --no-cache tini

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  NODE_ENV=production

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER appuser

EXPOSE 4000

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/main"]
