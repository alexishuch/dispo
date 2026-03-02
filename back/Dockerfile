FROM --platform=linux/arm64/v8 arm64v8/node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx @nestjs/cli build

FROM --platform=linux/arm64/v8 arm64v8/node:25-alpine
WORKDIR /app
COPY --from=builder /app/dist/ /app/dist/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
CMD ["node", "dist/main"]
