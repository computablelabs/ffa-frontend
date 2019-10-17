#!/bin/bash -ex

# Build and tag docker image
docker build -t "ffa:latest" .
docker tag "ffa:latest" "$REPO_URI:latest"
docker tag "ffa:latest" "$REPO_URI:$TRAVIS_COMMIT"
$(aws ecr get-login --no-include-email --region $AWS_DEFAULT_REGION)
docker push "$REPO_URI:latest"
docker push "$REPO_URI:$TRAVIS_COMMIT"

# Force deploy service to pick up new docker image & wait for success
python scripts/restart_service.py $CLUSTER $SERVICE
