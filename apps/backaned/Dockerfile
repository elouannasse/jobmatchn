# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
# Using --legacy-peer-deps to handle dependency conflicts between NestJS and validator packages
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port (user requested 4000)
ENV PORT=4000
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]
