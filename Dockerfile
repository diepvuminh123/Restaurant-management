FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm install \
  && npm --prefix backend install \
  && npm --prefix frontend install

# Copy source code
COPY . .

EXPOSE 3000 5001

CMD ["npm", "run", "dev"]
