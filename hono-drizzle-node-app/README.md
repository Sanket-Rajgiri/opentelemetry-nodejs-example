# Schema Migration 

### 1. Start Postgres Server 
```bash 
    docker compose up postgresql -d 
```
### 2. Export DB_URL 
```bash
    DATABASE_URL=postgres://root:otel@localhost:5432/otel
```
### 3. Run MIgration
```bash
    npm run db:generate

    npm run db:migrate
```


# Build and Run 
```bash
# Build 
npm run build 

# Start 
npm run start 
```

# API Documentation

Base URL: `http://localhost:3000`

---

## Root Endpoint

### GET `/`
Simple health check / welcome endpoint.

#### Request
- **Method:** `GET`
- **URL:** `/`

#### Response
- **200 OK**
```text
Hello Hono!
```

---

## Users API

Base Path: `/users`

---

### GET `/users`
Retrieve all users.

#### Request
- **Method:** `GET`
- **URL:** `/users`

#### Response
- **200 OK**
```json
[
  {
    "id": 1,
    "name": "Alice",
    "age": 25,
    "email": "alice@example.com"
  },
  {
    "id": 2,
    "name": "Bob",
    "age": 30,
    "email": "bob@example.com"
  }
]
```

---

### POST `/users`
Create a new user.

#### Request
- **Method:** `POST`
- **URL:** `/users`
- **Body (JSON):**
```json
{
  "name": "Charlie",
  "age": 28,
  "email": "charlie@example.com"
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

---

### GET `/users/{id}`
Retrieve a user by ID.

#### Request
- **Method:** `GET`
- **URL:** `/users/{id}`
- **Params:**
  - `id` (integer, required)

#### Response
- **200 OK**
```json
{
  "id": 1,
  "name": "Alice",
  "age": 25,
  "email": "alice@example.com"
}
```

---

### PUT `/users/{id}`
Update a user by ID.

#### Request
- **Method:** `PUT`
- **URL:** `/users/{id}`
- **Params:**
  - `id` (integer, required)
- **Body (JSON):**
```json
{
  "name": "Alice Smith",
  "age": 26,
  "email": "alice.smith@example.com"
}
```

#### Response
- **200 OK**
```json
{
  "id": 1,
  "name": "Alice Smith",
  "age": 26,
  "email": "alice.smith@example.com"
}
```

- **404 Not Found**
```json
{ "error": "User not found" }
```

---

### DELETE `/users/{id}`
Delete a user by ID.

#### Request
- **Method:** `DELETE`
- **URL:** `/users/{id}`
- **Params:**
  - `id` (integer, required)

#### Response
- **200 OK**
```json
{
  "deletedCount": 1
}
```
