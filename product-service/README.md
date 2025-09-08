# Database Setup (MongoDB)

## 1. Start MongoDB

```bash
docker compose up mongodb -d
```

## 2. Export DB URL

```bash
export DATABASE_URL="mongodb://localhost:27017/products"
```

## 3. Load Products Collection with Mock Data `/Mock Data/products.products.json`.

# Build and Run

```bash
# Build
npm run build

# Start
npm run start
```

The Service runs on `http://localhost:3003`

# API Documentation

Base URL: `http://localhost:3003`

## Root Endpoint

### GET `/`

Health check for the Product Service.

#### Request

- **Method:** `GET`
- **URL:** `/`

#### Response

- **200 OK**

```json
{ "Status": "Product Service running on http://localhost:3003" }
```

---

## Products API

Base Path: `/products`

---

### GET `/products`

Retrieve all products.

#### Request

- **Method:** `GET`
- **URL:** `/products`

#### Response

- **200 OK**
  ```json
  [
    {
      "_id": "64c1a9e2c2a3d12e98a7c101",
      "name": "Laptop",
      "price": 1200,
      "stock": 10
    },
    {
      "_id": "64c1a9e2c2a3d12e98a7c102",
      "name": "Phone",
      "price": 800,
      "stock": 15
    }
  ]
  ```

---

### GET `/products/{id}`

Retrieve a product by ID.

#### Request

- **Method:** `GET`
- **URL:** `/products/{id}`
- **Params:**
  - `id` (string, required)

#### Response

- **200 OK**

  ```json
  {
    "_id": "64c1a9e2c2a3d12e98a7c101",
    "name": "Laptop",
    "price": 1200,
    "stock": 10
  }
  ```

- **404 Not Found**

  ```json
  { "message": "Product not found" }
  ```

---

### POST `/products`

Create a new product.

#### Request

- **Method:** `POST`
- **URL:** `/products`
- **Body (JSON):**

  ```json
  {
    "name": "Headphones",
    "price": 150,
    "stock": 30
  }
  ```

#### Response

- **201 Created**

  ```json
  {
    "_id": "64c1a9e2c2a3d12e98a7c103",
    "name": "Headphones",
    "price": 150,
    "stock": 30
  }
  ```

---

### POST `/products/{id}/decrement-stock`

Decrement product stock.

#### Request

- **Method:** `POST`
- **URL:** `/products/{id}/decrement-stock`
- **Params:**
  - `id` (string, required)
- **Body (JSON):**

  ```json
  { "decrementBy": 2 }
  ```

#### Response

- **200 OK**

  ```json
  {
    "_id": "64c1a9e2c2a3d12e98a7c101",
    "name": "Laptop",
    "price": 1200,
    "stock": 8
  }
  ```

- **400 Bad Request**

  ```json
  { "message": "Insufficient stock" }
  ```

- **404 Not Found**

  ```json
  { "message": "Product not found" }
  ```

---

### POST `/products/{id}/increment-stock`

Increment product stock.

#### Request

- **Method:** `POST`
- **URL:** `/products/{id}/increment-stock`
- **Params:**
  - `id` (string, required)
- **Body (JSON):**

  ```json
  { "incrementBy": 5 }
  ```

#### Response

- **200 OK**

  ```json
  {
    "_id": "64c1a9e2c2a3d12e98a7c101",
    "name": "Laptop",
    "price": 1200,
    "stock": 15
  }
  ```

- **404 Not Found**

  ```json
  { "message": "Product not found" }
  ```

---

# Observability
- OpenTelemetry Traces are emitted for request handling.
- Custom Middleware records response time for every request.

# Environment Variables

| Variable        | Default                             | Description            |
| --------------- | ----------------------------------- | ---------------------- |
| `DATABASE_URL`  | `mongodb://mongodb:27017/products`  | MongoDB connection URL |
| `PORT`          | `3003`                              | Service Port           |
