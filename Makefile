nginx:
	yarn build \
		&& docker build -t fe:nginx -f Dockerfile.nginx.dockerfile . \
		&& docker run -p 8080:80 fe:nginx

prod:
	yarn build \
		&& docker build -t fe:nginx .