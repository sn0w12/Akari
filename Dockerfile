FROM node:25-alpine

# Set working directory
WORKDIR /app
COPY package*.json ./

RUN npm ci
COPY . .

RUN npm run build

# Copy and make executable the start script
COPY /scripts/start.sh .
RUN chmod +x start.sh

# Expose the port Next.js runs on (default 3000)
ARG PORT=3000
EXPOSE $PORT

CMD ["./start.sh"]