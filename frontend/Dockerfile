FROM node:20-bookworm-slim

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
