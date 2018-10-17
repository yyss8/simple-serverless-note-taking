const webpackConfig = require('./webpack.config');

module.exports = config => {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'test/**/*Spec.js',
            'test/**/*Spec.jsx'
        ],
        preprocessors: {
            'test/**/*Spec.js': ['webpack'],
            'test/**/*Spec.jsx': ['webpack']
        },
        webpack: {
            mode:'development',
            devtool: 'inline-source-map',
            module: {
                rules: [
                    { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
                    { test: /\.jsx$/, use: 'babel-loader', exclude: /node_modules/ },
                    { test: /\.css$/, use: ['style-loader', { loader:'css-loader', options:{ minimize: false } }] },
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
                    },
                    {
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
                    }
                ]
            },
        },
        reporters: ['progress'],
        port: 3112,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true,
        concurrency: Infinity
    })
}