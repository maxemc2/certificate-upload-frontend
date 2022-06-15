# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --production
# copy all frontend file to folder 'app'
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
# remove nginx container's defaukt.conf, nginx configure
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf
# copy current content nginx.conf to the file /etc/nginx in nginx container
COPY ./nginx.conf /etc/nginx/
# copy the packaged vue frontend item to nginx to run
COPY --from=build-stage /app/dist /usr/share/nginx/html
# expose in port 8080
EXPOSE 8000
# using mode 'daemon off' to run in nginx, in order to ensure the container does not exit
CMD ["nginx", "-g", "daemon off;"]

# FROM nginx:alpine
# COPY dist/ /usr/share/nginx/html/
# COPY nginx.conf /etc/nginx/conf.d/