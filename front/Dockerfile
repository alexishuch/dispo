FROM --platform=linux/arm64/v8 arm64v8/node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM --platform=linux/arm64/v8 arm64v8/node:25-alpine
WORKDIR /app
COPY --from=builder /app/build/ /build
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["node", "build"]