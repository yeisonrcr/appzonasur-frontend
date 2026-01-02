FROM node:20-alpine

WORKDIR /app

# 1. Copiar manifiestos de dependencias (Package.json)
# Se copian primero para aprovechar la caché de capas de Docker.
# Si no cambian los package.json, Docker no volverá a ejecutar los 'npm install'.
COPY package*.json ./
COPY apps/cliente/package*.json ./apps/cliente/
COPY apps/admin/package*.json ./apps/admin/

# 2. Instalar dependencias
# Instala dependencias del workspace raíz (compartidas)
RUN npm install

# Instala dependencias específicas del Cliente
RUN cd apps/cliente && npm install

# Instala dependencias específicas del Admin (NUEVO)
RUN cd apps/admin && npm install

# 3. Copiar el código fuente
# Esto se hace al final porque el código cambia frecuentemente
COPY . .

# 4. Exponer puertos
# 5174 para Cliente, 5175 para Admin
EXPOSE 5174
EXPOSE 5175

# 5. Directorio de trabajo y comando por defecto
# Dejamos WORKDIR en la raíz. El comando específico se define en docker-compose.yml
# (CMD ["npm", "run", "dev"] se elimina o se deja como fallback, pero compose lo sobreescribe)
WORKDIR /app
CMD ["echo", "Especifica un comando en docker-compose para iniciar cliente o admin"]