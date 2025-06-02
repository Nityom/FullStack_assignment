FROM node:20

WORKDIR /app

# Install system dependencies required for onnxruntime
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    libc6 \
    glibc-source \
    libgomp1 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
