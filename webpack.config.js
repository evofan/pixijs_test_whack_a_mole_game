const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  // When the mode is set to "production", the JS file is output in an optimized state
  // When the mode is set to "development", the source map is valid and the JS file is output
  // mode: "production",
  // or
  mode: "development",

  // Launch local development environment, browser automatically opens localhost at runtime
  devServer: {
    contentBase: "dist",
    open: true
  },

  entry: "./src/index.ts",

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Pixi.js Demo", // If there is template.html, that title takes precedence
      template: "./src/html/index.html"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets", to: "assets"
        }
      ]
    })
  ],

  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },

  resolve: {
    extensions: [".ts", ".js"]
  },

  devServer: {
    // public folder of webpack-dev-server
    contentBase: path.join(__dirname, "dist")
  },

  // Set rules to be applied to the module (here we often set the loader)
  module: {
    rules: [
      {
        // Apply TypeScript compiler to files ending in .ts
        test: /\.ts$/,
        loader: "ts-loader",
      },
      {
        // Turn off SourceMap warnings.
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ]
  }
};
