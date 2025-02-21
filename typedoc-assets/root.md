[![Documentation Coverage](./coverage.svg)](https://www.npmjs.com/package/typedoc-plugin-coverage)
[![Lerna Monorepo](https://img.shields.io/badge/Monorepo-Lerna-darkorchid)](https://lerna.js.org/)
[![TypeScript Language](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![Vite Dev](https://img.shields.io/badge/Dev-Vite-blueviolet)](https://vitejs.dev/)
[![Rollup Build](https://img.shields.io/badge/Build-Rollup-red)](https://rollupjs.org/)
[![Vitest Unit Tests](https://img.shields.io/badge/Unit_Tests-Vitest-green)](https://vitest.dev/)
[![Istanbul Code Coverage](https://img.shields.io/badge/Code_Coverage-Istanbul-yellow)](https://istanbul.js.org/)
[![Build Status](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml)

# Building a Better Spreadsheet

InfiniSheet is a cloud based, open source, serverless, customer deployed, scalable spreadsheet. Or at least it will be when I've finished.

# Repo

InfiniSheet is a [Lerna](https://lerna.js.org/) based monorepo. The primary tooling is [NodeJS](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) and [Vitest](https://vitest.dev/). The repo is hosted on [GitHub](https://github.com/TheCandidStartup/infinisheet) with [Build CI](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml) provided by GitHub Actions. 

This documentation is [automatically generated](https://github.com/TheCandidStartup/infinisheet/actions/workflows/docs.yml) based on [TSDoc](https://tsdoc.org/pages/spec/overview/) comments in the code using [TypeDoc](https://typedoc.org/).

# Packages

* {@link @candidstartup/react-virtual-scroll! | react-virtual-scroll}: Modern React components for lists and grids that scale to trillions of rows and columns
* {@link @candidstartup/react-spreadsheet! | react-spreadsheet}: Scalable spreadsheet frontend built on `react-virtual-scroll`
* {@link @candidstartup/infinisheet-types! | infinisheet-types}: Common types shared by frontend and backend packages
* [storybook](/infinisheet/storybook/): Storybook showcasing `react-virtual-scroll` and `react-spreadsheet` components
