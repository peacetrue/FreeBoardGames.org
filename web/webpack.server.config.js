var path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

var config = {
  target: 'node',
  externals: [nodeExternals()],

  entry: {
    server_bgio: path.resolve(__dirname, 'server/bgio.ts'),
    server_web: path.resolve(__dirname, 'server/web.ts'),
    'next.config': path.resolve(__dirname, 'server/next.config.ts'),
  },

  node: {
    global: false,
    __filename: false,
    __dirname: true,
  },

  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'server/dist'),
    filename: '[name].js',
    chunkFilename: '[chunkhash].js',
    libraryTarget: 'commonjs',
  },

  optimization: {
    minimize: false,
  },

  plugins: [new CleanWebpackPlugin()],

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '*'],
    modules: ['node_modules', 'src'],
    plugins: [new TSConfigPathsPlugin()],
  },

  module: {
    rules: [
      {
        test: /\.(j|t)s(x?)$/,
        exclude: [/node_modules/, /.*worker.*js$/],
        use: [
          'cache-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      node: true,
                    },
                  },
                ],
              ],
              plugins: ['@babel/plugin-syntax-dynamic-import'],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.server.json',
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|webp|svg|mp3|wav)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'null-loader',
          },
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
    ],
  },
};

module.exports = config;
