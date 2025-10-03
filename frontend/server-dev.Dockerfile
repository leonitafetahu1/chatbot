# Stage 1: Build the app
FROM node:20-alpine as build

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .

## https://github.com/browserslist/update-db#readme
#RUN npx update-browserslist-db@1.0.13

EXPOSE 8080

#ENV DEBUG=vite:*

# CMD ["npm", "run", "dev"]
CMD ["npm", "run", "dev"]