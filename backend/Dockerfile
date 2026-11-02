# Stage 1: Build source code & sinh Prisma Client
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Cài đặt OpenSSL cho môi trường Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --engine-strict=false

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime image
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

# Cài đặt OpenSSL cho môi trường chạy thực thi
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]