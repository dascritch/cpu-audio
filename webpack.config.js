const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  plugins: [new ESLintPlugin({
    context : '.',
    failOnWarning : false,

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
  },
  target: ['web', 'es2021'],
output:{
	chunkFormat: 'array-push'
}

};
