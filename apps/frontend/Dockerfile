# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
# Using --legacy-peer-deps to handle dependency conflicts
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
# Use production environment
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Expose port (user requested 3000)
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
