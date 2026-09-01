import { prisma } from "../src/config/prisma.js";

// --- Helpers ---

async function upsertStation(name: string, code: string, location: string) {
  return prisma.station.upsert({
    where: { code },
    update: {},
    create: { name, code, location },
  });
}

async function createRoute(sourceId: string, destinationId: string, basePrice: number) {
  return prisma.route.create({
    data: { source_id: sourceId, destination_id: destinationId, base_price: basePrice },
  });
}

async function createTrainWithSeats(name: string, number: string, capacity: number, seatCount: number) {
  const train = await prisma.train.create({
    data: { name, number, total_capacity: capacity },
  });

  const seats = [];
  for (let i = 1; i <= seatCount; i++) {
    seats.push(
      prisma.seat.create({
        data: {
          train_id: train.id,
          seat_number: `A${i}`,
          seat_class: i <= 2 ? "FIRST_CLASS" : "ECONOMY",
        },
      })
    );
  }
  await Promise.all(seats);
  return train;
}

async function createTrip(routeId: string, trainId: string, departureOffsetMs: number, durationMs: number) {
  return prisma.trip.create({
    data: {
      route_id: routeId,
      train_id: trainId,
      departure_time: new Date(Date.now() + departureOffsetMs),
      arrival_time: new Date(Date.now() + departureOffsetMs + durationMs),
    },
  });
}

// --- Main seed logic ---

async function main() {
  console.log("Cleaning old database records...");
  await prisma.booking.deleteMany(); // Added booking cleanup just in case!
  await prisma.trip.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.train.deleteMany();
  await prisma.route.deleteMany();
  await prisma.station.deleteMany();

  console.log("Seeding Poland Railway Network... 🇵🇱");

  // 1. Stations
  const warsaw = await upsertStation("Warszawa Centralna", "WAW", "Central Poland");
  const krakow = await upsertStation("Kraków Główny", "KRK", "South Poland");
  const gdansk = await upsertStation("Gdańsk Główny", "GDN", "North Poland");

  // 2. Routes
  const routeWawKrk = await createRoute(warsaw.id, krakow.id, 120);
  const routeWawGdn = await createRoute(warsaw.id, gdansk.id, 130);
  
  // The Premium Direct Route
  const routeGdnKrk = await createRoute(gdansk.id, krakow.id, 350); 
  
  // Reverse routes
  const routeKrkWaw = await createRoute(krakow.id, warsaw.id, 120);
  const routeGdnWaw = await createRoute(gdansk.id, warsaw.id, 130);
  const routeKrkGdn = await createRoute(krakow.id, gdansk.id, 350);

  // 3. Polish Trains
  const pendolino = await createTrainWithSeats("EIP Pendolino", "EIP-1001", 300, 10);
  const intercity = await createTrainWithSeats("PKP InterCity", "IC-2002", 400, 10);
  const tlk = await createTrainWithSeats("TLK Regional", "TLK-3003", 500, 10);

  const HOUR = 60 * 60 * 1000;

  // 4. Scheduled Trips
  // Direct High-Speed Trip from Gdansk to Krakow
  await createTrip(routeGdnKrk.id, pendolino.id, HOUR * 24, HOUR * 5);
  await createTrip(routeKrkGdn.id, pendolino.id, HOUR * 30, HOUR * 5);

  // Standard Trips transferring through Warsaw
  await createTrip(routeGdnWaw.id, intercity.id, HOUR * 24, HOUR * 3);
  await createTrip(routeWawKrk.id, intercity.id, HOUR * 28, HOUR * 2.5);
  
  await createTrip(routeKrkWaw.id, tlk.id, HOUR * 24, HOUR * 3);
  await createTrip(routeWawGdn.id, tlk.id, HOUR * 28, HOUR * 3);

  console.log("Database successfully seeded with Stations, Routes, Trains, Seats, and Trips!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });