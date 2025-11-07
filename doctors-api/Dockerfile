FROM node:20-alpine
WORKDIR /app

# Copia manifests
COPY package*.json ./

# Instala dependencias de producción usando el lockfile
RUN npm ci --omit=dev

# Copia el código fuente
COPY src ./src

# Vars de entorno / puerto
ENV NODE_ENV=production
ENV PORT=4003
EXPOSE 4003

# Ejecuta la app
CMD ["node", "src/app.js"]

