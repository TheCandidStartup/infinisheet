import configs from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...configs,
  {
    rules: {
      // Keeping samples compact
      // Using deprecated ReactDOM.render to work around bug in React 18
      'react-refresh/only-export-components': 'off',
      'react/no-deprecated': 'off',
      'react/display-name': 'off',
    } 
  }
);
