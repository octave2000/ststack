import { execSync } from "child_process";
import fs from "fs";

export async function setupDrizzle(dbType: string, packageManager: string) {
  console.log("Installing Drizzle ORM...");
  let drizzlePackages = ["drizzle-orm"];
  let dbDriver = "";

  switch (dbType) {
    case "postgresql":
      dbDriver = "pg";
      drizzlePackages.push("drizzle-orm-pg");
      break;
    case "mysql":
      dbDriver = "mysql2";
      drizzlePackages.push("drizzle-orm-mysql2");
      break;
    case "sqlite":
      dbDriver = "sqlite3";
      drizzlePackages.push("drizzle-orm-sqlite3");
      break;
    case "mongodb":
      dbDriver = "mongodb";
      drizzlePackages.push("drizzle-orm-mongodb");
      break;
    default:
      throw new Error(`Unsupported database type for Drizzle: ${dbType}`);
  }

  const installCmd = `${packageManager} add ${drizzlePackages.join(
    " "
  )} ${dbDriver}`;
  execSync(installCmd, { stdio: "inherit" });

  console.log("Drizzle ORM installed.");
}

export async function configureDrizzle() {
  const drizzleConfig = `
  import { drizzle } from 'drizzle-orm';
  import { ${getDrizzleAdapter()} } from 'drizzle-orm/${getDrizzleAdapter()}';
  import { Pool } from 'pg'; // Change based on your DB
  
  const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
  });
  
  export const db = drizzle(pool);
  `.trim();

  fs.writeFileSync("drizzle.config.ts", drizzleConfig);
  console.log("Drizzle ORM configuration file created.");
}

export function getDrizzleAdapter(): string {
  return "pg";
}
