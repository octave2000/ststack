import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  configurePrisma,
  generateNestPrismaService,
  setupPrisma,
} from "../utils/orms/prisma/setupPrisma";
import {
  configureDrizzleForNestjs,
  configureDrizzleForNextjs,
  setupDrizzle,
  setupNestDrizzle,
} from "../utils/orms/drizzle/setupDrizzle";

export async function initiateReactApp({
  projectPath,
  version = "latest",
  addTailwind = true,
  addEsLint = true,
  addTypeScript = true,
  addZustand = true,
  packageManager = "npm",
}: {
  projectPath: string;
  version: string;
  addTailwind: boolean;
  addEsLint: boolean;
  addTypeScript: boolean;
  addZustand: boolean;
  packageManager: "npm" | "pnpm" | "bun" | "yarn";
}) {
  console.log(
    `Creating React project at ${projectPath} with version ${version}`
  );

  execSync(
    `npx -y create-vite@${version} ${projectPath.replace(
      "./",
      ""
    )} --template ${addTypeScript ? "react-ts" : "react"} -- ${
      addEsLint ? "--eslint" : ""
    }`
  );

  process.chdir(projectPath);

  if (addEsLint) {
    console.log("Installing ....");
    execSync(`${packageManager} install`, { stdio: "inherit" });
  }

  if (addTailwind) {
    console.log("Installing Tailwind CSS...");
    if (packageManager == "yarn")
      execSync(`${packageManager} add -D tailwindcss postcss autoprefixer`, {
        stdio: "inherit",
      });
    else
      execSync(
        `${packageManager} install -D tailwindcss postcss autoprefixer`,
        { stdio: "inherit" }
      );
    execSync("npx tailwindcss init", { stdio: "inherit" });

    const tailwindConfig = `
            module.exports = {
                content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
                theme: {
                    extend: {},
                },
                plugins: [],
            };
        `;
    fs.writeFileSync("tailwind.config.js", tailwindConfig);

    const tailwindCSSImports = `
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
        `;
    fs.appendFileSync("src/index.css", tailwindCSSImports);
  }

  if (addZustand) {
    console.log("Installing Zustand...");
    if (packageManager == "yarn")
      execSync(`${packageManager} add zustand`, { stdio: "inherit" });
    else execSync(`${packageManager} install zustand`, { stdio: "inherit" });

    const zustandExample = !addTypeScript
      ? `
import { create } from 'zustand';

export const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
}));
    
        `
      : `
import { create } from 'zustand';

interface CounterState {
    count: number;
    increment: () => void;
    decrement: () => void;
}

export const useStore = create<CounterState>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
}));
        
        `;

    const storeDir = "src/store";
    if (!fs.existsSync(storeDir)) {
      fs.mkdirSync(storeDir);
    }
    fs.writeFileSync(path.join(storeDir, "store.ts"), zustandExample);
  }

  console.log("React project initialization complete!");
}

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
    dbType: "none" | "mongodb" | "mysql" | "postgresql" | "sqlite";
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

      configureEnv(addon.dbType);

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

/**
 *
 * @param options
 */
export async function initiateNextjs({
  projectPath,
  version = "latest",
  addTailwind = true,
  addEsLint = true,
  addTypeScript = true,
  useAppRoute = true,
  useTurbo = false,
  useSrcDir = true,
  addZustand = true,
  packageManager = "npm",
  addon,
}: {
  projectPath: string;
  version?: string;
  addTailwind?: boolean;
  addEsLint?: boolean;
  addTypeScript?: boolean;
  useAppRoute?: boolean;
  useTurbo?: boolean;
  useSrcDir?: boolean;
  addZustand?: boolean;
  packageManager?: "npm" | "pnpm" | "bun" | "yarn";
  addon: {
    ormType: "none" | "prisma" | "drizzle";
    dbType: "none" | "mongodb" | "mysql" | "postgresql" | "sqlite";
  };
}) {
  try {
    console.log(
      `Creating Next.js project at ${projectPath} with version ${version}`
    );
    const createCmd =
      `npx create-next-app@${version} ${projectPath} ` +
      `${addTypeScript ? "--typescript" : ""} ` +
      `${useTurbo ? "--turbo" : ""} ` +
      `${addTailwind ? "--tailwind" : ""} ` +
      `${addEsLint ? "--eslint" : ""} ` +
      `${useAppRoute ? "--app" : ""} ` +
      `${useSrcDir ? "--src-dir" : ""} ` +
      `--import-alias "@/*" --use-${packageManager}`;

    console.log(`Executing: ${createCmd}`);
    execSync(createCmd, { stdio: "inherit" });

    process.chdir(projectPath);

    if (addZustand) {
      console.log("Installing Zustand...");
      const zustandInstallCmd =
        packageManager === "yarn"
          ? `${packageManager} add zustand`
          : `${packageManager} install zustand`;
      execSync(zustandInstallCmd, { stdio: "inherit" });

      const zustandExample = !addTypeScript
        ? `
import { create } from 'zustand';

export const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
}));
    
        `
        : `
import { create } from 'zustand';

interface CounterState {
    count: number;
    increment: () => void;
    decrement: () => void;
}

export const useStore = create<CounterState>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
}));
              
              `;
      const storeDir = useSrcDir ? "src/store" : "store";
      if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir, { recursive: true });
      }
      fs.writeFileSync(path.join(storeDir, "store.ts"), zustandExample.trim());
      console.log("Zustand setup complete.");
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
          await setupDrizzle({
            addTypeScript: addTypeScript,
            dbType: addon.dbType,
            packageManager: packageManager,
          });
          break;
        default:
          console.log("No ORM selected.");
      }

      configureEnv(addon.dbType);

      switch (addon.ormType) {
        case "prisma":
          await configurePrisma();
          break;
        case "drizzle":
          await configureDrizzleForNextjs({
            addTypeScript: addTypeScript,
            dbType: addon.dbType,
          });
          break;
        default:
          break;
      }
    } else {
      console.log("No ORM or Database selected.");
    }

    console.log("Project initialization complete!");
  } catch (error) {
    console.error("Error during project initialization:", error);
  }
}

/**

 * @param dbType 
 */
function configureEnv(dbType: string) {
  const envPath = path.join(process.cwd(), ".env");
  let dbUrl = "";

  switch (dbType) {
    case "postgresql":
      dbUrl = "postgresql://USER:PASSWORD@localhost:5432/mydb";
      break;
    case "mysql":
      dbUrl = "mysql://USER:PASSWORD@localhost:3306/mydb";
      break;
    case "sqlite":
      dbUrl = "file:./dev.db";
      break;
    case "mongodb":
      dbUrl = "mongodb://USER:PASSWORD@localhost:27017/mydb";
      break;
    default:
      dbUrl = "";
  }

  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  if (!envContent.includes("DATABASE_URL")) {
    envContent += `\nDATABASE_URL=${dbUrl}\n`;
  } else {
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${dbUrl}`);
  }

  fs.writeFileSync(envPath, envContent);
  console.log(".env file configured with DATABASE_URL.");
}
