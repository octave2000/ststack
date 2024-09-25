# `st-stack`

`st-stack` is a CLI tool designed to simplify the process of setting up various types of projects. It allows you to initialize projects with different frameworks and configurations, including Next.js, React.js, and NestJS. With `st-stack`, you can easily choose your preferred setup options such as language, styling, linting, state management, and more.

## Features

- **Framework Support:** Next.js, React.js, NestJS
- **Language Options:** TypeScript, JavaScript
- **Styling Options:** Tailwind CSS
- **Linting:** ESLint
- **State Management:** Zustand
- **Database Options:** PostgreSQL, MySQL, SQLite
- **ORM Options:** Drizzle, Prisma

## Installation

To install `st-stack`, you can use the following command:

```bash
npm install -g st-stack

To start the setup process, run:
st-stack

# Project Configuration Guide

Welcome to the project configuration setup! You'll be prompted to configure various options for your project. Below is a breakdown of the prompts you'll encounter:

## Project Name

- **Input:** The name of your project (avoid capital letters) or use `.` to install in the current directory.
- **Validation:**
  - Project name should not contain capital letters.
  - Project name should not start with `.`, `_`, or `-`.
  - If using `..`, the current directory name should not have capital letters.

## Package Manager

- **Prompt:** Choose a package manager for your project.
- **Choices:**
  - `npm`
  - `yarn`
  - `pnpm`
  - `bun`

## Framework

- **Prompt:** Choose your preferred framework.
- **Choices:**
  - `Next.js`
  - `React.js`
  - `NestJS`

## Framework-Specific Options

### Next.js

- **Language:** Choose between TypeScript and JavaScript.
- **Tailwind CSS:** Do you want to include Tailwind CSS?
- **ESLint:** Do you want to use ESLint?
- **App Route:** Do you want to use the app route?
- **Create Src Directory:** Do you want to create a `src` directory?
- **Turbo:** Enable Turbo in development?
- **State Management:** Add Zustand?
- **Database:** Choose a database:
  - `PostgreSQL`
  - `MySQL
```
