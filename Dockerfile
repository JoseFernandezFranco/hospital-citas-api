FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY src ./src

# Ensure data directory exists for SQLite DB
RUN mkdir -p data

# Expose application port
EXPOSE 3000

# Launch the service
CMD ["node", "src/server.js"]
