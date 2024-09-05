const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        background: './src/background.ts',
        popup: './src/popup.ts'
    },
    module: {
        rules: [
            // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.([cm]?ts|tsx)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        // Add support for TypeScripts fully qualified ESM imports.
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
        }
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./manifest.json", to: "./" },
                { from: "./src/index.html", to: "./" },
            ],
        }),
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimize: false,
    },
    mode: 'production',
};
