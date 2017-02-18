var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './js/main.js',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'bundle.js'
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'index.html' },
            { from: 'favicon.png' },
            { from: 'js/lib/pdfkit.js'}
        ], {})
    ],
    // This seems to be the only fix to the "Can't resolve 'fs'" error
    // See https://github.com/pugjs/pug-loader/issues/8
    node: { fs: 'empty' },
    externals: {
        jquery: 'jQuery',
        pdfkit: 'PDFDocument'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        port: 8000
    }
}
