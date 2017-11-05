const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
const path = require('path');

module.exports = {
    entry: slsw.lib.entries,
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
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ],
            }
        ]
    }
};