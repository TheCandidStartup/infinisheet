import configs from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...configs,
  {
    rules: {
      // Keeping samples compact
      'react-refresh/only-export-components': 'off',
      'react/display-name': 'off',
    } 
  }
);
