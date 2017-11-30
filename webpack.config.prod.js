const nodeExternals = require('webpack-node-externals');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const slsw = require('serverless-webpack');
const path = require('path');

module.exports = {
    entry: slsw.lib.entries,
    externals: [nodeExternals(), 'aws-sdk', 'source-map-support'],
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
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [{
                    loader: 'ts-loader'
                }],
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin({
            compress: {warnings: false},
            sourceMap: true
        })
    ]
};