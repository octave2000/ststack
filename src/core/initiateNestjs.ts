import { execSync } from "child_process";
import { configureNestEnv } from "../helpers/envGenerators/configureNestenv";
import {
  configureDrizzleForNestjs,
  setupNestDrizzle,
} from "../utils/orms/drizzle";
import {
  configurePrisma,
  generateNestPrismaService,
  setupPrisma,
} from "../utils/orms/prisma";

export async function initiateNestjs({
  projectPath,
  version = "latest",
  addTypeScript = true,
  useSrcDir = true,
  packageManager = "npm",
  addon,
}: {
  projectPath: string;
  version: string;
  addTypeScript: boolean;
  useSrcDir: boolean;
  packageManager: "npm" | "pnpm" | "bun" | "yarn";
  addon: {
    ormType: "none" | "prisma" | "drizzle";
    dbType: "none" | "mysql" | "postgresql" | "sqlite";
  };
}) {
  try {
    console.log(
      `Creating NestJS project at ${projectPath} with version ${version}`
    );
    execSync(
      `npx @nestjs/cli new  ${projectPath} ${
        addTypeScript ? '-l "TypeScript"' : '-l "JavaScript"'
      } --package-manager npm --skip-install`,
      { stdio: "inherit" }
    );

    process.chdir(projectPath);

    if (useSrcDir) {
      console.log("Installing ....");
      execSync(`${packageManager} install`, { stdio: "inherit" });
    }

    if (addon && addon.ormType !== "none" && addon.dbType !== "none") {
      console.log(
        `Setting up ORM: ${addon.ormType} with Database: ${addon.dbType}`
      );

      switch (addon.ormType) {
        case "prisma":
          await setupPrisma(addon.dbType, packageManager);
          break;
        case "drizzle":
          await setupNestDrizzle({
            addTypeScript: addTypeScript,
            dbType: addon.dbType,
            packageManager: packageManager,
          });
          break;
        default:
          console.log("No ORM selected.");
      }

      configureNestEnv(addon.dbType);

      switch (addon.ormType) {
        case "prisma":
          await configurePrisma();
          await generateNestPrismaService();
          break;
        case "drizzle":
          await configureDrizzleForNestjs({ dbType: addon.dbType });
          break;
        default:
          break;
      }
    } else {
      console.log("No ORM or Database selected.");
    }

    console.log("Project initialization complete!");

    console.log("NestJS project initialization complete!");
  } catch (error) {
    console.error("Error during project initialization:", error);
  }
}
