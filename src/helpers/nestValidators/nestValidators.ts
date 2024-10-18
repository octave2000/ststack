import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function installNestValidators(packageManager: string) {
  try {
    console.log("installing validators and transformers....");
    execSync(
      `${packageManager} ${
        packageManager === "yarn" ? "add" : "install"
      } class-validator class-transformer @nestjs/config `
    );

    const updateContent = `
import { ValidationPipe } from '@nestjs/common';
        `;

    const ValidationPipe = `
  app.useGlobalPipes(new ValidationPipe());
     `;
    const mainFilePath = path.join("src", "main.ts");
    let mainFileContent = fs.readFileSync(mainFilePath, "utf-8");
    const importsRegex = /^import .*?;$/gm;
    const importsMatch = mainFileContent.match(importsRegex);
    if (importsMatch && importsMatch.length > 0) {
      const lastImport = importsMatch.pop();
      const lastImportIndex = mainFileContent.lastIndexOf(lastImport as string);
      mainFileContent =
        mainFileContent.slice(0, lastImportIndex + lastImport!.length) +
        updateContent +
        mainFileContent.slice(lastImportIndex + lastImport!.length);
    } else {
      mainFileContent = updateContent + mainFileContent;
    }

    const contentRegex = /const app = await NestFactory\.create\(AppModule\);/;
    const match = contentRegex.exec(mainFileContent);
    if (match) {
      const existingLine = match[0];
      const updatedMainFileContent = `${existingLine}\n   ${ValidationPipe}`;
      mainFileContent = mainFileContent.replace(
        contentRegex,
        updatedMainFileContent
      );
      fs.writeFileSync(mainFilePath, mainFileContent);
      console.log("main file updated");
    }
  } catch (error) {
    console.error("error in installing valiations", error);
  }
}
