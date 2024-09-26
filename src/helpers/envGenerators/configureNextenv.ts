import path from "path";
import fs from "fs";

/**

 * @param dbType 
 */
export function configureNextEnv(dbType: string) {
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
