const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    entry: {
        background: './src/background.ts',
        popup: './src/main.ts',
        options: './src/options/main.ts',
        recommendations_loaded_observer: './src/scripts/recommendations_loaded_observer.mts',
        video_loaded_observer: './src/scripts/video_loaded_observer.mts',
        ensure_highest_quality: './src/scripts/ensure_highest_quality.mts',
        ensure_theatre_mode: './src/scripts/ensure_theatre_mode.mts',
        disable_autoplay: './src/scripts/disable_autoplay.mts',
        disable_auto_dubbing: './src/scripts/disable_auto_dubbing.mts',
        load_all_recommendations: './src/scripts/load_all_recommendations.mts',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.([cm]?ts|tsx)$/,
                loader: "ts-loader",
                options: { appendTsSuffixTo: [/\.vue$/] },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            // 0 => no loaders (default);
                            // 1 => postcss-loader;
                            // 2 => postcss-loader, sass-loader
                            importLoaders: 1,
                        },
                    },
                    "postcss-loader",
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.vue'],
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
                { from: "./src/options/index.html", to: "./options.html" },
            ],
        }),
        new VueLoaderPlugin(),
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
