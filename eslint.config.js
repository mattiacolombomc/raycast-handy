const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

require("@rushstack/eslint-patch/modern-module-resolution");

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [...compat.extends("@raycast/eslint-config")];
