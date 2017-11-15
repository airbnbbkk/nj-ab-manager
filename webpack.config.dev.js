const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
const path = require('path');

module.exports = {
    entry: slsw.lib.entries,
    externals: [nodeExternals()],
    resolve: {
        extensions: [
            '.js',
            '.json',
            '.ts',
            '.tsx'
        ]
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    target: 'node',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            "presets": [
                                ["env", {
                                    "targets": {
                                        "node": "current",
                                    },
                                    "useBuiltIns": true,
                                }]
                            ]
                        }
                    },
                    {
                        loader: 'ts-loader'
                    }
                ],
            }
        ]
    },
    plugins: [
    ]
};