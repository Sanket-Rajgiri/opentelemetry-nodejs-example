# Database Setup (MongoDB)

## 1. Start MongoDB

```bash
docker compose up mongodb -d
```

## 2. Export DB URL

```bash
export DATABASE_URL="mongodb://localhost:27017/payments"
```

## 3. Load Payments Collection with Mock Data `/Mock Data/payments.payments.json`.

# Build and Run

```bash
# Build
npm run build

# Start
npm run start
```

The Service run on `http://localhost:3002`

# API Documentation

Base URL: `http://localhost:3002`

## Root Endpoint

### GET `/`

Health check for the Payment Service.

#### Request

- **Method:** `GET`
- **URL:** `/`

#### Response

- **200 OK**

```json
{ "Status": "Payment Service running on http://localhost:3002" }
```

---

## Payments API

Base Path: `/payments`

---

### GET `/payments`

Retrieve all payments.

#### Request

- **Method:** `GET`
- **URL:** `/payments`

#### Response

- **200 OK**
  ```json
  [
    {
      "_id": "64bdf0f8c2a3d12e98a7c0d1",
      "userId": "64bdf0f8c2a3d12e98a7c001",
      "products": [{ "productId": "64bdf0f8c2a3d12e98a7c111", "quantity": 2 }],
      "paymentDate": "2025-09-05T09:00:00Z",
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

### POST `/payments`

Create a new payment (validates order status with Order Service and updates it to "paid").

#### Request

- **Method:** `POST`
- **URL:** `/payments`
- **Body (JSON):**

  ```json
  {
    "orderId": "64bdf0f8c2a3d12e98a7c0d1",
    "amount": 250
  }
  ```

#### Response

- **201 Created**

  ```json
  {
    "_id": "64be00f8c2a3d12e98a7c0d2",
    "orderId": "64bdf0f8c2a3d12e98a7c0d1",
    "amount": 250,
    "paymentDate": "2025-09-05T09:30:00Z"
  }
  ```

- **400 Bad Request**

  ```json
  {
    "error": "Invalid order ID or order not ready for payment"
  }
  ```

- **500 Internal Server Error**

  ```json
  { "error": "Internal server error", "details": "Error message" }
  ```

---

# Observability

- OpenTelemetry Traces are emitted for request handling.
- Custom Middleware records response time for every request.

# Environment Variables

| Variable            | Default                            | Description            |
| ------------------- | ---------------------------------- | ---------------------- |
| `DATABASE_URL`      | `mongodb://mongodb:27017/payments` | MongoDB connection URL |
| `ORDER_SERVICE_URL` | `http://order-service:3001`        | URL of Order Service   |
