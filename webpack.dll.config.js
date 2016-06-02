var path = require("path");
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');

var assetsPluginInstance = new AssetsPlugin({
    pretty: true,
    path: path.join(__dirname, 'manifest'),
    update: true
})


var config = {
    entry: {
        vendor: ['lodash', 'react', 'react-dom', 'react-addons-css-transition-group', 'react-router','antd']
    },
    module: {
        loaders: [
            {
                test: /\.js|\.jsx$/,
                loaders: ['babel?cacheDirectory=true'],
                exclude: /node_modules/
            }
        ]
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].dev.dll.js",
        library: "[name]_dll", //和下得 DllPlugin的name对应
        libraryTarget: "var"
    },
    plugins: [
        //可以有多个dll
        new webpack.DllPlugin({
            path: path.join(__dirname, "dist", "vendor-dev-manifest.json"),
            name: "[name]_dll"
        }),
        new webpack.optimize.OccurenceOrderPlugin()
    ]
};
if(process.env.NODE_ENV=='production'){
    config.output={
        path: path.join(__dirname, "dist"),
        filename: "[name].[hash].dll.js",
        library: "[name]_[hash]_dll", //和下得 DllPlugin的name对应
        libraryTarget: "var"
    }

    config.plugins=[
        assetsPluginInstance,
        new webpack.DllPlugin({
            path: path.join(__dirname, "dist", "vendor-manifest.json"),
            name: "[name]_[hash]_dll"
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
               except: ['$', 'exports', 'require']
            },
            // mangle:false,
            // exclude:/\.min\.js$/
            compress: { warnings: false },
            output:{comments:false}
        })
    ]
}

module.exports = config