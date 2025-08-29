import path from "path";
import winston from "winston";

const prismaLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "logs/prisma.log"),
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs/prisma-error.log"),
      level: "error",
    }),
  ],
});

export default prismaLogger;
