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
        path: path.join(__dirname, 'dist'),
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
                                require('autoprefixer')({ broswers: ['> 1%', 'last 2 versions']});
                            ];
                        }
                    }
                }]
            })
        }]
    }
}