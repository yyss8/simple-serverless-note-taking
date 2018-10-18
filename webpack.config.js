const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env, options) =>{

    const onProd = options.mode === 'production'; 
    const publicPath = '/';
    const API_URL = onProd ? 'https://nt.scitweb.com/v2':'http://localhost:4444';
    const AUTH0_REDIRECT = onProd ? 'http://ntf.scitweb.com/auth':'http://localhost:3111/auth';

    const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
        templateParameters:{
            publicPath
        }
    })

    let plugins = [
        HtmlWebpackPluginConfig,
        new webpack.DefinePlugin({
            PUBLIC:JSON.stringify( publicPath ),
            API_URL:JSON.stringify( API_URL ),
            JWS_URI:JSON.stringify(process.env.JWS_URI),
            JWS_AUDIENCE:JSON.stringify( process.env.JWS_AUDIENCE ),
            JWS_ISSUER:JSON.stringify( process.env.JWS_ISSUER ),
            AUTH0_REDIRECT:JSON.stringify( AUTH0_REDIRECT ),
            __VERSION__: JSON.stringify(require('./package.json').version),
            'process.env': {
                'NODE_ENV': JSON.stringify(options.mode)
            }
        }),
        new MiniCssExtractPlugin({
            filename: onProd ? "styles/[name].[hash].css":"[name].css",
            chunkFilename: onProd ? "styles/[id].[hash].css":"[id].css"
        })
    ];
    
    let moduleLoaders = [
        { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
        { test: /\.jsx$/, use: 'babel-loader', exclude: /node_modules/ },
        { test: /\.(png|jpg|gif)$/, use: [{
            loader:'url-loader',
            options:{
                limit:8192
            }
        }]},
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: [{
            loader:'url-loader',
            options:{
                limit:10000,
                mimetype:'image/svg+xml'
            }
        }]},
        {
            test: /\.less$/,
            use: [{
              loader: 'style-loader',
            }, {
              loader: 'css-loader', // translates CSS into CommonJS
            }, {
                loader: 'less-loader',
                options: {
                    javascriptEnabled: true,
                },
            }
            ]
        }
    ];

    let optimization = {
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                default: false,
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'chunk',
                    chunks: 'all',
                    minChunks: 2
                }
            }
        }
    };
    
    if ( onProd ){
        moduleLoaders.push( { test: /\.css$/,use:[
            MiniCssExtractPlugin.loader,
            {
                loader:'css-loader',
                options:{
                    minimize: onProd
                }
            }
        ]});
    
        moduleLoaders.push( {
            test: /\.scss$/, 
            use: [
                MiniCssExtractPlugin.loader,
                {
                loader: 'css-loader', options: {
                    modules: true,
                    localIdentName: '[local]'
                }
                },
                {
                loader: 'postcss-loader',
                options: {
                    config: {
                    path: 'postcss.config.js' 
                    }
                }
                },
                'sass-loader'
            ]
        });

        optimization.minimizer = [
            new UglifyJSPlugin({
             cache: true,
              sourceMap: true,
              uglifyOptions: {
                compress: {
                  inline: false,
                  ecma: 6
                }
              }
            }),
            new OptimizeCSSAssetsPlugin({})
        ];

        // plugins.push( new UploaderPlugin(uploaderOptions) );
        
    }else{
        //store css content in style tag for immediately hot reload for development mode  
        moduleLoaders.push( { test: /\.css$/, use: ['style-loader', { loader:'css-loader', options:{ minimize: false } }] } );
        moduleLoaders.push({
            test: /\.scss$/,
            use: [
              {loader:'style-loader'},
              {
                loader: 'css-loader', options: {
                  sourceMap: true, modules: true,
                  localIdentName: '[local]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  config: {
                    path: 'postcss.config.js' 
                  }
                }
              },
              {
                loader: 'sass-loader', options: { sourceMap: true }
              }
            ]
        });
    }
    
    const src = path.resolve(__dirname, './');

    return {
        stats: {
            colors:true,
            hash: true,
            timings: true,
            assets: true,
            chunks: true,
            chunkModules: true,
            modules: true,
            children: true
        },
        mode: options.mode,
        entry: ['babel-polyfill', './src/index.js'],
        output: {
            path:path.resolve(__dirname, './final'),
            publicPath,
            filename:  onProd ? 'build/m/[name].[chunkhash].js':'build/bundle.js'
        },
        module: {
            rules: moduleLoaders
        },
        optimization,
        resolve:{
            alias:{
                'node_modules':path.resolve(__dirname,'node_modules'),
                '~':src + '/components',
                'u':src + '/utilities',
                'a':src + '/actions',
                static:path.resolve(__dirname, 'static')
            }
        },
        node: {
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            dns: 'empty',
            child_process:'empty'
        },
        plugins,
        devServer: {
            publicPath: "/",
            contentBase: "./public/",
            compress: false,
            port: 3111,
            historyApiFallback:true,
            hot:true,
            open:true
        },
    };
};