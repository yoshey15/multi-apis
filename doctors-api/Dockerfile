FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 4003
ENV PORT=4003 SERVICE_NAME=doctors-api
CMD ["node", "src/app.js"]
