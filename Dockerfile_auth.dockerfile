FROM nginx

ARG HTTP_USERNAME
ARG HTTP_PASSWORD

WORKDIR /app
COPY conf/nginx_auth.conf /etc/nginx/nginx.conf
COPY dist /app

RUN apt-get update && \
    apt-get install --no-install-recommends -y apache2-utils && \
    htpasswd -bc /etc/nginx/.htpasswd $HTTP_USERNAME $HTTP_PASSWORD
RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log
