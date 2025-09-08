#!/bin/bash

# List of images to load into Minikube
IMAGES=(
  "opentelemetry-nodejs-example-order:latest"
  "opentelemetry-nodejs-example-hono-app:latest"
  "opentelemetry-nodejs-example-payment:latest"
  "opentelemetry-nodejs-example-product:latest"
  "opentelemetry-nodejs-example-user:latest"
)

echo "🚀 Loading images into Minikube..."

for IMAGE in "${IMAGES[@]}"; do
  echo "➡️ Loading $IMAGE ..."
  minikube image load "$IMAGE" --overwrite=true
done

echo "✅ All images loaded into Minikube!"
