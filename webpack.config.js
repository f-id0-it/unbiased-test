const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const cssThreadLoader = require('thread-loader');

cssThreadLoader.warmup({ workerParallelJobs: 2 }, [
  'less-loader',
  'postcss-loader',
  'css-loader',
  'style-loader',
  'buble-loader',
]);

const stats = {
  assets: true,
  children: false,
  chunks: false,
  hash: false,
  modules: false,
  publicPath: false,
  timings: true,
  version: false,
  warnings: true,
  colors: {
    green: '\u001b[32m',
  }
};

const clean_css_loader = {
  loader: 'clean-css-loader',
  options: {
    // compatibility: 'ie9',
    level: 2,
    inline: ['remote']
  }
};

module.exports = function(env) {
  const nodeEnv = env && env.prod ? 'production' : 'development';
  const isProd = nodeEnv === 'production';

  // replace localhost with 0.0.0.0 if you want to access
  // your app from wifi or a virtual machine
  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;

  const sourcePath = path.join(__dirname, './app');
  const buildDirectory = isProd ? path.join(__dirname, './build') : path.join(__dirname, './build_dev');

  const htmlTemplate = 'index.hbs';

  const plugins = [
    // new CleanWebpackPlugin([buildDirectory]),

    new webpack.optimize.CommonsChunkPlugin({
      async: true,
      children: true,
      minChunks: 2,
    }),

    // setting production environment will strip out
    // some of the development code from the app
    // and libraries
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(nodeEnv) },
    }),

    // create index.html
    new HtmlWebpackPlugin({
      template: htmlTemplate,
      inject: true,
      production: isProd,
      preload: ['*.css'],
      minify: isProd && {
        removeComments: true,
        // collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),

    // Enable jQuery
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery'
    })
  ];

  if (isProd) {
    plugins.push(
      // create css bundle
      new ExtractTextPlugin('style-[contenthash:8].css'),
      // minify remove some of the dead code
      new UglifyJSPlugin({
        comments: false,
        compress: {
          warnings: false,
          screw_ie8: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
        },
      })
    );

    cssLoader = ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        'cache-loader',
        {
          loader: 'css-loader',
          // options: {
          //   module: true, // css-loader 0.14.5 compatible
          //   modules: true,
          //   importLoaders: 1,
          //   localIdentName: '[hash:base64:5]',
          // },
        },
        // {
        //   loader: 'postcss-loader',
        //   options: {
        //     sourceMap: true,
        //   },
        // },
        clean_css_loader,
        {
          loader: 'less-loader',
          options: {
            sourceMap: true
          }
        },
      ],
    });
  } else {
    plugins.push(
      // make hot reloading work
      new webpack.HotModuleReplacementPlugin(),
      // show module names instead of numbers in webpack stats
      new webpack.NamedModulesPlugin(),
      // don't spit out any errors in compiled assets
      new webpack.NoEmitOnErrorsPlugin()
    );

    cssLoader = [
      // cache css output for faster rebuilds
      'cache-loader',
      {
        // build css/sass in threads (faster)
        loader: 'thread-loader',
        options: {
          workerParallelJobs: 2,
        },
      },
      'style-loader',
      'css-loader',
      clean_css_loader,
      {
        loader: 'less-loader',
        options: {
          sourceMap: false
        },
      },
    ];
  }

  const entryPoint = isProd
    ? './index.js'
    : [
      // bundle the client for webpack-dev-server
      // and connect to the provided endpoint
      `webpack-dev-server/client?http://${host}:${port}`,

      // bundle the client for hot reloading
      // only- means to only hot reload for successful updates
      'webpack/hot/only-dev-server',

      // the entry point of our app
      './index.js',
    ];

  return {
    devtool: isProd ? 'cheap-source-map' : 'eval-cheap-module-source-map',
    context: sourcePath,
    entry: {
      main: entryPoint,
    },
    output: {
      path: buildDirectory,
      // publicPath: '/',
      // Computing hashes is expensive and we don't need them in development
      filename: isProd ? '[name]-[hash:8].js' : '[name].js',
      chunkFilename: isProd ? '[name]-[chunkhash:8].js' : '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.hbs$/,
          use: [
            {loader: 'handlebars-loader', options: {
              inlineRequires: './images/'
            }}
          ]
        },
        {
          test: /\.(html|svg|jpe?g|png|ico|ttf|otf|eot|woff(2)?)$/,
          include: sourcePath,
          use: {
            loader: 'file-loader',
            options: {
              name: isProd ? 'static/[name]-[hash:8].[ext]' : 'static/[name].[ext]',
            },
          },
        },
        {
          test: /\.less$/,
          include: sourcePath,
          use: cssLoader,
        },
        {
          test: /\.js$/,
          include: sourcePath,
          use: [
            {
              loader: 'thread-loader',
              options: {
                workerParallelJobs: 2,
              },
            },
            'buble-loader',
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.scss'],
      modules: [path.resolve(__dirname, 'node_modules'), sourcePath],
      symlinks: false,
    },

    plugins,

    stats: stats,

    devServer: {
      contentBase: './app',
      publicPath: '/',
      historyApiFallback: true,
      port: port,
      host: host,
      hot: !isProd,
      compress: isProd,
      stats: stats,
    },
  };
};