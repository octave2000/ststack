import { execSync } from "child_process";
import fs from "fs";
import path from "path";

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
