FROM nginx

WORKDIR /app
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY dist /app

RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log
