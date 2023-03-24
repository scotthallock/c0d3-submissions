import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHALLENGE_JS6_3_STARS = {
  ENTRY_FILE: './src/js6-p3/stars/src/index.js',
  ASSET_PATH: '/stars-and-kanban/stars',
  OUTPUT_PATH: path.join(__dirname, '/src/js6-p3/stars/dist'),
  TEMPLATE_FILE: './src/js6-p3/stars/src/index.html',
};

const CHALLENGE_JS6_3_KANBAN = {
  ENTRY_FILE: './src/js6-p3/kanban/src/index.js',
  ASSET_PATH: '/stars-and-kanban/kanban',
  OUTPUT_PATH: path.join(__dirname, '/src/js6-p3/kanban/dist'),
  TEMPLATE_FILE: './src/js6-p3/kanban/src/index.html',
};

const CHALLENGE_JS6_4 = {
  ENTRY_FILE: './src/js6-p4/src/index.js',
  ASSET_PATH: '/pokemon-classes',
  OUTPUT_PATH: path.join(__dirname, '/src/js6-p4/dist'),
  TEMPLATE_FILE: './src/js6-p4/src/index.html',
}

const CHALLENGE_JS6_6 = {
  ENTRY_FILE: './src/js6-p6/src/index.js',
  ASSET_PATH: '/star-lesson',
  OUTPUT_PATH: path.join(__dirname, '/src/js6-p6/dist'),
  TEMPLATE_FILE: './src/js6-p6/src/index.html',
}

const {
  ENTRY_FILE,
  ASSET_PATH,
  OUTPUT_PATH,
  TEMPLATE_FILE
} = CHALLENGE_JS6_6; // Change this based on which challenge to bundle

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
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }

};