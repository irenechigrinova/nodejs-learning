FROM node:16
WORKDIR /api
COPY package.json package-lock.json ./
RUN npm install
COPY . /api
CMD ["npm", "start"]