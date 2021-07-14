const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const HOST = process.env.HOST || 'localhost';
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const helpers = require('./helpers');

// Two dev modes: local | remote
// local - auto authenticates as a fake user and uses a local
// json mock server as its host cluster. Intended for pure
// UI development without the need for e2e functionality
// remote - expects the user to provide a remote.config.json
// that contains an object with coordinates to a remote cluster
const devMode = process.env.DEVMODE || 'local';
if (devMode !== 'local' && devMode !== 'remote') {
  console.error(`Illegal DEVMODE: ${devMode}, must be 'local' or 'remote'`);
  process.exit(1);
}

const htmlWebpackPluginOpt = {
  template: `public/index.dev.html`,
  title: 'MIG UI',
  inject: 'body',
  favicon: 'public/favicon.ico',
};

const { localConfig, migMeta } = helpers.getLocalConfig();

htmlWebpackPluginOpt.migMeta = Buffer.from(JSON.stringify(migMeta)).toString('base64');
const PORT = process.env.PORT || localConfig.devServerPort;
const EXPRESS_PORT = process.env.EXPRESS_PORT || 9001;

const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin(htmlWebpackPluginOpt),
  new webpack.DefinePlugin({
    'process.env.BRAND_TYPE': JSON.stringify(process.env.BRAND_TYPE),
  }),
  new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css',
  }),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
];

if (devMode === 'local') {
  // TODO/FIXME since moving login flow to express server, local dev mode is broken.
  //   We would probably need to mock the express route /login to just redirect to /login-success with bogus token data.
  plugins.push(
    new webpack.NormalModuleReplacementPlugin(/client_factory.ts/, 'client_factory.mock.ts')
  );
}

const webpackConfig = {
  entry: {
    app: ['react-hot-loader/patch', './src/index.tsx'],
  },
  output: {
    path: __dirname + '../dist',
    filename: '[name].bundle.js',
    publicPath: '/',
    pathinfo: false,
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.ts', '.tsx', '.js', '.scss'],
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  module: {
    unsafeCache: true,
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../node_modules/'),
          path.resolve(__dirname, '../node_modules/patternfly'),
          path.resolve(__dirname, '../node_modules/@patternfly/patternfly'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, '../node_modules/@patternfly/react-core/dist/styles/base.css'),
          path.resolve(
            __dirname,
            '../node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'
          ),
          path.resolve(
            __dirname,
            '../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'
          ),
          path.resolve(
            __dirname,
            '../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'
          ),
          path.resolve(
            __dirname,
            '../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css'
          ),
        ],
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2|png|jpg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
          },
        },
      },
    ],
  },
  devServer: {
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: false,
    disableHostCheck: true,
    stats: {
      // interfaces and type aliases are not left after transpilation, causing
      // legitimate typescript exports to trigger warnings in webpack
      warningsFilter: /export .* was not found in/,
    },
    proxy: [
      {
        // NOTE: Any future backend-only routes added to deploy/main.js need to be listed here:
        context: ['/login', '/login/callback', '/cluster-api', '/discovery-api'],
        target: `http://localhost:${EXPRESS_PORT}`,
      },
    ],
  },
  plugins,
};

module.exports = webpackConfig;
