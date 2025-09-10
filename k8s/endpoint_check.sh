#!/bin/bash

# List of GET endpoints from the Postman collection
endpoints=(
  "http://localhost:3000"
  "http://localhost:3001"
  "http://localhost:3002/"
  "http://localhost:3003"
  "http://localhost:3004"
  "http://localhost:3001/orders"
  "http://localhost:3004/users"
  "http://localhost:3000/users"
  "http://localhost:3001/external"
  "http://localhost:3003/products"
  "http://localhost:3002/payments"
  "http://localhost:3004/external/users"
  "http://localhost:3000/users/2"
)

echo "🚀 Hitting all GET endpoints"
echo "--------------------------------------------"

for url in "${endpoints[@]}"; do
  echo "👉 Request: $url"
  
  # Get status + body
  response=$(curl -s -w "\n%{http_code}" "$url")
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n1)

  echo "Status: $status"
  echo "Response:"
  echo "$body"
  echo "--------------------------------------------"
done
