import { execSync } from "child_process";
import { configureNextEnv } from "../helpers/envGenerators/configureNextenv";
import fs from "fs";
import path from "path";
import { configureDrizzleForNextjs, setupDrizzle } from "../utils/orms/drizzle";
import { configurePrisma, setupPrisma } from "../utils/orms/prisma";

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
    dbType: "none" | "mysql" | "postgresql" | "sqlite";
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

      configureNextEnv(addon.dbType);

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
