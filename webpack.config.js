import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import {
  CHALLENGE_JS6_3_STARS,
  CHALLENGE_JS6_3_KANBAN,
  CHALLENGE_JS6_4,
  CHALLENGE_JS6_6,
  CHALLENGE_JS6_7,
} from "./webpack-constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { ENTRY_FILE, ASSET_PATH, OUTPUT_PATH, TEMPLATE_FILE } = CHALLENGE_JS6_7; // CHANGE THIS based on which challenge to bundle

export default {
  entry: ENTRY_FILE,

  output: {
    publicPath: ASSET_PATH,
    path: OUTPUT_PATH,
    filename: "bundle.js",
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: TEMPLATE_FILE,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
