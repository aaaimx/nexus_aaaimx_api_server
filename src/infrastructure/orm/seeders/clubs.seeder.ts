import prisma from "../prisma.client";
import logger from "../../logger";

export async function seedClubs() {
  const clubs = [
    {
      name: "Video Games",
      description:
        "Club de Videojuegos - Club para jugar videojuegos y participar en competencias",
    },
  ];

  for (const club of clubs) {
    await prisma.clubs.upsert({
      where: { name: club.name },
      update: {
        description: club.description,
      },
      create: club,
    });
  }

  logger.info(`🎮 Seeded ${clubs.length} clubs`);
}
