FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo pdf-parse)
RUN npm install --production

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p data public/images

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "src/server.js"]
