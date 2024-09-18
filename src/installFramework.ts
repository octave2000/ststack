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
    packageManager = "npm"
}: {
    projectPath: string;
    version: string;
    addTailwind: boolean;
    addEsLint: boolean;
    addTypeScript: boolean;
    useAppRoute: boolean;
    useTurbo: boolean;
    useSrcDir: boolean;
    addZustand: boolean;
    packageManager: "npm" | "pnpm" | "bun" | "yarn"
}) {
    // Step 1: Create the Next.js project
    console.log(`Creating Next.js project at ${projectPath} with version ${version}`);
    console.log(`npx create-next-app@${version} ${projectPath} ${addTypeScript ? '--typescript' : ''} ${useTurbo ? '--turbo' : ''} ${addTailwind ? '--tailwind' : ''} ${addEsLint ? '--eslint' : ''} ${useAppRoute ? '--app' : ''} ${useSrcDir ? '--src-dir' : ''}  --import-alias "@/*" --use-${packageManager}`);

    execSync(`npx create-next-app@${version} ${projectPath} ${addTypeScript ? '--typescript' : ''} ${useTurbo ? '--turbo' : ''} ${addTailwind ? '--tailwind' : ''} ${addEsLint ? '--eslint' : ''} ${useAppRoute ? '--app' : ''} ${useSrcDir ? '--src-dir' : ''}  --import-alias "@/*" --use-${packageManager}`, { stdio: 'inherit' });
    // Change directory to project
    process.chdir(projectPath);

    // Step 5: Add Zustand for state management
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
        const storeDir = useSrcDir ? 'src/store' : 'store';
        if (!fs.existsSync(storeDir)) {
            fs.mkdirSync(storeDir);
        }
        fs.writeFileSync(path.join(storeDir, 'store.ts'), zustandExample);
    }


    console.log('Project initialization complete!');
}

