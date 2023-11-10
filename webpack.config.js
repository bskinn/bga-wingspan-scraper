const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/scrape_scores.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'wingspan_scores.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
