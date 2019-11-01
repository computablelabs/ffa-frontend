FROM nginx

WORKDIR /app
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY dist /app
