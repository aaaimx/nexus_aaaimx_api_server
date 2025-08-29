# Build stage
FROM node:20-bullseye AS builder

# Set the working directory
WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@10.5.1

# Install node-gyp globally
RUN npm install -g node-gyp

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Copy configuration files
COPY tsconfig.json ./
COPY src/infrastructure/orm/schema.prisma ./src/infrastructure/orm/schema.prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=src/infrastructure/orm/schema.prisma

# Rebuild native modules
RUN npm rebuild bcrypt --build-from-source && \
    npm rebuild argon2 --build-from-source || true && \
    npm rebuild sqlite3 --build-from-source || true && \
    npm rebuild sharp --build-from-source || true

# Production stage
FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# Copy built node modules and compiled prisma from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json

# Install production dependencies only
RUN npm install -g pnpm@10.5.1

# Expose the application port
EXPOSE ${PORT}

# Command to start the application
CMD ["pnpm", "dev"]
