#!/bin/bash

# Define services and ports
declare -A SERVICES=(
  ["hono-app"]=3000
  ["order-service"]=3001
  ["payment-service"]=3002
  ["product-service"]=3003
  ["user-service"]=3004
)

NAMESPACE="demo-app"   # Change if your services are in another namespace

echo "🚀 Checking and starting port-forwarding for services..."

for SERVICE in "${!SERVICES[@]}"; do
  PORT=${SERVICES[$SERVICE]}

  # Check if service is already reachable
  if curl -s --max-time 2 "http://localhost:${PORT}/" >/dev/null; then
    echo "⚠️  $SERVICE already reachable on localhost:${PORT}, skipping..."
  else
    echo "➡️ Forwarding $SERVICE on port $PORT ..."
    kubectl port-forward --address 0.0.0.0 svc/$SERVICE $PORT:$PORT -n $NAMESPACE >/dev/null 2>&1 &
    sleep 2  # let port-forward establish
    
    # Verify after starting
    if curl -s --max-time 3 "http://localhost:${PORT}/" >/dev/null; then
      echo "✅ $SERVICE forwarded successfully on port $PORT"
    else
      echo "❌ Failed to reach $SERVICE on port $PORT after forwarding"
    fi
  fi
done

echo "👉 Run 'ps aux | grep kubectl' to see active port-forwards"
echo "👉 Run 'killall kubectl' to stop them"