var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');
var DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const IS_PROD = process.env.NODE_ENV === 'production';

module.exports = {
    devtool: IS_PROD
        ? false
        : 'source-map',

    profile: !IS_PROD,

    entry: {
        main: './src/index'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[chunkhash].js',
        publicPath: '/collateralmanager/'
    },
    resolve: {
        alias: {
        'react$': path.join(__dirname, 'node_modules', 'react','umd',
            (IS_PROD ? 'react.production.min.js' : 'react.development.js')),
        'react-dom$': path.join(__dirname, 'node_modules', 'react-dom','umd',
            (IS_PROD ? 'react-dom.production.min.js' : 'react-dom.development.js'))
        },
        extensions: ['.js', '.ts', '.tsx', '.css']
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, 'node_modules/react-toolbox/'),
                ],
                use: ExtractTextPlugin.extract({
                use: [
                    {
                    loader: 'css-loader',
                        options: {
                            sourceMap: !IS_PROD,
                            importLoaders: 0,
                            modules: true,
                            localIdentName: "[name]--[local]--[hash:base64:5]"
                        }
                    },
                    'postcss-loader'
                ]
                })
            },
            {
                test: /\.css$/,
                exclude: '/node_modules/',
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: !IS_PROD,
                                importLoaders: 0
                            }
                        },
                        'postcss-loader'
                    ]
                })
            }, {
                test: /\.png|\.cur|\.woff|\.woff2|\.eot|\.ttf|\.svg|\.gif$/,
                use: 'file-loader'
            }, {
                test: /\.ts|\.tsx$/,
                use: 'awesome-typescript-loader',
            }
        ]
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack
            .optimize
            .CommonsChunkPlugin({
                name: 'vendor',
                minChunks: function (module) {
                    // dynamically find vendors by virtue of being under node_modules or bootstrap
                    // folders
                    if (module.context && module.context.indexOf('node_modules') !== -1) {
                        return true;
                    } else if (module.context && module.context.indexOf('vendor') !== -1) {
                        return true;
                    }
                    return false;
                }
            }),
        // creates a manifest, a layer of indirection, which allows changes to the main
        // bundle to note require a new vendor chunk, see
        // https://webpack.js.org/guides/code-splitting-libraries/
        new webpack
            .optimize
            .CommonsChunkPlugin({
                // But since there are no more common modules between them we end up with just
                // the runtime code included in the manifest file
                name: 'manifest'

            }),
        new HtmlWebpackPlugin({
            title: 'Collateral Manager',
            xhtml: true,
            favicon: './src/favicon.ico',
            template: path.join(path.join(__dirname, 'src'), 'html-template.ejs'),
            chunks: [
                'main', 'vendor', 'manifest'
            ],
            filename: 'index.html'
        }),
        new ExtractTextPlugin({filename: '[name].[contenthash].css', allChunks: true}),
        new StatsPlugin('stats.json', {
            chunkModules: true,
            timings: false,
            exclude: [/node_modules/]
        })
        , new DuplicatePackageCheckerPlugin({   verbose: true })
    ]
};

if (IS_PROD) {
    module
        .exports
        .plugins
        .push(new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: {
                warnings: false,
                pure_funcs: ['console.log', 'window.console.log.apply']
            },
            comments: false
        }));
}

if (process.env.WATCH === 'true') {
    module.exports.watch = true;
}