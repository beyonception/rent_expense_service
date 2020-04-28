FROM node:12.16.2-stretch-slim
RUN mkdir /opt/app-root/
WORKDIR /opt/app-root/
COPY . .
RUN npm install -d
CMD ["npm", "start"]
