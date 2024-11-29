import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";
import path from "path";

const isExternal = (id) => !id.startsWith(".") && !path.isAbsolute(id);

export default [
  {
    input: "src/index.ts",
    external: isExternal,
    output: [
      {
        sourcemap: true,
        dir: "dist",
        format: "es"
      },
    ],
    plugins: [
      typescript({ "declarationDir": "dist/types", tsconfig: "./tsconfig.build.json" })
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