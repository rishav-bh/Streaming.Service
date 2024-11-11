# Use the official Node.js LTS version as the base image
FROM node:lts-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7000

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# Install production dependencies
RUN npm install --production --silent && mv node_modules ../

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (matching your .env file)
EXPOSE 7000

# Change ownership to node user
RUN chown -R node /usr/src/app

# Switch to non-root user
USER node

# Command to start the application
CMD ["npm", "start"]