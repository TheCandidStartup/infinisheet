[![Lerna Monorepo](https://img.shields.io/badge/Monorepo-Lerna-darkorchid)](https://lerna.js.org/)
[![TypeScript](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FTheCandidStartup%2Finfinisheet%2Fmain%2Fpackage.json&query=%24.devDependencies.typescript&label=TypeScript&color=blue)](https://github.com/TheCandidStartup/infinisheet/blob/main/README.md#typescript-semantic-versioning)
[![Vite Dev](https://img.shields.io/badge/Dev-Vite-blueviolet)](https://vitejs.dev/)
[![Rollup Build](https://img.shields.io/badge/Build-Rollup-red)](https://rollupjs.org/)
[![Vitest Unit Tests](https://img.shields.io/badge/Unit_Tests-Vitest-green)](https://vitest.dev/)
[![Istanbul Code Coverage](https://img.shields.io/badge/Code_Coverage-Istanbul-yellow)](https://istanbul.js.org/)
[![Build Status](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml)

[GitHub](https://github.com/TheCandidStartup/infinisheet/) | [Storybook](https://www.thecandidstartup.org/infinisheet/storybook/) | [API](https://www.thecandidstartup.org/infinisheet/index.html) 

# Building a Better Spreadsheet

Infinisheet is a cloud based, open source, serverless, customer deployed, scalable spreadsheet. Or at least it will be when I've finished.

# Repo

This is a [Lerna](https://lerna.js.org/) based monorepo. The primary tooling is [NodeJS](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Vitest](https://vitest.dev/) and [Storybook](https://storybook.js.org/).

## Packages

* [react-virtual-scroll](./packages/react-virtual-scroll): Modern React components for lists and grids that scale to trillions of rows and columns
* [react-spreadsheet](./packages/react-spreadsheet): Scalable spreadsheet frontend built on `react-virtual-scroll`
* [infinisheet-types](./packages/infinisheet-types): Common types shared by frontend and backend packages
* [simple-spreadsheet-data]](./packages/simple-spreadsheet-data): Reference implementations of `SpreadsheetData`

## Apps

* [virtual-scroll-samples](./apps/virtual-scroll-samples): Test app for `react-virtual-scroll` package
* [spreadsheet-sample](./apps/spreadsheet-sample): Test app for `react-spreadsheet` package
* [storybook](./apps/storybook): Storybook showcasing `react-virtual-scroll` and `react-spreadsheet` components

## TypeScript Semantic Versioning

This repo aims to conform with [Semantic Versioning for TypeScript Types](https://www.semver-ts.org/index.html). Public published types are part of the SemVer contract of each package and are versioned accordingly.

This README and each package README includes a "TypeScript" badge that documents the current supported range of TypeScript compiler versions. We use a *simple majors* support policy where dropping a previously supported compiler version is treated as a breaking change. 

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
