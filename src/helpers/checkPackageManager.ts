import { exec } from "child_process";

export function checkPackageManager(
  manager: string
): Promise<{ manager: string; installed: boolean; version?: string }> {
  return new Promise((resolve, reject) => {
    exec(
      `${manager} --version`,
      (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          resolve({ manager, installed: false });
        } else {
          resolve({ manager, installed: true, version: stdout.trim() });
        }
      }
    );
  });
}

// (async () => {
//   const packageManagers = ["pnpm", "yarn", "npm", "bun"];
//   const checks = await Promise.all(packageManagers.map(checkPackageManager));

//   checks.forEach(({ manager, installed, version }) => {
//     if (installed) {
//       console.log(`${manager} is installed. Version: ${version}`);
//     } else {
//       console.log(`${manager} is not installed.`);
//     }
//   });
// })();
