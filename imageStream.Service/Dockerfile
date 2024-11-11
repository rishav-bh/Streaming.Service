# Use the official Node.js LTS version as the base image
FROM node:lts-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7001

# Create and set the working directory
WORKDIR /usr/src/app

# Install system dependencies for better performance and compatibility
RUN apk add --no-cache \
    git \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production \
    && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Create a non-root user for security
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup

# Change ownership of the application directory
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 7001

# Command to start the application
CMD ["npm", "start"]