const path = require('path');
const glob = require('glob');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
const Entry = require('./getEntry.js');

let entries = Entry.getEntry('src/**/*.js', 'src/');
for (let key in entries) {
    entries[key] = [hotMiddlewareScript, entries[key]];
}

let devConfig = {
    devtool: 'source-map',
    entry: entries,
    output: {
        path: path.join(__dirname, '../dist/'),
        filename: 'build/[name]/index.js',
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.js$/,
            //exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                    loader: 'css-loader',
                    options: {
                        sourceMap: true
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: function() {
                            return [
                                require('autoprefixer')({ broswers: ['> 1%', 'last 2 versions']})
                            ];
                        },
                        sourceMap: true
                    }
                }, {
                    loader: 'less-loader',
                    options: {
                        sourceMap: false
                    }
                }]
            }),
            exclude: /node_modules/
        }, {
            test: /\.xtpl$/,
            loader: 'xtpl-loader'
        }]
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new ExtractTextPlugin('build/[name]/index.css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons'
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}

let pages = Object.keys(Entry.getViewEntry('views/*.html'));

pages.forEach(function(filename) {
    let conf = {
        template: `ejs-render-loader!views/${filename}.html`, //html模板路径，默认使用ejs-loader
        inject: false, //js插入的位置，true/'head'/'body'/false
        filename: `${filename}.html` //输出文件[注意：这里的根路径是module.exports.output.path]
    };

    if (filename in devConfig.entry) {
        conf.inject = 'body';
        conf.chunks = ['commons', filename];
    }
    devConfig.plugins.push(new HtmlWebpackPlugin(conf));
})

module.exports = devConfig;