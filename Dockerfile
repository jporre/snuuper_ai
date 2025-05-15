FROM node:23.11 AS builder
WORKDIR /app

# Aumentar la memoria disponible para Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias nativas para canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar package.json y pnpm-lock.yaml (si existe)
COPY package*.json pnpm*.yaml ./

# Instalar dependencias con pnpm
RUN pnpm install

# Copiar los archivos fuente
COPY . .

# Construir la aplicación con más memoria
RUN pnpm run build

# Imagen para producción
FROM node:23.11.0-alpine AS production
WORKDIR /app

# Instalar dependencias necesarias para thumbnail y canvas
RUN apk add --no-cache \
    # Dependencias para canvas
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg \
    # Dependencias para thumbnails
    imagemagick \
    curl \
    ffmpeg \
    python3 \
    # Para unoconv necesitamos libreoffice
    libreoffice

# Descargar unoconv directamente como script ejecutable
RUN wget https://raw.githubusercontent.com/unoconv/unoconv/master/unoconv -O /usr/local/bin/unoconv && \
    chmod +x /usr/local/bin/unoconv

# Crear usuario para no usar root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Establecer permisos
USER appuser

# Copiar archivos de construcción y dependencias
COPY --from=builder --chown=appuser:appgroup /app/build ./build
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup package.json .

# Configurar variables de entorno
ENV PORT=5050
ENV BODY_SIZE_LIMIT=100m

# Exponer puerto
EXPOSE 5050

# Comando para iniciar la aplicación
CMD ["node", "build"]