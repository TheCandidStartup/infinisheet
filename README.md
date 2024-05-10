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
