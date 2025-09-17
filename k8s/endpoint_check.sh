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

  response=$(curl -s -w "\n%{http_code}" "$url")
  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')   # works on mac + linux

  echo "Status: $status"
  echo "Response:"
  echo "$body"
  echo "--------------------------------------------"
done
