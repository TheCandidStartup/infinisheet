[![Lerna Monorepo](https://img.shields.io/badge/Monorepo-Lerna-darkorchid)](https://lerna.js.org/)
[![TypeScript Language](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![Vite Dev](https://img.shields.io/badge/Dev-Vite-blueviolet)](https://vitejs.dev/)
[![Rollup Build](https://img.shields.io/badge/Build-Rollup-red)](https://rollupjs.org/)
[![Vitest Unit Tests](https://img.shields.io/badge/Unit_Tests-Vitest-green)](https://vitest.dev/)
[![Istanbul Code Coverage](https://img.shields.io/badge/Code_Coverage-Istanbul-yellow)](https://istanbul.js.org/)
[![Build Status](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml)

[GitHub](https://github.com/TheCandidStartup/infinisheet/) | [Storybook](https://www.thecandidstartup.org/infinisheet/storybook/) | [API](https://www.thecandidstartup.org/infinisheet/index.html) 

# Building a Better Spreadsheet

Infinisheet is a cloud based, open source, serverless, customer deployed, scalable spreadsheet. Or at least it will be when I've finished.

# Repo

This is a [Lerna](https://lerna.js.org/) based monorepo. The primary tooling is [NodeJS](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) and [Vitest](https://vitest.dev/).

## Packages

* [react-virtual-scroll](./packages/react-virtual-scroll): Modern React components for lists and grids that scale to trillions of rows and columns
* [react-spreadsheet](./packages/react-spreadsheet): Scalable spreadsheet frontend built on `react-virtual-scroll`
* [infinisheet-types](./packages/infinisheet-types): Common types shared by frontend and backend packages

## Apps

* [virtual-scroll-samples](./apps/virtual-scroll-samples): Test app for `react-virtual-scroll` package
* [spreadsheet-sample](./apps/spreadsheet-sample): Test app for `react-spreadsheet` package
* [storybook](./apps/storybook): Storybook showcasing `react-virtual-scroll` and `react-spreadsheet` components

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

Follow the journey on [my blog](https://www.thecandidstartup.org/topics/infinisheet.html).
