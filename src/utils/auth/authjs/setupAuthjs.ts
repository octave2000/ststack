import { execSync } from "child_process";
import fs from "fs";
import path from "path";



export async function setupAuthjsNextjs({
    dbType,
    ormType,
    packageManager,
    addTypeScript,
    useSrcDir
}: {
    dbType: "none" | "mongodb" | "mysql" | "postgresql" | "sqlite";
    ormType: "none" | "prisma" | "drizzle";
    packageManager: "yarn" | "npm" | "bun" | "pnpm";
    addTypeScript: boolean;
    useSrcDir: boolean;
}) {

    console.log("Installing Auth.js Next.js...");

    let authPackages = ["next-auth@beta"];
    switch (ormType) {
        case "prisma":
            authPackages.push("@prisma/client");
            authPackages.push("@auth/prisma-adapter");
            dbType != "none" && configurePrismaAuthjsNextjs({
                dbType: dbType,
                addTypeScript: addTypeScript
            });
            break;
        case "drizzle":
            authPackages.push("@auth/drizzle-adapter");
            break;
        case "none":
            console.log("Using better sqlite3...");
            // drizzlePackages.push("better-sqlite3");
            break;
        default:
            throw new Error(`Unsupported database type for Drizzle: ${dbType}`);
    }
    const installCmd = `${packageManager} ${packageManager == "yarn" ? "add" : "install"
        } ${authPackages.join(" ")}`;
    execSync(installCmd, { stdio: "inherit" });
    execSync("npx auth secret");

    console.log("Installed Auth Packages");


    fs.writeFileSync(`auth.${addTypeScript ? "ts" : "js"}`, `
import NextAuth from "next-auth"
${ormType == "prisma" ? 'import { PrismaAdapter } from "@auth/prisma-adapter"' : ""}
${ormType == "prisma" ? 'import { prisma } from "@/prisma"' : ""}

 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
  ${ormType == "prisma" ? 'adapter: PrismaAdapter(prisma)' : ""}
})
    `.trim());

    fs.writeFileSync(`${useSrcDir ? "src/" : ""}app/api/auth/[...nextauth]/route.${addTypeScript ? "ts" : "js"}`, `
import { handlers } from "@/auth" // Referring to the auth.${addTypeScript ? "ts" : "js"} just created
export const { GET, POST } = handlers
        `.trim());

    console.log("Authjs Configured.");
}


function configurePrismaAuthjsNextjs({
    addTypeScript,
    dbType
}: {
    addTypeScript: boolean;
    dbType: "mongodb" | "mysql" | "postgresql" | "sqlite" | "none";
}) {
    const prismaSchemaPath = path.join("prisma", "schema.prisma");

    fs.writeFileSync(`prisma.${addTypeScript ? "ts" : "js"}`, `
    
import { PrismaClient } from "@prisma/client"
    
const globalForPrisma = globalThis ${addTypeScript ? "as unknown as { prisma: PrismaClient }" : ""}
    
export const prisma = globalForPrisma.prisma || new PrismaClient()
    
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
            `.trim());


    if (dbType == "mysql") {
        fs.appendFileSync(prismaSchemaPath, `
          
model User {
  id            String          @id @default(cuid())
  name          String?
  username      String?         @unique
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  // Optional for WebAuthn support
  Authenticator Authenticator[]
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 
model Account {
  id                       String  @id @default(cuid())
  userId                   String  @unique
  type                     String
  provider                 String
  providerAccountId        String
  refresh_token            String? @db.Text
  access_token             String? @db.Text
  expires_at               Int?
  token_type               String?
  scope                    String?
  id_token                 String? @db.Text
  session_state            String?
  refresh_token_expires_in Int?
  user                     User?   @relation(fields: [userId], references: [id])
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
 
  @@unique([provider, providerAccountId])
  @@index([userId])
}
 
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
 
  @@index([userId])
}
 
model VerificationToken {
  identifier String
  token      String
  expires    DateTime
 
  @@unique([identifier, token])
}
 
// Optional for WebAuthn support
model Authenticator {
  credentialID         String  @unique
  userId               String
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@id([userId, credentialID])
}    
            `);

    }

    if (dbType == "postgresql") {
        fs.appendFileSync(prismaSchemaPath, `
          
model User {
  id            String          @id @default(cuid())
  name          String?
  email         String          @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  // Optional for WebAuthn support
  Authenticator Authenticator[]
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 
model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@id([provider, providerAccountId])
}
 
model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 
model VerificationToken {
  identifier String
  token      String
  expires    DateTime
 
  @@id([identifier, token])
}
 
// Optional for WebAuthn support
model Authenticator {
  credentialID         String  @unique
  userId               String
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@id([userId, credentialID])
}  
            `);

    }
    if (dbType == "sqlite") {
        fs.appendFileSync(prismaSchemaPath, `
          
model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  // Optional for WebAuthn support
  Authenticator Authenticator[]
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@unique([provider, providerAccountId])
}
 
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 
model VerificationToken {
  identifier String
  token      String
  expires    DateTime
 
  @@unique([identifier, token])
}
 
// Optional for WebAuthn support
model Authenticator {
  credentialID         String  @unique
  userId               String
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@id([userId, credentialID])
}
            `);

    }
    if (dbType == "mongodb") {
        fs.appendFileSync(prismaSchemaPath, `
          
model User {
  id            String          @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  // Optional for WebAuthn support
  Authenticator Authenticator[]
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 
model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.String
  access_token      String? @db.String
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.String
  session_state     String?
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@unique([provider, providerAccountId])
}
 
model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 
model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  token      String
  expires    DateTime
 
  @@unique([identifier, token])
}
 
// Optional for WebAuthn support
model Authenticator {
  credentialID         String  @id @map("_id")
  userId               String  @db.ObjectId
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@unique([userId, credentialID])
}
            `);

    }
    // No migrationtions
    // execSync(`npm exec prisma migrate dev`);
    execSync(`npx prisma generate`);

}

function configureDrizzleAuthjsNextjs() {
    //  make drizzle schema config
}