# 🚆 Railway Ticket Reservation System

A high-concurrency backend system for booking railway tickets, built to explore distributed locking, graph algorithms, dynamic pricing, and event-driven architecture — designed and built phase by phase with production practices (CI/CD, load testing, clean layered architecture) from day one.

---

## 🛠️ Tech Stack
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)

---

## 🏗️ Layered Architecture & Request Lifecycle

This project follows a strict layered architecture per module to enforce separation of concerns, testability, and maintainability:

$$\text{Client} \longrightarrow \text{Server (Express)} \longrightarrow \text{Route} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{PostgreSQL / Redis}$$

### Request Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Client as 👤 Client (Browser / App)
    participant Server as 🌐 Express Server (Middleware & Auth)
    participant Route as 🚦 Router Layer
    participant Controller as 🎮 Controller Layer
    participant Service as 🧠 Service Layer (Business Logic)
    participant Repo as 🗄️ Repository Layer (Data Access)
    participant DB as 🐘 PostgreSQL / Redis

    Note over Client,DB: Standard HTTP Request Lifecycle
    Client->>+Server: HTTP Request (Headers + Body + JWT)
    Server->>Server: Global Middleware (CORS, Helmet, Rate Limiter)
    Server->>+Route: Matches URI endpoint & HTTP verb
    Route->>Route: Route Guard (JWT Auth & Input Validation)
    Route->>+Controller: Dispatches validated DTO
    Controller->>+Service: Executes business use case
    Service->>Service: Evaluates business rules (e.g. Dynamic Pricing, Locks)
    Service->>+Repo: Query request via Prisma / Redis client
    Repo->>+DB: Executes Query (e.g. SELECT ... FOR UPDATE)
    DB-->>-Repo: Returns raw entity / dataset
    Repo-->>-Service: Returns domain entity
    Service-->>-Controller: Returns computed result / DTO
    Controller-->>-Route: Formats standardized HTTP response
    Route-->>-Server: Passes response object
    Server-->>-Client: 200 OK / 201 Created (JSON payload)
```

- **Route** — Maps HTTP endpoints, applies validation schemas and JWT authentication guards.
- **Controller** — Handles request extraction, calls services, and maps results to HTTP status codes (no business logic).
- **Service** — Encapsulates core business rules, algorithms, dynamic pricing strategies, and concurrency locks (fully unit-testable in isolation).
- **Repository** — The only layer that interfaces directly with the database (Prisma / Raw SQL / Redis).

---

## 📊 Database Design & Entity Relationships

The schema is built with **PostgreSQL** and managed via **Prisma ORM**.

```mermaid
erDiagram
    STATION ||--o{ ROUTE : "source / destination"
    TRAIN ||--o{ SEAT : "has physical"
    TRAIN ||--o{ TRIP : "operates"
    ROUTE ||--o{ TRIP : "scheduled on"
    USER ||--o{ BOOKING : "places"
    SEAT ||--o{ BOOKING : "reserved in"
    TRIP ||--o{ BOOKING : "scheduled for"

    STATION {
        string id PK "UUID"
        string name UK "Station Name"
        string code UK "Station Code (e.g. NYC)"
        string location "City / Coordinates"
    }

    TRAIN {
        string id PK "UUID"
        string name "Train Name"
        string number UK "Train Fleet Number"
        int total_capacity "Total Passenger Capacity"
    }

    ROUTE {
        string id PK "UUID"
        string source_id FK "Station(id)"
        string destination_id FK "Station(id)"
        decimal base_price "Standard Route Fare"
    }

    TRIP {
        string id PK "UUID"
        string route_id FK "Route(id)"
        string train_id FK "Train(id)"
        datetime departure_time "Scheduled Departure"
        datetime arrival_time "Scheduled Arrival"
    }

    SEAT {
        string id PK "UUID"
        string train_id FK "Train(id)"
        string seat_number "e.g. 14A, B2-01"
        SeatClass seat_class "ECONOMY | FIRST_CLASS"
    }

    USER {
        string id PK "UUID"
        string name "User Name"
        string email UK "Unique Email"
        string password_hash "Bcrypt Hash"
    }

    BOOKING {
        string id PK "UUID"
        string user_id FK "User(id)"
        string seat_id FK "Seat(id)"
        string trip_id FK "Trip(id)"
        BookingStatus status "PENDING | CONFIRMED | CANCELLED"
        decimal final_price "Locked Fare"
        string payment_token "Payment Gateway Ref"
        datetime created_at "Created Timestamp"
        datetime expires_at "Hold Expiration (10m)"
    }
```

---

## 🧩 Deep-Dive Workflows & Core Algorithms

### 1. Graph-Based Multi-Hop Route Search (Dijkstra + Min-Heap)

Railway networks are modeled as a **weighted directed graph** $G = (V, E)$, where Stations are vertices ($V$) and direct Routes are edges ($E$) with weight equal to `base_price`. A generic **Min-Heap** provides $O(\log V)$ priority queue operations to find the cheapest path between any two stations, even if no direct train exists.

```mermaid
flowchart TD
    classDef startNode fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#fff;
    classDef intermediateNode fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#fff;
    classDef targetNode fill:#059669,stroke:#047857,stroke-width:2px,color:#fff;
    classDef heapNode fill:#F59E0B,stroke:#B45309,stroke-width:2px,color:#fff;
    classDef pathEdge stroke:#10B981,stroke-width:3px,color:#10B981;

    subgraph Station_Network ["🚉 Railway Graph Representation"]
        S1(["Station A (Start)"]):::startNode
        S2(["Station B"]):::intermediateNode
        S3(["Station C"]):::intermediateNode
        S4(["Station D (Dest)"]):::targetNode

        S1 -- "$50" --> S2
        S1 -- "$120 (Direct)" --> S4
        S2 -- "$30" --> S3
        S3 -- "$25" --> S4
        S2 -- "$60" --> S4
    end

    subgraph Min_Heap_Process ["⚡ Min-Heap Execution Step-by-Step"]
        H1["1. Push (A, $0) to Min-Heap"]:::heapNode --> H2["2. Pop A -> Relax Neighbors (B: $50, D: $120)"]:::heapNode
        H2 --> H3["3. Pop B ($50) -> Relax (C: $50+$30=$80, D: $50+$60=$110)"]:::heapNode
        H3 --> H4["4. Pop C ($80) -> Relax (D: $80+$25=$105) [Cheapest!]"]:::heapNode
        H4 --> H5["5. Pop D ($105) -> Target reached, backtrack path"]:::targetNode
    end

    subgraph Optimal_Result ["✅ Cheapest Route Found"]
        R["A ➔ B ➔ C ➔ D = $105 (Saves $15 vs Direct $120)"]:::targetNode
    end

    S1 ==>|Step 1| S2 ==>|Step 2| S3 ==>|Step 3| S4
```

---

### 2. 10-Minute Redis Seat Hold & TTL Workflow

To provide a smooth checkout experience without blocking database connections, a seat is placed on a **10-minute temporary hold** in Redis using atomic key allocation.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Passenger A
    participant API as 🚀 Express API
    participant Redis as 🔴 Redis (Cache & Lock)
    participant DB as 🐘 PostgreSQL

    User->>+API: POST /bookings/hold (tripId, seatId)
    API->>+Redis: SET hold:trip_1:seat_12A "user_1" NX EX 600
    alt Seat already held by someone else
        Redis-->>API: Nil (Key already exists)
        API-->>User: 409 Conflict ("Seat currently held")
    else Lock Acquired (NX succeeded)
        Redis-->>-API: OK
        API->>+DB: INSERT INTO Booking (status: PENDING, expires_at: now + 10m)
        DB-->>-API: Booking record (ID: bk_123)
        API-->>-User: 201 Created (Booking Pending, 10m timer started)
    end

    opt User pays within 10 minutes
        User->>+API: POST /bookings/bk_123/confirm (paymentToken)
        API->>+DB: UPDATE Booking SET status='CONFIRMED' WHERE id='bk_123'
        DB-->>-API: Booking Confirmed
        API->>+Redis: DEL hold:trip_1:seat_12A
        Redis-->>-API: 1 (Lock released)
        API-->>-User: 200 OK (Ticket Issued 🎉)
    end
```

---

### 3. Seat Waitlist & Event-Driven Auto-Promotion Flow

When a seat is already held, subsequent users can join a **FIFO Waitlist** backed by a **Redis Sorted Set (`ZSET`)**. If the 10-minute hold expires without payment, a **Redis Keyspace Notification** triggers an event that automatically promotes the next passenger in line.

```mermaid
sequenceDiagram
    autonumber
    actor UserB as 👤 Passenger B (Waitlist)
    actor UserA as 👤 Passenger A (Holding Seat)
    participant API as 🚀 Booking Service
    participant Redis as 🔴 Redis (ZSET & Keyspace)
    participant Worker as ⚙️ Background Event Consumer
    participant DB as 🐘 PostgreSQL
    participant Notif as 🔔 Notification Service

    Note over UserA,Redis: Passenger A holds seat for 10 minutes (TTL = 600s)
    UserB->>+API: POST /bookings/hold (trip_1, seat_12A)
    API->>+Redis: Check hold:trip_1:seat_12A
    Redis-->>-API: Key exists (Held by User A)
    API->>+Redis: ZADD waitlist:trip_1:seat_12A <timestamp> "user_B"
    Redis-->>-API: Added to Sorted Set
    API-->>-UserB: 202 Accepted ("Seat held, you are #1 on the waitlist")

    Note over UserA,Worker: ⏳ 10 Minutes Elapse — Passenger A fails to pay
    Redis--xWorker: 💥 Publishes Keyspace Expiry Event: `__keyevent@0__:expired` `hold:trip_1:seat_12A`

    Worker->>+DB: UPDATE Booking SET status='CANCELLED' WHERE seat_id='seat_12A' AND status='PENDING'
    DB-->>-Worker: Cancelled Passenger A's booking

    Worker->>+Redis: ZPOPMIN waitlist:trip_1:seat_12A 1
    Redis-->>-Worker: Returns Next Passenger ("user_B")

    Worker->>+Redis: SET hold:trip_1:seat_12A "user_B" NX EX 600
    Redis-->>-Worker: OK (New 10m hold for User B)

    Worker->>+DB: INSERT INTO Booking (user_id: "user_B", status: PENDING, expires_at: now + 10m)
    DB-->>-Worker: Booking created for User B

    Worker->>+Notif: Dispatch "Seat Available - Pay in 10 mins"
    Notif-->>-UserB: 📲 Push/Email Alert ("You've been promoted! Complete checkout.")
```

---

## ✨ Features Implemented So Far

- ✅ **Authentication** — JWT-based register/login with bcrypt password hashing
- ✅ **Concurrency-Safe Booking** — Row-level locking (`SELECT ... FOR UPDATE`) inside a Postgres transaction to eliminate double-booking under high load
  - Proven with a **k6 load test** firing 50 concurrent requests at a single seat — exactly one booking succeeds, the rest correctly receive `409 Conflict`
  - Unit-tested with Vitest (repository mocked, service logic isolated)
- ✅ **Graph-Based Multi-Hop Route Search** — Models stations and routes as a weighted directed graph and runs **Dijkstra's algorithm** with a custom-built generic **Min-Heap** ($O(\log V)$ insert/extract) to find the cheapest path, including multi-hop connections a direct-route query would miss
- ✅ **Redis Layer**
  - **TTL-based seat holds** — Unpaid bookings auto-expire and release the seat via Redis keyspace notifications (event-driven, not polling)
  - **Route search caching** — Fast retrieval of frequently searched station pairs
  - **Sorted-Set (`ZSET`) waitlist** — Automatic promotion of the next user in line when a held seat is cancelled or expires
- ✅ **Dynamic Pricing Engine** — Strategy-pattern-based surcharges (occupancy-based, urgency-based), computed atomically inside the booking transaction and locked onto the booking permanently (`final_price`)
- ✅ **Idempotent Payments** — `Idempotency-Key` header pattern (industry standard, same approach Stripe uses) prevents duplicate charges on network retries or repeated client requests
- ✅ **CI Pipeline** — GitHub Actions runs lint, build, and tests on every push

---

## ⚠️ Known Limitations (Honest, Deliberate Scope Choices)

- Multi-hop route search finds the cheapest path but does not yet validate that connecting trips have compatible arrival/departure timing.
- Route search estimated pricing uses simplified placeholder occupancy/timing; actual booking always computes and locks in the real, accurate price.
- Only single shortest-path is returned (not k-ranked alternatives).

---

## 🗺️ Roadmap

- 🔲 **Event-driven notifications** (Kafka / RabbitMQ integration for high-throughput message streaming)
- 🔲 **Observability** (Prometheus metrics exporter + Grafana dashboards)
- 🔲 **Full CI/CD deployment** (Automated Docker container builds and Kubernetes/Cloud deployment)

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+) & npm

### Installation

```bash
# 1. Start PostgreSQL and Redis containers
docker compose up -d

# 2. Install project dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Run Prisma database migrations and seed initial data
npx prisma migrate dev
npx prisma db seed

# 5. Start the development server
npm run dev
```

---

## 🧪 Running Tests

```bash
# Run unit & integration tests with Vitest
npm test

# Run k6 high-concurrency booking load test
k6 run tests/load/concurrent-booking.js -e TOKEN=<jwt> -e SEAT_ID=<id> -e TRIP_ID=<id>
```

---

## 📌 Project Status
🚧 **In progress** — actively being built and documented phase by phase.  
*Currently on Phase 6 (Event-Driven Architecture & Message Brokers).*
