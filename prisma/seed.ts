// prisma/seed.ts
import { prisma } from "../src/config/prisma.js";

async function main() {
  console.log("Seeding database...");

  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      password_hash: "$2b$10$YourHashedPasswordHere",
    },
  });

  // 2. Create Stations
  const stationA = await prisma.station.upsert({
    where: { code: "ST-A" },
    update: {},
    create: {
      name: "Central Station",
      code: "ST-A",
      location: "City Center",
    },
  });

  const stationB = await prisma.station.upsert({
    where: { code: "ST-B" },
    update: {},
    create: {
      name: "North Station",
      code: "ST-B",
      location: "North Suburbs",
    },
  });

  // 3. Create Route (Connects Station A to Station B)
  const route = await prisma.route.create({
    data: {
      source_id: stationA.id,
      destination_id: stationB.id,
      base_price: 49.99,
    },
  });

  // 4. Create Train
  const train = await prisma.train.create({
    data: {
      name: "Express 101",
      number: "EXP-101",
      total_capacity: 100,
    },
  });

  // 5. Create Seat (Belongs to the Train)
  const seat = await prisma.seat.create({
    data: {
      train_id: train.id,
      seat_number: "A1",
      seat_class: "ECONOMY",
    },
  });

  // 6. Create Trip (Connects Route & Train)
  const trip = await prisma.trip.create({
    data: {
      route_id: route.id,
      train_id: train.id,
      departure_time: new Date(Date.now() + 86400000), // Tomorrow
      arrival_time: new Date(Date.now() + 90000000),
    },
  });

  console.log("Seeding completed successfully!\n");
  console.log("--- IDs for your k6 load test ---");
  console.log(`USER_ID: ${user.id}`);
  console.log(`TRIP_ID: ${trip.id}`);
  console.log(`SEAT_ID: ${seat.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });