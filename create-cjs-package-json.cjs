const fs = require("fs");
const path = require("path");

// This script is added to commonjs build script, to clarify
// the files in this directory are CommonJS modules.
// Required because the main package.json specifies "type": "module",
// which treats .js files as ES Modules by default. This additional package.json
// ensures that Node.js correctly interprets the .js files in dist/cjs as CommonJS.

const packageJson = {
  type: "commonjs",
};

const filePath = path.join(__dirname, "dist/cjs/package.json");

fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
