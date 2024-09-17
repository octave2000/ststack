export type packageManager = "yarn" | "npm" | "pnpm";
export type projectName = string;
export type framework = "next js" | "nest js" | "React js";

export interface userSelections {
  projectName: projectName;
  packageManager: packageManager;
  framework: framework;
}
