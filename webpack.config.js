var webpack = require('webpack');

module.exports = {
    devtool: 'source-map',

    entry: {
        'rest-client': './src/rest-client.js',
        'rest-client.min': './src/rest-client.js'
    },
    output: {
        path: '.',
        filename: '[name].js',
        library: 'RestClient',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-object-assign']
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({include: /\.min\.js$/})
    ]
};