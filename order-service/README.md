# Database Setup (MongoDB)

## 1. Start MongoDB

```bash
docker compose up mongodb -d
```

## 2. Export DB URL

```bash
export DATABASE_URL="mongodb://localhost:27017/orders"
```

## 3. Load Orders Collection with Mock Data `/Mock Data/orders.orders.json`.

# Build and Run

```bash
# Build
npm run build

# Start
npm run start
```

The Service run on `http://localhost:3001`

# API Documentation

Base URL: `http://localhost:3001`

## Root Endpoint

### GET `/`

Health check for the Order Service.

#### Request

- **Method:** `GET`
- **URL:** `/`

#### Response

- **200 OK**

```json
{ "Status": "Order Service running on http://localhost:3001" }
```

---

## Orders API

Base Path: `/orders`

---

### GET `/orders`

Retrieve all orders.

#### Request

- **Method:** `GET`
- **URL:** `/orders`

#### Response

- **200 OK**
  ```json
  [
    {
      "_id": "64bdf0f8c2a3d12e98a7c0d1",
      "userId": "64bdf0f8c2a3d12e98a7c001",
      "products": [{ "productId": "64bdf0f8c2a3d12e98a7c111", "quantity": 2 }],
      "orderDate": "2025-09-05T09:00:00Z",
      "status": "awaiting payment",
      "user": {
        "_id": "64bdf0f8c2a3d12e98a7c001",
        "name": "Alice",
        "email": "alice@example.com"
      }
    }
  ]
  ```

---

### POST `/orders`

Create a new order (validates product stock and decrements stock in Product Service).

#### Request

- **Method:** `POST`
- **URL:** `/orders`
- **Body (JSON):**

  ```json
  {
    "userId": "64bdf0f8c2a3d12e98a7c001",
    "products": [{ "productId": "64bdf0f8c2a3d12e98a7c111", "quantity": 2 }]
  }
  ```

#### Response

- **200 OK**

  ```json
  {
    "id": 3,
    "name": "Charlie",
    "age": 28,
    "email": "charlie@example.com"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Product 64bdf0f8c2a3d12e98a7c111 is out of stock or does not exist."
  }
  ```

---

### GET `/orders/{id}`

Retrieve order details by ID, including user info.

#### Request

- **Method:** `GET`
- **URL:** `/orders/{id}`
- **Params:**
  - `id` (integer, required)

#### Response

- **200 OK**

  ```json
  {
    "_id": "64bdf0f8c2a3d12e98a7c0d1",
    "userId": "64bdf0f8c2a3d12e98a7c001",
    "products": [{ "productId": "64bdf0f8c2a3d12e98a7c111", "quantity": 2 }],
    "status": "paid",
    "user": {
      "_id": "64bdf0f8c2a3d12e98a7c001",
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
  ```

---

### PATCH `/orders/{id}`

Update the status of an order.

#### Request

- **Method:** `PATCH`
- **URL:** `/orders/{id}`
- **Params:**
  - `id` (integer, required)
- **Body (JSON):**

  ```json
  { "status": "shipped" }
  ```

#### Response

- **200 OK**

  ```json
  {
    "_id": "64bdf0f8c2a3d12e98a7c0d1",
    "status": "shipped"
  }
  ```

- **404 Not Found**

  ```json
  { "message": "Order not found" }
  ```

---

## External API

### GET `/external`

Proxy call to User Service’s external endpoint.

#### Response

- **200 Ok**

  ```json
  [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
  ```

- **500 Internal Server Error**
  ```json
  { "message": "Failed to fetch external data" }
  ```

# Observability 
- OpenTelemetry Traces are emitted for request handling.
- Custom Middleware records response time for every request.
- Custom Metrics : 
    - `order_validation_duration` (Histogram, unit: ms)

# Environment Variables 

| Variable              | Default                          | Description            |
| --------------------- | -------------------------------- | ---------------------- |
| `DATABASE_URL`        | `mongodb://mongodb:27017/orders` | MongoDB connection URL |
| `USER_SERVICE_URL`    | `http://user-service:3004`       | URL of User Service    |
| `PRODUCT_SERVICE_URL` | `http://product-service:3003`    | URL of Product Service |


