const express = require('express');
const path = require('path');
const fs = require('fs');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');
const ejs = require('ejs');
const app = module.exports = express();

/*app.engine(ext, callback)
 * Registers the given template engine callback as ext.
 * map the EJS template engine to “.html” files
 */
app.engine('html', ejs.__express); 

/*app.set(name, value)
 * Assigns setting name to value, where name is one of the properties from the app settings table.
 */
app.set('views', path.join(__dirname, 'views'));

/*app.use([path,] function [, function...])
 * Mounts the middleware function(s) at the path. If path is not specified, it defaults to “/”.
 */
/*express.static('目录')
 *通过 Express 内置的 express.static 可以方便地托管静态文件
 */
app.use(express.static(path.join(__dirname + 'static')));

app.set('view engine', 'html');

/*ejs.render(str, options)
 *返回经过解析的字符串
 */
let handleHtml = {
    compileEjs: function (filepath) {
        let content = fs.readFileSync(filePath);
        return ejs.render(content.toString(), {
            filename: filepath
        })
    },
    parsePath: function (filePath) {
        try {
            return this.compileEjs(filepath);
        } catch (e) {
            return e.message;
        }
    },
    do: function (fixPath) {
        let self = this;
        return function (req, res) {
            let filePath = __dirname +(fixPath || '') + req.path;
            /*fs.stat(path, callback)
             * fs.stat() 检查一个文件是否存在
             */
            fs.stat(filePath, function(err, stats){
                /*response.end([data][,encoding][,callback])
                 * 该方法会通知服务器，所有响应头和响应主体都已被发送，
                 * 即服务器将其视为已完成
                 */
                if (err || !stats.isFile()) {
                    //@note 没有文件
                    res.end("page is not found");
                } else {
                    //@note 读取该文件
                    res.end(self.parsePath(filePath));
                }
            })
        }
    }
}
//webpack编译
let webpackConfig = require('./bin/webpack.dev.config.js');
let compiler = webpack(webpackConfig);
app.use(webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    stats: {
        colors: true,
        chunks: false,
        children: false,
        hash: false,
        assets: false,
        version: false,
        time: false
    }
}))

let hotMiddleware = webpackHotMiddleware(compiler);
app.use(hotMiddleware);

//路由
app.get('/', function(req, res) {
    res.redirect('/users.html');
})
app.get('/*.html', handleHtml.do('/views/'));

if (!module.parent) {
    app.listen(4002);
    console.log('Express started on port 3000');
}