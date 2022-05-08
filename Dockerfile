FROM node:lts-alpine
RUN mkdir /api && chown -R node:node /api
WORKDIR /api
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
USER node
RUN npm install --legacy-peer-deps && mv node_modules ../
COPY --chown=node:node . .
EXPOSE 3001
CMD ["npm","run","start:dev"]
