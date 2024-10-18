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
import { installNestValidators } from "../helpers/nestValidators/nestValidators";
import {
  configureAuthFiles,
  createAuthFolders,
  initiatePassportJwt,
} from "../utils/auth/passport/nestjs/jwt-auth/jwt";

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
    dbType: "none" | "mysql" | "postgresql" | "sqlite" | "mongo";
    auth: "none" | "nestjwt/passport";
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
          await setupPrisma(packageManager, addon.dbType);
          await installNestValidators(packageManager);
          configureNestEnv(addon.dbType);
          await configurePrisma();
          await generateNestPrismaService();
          break;

        case "drizzle":
          await setupNestDrizzle({
            addTypeScript,
            dbType: addon.dbType,
            packageManager,
          });

          configureNestEnv(addon.dbType);
          await configureDrizzleForNestjs({ dbType: addon.dbType });
          await installNestValidators(packageManager);
          break;

        default:
          console.log("No ORM selected.");
          break;
      }
    } else {
      console.log("No ORM or Database selected.");
    }

    if (addon && addon.auth !== "none") {
      console.log("setting up passport auth");
      await initiatePassportJwt(packageManager);
      await createAuthFolders();
      await configureAuthFiles(addon.ormType);
    }

    console.log("Project initialization complete!");

    console.log("NestJS project initialization complete!");
  } catch (error) {
    console.error("Error during project initialization:", error);
  }
}
