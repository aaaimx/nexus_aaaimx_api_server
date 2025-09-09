import prisma from "../prisma.client";
import logger from "../../logger";

export async function seedRoles() {
  const roles = [
    {
      name: "committee",
      description:
        "Comité Directivo - Acceso máximo a todas las funcionalidades del sistema",
    },
    {
      name: "president",
      description:
        "Presidente - Acceso máximo a todas las funcionalidades del sistema",
    },
    {
      name: "leader",
      description:
        "Líder - Acceso alto limitado por organización (división o club)",
    },
    {
      name: "co-leader",
      description:
        "Co-líder - Acceso medio-alto limitado por organización (división o club)",
    },
    {
      name: "senior member",
      description: "Miembro Senior - Acceso medio, puede liderar proyectos",
    },
    {
      name: "member",
      description:
        "Miembro - Acceso básico, solo visualización y participación",
    },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  logger.info(`📝 Seeded ${roles.length} roles`);
}
