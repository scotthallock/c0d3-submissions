import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Change these variables based on which challenge we want to bundle with Webpack */
const ENTRY_FILE = './src/js6-p4/src/index.js';
const ASSET_PATH = '/pokemon-classes';
const OUTPUT_PATH = path.join(__dirname, '/src/js6-p4/dist');
const TEMPLATE_FILE = './src/js6-p4/src/index.html';

export default {
  
  entry: ENTRY_FILE,

  output: {
    publicPath: ASSET_PATH,
    path: OUTPUT_PATH,
    filename: 'bundle.js'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: TEMPLATE_FILE
    })
  ],

  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  }

};