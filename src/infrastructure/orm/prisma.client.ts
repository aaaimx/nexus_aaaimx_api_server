import prismaLogger from "@/infrastructure/logger/prisma.logger";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

declare global {
  var prisma: ReturnType<typeof _createPrismaClient> | undefined;
}

const _createPrismaClient = () => {
  return new PrismaClient().$extends({
    query: {
      $allOperations({ operation, args, query }) {
        prismaLogger.info("Query", {
          operation,
          args,
        });
        return query(args);
      },
    },
  });
};

const prisma = global.prisma || _createPrismaClient();

if (process.env["NODE_ENV"] === "development") {
  global.prisma = prisma;
}

export default prisma;
