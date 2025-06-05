FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production
RUN npm install -D @nestjs/cli

RUN mkdir -p uploads/thumbnails uploads/images

COPY .env* ./

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]