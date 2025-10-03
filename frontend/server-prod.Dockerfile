# ---- 1. BUILD STAGE ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code and build
COPY . .
RUN npm run build

# ---- 2. NGINX STAGE ----
FROM nginx:alpine
# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional, for SPA routing)
# Make sure you have a file called default.conf in your project
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
