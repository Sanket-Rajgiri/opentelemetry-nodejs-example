#!/bin/bash

# List of images to load into Minikube
IMAGES=(
  "opentelemetry-nodejs-example-main-main-order:latest"
  "opentelemetry-nodejs-example-main-main-hono-app:latest"
  "opentelemetry-nodejs-example-main-main-payment:latest"
  "opentelemetry-nodejs-example-main-main-product:latest"
  "opentelemetry-nodejs-example-main-main-user:latest"
)

echo "🚀 Loading images into Minikube..."

for IMAGE in "${IMAGES[@]}"; do
  echo "➡️ Loading $IMAGE ..."
  minikube image load "$IMAGE" --overwrite=true
done

echo "✅ All images loaded into Minikube!"
