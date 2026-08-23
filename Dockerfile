# Multi-stage production build for optimal performance
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies, needed by nothing here
# but kept in sync with package-lock.json for reproducible installs)
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

# Install only production dependencies directly in this stage (excludes
# jest/nodemon/eslint/sequelize-cli/etc.), instead of copying the builder's
# full node_modules — smaller image, smaller attack surface.
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application code. seeders/ and scripts/ are required at runtime by
# `npm run db:seed` and `npm run admin:create` (both documented to run via
# `docker-compose exec api npm run ...`) — they must NOT be stripped out.
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/seeders ./seeders
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/ecosystem.config.cjs ./
COPY --from=builder /app/*.js ./

# Create necessary directories with proper permissions
RUN mkdir -p logs temp uploads && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# Set environment variables for production
# NOTE: must match ecosystem.config.cjs (PORT 3000) and docker-compose.yml's
# healthcheck/port mapping. Previously this was 4000, silently masked because
# docker-compose.yml overrides PORT and the healthcheck target — but running
# this image standalone (docker run, no compose) would listen on 3000 via PM2
# while Docker's own HEALTHCHECK curled 4000, marking a healthy container as
# unhealthy forever.
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
