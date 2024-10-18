import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function setupDrizzle({
  dbType,
  packageManager,
  addTypeScript,
}: {
  dbType: "none" | "mysql" | "postgresql" | "sqlite" | "mongo";
  packageManager: "yarn" | "npm" | "bun" | "pnpm";
  addTypeScript: boolean;
}) {
  if (dbType == "none") return;
  if (dbType == "mongo") {
    return "drizzle do not support mongo ";
  }
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

  const installCmd = `${packageManager} ${
    packageManager == "yarn" ? "add" : "install"
  } ${drizzlePackages.join(" ")}`;
  execSync(installCmd, { stdio: "inherit" });

  console.log("Drizzle ORM installed and database drivers.");
}

export async function configureDrizzleForNextjs({
  dbType,
  addTypeScript,
}: {
  dbType: "none" | "mysql" | "postgresql" | "sqlite" | "mongo";
  addTypeScript: boolean;
}) {
  if (dbType === "mongo") {
    return "drizzle do not support mongo";
  }
  const drizzleConfig =
    dbType == "postgresql"
      ? `
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ${
    addTypeScript ? "as string" : ""
  },
});
export const db = drizzle(pool); 
    `
      : dbType == "mysql"
      ? `
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL ${addTypeScript ? "as string" : ""}
});
export const db = drizzle(poolConnection);
    `
      : dbType == "sqlite"
      ? `
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite);
      `
      : "";

  fs.writeFileSync("drizzle.config.ts", drizzleConfig);
  console.log("Drizzle ORM configuration file created.");
}

// export async function setupNestDrizzle({
//   dbType,
//   packageManager,
//   addTypeScript,
// }: {
//   dbType: "none" | "mysql" | "postgresql" | "sqlite";
//   packageManager: "yarn" | "npm" | "bun" | "pnpm";
//   addTypeScript: boolean;
// }) {
//   if (dbType === "none") return;
//   console.log("installing drizzle orm ");
//   let drizzlePackages = ["drizzle-kit", "drizzle-orm"];
//   switch (dbType) {
//     case "postgresql":
//       drizzlePackages.push("@knaadh/nestjs-drizzle-postgres", "postgres");
//       break;
//     case "mysql":
//       drizzlePackages.push("@knaadh/nestjs-drizzle-mysql2", "mysql2");
//       break;
//     case "sqlite":
//       drizzlePackages.push(
//         "@knaadh/nestjs-drizzle-better-sqlite3",
//         "better-sqlite3"
//       );
//       break;
//     default:
//       throw new Error(`Unsupported database type for Drizzle: ${dbType}`);
//   }

//   const installCmd = `${packageManager} ${
//     packageManager === "yarn" ? "add" : "install"
//   } ${drizzlePackages.join(" ")}`;

//   execSync(installCmd, { stdio: "inherit" });
//   console.log(`${dbType} and drizzle orm`);
// }

// export async function configureDrizzleForNestjs({
//   dbType,
// }: {
//   dbType: "none" | "mysql" | "postgresql" | "sqlite";
// }) {
//   const drizzleConfig =
//     dbType == "mysql"
//       ? `
// import { defineConfig } from "drizzle-kit";
// export default defineConfig({
//   dialect: "mysql"
//   schema: "./src/schema/*",
//   out: "./drizzle",
// });
// `
//       : dbType == "postgresql"
//       ? `
// import { defineConfig } from "drizzle-kit";
// export default defineConfig({
//   dialect: "postgresql"
//   schema: "./src/schema/*",
//   out: "./drizzle",
// });
// `
//       : dbType == "sqlite"
//       ? `
// import { defineConfig } from "drizzle-kit";
// export default defineConfig({
//   dialect: "sqlite"
//   schema: "./src/schema/*",
//   out: "./drizzle",
// });
// `
//       : "";

//   fs.writeFileSync("drizzle.config.ts", drizzleConfig);

//   const srcpath = path.join("src");
//   const schemapath = path.join(srcpath, "schema");

//   fs.mkdirSync(schemapath, { recursive: true });

//   const schemaContent =
//     dbType == "mysql"
//       ? `
// import { mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

// export const users = mysqlTable('users', {
//   id: serial('id').primaryKey(),
//   email: varchar('email', { length: 255 }).notNull(),
//   name: varchar('name', { length: 255 }).notNull(),
//   tel: varchar('tel', { length: 15 }).notNull(), // Assuming tel is stored as a string
// });

//   `
//       : dbType == "postgresql"
//       ? `
// import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   email: varchar('email', { length: 255 }).notNull(),
//   name: varchar('name', { length: 255 }).notNull(),
//   tel: varchar('tel', { length: 15 }).notNull(), // Assuming tel is stored as a string of up to 15 characters
// });

//   `
//       : dbType == "sqlite"
//       ? `
// import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// export const users = sqliteTable('users', {
//   id: integer('id').primaryKey().autoincrement(),
//   email: text('email').notNull(),
//   name: text('name').notNull(),
//   tel: text('tel').notNull(), // SQLite doesn't have varchar, text will work for strings
// });

//   `
//       : "";

//   fs.writeFileSync("src/schema/schema.ts", schemaContent);

//   const drizzleImport =
//     dbType == "postgresql"
//       ? `
// import * as schema from './schema/schema';
// import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
//   `
//       : dbType == "mysql"
//       ? `
// import * as schema from './schema/schema';
// import { DrizzleMySqlModule } from '@knaadh/nestjs-drizzle-mysql2';
// `
//       : dbType == "sqlite"
//       ? `
// import * as schema from './schema/schema';
// import { DrizzleBetterSQLiteModule } from '@knaadh/nestjs-drizzle-better-sqlite3';
// `
//       : " ";

//   const drizzleProvider =
//     dbType == "postgresql"
//       ? `
// DrizzlePostgresModule.register({
// tag: 'DB_DEV',
// postgres: {
//    url: 'postgres://postgres:@127.0.0.1:5432/drizzleDB',
//    },
// config: { schema: { ...schema } },
//     }),
//   `
//       : dbType == "mysql"
//       ? `
//      DrizzleMySqlModule.register({
//       tag: 'DB_DEV',
//       mysql: {
//         connection: 'client',
//         config: {
//           host: '127.0.0.1',
//           user: 'root',
//           database: 'drizzleDB',
//         },
//       },
//       config: { schema: { ...schema }, mode: 'default' },
//     }),
//   `
//       : dbType == "sqlite"
//       ? `

//     DrizzleBetterSQLiteModule.register({
//       tag: 'DB_DEV',
//       sqlite3: {
//         filename: 'demo.db',
//       },
//       config: { schema: { ...schema } },
//     }),
//   `
//       : "";

//   const appModulePath = path.join("src", "app.module.ts");

//   let appModuleContent = fs.readFileSync(appModulePath, "utf-8");

//   if (!appModuleContent.includes("import * as schema")) {
//     const importRegex = /^import .*?;$/gm;
//     const importsMatch = appModuleContent.match(importRegex);

//     if (importsMatch && importsMatch.length > 0) {
//       const lastImport = importsMatch.pop();
//       const lastImportIndex = appModuleContent.lastIndexOf(
//         lastImport as string
//       );

//       appModuleContent =
//         appModuleContent.slice(0, lastImportIndex + lastImport!.length) +
//         drizzleImport +
//         appModuleContent.slice(lastImportIndex + lastImport!.length);
//     } else {
//       appModuleContent = drizzleImport + appModuleContent;
//     }

//     const importsRegex = /imports: \[([\s\S]*?)\]/;

//     const match = importsRegex.exec(appModuleContent);
//     if (match) {
//       const existingImports = match[1]?.trim();

//       if (!existingImports?.includes(drizzleProvider.trim())) {
//         const updatedImports = `${existingImports}\n    ${drizzleProvider}`;
//         appModuleContent = appModuleContent.replace(
//           importsRegex,
//           `imports: [${updatedImports}]`
//         );
//         fs.writeFileSync(appModulePath, appModuleContent);
//         console.log("AppModule updated with Drizzle configuration.");
//       } else {
//         console.log("Drizzle provider is already present in the imports.");
//       }
//     } else {
//       console.error("Imports section not found in AppModule.");
//     }
//   }
// }
