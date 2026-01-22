# Multi-stage build para optimizar tamaño de imagen
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Stage de producción
FROM node:18-alpine AS production

# Instalar LibreOffice para renderizar PowerPoint a imágenes
RUN apk add --no-cache \
    libreoffice \
    ttf-dejavu \
    ttf-liberation \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar solo dependencias y código desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Crear directorios necesarios (también se crearán en runtime si se monta un volumen)
RUN mkdir -p data public/images public/files data/presentations data/backups

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar ownership de directorios
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "src/server.js"]
