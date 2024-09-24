import { execSync } from "child_process";
import fs from "fs";


export async function setupDrizzle({
  dbType,
  packageManager,
  addTypeScript,
}: {
  dbType: "none" | "mongodb" | "mysql" | "postgresql" | "sqlite",
  packageManager: "yarn" | "npm" | "bun" | "pnpm",
  addTypeScript: boolean,
}) {
  if (dbType == "none") return;
  console.log("Installing Drizzle ORM...");
  let drizzlePackages = ["drizzle-kit", "drizzle-orm"];
  switch (dbType) {
    case "postgresql":
      drizzlePackages.push("pg");
      if (addTypeScript) drizzlePackages.push("@types/pg");
      break;
    case "mysql":
      drizzlePackages.push("mysql2");
      break;
    case "sqlite":
      console.log("Using better sqlite3...");
      drizzlePackages.push("better-sqlite3");
      break;
    default:
      throw new Error(`Unsupported database type for Drizzle: ${dbType}`);
  }

  const installCmd = `${packageManager} ${packageManager == "yarn" ? "add" : "install"} ${drizzlePackages.join(
    " "
  )}`;
  execSync(installCmd, { stdio: "inherit" });

  console.log("Drizzle ORM installed and database drivers.");
}

export async function configureDrizzleForNextjs({
  dbType,
  addTypeScript,
}: {
  dbType: "none" | "mongodb" | "mysql" | "postgresql" | "sqlite",
  addTypeScript: boolean,
}) {
  if (dbType == "none" || dbType == "mongodb") {
    console.log("Unsupported database for drizzle ...");
    return;
  }

  const drizzleConfig = (dbType == "postgresql") ? `
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ${addTypeScript ? "as string" : ""},
});
export const db = drizzle(pool); 
    `: (dbType == "mysql") ? `
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL ${addTypeScript ? "as string" : ""}
});
export const db = drizzle(poolConnection);
    ` : (dbType == "sqlite") ? `
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite);
      `: "";

  fs.writeFileSync("drizzle.config.ts", drizzleConfig);
  console.log("Drizzle ORM configuration file created.");
}

export function getDrizzleAdapter(): string {
  return "pg";
}
