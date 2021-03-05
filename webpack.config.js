const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  plugins: [new ESLintPlugin({
    context : '.',
    failOnWarning : true,

  })],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /@license/i,
          },
        },
        extractComments: false,
      }),
    ],
  }
};