# opentelemetry-signoz-sample

## Project Overview

This repository contains a microservices-based application demonstrating the integration of OpenTelemetry for observability. It's designed to showcase how different services such as orders, payments, products, and users can be monitored in a distributed system.

## Directory Structure
```bash
├── Mock Data
├── docs
├── hono-drizzle-node-app
├── k8s
├── order-service
├── payment-service
├── product-service
└── user-service
```
### Folder Details 
- **Mock Data**
  Contains mock datasets for MongoDB collections, useful for seeding and testing services.
- **k8s**
Kubernetes manifests for deploying demo services and the OpenTelemetry Collector (otel-collector).
- **hono-drizzle-node-app**
A sample Node.js + TypeScript application built using Hono
 and Drizzle ORM which connects  to `Postgresql` Database.
-**order-service / payment-service / product-service / user-service**
  Microservices implemented in Node.js and TypeScript. Each service contains its own business logic, routes, and configuration. All of these services connect to `MongoDB` Database.
  
## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Node.js installed
- Access to MongoDB and Postgres

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sanket-Rajgiri/opentelemetry-nodejs-example.git
   cd opentelemetry-nodejs-example
   ```

2. **Build and run the services using Docker Compose**
   ```bash
   docker compose up --build
   ```

## Technology Stack

- **Backend**: Node.js with Hono
- **Database**: MongoDB, Postgres
- **Observability**: OpenTelemetry
- **Containerization**: Docker, Docker Compose

## Project Structure

- `hono-drizzle-node-app/`: Contains all files related to Hono-Service using Postgres Database
- `order-service/`: Contains all files related to the Order service including its Dockerfile and server logic.
- `payment-service/`: Contains all files for the Payment service.
- `product-service/`: Manages the Product service files.
- `user-service/`: Holds the User service files.
- `docker-compose.yml`: Defines how the Docker containers are built, run, and interconnect.
- `k8s/` : Contains all Kubenetes Manifests and Scripts to Load Images in Minikube and Port-Forwarding Services.

## Key Endpoints

Each service offers several endpoints for interacting with the application:

- **Orders**

  - `GET /orders`: Retrieves all orders, including user details.
  - `POST /orders`: Creates a new order and updates the product stock.

- **Payments**

  - `GET /payments`: Lists all payments.
  - `POST /payments`: Processes a payment for an order.

- **Products**

  - `GET /products`: Fetches all products.
  - `POST /products`: Adds a new product to the inventory.

- **Users**

  - `GET /users`: Returns all registered users.
  - `POST /users`: Registers a new user.

- **Hono-App**
  - `GET /users`: Returns all users in Hono-App
  - `Post /users`: Creates new user in Hono-App

## Running in Minikube

- **Start Databases Locally** :
  ```bash
  docker compose up mongodb postgresql -d
  ```
- **Load Data in MongoDB Database Running Locally**: Use `/Mock Data` folder to load data in MongoDB Database runnning Locally.
- **Run DB Migration in Hono-Service App**:

  1. Go to hono-app folder

  ```bash
  cd hono-drizzle-node-app
  ```

  2. Install Depedencies

  ```bash
  npm i
  ```

  3. Export Postgres `DATABASE_URL`

  ```bash
  export DATABASE_URL=postgres://root:otel@localhost:5432/otel
  ```

  4. Run Schema Migration for Postgres Database

  ```bash
  npm run db:generate

  npm run db:migrate
  ```

- **Build App Images Locally** :

  ```bash
    docker compose build
  ```

- **Load Images in Minikube**:

  ```bash
   k8s/image_load.sh
  ```

- **Start Otel-Collector** :
  ```bash
  kubernetes apply -f 'k8s/otel-collector*.yml'
  ```
- **Start Services**:

  ```bash
  kubernetes apply -f 'k8s/*-service.yml'
  ```

- **Port-Forward Services**:

  ```bash
  k8s/port-forward.sh
  ```

- **Run EndPoint Check on Port Forwarded Services**:

  ```bash
  k8s/endpoint_check.sh
  ```

- **Test Endpoints in PostMan or Browser**

## Troubleshooting Common Issues

- **Service discovery issues**: Ensure all services are correctly referenced in `docker-compose.yml` and network configurations are correct.
- **Database connectivity issues**: Double-check MongoDB URIs and network access settings in Docker.
- **Load Data in MongDB using MockData**
- **Endpoint failures**: Verify that all routes are correctly implemented and tested. Check server logs for detailed error messages.
- **Configuration errors in Docker Compose**: Ensure that ports, volumes, and dependency definitions are correct.
