FROM node:20-alpine
WORKDIR /app

# Copiamos solo archivos de dependencias para aprovechar el cache de Docker
COPY package*.json ./
RUN npm install --only=production

# Copiamos el resto del código
COPY . .

EXPOSE 4000

# Usamos el comando de inicio de producción
CMD [ "npm", "start" ]