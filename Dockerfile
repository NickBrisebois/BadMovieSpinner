FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/.output ./

# mount this directory to host
RUN mkdir -p ./public

EXPOSE 3000

CMD ["node", "server/index.mjs"]