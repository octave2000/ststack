import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function setupPrisma(dbType: string, packageManager: string) {
  console.log("Installing Prisma...");
  const installCmd =
    packageManager === "yarn"
      ? `${packageManager} add prisma @prisma/client`
      : `${packageManager} install prisma @prisma/client`;
  execSync(installCmd, { stdio: "inherit" });

  console.log("Initializing Prisma...");
  execSync(`${packageManager} exec prisma init`, { stdio: "inherit" });

  const prismaSchemaPath = path.join("prisma", "schema.prisma");
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
  ${datasource}
  
  generator client {
    provider = "prisma-client-js"
  }
  
  model User {
    id    Int     @id @default(autoincrement())
    email String  @unique
    name  String?
  }
  `.trim();

  fs.writeFileSync(prismaSchemaPath, prismaSchemaContent);
  console.log("Prisma schema configured.");
}

export async function generateNestPrismaService() {
  console.log("generating prisma service ");
  execSync("nest g module prisma ");
  execSync("nest g service prisma");
  const prismaModulePath = path.join("src", "prisma", "prisma.module.ts");
  const customPrismaModule = `
    import { Global, Module } from '@nestjs/common';
  import { PrismaService } from './prisma.service';
  
  @Global()
  @Module({
    providers: [PrismaService]
  })
  export class PrismaModule {}
  
    `;
  fs.writeFileSync(prismaModulePath, customPrismaModule);

  console.log("prisma service generated ");
}

export async function configurePrisma() {
  console.log("Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("Prisma client generated.");
}
