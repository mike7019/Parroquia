# Multi-stage production build for optimal performance
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine AS production

# Install production dependencies and utilities
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Install PM2 globally for process management
RUN npm install -g pm2@latest

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy production dependencies and built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/ecosystem.config.cjs ./
COPY --from=builder /app/*.js ./

# Remove unnecessary files and directories for production
RUN rm -rf \
    tests/ \
    *.md \
    ollama/ \
    scripts/ \
    temp-archive/ \
    jenkins/ \
    docs/ \
    seeders/ \
    Dockerfile* \
    docker-compose* \
    .git* \
    node_modules/.cache \
    *.ps1 \
    *.http

# Create necessary directories with proper permissions
RUN mkdir -p logs temp uploads && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000
ENV PM2_PUBLIC_KEY=""
ENV PM2_SECRET_KEY=""

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check with improved reliability
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || \
        node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application with PM2 in production mode
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]
