import configs from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...configs,
);
