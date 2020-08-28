// webpack.config.js
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    context: path.resolve(__dirname),
    entry: {
        "pixi-loopkit": path.resolve(__dirname, "src"),
        docs: path.resolve(__dirname, "docs-src/docs.js"),
    },
    output: {
        path: path.resolve(__dirname, "docs"),
        filename: "[name].js",
    },

    externals: {
        "pixi.js": "PIXI",
        "chroma-js": "chroma",
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, "docs-src/index.html"),
            filename: "index.html",
        }),
    ],

    stats: "errors-warnings",
    //devtool: "inline-source-map",
};
