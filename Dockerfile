FROM node:stretch-slim
WORKDIR /forest-api
COPY . .
RUN npm i
EXPOSE 3001

ENTRYPOINT [ "./docker-entrypoint.sh" ]