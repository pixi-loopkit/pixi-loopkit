// webpack.config.js
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

const pkg = require("./package.json")

module.exports = [
    // dist bundle
    {
        name: "dist",
        context: path.resolve(__dirname),
        entry: {
            "pixi-loopkit": path.resolve(__dirname, "src"),
        },
        output: {filename: `pixi-loopkit-${pkg.version}.min.js`},
        externals: {
            "pixi.js": "PIXI",
            "chroma-js": "chroma",
        },
        stats: "errors-warnings",
    },

    // docs bundle
    {
        name: "docs",
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
        optimization: {
            minimize: false,
        },

        devServer: {
            contentBase: path.join(__dirname, "docs-src"),
            compress: true,
        },
    },

];
