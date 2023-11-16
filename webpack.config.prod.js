const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
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
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@type': path.resolve(__dirname, 'src/types/'),
    },
  },
  output: {
    filename: 'wingspan.js',
    path: path.resolve(__dirname, 'build-prod'),
  },
}
