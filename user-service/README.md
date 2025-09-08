# Database Setup (MongoDB)

## 1. Start MongoDB

```bash
docker compose up mongodb -d
```

## 2. Export DB URL

```bash
export DATABASE_URL="mongodb://localhost:27017/users"
```

## 3. Load Users Collection with Mock Data `/Mock Data/users.users.json`.

# Build and Run

```bash
# Build
npm run build

# Start
npm run start
```

The Service runs on `http://localhost:3004`

# API Documentation

Base URL: `http://localhost:3004`

## Root Endpoint

### GET `/`

Health check for the User Service.

#### Request

* **Method:** `GET`
* **URL:** `/`

#### Response

* **200 OK**

```json
{ "Status": "User Service running on http://localhost:3004" }
```

---

## Users API

Base Path: `/users`

---

### GET `/users`

Retrieve all users.

#### Request

* **Method:** `GET`
* **URL:** `/users`

#### Response

* **200 OK**

  ```json
  [
    {
      "_id": "64bdf0f8c2a3d12e98a7c001",
      "name": "Alice",
      "email": "alice@example.com",
      "registeredAt": "2025-09-05T09:00:00Z"
    }
  ]
  ```

---

### POST `/users`

Create a new user.

#### Request

* **Method:** `POST`
* **URL:** `/users`
* **Body (JSON):**

  ```json
  {
    "name": "Charlie",
    "email": "charlie@example.com"
  }
  ```

#### Response

* **201 Created**

  ```json
  {
    "_id": "64bdf0f8c2a3d12e98a7c005",
    "name": "Charlie",
    "email": "charlie@example.com",
    "registeredAt": "2025-09-05T10:00:00Z"
  }
  ```

* **500 Internal Server Error**

  ```json
  { "message": "Internal server error", "error": "Error details here" }
  ```

---

### GET `/users/{id}`

Retrieve a user by ID.

#### Request

* **Method:** `GET`
* **URL:** `/users/{id}`
* **Params:**

  * `id` (string, required)

#### Response

* **200 OK**

  ```json
  {
    "_id": "64bdf0f8c2a3d12e98a7c001",
    "name": "Alice",
    "email": "alice@example.com",
    "registeredAt": "2025-09-05T09:00:00Z"
  }
  ```

* **404 Not Found**

  ```json
  { "message": "User not found" }
  ```

---

## External API

### GET `/external/users`

Proxy call to Hono App’s `/users` endpoint.

#### Response

* **200 OK**

  ```json
  [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
  ```

* **500 Internal Server Error**

  ```json
  { "message": "Failed to fetch external data", "error": "Error details here" }
  ```

# Observability

* OpenTelemetry Traces are emitted for request handling.
* Custom Middleware records response time for every request.

# Environment Variables

| Variable       | Default                         | Description              |
| -------------- | ------------------------------- | ------------------------ |
| `DATABASE_URL` | `mongodb://mongodb:27017/users` | MongoDB connection URL   |
| `HONOAPP_URL`  | `http://hono-app:3000`          | URL of external Hono app |
