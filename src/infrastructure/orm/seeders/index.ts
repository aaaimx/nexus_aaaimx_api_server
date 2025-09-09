import prisma from "../prisma.client";
import logger from "../../logger";
import { seedRoles } from "./roles.seeder.js";
import { seedDivisions } from "./divisions.seeder.js";
import { seedClubs } from "./clubs.seeder.js";
import { seedTags } from "./tags.seeder.js";

async function main() {
  logger.info("🌱 Starting database seeding...");

  try {
    // Seed roles first (required for other entities)
    await seedRoles();
    logger.info("✅ Roles seeded successfully");

    // Seed divisions
    await seedDivisions();
    logger.info("✅ Divisions seeded successfully");

    // Seed clubs
    await seedClubs();
    logger.info("✅ Clubs seeded successfully");

    // Seed tags
    await seedTags();
    logger.info("✅ Tags seeded successfully");

    logger.info("🎉 Database seeding completed successfully!");
  } catch (error) {
    logger.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
