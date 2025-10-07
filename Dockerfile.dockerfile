# --------------------
# Stage 1: Build Stage
# --------------------
# Use a full environment image to build/compile your application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application (e.g., for React/Angular/Vue/TypeScript)
# If your app doesn't require a build step (like a simple backend API), you can skip this.
RUN npm run build 

# --------------------
# Stage 2: Production Stage
# --------------------
# Use a minimal, secure runtime image for the final container
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy ONLY the necessary files from the 'builder' stage
# This significantly reduces the final image size and excludes build tools/source code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist # Copy the built files
COPY --from=builder /app/package.json . # Copy package.json for runtime information

# Expose the port the application runs on
EXPOSE 8080

# Define the command to run the application when the container starts
CMD ["node", "dist/server.js"] 
# Or, if running a non-built application: CMD ["node", "index.js"]
