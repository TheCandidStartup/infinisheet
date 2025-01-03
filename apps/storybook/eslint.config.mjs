import configs from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";
import storybook from "eslint-plugin-storybook";

export default tseslint.config(
  ...configs,
  ...storybook.configs['flat/recommended'],
  { ignores: [ ".storybook" ] },
);
