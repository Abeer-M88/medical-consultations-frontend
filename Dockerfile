FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm install -g http-server

EXPOSE 8080

CMD ["http-server", "dist/medical-consultations-frontend", "-p", "8080", "-c-1", "--proxy", "http://localhost:8080?"]
