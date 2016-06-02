var path = require('path')
var express = require('express');
var webpack = require('webpack');

var httpProxy = require("http-proxy");
var apiProxy = httpProxy.createProxyServer();

var config = require('./webpack.common.config');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use("/api/*", function (req, res) {
    apiProxy.web(req, res, {
        auth: '',
        target: 'http://example.com' + req.originalUrl,
        changeOrigin: true
    })
});


app.use(function (req, res, next) {
    if (req.path.indexOf("/dist/") == 0) {
        return res.sendFile(path.join(__dirname, req.path))
    }
    return next()
});

app.get('*', function (req, res, next) {
    res.sendFile(path.join(__dirname, 'index.html'))
});


var devPort = 9527;
app.listen(devPort, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Listening at http://localhost:' + devPort);
});

