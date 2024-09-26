import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function generateNestPrismaService() {
  console.log("generating prisma service ");
  execSync("nest g module prisma ");
  execSync("nest g service prisma");
  const prismaModulePath = path.join("src", "prisma", "prisma.module.ts");
  const prismaServicePath = path.join("src", "prisma", "prisma.service.ts");

  const customPrismaService = `
  import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
  import { PrismaClient } from '@prisma/client';
  
  @Injectable()
  export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
      await this.$connect();
    }
  
    async onModuleDestroy() {
      await this.$disconnect();
    }
  }
  
    `;
  fs.writeFileSync(prismaServicePath, customPrismaService);

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
