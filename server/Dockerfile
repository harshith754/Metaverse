FROM node:18-alpine
WORKDIR /app
# Copy package.json from the 'server' subdirectory
COPY server/package.json ./
# If you have a package-lock.json in server/, uncomment the next line
# COPY server/package-lock.json ./
RUN npm install --omit=dev
# Copy the rest of the server code
COPY server/ .
EXPOSE 5000
CMD ["npm", "start"]