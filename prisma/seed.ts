import "dotenv/config";
import { PrismaClient } from "@/lib/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const seedHash = await bcrypt.hash("Admin123", 10);

  const admin = await prisma.player.upsert({
    where: { playerEmail: "admin@cyberkey.gg" },
    update: {},
    create: {
      playerEmail: "admin@cyberkey.gg",
      hashedSecurityKey: seedHash,
      accountTier: "admin",
    },
  });

  await prisma.player.upsert({
    where: { playerEmail: "seller@cyberkey.gg" },
    update: {},
    create: {
      playerEmail: "seller@cyberkey.gg",
      hashedSecurityKey: seedHash,
      accountTier: "seller",
    },
  });

  const existingGames = await prisma.gameProduct.count();
  if (existingGames > 0) {
    console.log("Games already seeded — skipping game/order seed, players are up to date.");
    return;
  }

  const games = await Promise.all(
    [
      { title: "Cyberpunk 2077 Ultimate Edition", retailPrice: 29.99, availableKeys: 150, genre: "rpg", platform: "steam", ageRating: "PEGI 18", publisher: "CD Projekt RED" },
      { title: "Elden Ring — Shadow of the Erdtree", retailPrice: 34.99, availableKeys: 80, genre: "action-rpg", platform: "steam", ageRating: "PEGI 16", publisher: "Bandai Namco" },
      { title: "FIFA 25 Standard Edition", retailPrice: 19.99, availableKeys: 200, genre: "sports", platform: "epic", ageRating: "PEGI 3", publisher: "EA Sports" },
      { title: "Baldur's Gate 3 Deluxe Edition", retailPrice: 44.99, availableKeys: 60, genre: "rpg", platform: "gog", ageRating: "PEGI 18", publisher: "Larian Studios" },
      { title: "Counter-Strike 2 — Prime Status", retailPrice: 12.99, availableKeys: 320, genre: "fps", platform: "steam", ageRating: "PEGI 16", publisher: "Valve Corporation" },
    ].map((g) => prisma.gameProduct.create({ data: g })),
  );

  await prisma.purchaseOrder.createMany({
    data: [
      { gameId: games[0].id, unitCount: 2, deliveryState: "pending", customerId: admin.id, grandTotal: 59.98 },
      { gameId: games[2].id, unitCount: 1, deliveryState: "fulfilled", customerId: admin.id, grandTotal: 19.99 },
      { gameId: games[4].id, unitCount: 3, deliveryState: "processing", customerId: admin.id, grandTotal: 38.97 },
      { gameId: games[1].id, unitCount: 1, deliveryState: "refunded", customerId: admin.id, grandTotal: 34.99 },
    ],
  });

  console.log("Seed complete: 2 players, 5 games, 4 orders.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
