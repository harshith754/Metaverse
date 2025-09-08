# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
# Copy package.json from the 'frontend' subdirectory
COPY frontend/package.json ./
# If you have a package-lock.json in frontend/, uncomment the next line
# COPY frontend/package-lock.json ./
RUN npm install
# Copy the rest of the frontend code
COPY frontend/ .
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:1.21.6-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]