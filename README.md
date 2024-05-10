[![Lerna Monorepo](https://img.shields.io/badge/Monorepo-Lerna-darkorchid)](https://lerna.js.org/)
[![Lerna Monorepo](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![Lerna Monorepo](https://img.shields.io/badge/Dev-Vite-blueviolet)](https://vitejs.dev/)
[![Lerna Monorepo](https://img.shields.io/badge/Build-Rollup-red)](https://rollupjs.org/)
[![Lerna Monorepo](https://img.shields.io/badge/Unit_Tests-Vitest-green)](https://vitest.dev/)
[![Lerna Monorepo](https://img.shields.io/badge/Code_Coverage-Istanbul-yellow)](https://istanbul.js.org/)

# Building a Better Spreadsheet

Infinisheet is a cloud based, open source, serverless, customer deployed, scalable spreadsheet. Or at least it will be when I've finished.

# Repo

This is a [Lerna](https://lerna.js.org/) based monorepo. The primary tooling is [NodeJS](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) and [Vitest](https://vitest.dev/).

## Packages

* [react-virtual-scroll](./packages/react-virtual-scroll): Modern React components for lists and grids that scale to trillions of rows and columns

## Apps

* [virtual-scroll-samples](./apps/virtual-scroll-samples): Test app for react-virtual-scroll package

# Build

In root directory

```
npm run lerna-build
npm run lerna-test
```

In any package directory

```
npm run test
npm run build
```

In any app directory

```
npm run dev
npm run build
npm run preview
```

# Blog

Follow the journey on [my blog](https://www.thecandidstartup.org/topics/spreadsheets.html).
