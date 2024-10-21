import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function setupPrisma(packageManager: string, dbType?: string) {
  console.log("Installing Prisma...");
  const installCmd =
    packageManager === "yarn"
      ? `${packageManager} add prisma @prisma/client`
      : `${packageManager} install prisma @prisma/client`;
  execSync(installCmd, { stdio: "inherit" });

  console.log("Initializing Prisma...");
  execSync(`npx prisma init`);

  const prismaSchemaPath = path.join("prisma", "schema.prisma");
  if (dbType !== "none") {
  }
  let datasource = "";
  switch (dbType) {
    case "postgresql":
      datasource = `datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }`;
      break;
    case "mysql":
      datasource = `datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
  }`;
      break;
    case "sqlite":
      datasource = `datasource db {
    provider = "sqlite"
    url      = "file:./dev.db"
  }`;
      break;
    case "none":
      datasource = `
      datasource db {
    provider = "mongodb"
    url      = env("DATABASE_URL")
      `;
    case "mongodb":
      datasource = `datasource db {
    provider = "mongodb"
    url      = env("DATABASE_URL")
  }`;
      break;
    default:
      throw new Error(`Unsupported database type for Prisma: ${dbType}`);
  }

  const prismaSchemaContent = `
  generator client {
    provider = "prisma-client-js"
  }
  // crosss-db compatibility
  model Counter {
    counterId  String  @unique
    counter Int
  }
  `.trim();

  fs.writeFileSync(prismaSchemaPath, prismaSchemaContent);
  console.log("Prisma schema configured.");
}

export async function configurePrisma() {
  console.log("Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("Prisma client generated.");
}
