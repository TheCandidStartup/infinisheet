import configs from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...configs,
  {
    rules: {
      // Using deprecated ReactDOM.render to work around bug in React 18
      'react/no-deprecated': 'off',
    } 
  }
);
