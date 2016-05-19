module.exports = {
    entry: "./src/rest-client.js",
    output: {
        path: __dirname,
        library: "RestClient",
        libraryTarget: "umd",
        filename: "./rest-client.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-3']
                }
            }
        ]
    }
};