path = require('path');

module.exports = {
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devtool: 'inline-source-map',
    module: {
        loaders: [{
            test: /\.ts$/, exclude: /node_modules/, loader: 'ts-loader'
        }]
    }
};
