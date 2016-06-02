var path = require('path');
var webpack = require('webpack');
var glob = require('glob')
var AssetsPlugin = require('assets-webpack-plugin');
var bourbon = require('node-bourbon').includePaths;

var assetsPluginInstance = new AssetsPlugin({
    pretty: true,
    path: path.join(__dirname, 'manifest'),
    update: true
})

var entryBasePath = path.join(__dirname, 'src')
var entryFiles = glob.sync(path.join(entryBasePath, '**/*.entry.js'))
var entryObj = {}
var argv = require('yargs').argv

var filterReg = argv.f ? new RegExp(argv.f) : undefined
var ignoreReg = argv.i ? new RegExp(argv.i) : undefined


entryFiles.forEach(function (filePath) {
    if (filterReg && !filterReg.test(filePath)) return
    if (ignoreReg && ignoreReg.test(filePath)) return

    var key = path.relative(entryBasePath, filePath);
    key = key.substring(0, key.lastIndexOf('.'))
    var entryArr = [filePath]
    if (process.env.NODE_ENV !== 'production') {
        entryArr.unshift('webpack-hot-middleware/client?reload=false')
    }
    entryObj[key] = entryArr
})

console.log(entryObj)


var commonConfig = {
    devtool: 'cheap-module-eval-source-map',
    entry: entryObj,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: ''
    },
    plugins: [
        // Webpack 1.0
        new webpack.optimize.OccurenceOrderPlugin(),
        // Webpack 2.0 fixed this mispelling
        // new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require('./dist/vendor-dev-manifest.json'),
            sourceType: 'var'
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js|\.jsx$/,
                loaders: ['babel?cacheDirectory=true'],
                exclude: /node_modules/
            },
            { test: /\.scss/, loader: 'style-loader!css-loader!sass-loader?includePaths[]=' + bourbon },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader' }
        ]
    }
};

if (process.env.NODE_ENV == 'production') {
    commonConfig.output = {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[chunkhash].js',
        publicPath: ''
    }
    commonConfig.plugins = [
        // Webpack 1.0
        assetsPluginInstance,
        new webpack.optimize.OccurenceOrderPlugin(),
        // Webpack 2.0 fixed this mispelling
        // new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require('./dist/vendor-manifest.json'),
            sourceType: 'var'
        }),
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
            output: { comments: false }
        })
    ]
}

module.exports = commonConfig