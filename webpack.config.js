const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
var path = require('path');
const helpers = require('./config/helpers');

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    externals: [nodeExternals(), 'aws-sdk'],
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, 'dist'),
        filename: 'handler.js' // this should match the first part of function handler in serverless.yml
    },
    module: {
        loaders: [
            {
                test: /\.ts(x?)$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    }
};