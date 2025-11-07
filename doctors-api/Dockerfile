FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# copia package.json + package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev

# copia el código
COPY src ./src

# expone y arranca
EXPOSE 4003
ENV PORT=4003 SERVICE_NAME=doctors-api
CMD ["node", "src/index.js"]
