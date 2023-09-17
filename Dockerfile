# syntax=docker/dockerfile:1
FROM node:16

WORKDIR /app
COPY package*.json /app

RUN npm i
COPY . /app

CMD ["node", "server.js"]
EXPOSE 80