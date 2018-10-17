FROM node:8.12.0-alpine as builder
WORKDIR /multi_shell
COPY . .
RUN npm install ssh2 xterm@2.2.3 socket.io --force
CMD ["node", "server.js"]