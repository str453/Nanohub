# --------------------
# Stage 1: Build Stage
# --------------------
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the React app (outputs to /app/build)
RUN npm run build

# --------------------
# Stage 2: Serve Stage
# --------------------
# Use a lightweight Nginx image to serve static files
FROM nginx:alpine

# Copy the built React app from the builder stage to Nginx's public directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Nginx automatically starts and serves /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
