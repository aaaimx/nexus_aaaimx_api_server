import prisma from "../prisma.client";
import logger from "../../logger";

export async function seedTags() {
  const tags = [
    // Programming Languages
    {
      name: "javascript",
      description: "JavaScript - Lenguaje de programación web",
    },
    {
      name: "typescript",
      description: "TypeScript - JavaScript con tipado estático",
    },
    {
      name: "python",
      description: "Python - Lenguaje de programación versátil",
    },
    {
      name: "java",
      description: "Java - Lenguaje de programación orientado a objetos",
    },
    {
      name: "csharp",
      description: "C# - Lenguaje de programación de Microsoft",
    },
    { name: "cpp", description: "C++ - Lenguaje de programación de sistemas" },
    { name: "go", description: "Go - Lenguaje de programación de Google" },
    {
      name: "rust",
      description: "Rust - Lenguaje de programación de sistemas seguro",
    },

    // Web Development
    {
      name: "react",
      description:
        "React - Biblioteca de JavaScript para interfaces de usuario",
    },
    { name: "vue", description: "Vue.js - Framework progresivo de JavaScript" },
    { name: "angular", description: "Angular - Framework de desarrollo web" },
    {
      name: "nodejs",
      description: "Node.js - Entorno de ejecución de JavaScript",
    },
    { name: "express", description: "Express.js - Framework web para Node.js" },

    // Mobile Development
    {
      name: "react-native",
      description: "React Native - Desarrollo de aplicaciones móviles",
    },
    {
      name: "flutter",
      description: "Flutter - Framework de desarrollo móvil de Google",
    },
    { name: "swift", description: "Swift - Lenguaje de programación de Apple" },
    {
      name: "kotlin",
      description: "Kotlin - Lenguaje de programación para Android",
    },

    // Data & AI
    {
      name: "machine-learning",
      description: "Machine Learning - Aprendizaje automático",
    },
    {
      name: "deep-learning",
      description: "Deep Learning - Aprendizaje profundo",
    },
    { name: "data-science", description: "Data Science - Ciencia de datos" },
    {
      name: "tensorflow",
      description: "TensorFlow - Framework de machine learning",
    },
    { name: "pytorch", description: "PyTorch - Framework de deep learning" },

    // DevOps & Cloud
    { name: "docker", description: "Docker - Contenedores de aplicaciones" },
    {
      name: "kubernetes",
      description: "Kubernetes - Orquestación de contenedores",
    },
    {
      name: "aws",
      description: "Amazon Web Services - Plataforma de computación en la nube",
    },
    {
      name: "azure",
      description: "Microsoft Azure - Servicios de computación en la nube",
    },
    {
      name: "gcp",
      description: "Google Cloud Platform - Plataforma de Google Cloud",
    },

    // Databases
    {
      name: "mysql",
      description: "MySQL - Sistema de gestión de bases de datos relacional",
    },
    {
      name: "postgresql",
      description: "PostgreSQL - Base de datos relacional avanzada",
    },
    {
      name: "mongodb",
      description: "MongoDB - Base de datos NoSQL orientada a documentos",
    },
    { name: "redis", description: "Redis - Base de datos en memoria" },

    // Cybersecurity
    {
      name: "cybersecurity",
      description: "Ciberseguridad - Protección de sistemas informáticos",
    },
    {
      name: "penetration-testing",
      description: "Penetration Testing - Pruebas de penetración",
    },
    { name: "ethical-hacking", description: "Ethical Hacking - Hacking ético" },
    {
      name: "cryptography",
      description: "Criptografía - Técnicas de seguridad de la información",
    },

    // Robotics & IoT
    {
      name: "robotics",
      description: "Robótica - Diseño y construcción de robots",
    },
    {
      name: "arduino",
      description: "Arduino - Plataforma de prototipado electrónico",
    },
    {
      name: "raspberry-pi",
      description: "Raspberry Pi - Computadora de placa única",
    },
    { name: "iot", description: "Internet of Things - Internet de las cosas" },

    // Game Development
    { name: "game-development", description: "Desarrollo de videojuegos" },
    {
      name: "unity",
      description: "Unity - Motor de desarrollo de videojuegos",
    },
    {
      name: "unreal-engine",
      description: "Unreal Engine - Motor de desarrollo de videojuegos",
    },
    { name: "game-design", description: "Diseño de videojuegos" },

    // Tools & Technologies
    { name: "git", description: "Git - Sistema de control de versiones" },
    {
      name: "github",
      description: "GitHub - Plataforma de desarrollo colaborativo",
    },
    {
      name: "linux",
      description: "Linux - Sistema operativo de código abierto",
    },
    {
      name: "blockchain",
      description: "Blockchain - Tecnología de cadena de bloques",
    },
    {
      name: "api",
      description: "API - Interfaz de programación de aplicaciones",
    },
    {
      name: "microservices",
      description: "Microservicios - Arquitectura de software",
    },
    {
      name: "agile",
      description: "Metodología Ágil - Enfoque de desarrollo de software",
    },
    { name: "testing", description: "Testing - Pruebas de software" },
  ];

  for (const tag of tags) {
    await prisma.tags.upsert({
      where: { name: tag.name },
      update: {
        description: tag.description,
      },
      create: tag,
    });
  }

  logger.info(`🏷️ Seeded ${tags.length} tags`);
}
