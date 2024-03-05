#!/bin/bash

# Set your container registry URL
REGISTRY_URL="ghcr.io/nguyendhst/low-code-monorepo"

docker login $REGISTRY_URL

docker build -f ../../apiserver/auth-api/Dockerfile.prod -t yalc-auth-api:latest ../../apiserver/auth-api
docker tag yalc-auth-api:latest $REGISTRY_URL/yalc-auth-api:latest
docker push $REGISTRY_URL/yalc-auth-api:latest

docker build -f ../../apiserver/user-api/Dockerfile.prod -t yalc-user-api:latest ../../apiserver/user-api
docker tag yalc-user-api:latest $REGISTRY_URL/yalc-user-api:latest
docker push $REGISTRY_URL/yalc-user-api:latest

docker build -f ../../apiserver/user-api/user-db/Dockerfile.dev -t yalc-user-db:latest ../../apiserver/user-api/user-db
docker tag yalc-user-db:latest $REGISTRY_URL/yalc-user-db:latest
docker push $REGISTRY_URL/yalc-user-db:latest

echo "All images have been built and pushed."

ssh -T low-code << EOF
  cd /app/low-code-monorepo;
  git pull;
  cd deployment/ec2;
  docker compose -f compose.ec2.yaml up -d --pull --force-recreate --remove-orphans;
EOF