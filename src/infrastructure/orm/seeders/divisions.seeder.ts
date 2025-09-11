import prisma from "../prisma.client";
import logger from "../../logger";

export async function seedDivisions() {
  const divisions = [
    {
      name: "Software",
      description:
        "División de Software - Desarrollo de aplicaciones, sistemas y soluciones tecnológicas",
    },
    {
      name: "Robotics",
      description:
        "División de Robótica - Diseño, construcción y programación de robots y sistemas automatizados",
    },
    {
      name: "Artificial Intelligence",
      description:
        "División de Inteligencia Artificial - Machine Learning, Deep Learning y algoritmos inteligentes",
    },
    {
      name: "Cybersecurity",
      description:
        "División de Ciberseguridad - Protección de sistemas, redes y datos contra amenazas digitales",
    },
    {
      name: "Dep Ops",
      description:
        "Departamento de Operaciones - Operaciones administrativas, gestión y coordinación organizacional",
    },
    {
      name: "Video Games",
      description:
        "División de Videojuegos - Desarrollo, diseño y análisis de videojuegos, game jams y competencias",
    },
  ];

  for (const division of divisions) {
    await prisma.divisions.upsert({
      where: { name: division.name },
      update: {
        description: division.description,
      },
      create: division,
    });
  }

  logger.info(`🏢 Seeded ${divisions.length} divisions`);
}
