FROM node:18-alpine
WORKDIR /app
COPY package.json ./
# Use this line if you have a package-lock.json
# COPY package-lock.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
