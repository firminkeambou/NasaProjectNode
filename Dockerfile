FROM node:22-alpine

WORKDIR /app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN mkdir -p ./client ./server
COPY ./client/package.json ./client
COPY ./client/yarn.lock ./client

RUN cd ./client && yarn install --production && cd ..

COPY ./server/package.json ./server
COPY ./server/yarn.lock ./server
RUN cd ./server && yarn install --production && cd ..

COPY ./client ./client
RUN cd ./client && yarn run build && cd ..

COPY ./server ./server
USER node
CMD ["sh", "-c", "cd ./server && yarn start"]
EXPOSE 8000