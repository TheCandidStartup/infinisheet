import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";
import external from "rollup-plugin-peer-deps-external";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        sourcemap: true,
        file: "dist/index.js",
        format: "es"
      },
    ],
    plugins: [
      external(),
      typescript({ "declarationDir": "./types", tsconfig: "./tsconfig.build.json" })
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: [{
      file: "dist/index.d.ts",
      format: "es",
      plugins: []
    }],
    plugins: [      
      dts(),
      del({ targets: "dist/types", hook: "buildEnd" })
    ],
  }
];