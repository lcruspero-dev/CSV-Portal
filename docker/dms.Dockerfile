# DMS-new Frontend Dockerfile
# Multi-stage build: Build React app with Vite, serve with Nginx

# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY DMS-new/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY DMS-new/ ./

# Build arguments for Vite environment variables (if needed)
ARG VITE_BASE_URL
ARG VITE_UPLOADFILES_URL

# Set environment variables for the build
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_UPLOADFILES_URL=$VITE_UPLOADFILES_URL

# Build the application
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM nginx:alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY docker/nginx/dms.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
