# 🚀 st-stack

`st-stack` is a CLI tool that helps you kickstart projects using **Next.js**, **NestJS**, or **React.js**, with fully customizable setups. Whether you're looking for TypeScript, Tailwind CSS, Zustand state management, or database integrations like Drizzle or Prisma, `st-stack` has got you covered!

## 🌟 Features

- **Framework Options**: Start your project with **Next.js**, **NestJS**, or **React.js**.
- **Customization**: Choose between:
  - ⚙️ **Language**: TypeScript or JavaScript.
  - 🎨 **Styling**: Tailwind CSS or no styling.
  - 🧹 **ESLint**: Enable or skip.
  - 🛠️ **State Management**: Integrate Zustand or none.
  - 🗄️ **ORM**: Drizzle, Prisma, or no ORM.
  - 🛢️ **Database**: PostgreSQL, MySQL, SQLite, or none.
  - 🛣️ **Routing**: App route support (for Next.js).
  - ⚡ **Turbo**: Enable Turbo Mode for faster builds (for Next.js).
  - 📁 **src Directory**: Organize your code with a `src` folder.
- **Package Managers**: Supports **npm**, **yarn**, **pnpm**, and **bun**.

## 🛠️ How to Use

Run in your terminal:

## npm

```bash
npm create st-stack
```

## pnpm

```bash
pnpm create st-stack
```

## yarn

```bash
yarn create st-stack
```

## burn

```bash
burn create st-stack
```

You'll be prompted to select various options to configure your project:

1. **Project Name**: Define your project name (no capital letters).
2. **Package Manager**: Choose from npm, yarn, pnpm, or bun.
3. **Framework**: Select your desired framework (Next.js, React.js, or NestJS).
4. Customize based on your framework:
   - Language: TypeScript or JavaScript.
   - Tailwind CSS: Yes or No.
   - Zustand: Yes or No.
   - ESLint: Yes or No.
   - ORM & Database: Choose your ORM and Database (optional).

Once you finish selecting, `st-stack` will scaffold your project with your chosen configuration!

## 🤝 Contributing

Want to improve `st-stack`? Feel free to submit an issue or a pull request. Contributions are always welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a pull request

## 📝 License

This project is licensed under the [MIT License](LICENSE).
