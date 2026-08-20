# Multi-stage build para optimizar tamaño de imagen
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias del backend
COPY backend/package*.json ./

# Instalar todas las dependencias
RUN npm ci && npm cache clean --force

# Copiar código fuente del backend
COPY backend/src ./src

# Presentaciones y adjuntos versionados para sembrar en el volumen
RUN mkdir -p seed/presentations seed/files seed/images
COPY data/presentations ./seed/presentations
COPY public/files ./seed/files
COPY public/images/mtto-albatros-20ago26-p1.png ./seed/images/mtto-albatros-20ago26-p1.png
COPY public/images/mtto-albatros-20ago26-p2.png ./seed/images/mtto-albatros-20ago26-p2.png
COPY public/images/mtto-albatros-20ago26-p3.png ./seed/images/mtto-albatros-20ago26-p3.png

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
COPY --from=builder /app/seed ./seed

# Asegurar que los directorios existen y tienen permisos correctos
RUN mkdir -p data public/images public/files data/presentations data/backups && \
    chmod -R 755 data public

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
