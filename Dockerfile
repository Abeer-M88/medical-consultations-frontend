FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN ls -la dist/medical-consultations-frontend/
RUN npm install -g serve

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist/medical-consultations-frontend -l $PORT"]