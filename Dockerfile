# 1. Base image matched to your Playwright version with all Linux browser dependencies
FROM mcr.microsoft.com/playwright:v1.63.0-noble

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package definitions first for layer caching
COPY package*.json ./

# 4. Install dependencies inside container
RUN npm ci

# 5. Copy your framework files (pages, fixtures, tests, data, configs)
COPY . .

# 6. Default execution command
CMD ["npx", "playwright", "test"]