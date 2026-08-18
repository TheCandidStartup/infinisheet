// declaration.d.ts
declare module '*.module.css' {
  const content: Record<string, string>;
  export default content;
}

// Recognize all CSS files as module imports.
declare module "*.css" {}
