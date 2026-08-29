# Railway Ticket Reservation System

A high-concurrency backend system for booking railway tickets, built to explore
distributed locking, dynamic pricing, and event-driven architecture — designed
and built phase by phase with production practices (CI/CD, load testing, clean
layered architecture) from day one.

## Tech Stack
Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, Kafka/RabbitMQ

## Architecture
This project uses a strict layered architecture per module:

Route → Controller → Service → Repository

- **Route** — maps HTTP endpoints to controllers
- **Controller** — handles req/res, no business logic
- **Service** — business rules, fully unit-testable in isolation
- **Repository** — the only layer that talks to the database

## Features Implemented So Far

- ✅ **Authentication** — JWT-based register/login with bcrypt password hashing
- ✅ **Trip Search** — search trips by source, destination, and date
- ✅ **Concurrency-Safe Booking** — row-level locking (`SELECT ... FOR UPDATE`)
  inside a Postgres transaction to eliminate double-booking under load
  - Proven with a **k6 load test** firing 50 concurrent requests at a single
    seat — exactly one booking succeeds, the rest correctly receive `409`
  - Unit-tested with Vitest (repository mocked, service logic isolated)
- ✅ **CI Pipeline** — GitHub Actions runs lint, build, and tests on every push

## Roadmap

- 🔲 Graph-based multi-hop route search (Dijkstra's algorithm)
- 🔲 Redis seat holds, caching, and waitlist (BullMQ)
- 🔲 Dynamic pricing engine
- 🔲 Idempotent payment processing
- 🔲 Event-driven notifications (Kafka/RabbitMQ)
- 🔲 Observability (Prometheus + Grafana)
- 🔲 Full CI/CD deployment

## Getting Started

\`\`\`bash
docker compose up -d
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
\`\`\`

## Running Tests

\`\`\`bash
npm test              # unit tests (vitest)
k6 run tests/load/concurrent-booking.js -e TOKEN=<jwt> -e SEAT_ID=<id> -e TRIP_ID=<id>   # load test
\`\`\`

## Project Status
🚧 In progress — actively being built and documented phase by phase.