import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// initiateReactApp({
//     projectPath: `react-app`,
//     version: 'latest',
//     addTailwind: true,
//     addEsLint: true,
//     addTypeScript: true,
//     addZustand: true,
//     packageManager: "npm"

// }).then(() => {
//     console.log('React project initiated successfully!');
// });

export async function initiateReactApp({
    projectPath,
    version = 'latest',
    addTailwind = true,
    addEsLint = true,
    addTypeScript = true,
    addZustand = true,
    packageManager = "npm"

}: {
    projectPath: string;
    version: string;
    addTailwind: boolean;
    addEsLint: boolean;
    addTypeScript: boolean;
    addZustand: boolean;
    packageManager: "npm" | "pnpm" | "bun" | "yarn"
}) {
    // Step 1: Create the React project
    console.log(`Creating React project at ${projectPath} with version ${version}`);
    execSync(`npx -y create-vite@${version} ${projectPath} --template ${addTypeScript ? 'react-ts' : 'react'} -- ${addEsLint ? '--eslint' : ''}`, { stdio: 'inherit' });


    // Change directory to project
    process.chdir(projectPath);

    // Step 2: Install ESLint if requested
    if (addEsLint) {
        console.log('Installing ....');
        execSync(`${packageManager} install`, { stdio: 'inherit' });
    }

    // Step 3: Install Tailwind CSS if requested
    if (addTailwind) {
        console.log('Installing Tailwind CSS...');
        if (packageManager == "yarn") execSync(`${packageManager} add -D tailwindcss postcss autoprefixer`, { stdio: 'inherit' });
        else execSync(`${packageManager} install -D tailwindcss postcss autoprefixer`, { stdio: 'inherit' });
        execSync('npx tailwindcss init', { stdio: 'inherit' });

        // Configure Tailwind
        const tailwindConfig = `
            module.exports = {
                content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
                theme: {
                    extend: {},
                },
                plugins: [],
            };
        `;
        fs.writeFileSync('tailwind.config.js', tailwindConfig);

        // Add Tailwind imports to index.css
        const tailwindCSSImports = `
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
        `;
        fs.appendFileSync('src/index.css', tailwindCSSImports);
    }

    // Step 4: Add Zustand for state management
    if (addZustand) {
        console.log('Installing Zustand...');
        if (packageManager == "yarn") execSync(`${packageManager} add zustand`, { stdio: 'inherit' });
        else execSync(`${packageManager} install zustand`, { stdio: 'inherit' });


        const zustandExample = `
            import { create } from 'zustand';

            export const useStore = create((set) => ({
                count: 0,
                increment: () => set((state) => ({ count: state.count + 1 })),
                decrement: () => set((state) => ({ count: state.count - 1 })),
            }));
        `;
        const storeDir = 'src/store';
        if (!fs.existsSync(storeDir)) {
            fs.mkdirSync(storeDir);
        }
        fs.writeFileSync(path.join(storeDir, 'store.ts'), zustandExample);
    }

    console.log('React project initialization complete!');
}

// initiateNestjs({
//     projectPath: `nestjs-app`,
//     version: 'latest',
//     addTypeScript: true,
//     useSrcDir: true,
//     packageManager: "bun"
// }).then(() => {
//     console.log('NestJS project initiated successfully!');
// });

export async function initiateNestjs({
    projectPath,
    version = 'latest',
    addTypeScript = true,
    useSrcDir = true,
    packageManager = "npm"
}: {
    projectPath: string;
    version: string;
    addTypeScript: boolean;
    useSrcDir: boolean;
    packageManager: "npm" | "pnpm" | "bun" | "yarn"
}) {
    // nest new cool-rokject --skip-install -l "TypeScript" -p pnpm
    console.log(`Creating NestJS project at ${projectPath} with version ${version}`);
    execSync(`npx @nestjs/cli new  ${projectPath} ${addTypeScript ? '-l "TypeScript"' : '-l "JavaScript"'} --package-manager npm --skip-install`, { stdio: 'inherit' });


    // Change directory to project
    process.chdir(projectPath);

    // Step 2: Modify the structure if `useSrcDir` is true
    if (useSrcDir) {
        console.log('Installing ....');
        execSync(`${packageManager} install`, { stdio: 'inherit' });

        // By default, NestJS already uses a "src" directory, so no need for extra modifications
        // However, if you need specific directory setups, you can handle that here
    }

    console.log('NestJS project initialization complete!');
}

// initiateNextjs({
//     projectPath: `nextjs-app`,
//     version: 'latest',
//     addTailwind: true,
//     addEsLint: true,
//     addTypeScript: true,
//     useAppRoute: true,
//     useTurbo: true,
//     useSrcDir: true,
//     addZustand: true,
//     packageManager: "bun"
// }).then(() => {
//     console.log('Next.js project initiated successfully!');
// })
// export async function initiateNextjs({
//     projectPath,
//     version = 'latest',
//     addTailwind = true,
//     addEsLint = true,
//     addTypeScript = true,
//     useAppRoute = true,
//     useTurbo = false,
//     useSrcDir = true,
//     addZustand = true,
//     packageManager = "npm",
//     addon
// }: {
//     projectPath: string;
//     version: string;
//     addTailwind: boolean;
//     addEsLint: boolean;
//     addTypeScript: boolean;
//     useAppRoute: boolean;
//     useTurbo: boolean;
//     useSrcDir: boolean;
//     addZustand: boolean;
//     packageManager: "npm" | "pnpm" | "bun" | "yarn";
//     addon:{
//         ormType:"none" | "prisma" | "drizzle";
//         dbType: "none" | "mongodb" | "mysql" | "postgresql" | "sqlite";
//     }
// }) {
//     // Step 1: Create the Next.js project
//     console.log(`Creating Next.js project at ${projectPath} with version ${version}`);
//     console.log(`npx create-next-app@${version} ${projectPath} ${addTypeScript ? '--typescript' : ''} ${useTurbo ? '--turbo' : ''} ${addTailwind ? '--tailwind' : ''} ${addEsLint ? '--eslint' : ''} ${useAppRoute ? '--app' : ''} ${useSrcDir ? '--src-dir' : ''}  --import-alias "@/*" --use-${packageManager}`);

//     execSync(`npx create-next-app@${version} ${projectPath} ${addTypeScript ? '--typescript' : ''} ${useTurbo ? '--turbo' : ''} ${addTailwind ? '--tailwind' : ''} ${addEsLint ? '--eslint' : ''} ${useAppRoute ? '--app' : ''} ${useSrcDir ? '--src-dir' : ''}  --import-alias "@/*" --use-${packageManager}`, { stdio: 'inherit' });
//     // Change directory to project
//     process.chdir(projectPath);

//     // Step 5: Add Zustand for state management
//     if (addZustand) {
//         console.log('Installing Zustand...');
//         if (packageManager == "yarn") execSync(`${packageManager} add zustand`, { stdio: 'inherit' });
//         else execSync(`${packageManager} install zustand`, { stdio: 'inherit' });

//         const zustandExample = `
//             import { create } from 'zustand';

//             export const useStore = create((set) => ({
//                 count: 0,
//                 increment: () => set((state) => ({ count: state.count + 1 })),
//                 decrement: () => set((state) => ({ count: state.count - 1 })),
//             }));
//         `;
//         const storeDir = useSrcDir ? 'src/store' : 'store';
//         if (!fs.existsSync(storeDir)) {
//             fs.mkdirSync(storeDir);
//         }
//         fs.writeFileSync(path.join(storeDir, 'store.ts'), zustandExample);
//     }


//     console.log('Project initialization complete!');
// }


/**
 *
 * @param options
 */
export async function initiateNextjs({
    projectPath,
    version = 'latest',
    addTailwind = true,
    addEsLint = true,
    addTypeScript = true,
    useAppRoute = true,
    useTurbo = false,
    useSrcDir = true,
    addZustand = true,
    packageManager = "npm",
    addon
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
        // Step 1: Create the Next.js project
        console.log(`Creating Next.js project at ${projectPath} with version ${version}`);
        const createCmd = `npx create-next-app@${version} ${projectPath} ` +
            `${addTypeScript ? '--typescript' : ''} ` +
            `${useTurbo ? '--turbo' : ''} ` +
            `${addTailwind ? '--tailwind' : ''} ` +
            `${addEsLint ? '--eslint' : ''} ` +
            `${useAppRoute ? '--app' : ''} ` +
            `${useSrcDir ? '--src-dir' : ''} ` +
            `--import-alias "@/*" --use-${packageManager}`;

        console.log(`Executing: ${createCmd}`);
        execSync(createCmd, { stdio: 'inherit' });

        // Change directory to project
        process.chdir(projectPath);

        // Step 2: Add Zustand for state management
        if (addZustand) {
            console.log('Installing Zustand...');
            const zustandInstallCmd = packageManager === "yarn"
                ? `${packageManager} add zustand`
                : `${packageManager} install zustand`;
            execSync(zustandInstallCmd, { stdio: 'inherit' });

            const zustandExample = `
import { create } from 'zustand';

export const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
}));
`;
            const storeDir = useSrcDir ? 'src/store' : 'store';
            if (!fs.existsSync(storeDir)) {
                fs.mkdirSync(storeDir, { recursive: true });
            }
            fs.writeFileSync(path.join(storeDir, 'store.ts'), zustandExample.trim());
            console.log('Zustand setup complete.');
        }

        // Step 3: Handle Addon Functionality (ORM and Database)
        if (addon && addon.ormType !== "none" && addon.dbType !== "none") {
            console.log(`Setting up ORM: ${addon.ormType} with Database: ${addon.dbType}`);

            // Step 3a: Install ORM and Database Driver
            switch (addon.ormType) {
                case "prisma":
                    await setupPrisma(addon.dbType, packageManager);
                    break;
                case "drizzle":
                    await setupDrizzle(addon.dbType, packageManager);
                    break;
                default:
                    console.log('No ORM selected.');
            }

            // Step 3b: Configure Environment Variables
            configureEnv(addon.dbType);

            // Step 3c: Generate ORM Configuration Files
            switch (addon.ormType) {
                case "prisma":
                    await configurePrisma();
                    break;
                case "drizzle":
                    await configureDrizzle();
                    break;
                default:
                    // Do nothing
                    break;
            }
        } else {
            console.log('No ORM or Database selected.');
        }

        console.log('Project initialization complete!');
    } catch (error) {
        console.error('Error during project initialization:', error);
    }
}

/**
 * @param dbType
 * @param packageManager
 */
async function setupPrisma(dbType: string, packageManager: string) {
    console.log('Installing Prisma...');
    const installCmd = packageManager === "yarn"
        ? `${packageManager} add prisma @prisma/client`
        : `${packageManager} install prisma @prisma/client`;
    execSync(installCmd, { stdio: 'inherit' });

    console.log('Initializing Prisma...');
    execSync(`${packageManager} exec prisma init`, { stdio: 'inherit' });

    // Adjust the schema.prisma file based on dbType
    const prismaSchemaPath = path.join('prisma', 'schema.prisma');
    let datasource = '';
    switch (dbType) {
        case "postgresql":
            datasource = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;
            break;
        case "mysql":
            datasource = `datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}`;
            break;
        case "sqlite":
            datasource = `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`;
            break;
        case "mongodb":
            datasource = `datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}`;
            break;
        default:
            throw new Error(`Unsupported database type for Prisma: ${dbType}`);
    }

    const prismaSchemaContent = `
${datasource}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
`.trim();

    fs.writeFileSync(prismaSchemaPath, prismaSchemaContent);
    console.log('Prisma schema configured.');
}

/**
 * Configures Prisma by generating the client.
 */
async function configurePrisma() {
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma client generated.');
}

/**
 * Sets up Drizzle ORM with the selected database.
 *
 * @param dbType - Type of the database.
 * @param packageManager - Package manager to use.
 */
async function setupDrizzle(dbType: string, packageManager: string) {
    console.log('Installing Drizzle ORM...');
    let drizzlePackages = ['drizzle-orm'];
    let dbDriver = '';

    switch (dbType) {
        case "postgresql":
            dbDriver = 'pg';
            drizzlePackages.push('drizzle-orm-pg');
            break;
        case "mysql":
            dbDriver = 'mysql2';
            drizzlePackages.push('drizzle-orm-mysql2');
            break;
        case "sqlite":
            dbDriver = 'sqlite3';
            drizzlePackages.push('drizzle-orm-sqlite3');
            break;
        case "mongodb":
            dbDriver = 'mongodb';
            drizzlePackages.push('drizzle-orm-mongodb');
            break;
        default:
            throw new Error(`Unsupported database type for Drizzle: ${dbType}`);
    }

    const installCmd = `${packageManager} add ${drizzlePackages.join(' ')} ${dbDriver}`;
    execSync(installCmd, { stdio: 'inherit' });

    console.log('Drizzle ORM installed.');
}

async function configureDrizzle() {
    const drizzleConfig = `
import { drizzle } from 'drizzle-orm';
import { ${getDrizzleAdapter()} } from 'drizzle-orm/${getDrizzleAdapter()}';
import { Pool } from 'pg'; // Change based on your DB

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
`.trim();

    fs.writeFileSync('drizzle.config.ts', drizzleConfig);
    console.log('Drizzle ORM configuration file created.');
}

/**
 * @returns 
 */
function getDrizzleAdapter(): string {
    // This function should determine the adapter based on your dbType.
    // For simplicity, let's assume PostgreSQL. Modify as needed.
    return 'pg';
}

/**

 * @param dbType 
 */
function configureEnv(dbType: string) {
    const envPath = path.join(process.cwd(), '.env');
    let dbUrl = '';

    switch (dbType) {
        case "postgresql":
            dbUrl = 'postgresql://USER:PASSWORD@localhost:5432/mydb';
            break;
        case "mysql":
            dbUrl = 'mysql://USER:PASSWORD@localhost:3306/mydb';
            break;
        case "sqlite":
            dbUrl = 'file:./dev.db';
            break;
        case "mongodb":
            dbUrl = 'mongodb://USER:PASSWORD@localhost:27017/mydb';
            break;
        default:
            dbUrl = '';
    }

    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
    }

    if (!envContent.includes('DATABASE_URL')) {
        envContent += `\nDATABASE_URL=${dbUrl}\n`;
    } else {
        // Optionally, you can replace the existing DATABASE_URL
        envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${dbUrl}`);
    }

    fs.writeFileSync(envPath, envContent);
    console.log('.env file configured with DATABASE_URL.');
}




initiateNextjs({
    projectPath: './my-next-app',
    version: 'latest',
    addTailwind: true,
    addEsLint: true,
    addTypeScript: true,
    useAppRoute: true,
    useTurbo: false,
    useSrcDir: true,
    addZustand: true,
    packageManager: 'npm',
    addon: {
        ormType: 'prisma', // Options: 'none' | 'prisma' | 'drizzle'
        dbType: 'postgresql' // Options: 'none' | 'mongodb' | 'mysql' | 'postgresql' | 'sqlite'
    }
});
