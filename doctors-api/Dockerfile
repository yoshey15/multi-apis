FROM node:20-alpine

WORKDIR /app

# Copia ambos por si existe package-lock (si no existe, igual funciona)
COPY package*.json ./

# Usa npm install (no npm ci) para evitar el error por falta de package-lock
RUN npm install --omit=dev

# Copia el código
COPY src ./src

# Puerto (Azure usará WEBSITES_PORT=4003)
ENV PORT=4003
EXPOSE 4003

CMD ["node", "src/app.js"]
