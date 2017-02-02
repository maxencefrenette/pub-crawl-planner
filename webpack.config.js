module.exports = {
    entry: './js/main.js',
    output: {
        filename: 'dist/bundle.js'
    },
    externals: {
        jquery: 'jQuery',
        pdfkit: 'PDFDocument'
    },
    devtool: 'inline-source-map',
    devServer: {
        port: 8000
    }
}
