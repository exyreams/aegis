/**
 * Logging Utility
 *
 * Comprehensive logging system with Winston and Chalk integration providing
 * structured console output, file logging, request tracking, and colored
 * terminal output for development and production monitoring.
 */

import chalk from "chalk";
import winston from "winston";
import config from "../config/env";

import { existsSync, mkdirSync } from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? JSON.stringify(meta, null, 2)
        : "";
      return `${timestamp} [${level.toUpperCase()}] ${message} ${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.File({
      filename: path.resolve(config.logging.file),
      maxsize: 5242880,
      maxFiles: 10,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

if (config.server.isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

export class ConsoleLogger {
  static success(message: string, details?: any) {
    console.log(chalk.green("SUCCESS"), chalk.white(message));
    if (details) console.log(chalk.gray(JSON.stringify(details, null, 2)));
    console.log();
    logger.info(message, details);
  }

  static error(message: string, details?: any) {
    console.log(chalk.red("ERROR"), chalk.white(message));
    if (details) console.log(chalk.red(JSON.stringify(details, null, 2)));
    console.log();
    logger.error(message, details);
  }

  static info(message: string, details?: any) {
    console.log(chalk.blue("INFO"), chalk.white(message));
    if (details) console.log(chalk.gray(JSON.stringify(details, null, 2)));
    console.log();
    logger.info(message, details);
  }

  static warning(message: string, details?: any) {
    console.log(chalk.yellow("WARNING"), chalk.white(message));
    if (details) console.log(chalk.yellow(JSON.stringify(details, null, 2)));
    console.log();
    logger.warn(message, details);
  }

  static debug(message: string, details?: any) {
    if (config.server.isDevelopment) {
      console.log(chalk.magenta("DEBUG"), chalk.white(message));
      if (details) console.log(chalk.gray(JSON.stringify(details, null, 2)));
    }
    logger.debug(message, details);
  }

  static security(message: string, details?: any) {
    console.log(chalk.red.bold("SECURITY"), chalk.white(message));
    if (details) console.log(chalk.red(JSON.stringify(details, null, 2)));
    logger.error(`[SECURITY] ${message}`, details);
  }

  static audit(action: string, user: string, details?: any) {
    const auditMessage = `User ${user} performed action: ${action}`;
    console.log(chalk.cyan("AUDIT"), chalk.white(auditMessage));
    if (details) console.log(chalk.gray(JSON.stringify(details, null, 2)));
    logger.info(`[AUDIT] ${auditMessage}`, details);
  }

  static request(
    method: string,
    path: string,
    status: number,
    duration?: number
  ) {
    const statusColor =
      status >= 200 && status < 300
        ? chalk.green
        : status >= 400
        ? chalk.red
        : chalk.yellow;

    const methodColor =
      method === "GET"
        ? chalk.blue
        : method === "POST"
        ? chalk.green
        : method === "PUT"
        ? chalk.yellow
        : method === "DELETE"
        ? chalk.red
        : chalk.white;

    console.log(
      chalk.gray("[API]"),
      methodColor(method.padEnd(6)),
      chalk.white(path.padEnd(30)),
      statusColor(status.toString()),
      duration ? chalk.gray(`${duration}ms`) : ""
    );
    console.log();
  }

  static damlProxy(
    method: string,
    fromPath: string,
    toUrl: string,
    status: number
  ) {
    const statusColor = status >= 200 && status < 300 ? chalk.green : chalk.red;
    console.log(
      chalk.magenta("[DAML Proxy]"),
      chalk.cyan(method.padEnd(6)),
      chalk.white(fromPath),
      chalk.gray("->"),
      chalk.blue(toUrl),
      statusColor(status.toString())
    );
  }

  static startup(message: string) {
    console.log(chalk.cyan("Aegis RFQ Backend"), chalk.bold.white(message));
  }

  static damlInfo(message: string) {
    console.log(chalk.magenta("DAML JSON API:"), chalk.blue(message));
  }
}
