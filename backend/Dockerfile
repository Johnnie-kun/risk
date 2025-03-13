FROM node:18

WORKDIR /app

# Install nodemon globally
RUN npm install -g nodemon ts-node typescript

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 5000

# Use nodemon directly instead of npm run dev
CMD ["nodemon", "--exec", "ts-node", "src/app.ts"] 