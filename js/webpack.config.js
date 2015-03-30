var webpack = require('webpack');

module.exports = {
    devtool: 'eval-source-map',
    context: __dirname + "/",
    entry: {
        main: './main.jsx'
    },
    output: {
        path: './',
        // Make sure to use [name] or [id] in output.filename
        //  when using multiple entry points
        filename: "[name].bundle.js",
        chunkFilename: "[id].bundle.js"
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "css-loader" },
            { test: /\.jsx$/, loaders: ['react-hot', 'jsx?harmony'], exclude: /node_modules/ }
        ]
    }
};
