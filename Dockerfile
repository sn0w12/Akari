FROM node:25-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the server
FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-optional && npm cache clean --force

# Copy built server output and bootstrap entry
COPY --from=builder /app/dist ./dist
COPY server-entry.mjs ./server-entry.mjs

# Expose the port the app will run on
EXPOSE 3000

USER nodejs

# Start the Node.js server via bootstrap entry
CMD ["node", "server-entry.mjs"]
