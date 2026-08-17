import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'
import path from "path";

const isExternal = (id) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig({
  input: "src/index.ts",
  external: isExternal,
  output: [
    {
      sourcemap: true,
      dir: "dist",
      format: "es"
    },
  ],
  plugins: [dts({ tsconfig: "./tsconfig.build.json", resolver: "tsc", generator: "tsc" })]
})
