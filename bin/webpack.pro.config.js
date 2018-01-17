const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Entry = require('./getEntry.js');

let entries = Entry.getEntry('src/**/*.js', 'src/');
let proConfig = {
    entry: entries,
    output: {
        path: path.join(__dirname, '../dist/'),
        filename: 'build/[name]/index-[hash].js',
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: function () {
                            return [
                                require('autoprefixer')({ broswers: ["> 1%", "last 2 versions"]})
                            ];
                        }
                    }
                }]
            })
        }, {
            test: /\.(png|jpg)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 8182,
                    name: '[name][hash].[ext]'
                }
            }
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
        new CleanWebpackPlugin(['dist'], {root: path.join(__dirname, '../')}),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new ExtractTextPlugin('build/[name]/index-[hash].css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }),
        new webpack.NoErrorsPlugin()
    ]
}

let pages = Object.keys(Entry.getViewEntry('views/*.html'));
pages.forEach(function(filename){
    let conf = {
        template: `ejs-render-loader!views/${filename}.html`, //html模板路径
        inject: false, //js插入的位置，true/'head'/'body'/false
        filename: `${filename}.html`,
        minify: {  //压缩HTML文件
            removeComments: true,  //移除HTML中的注释
            collapseWhitespace: true,  //删除空白符和换行符
            minifyJS: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        }
    };

    if (filename in proConfig.entry) {
        conf.inject = 'body';
        conf.chunks = ['commons', filename];
    }
    proConfig.plugins.push(new HtmlWebpackPlugin(conf));
})

module.exports = proConfig;