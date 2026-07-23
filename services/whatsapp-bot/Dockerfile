FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends chromium ca-certificates fonts-liberation && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY services/whatsapp-bot/package*.json ./
RUN npm install --omit=dev
COPY services/whatsapp-bot/server.js ./
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV WHATSAPP_SESSION_PATH=/data/.wwebjs_auth
EXPOSE 3001
CMD ["npm", "start"]
