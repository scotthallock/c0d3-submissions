import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CHALLENGE_JS6_3_STARS = {
  ENTRY_FILE: "./src/js6-p3/stars/src/index.js",
  ASSET_PATH: "/stars-and-kanban/stars",
  OUTPUT_PATH: path.join(__dirname, "/src/js6-p3/stars/dist"),
  TEMPLATE_FILE: "./src/js6-p3/stars/src/index.html",
};

export const CHALLENGE_JS6_3_KANBAN = {
  ENTRY_FILE: "./src/js6-p3/kanban/src/index.js",
  ASSET_PATH: "/stars-and-kanban/kanban",
  OUTPUT_PATH: path.join(__dirname, "/src/js6-p3/kanban/dist"),
  TEMPLATE_FILE: "./src/js6-p3/kanban/src/index.html",
};

export const CHALLENGE_JS6_4 = {
  ENTRY_FILE: "./src/js6-p4/src/index.js",
  ASSET_PATH: "/pokemon-classes",
  OUTPUT_PATH: path.join(__dirname, "/src/js6-p4/dist"),
  TEMPLATE_FILE: "./src/js6-p4/src/index.html",
};

export const CHALLENGE_JS6_6 = {
  ENTRY_FILE: "./src/js6-p6/src/index.js",
  ASSET_PATH: "/star-lesson",
  OUTPUT_PATH: path.join(__dirname, "/src/js6-p6/dist"),
  TEMPLATE_FILE: "./src/js6-p6/src/index.html",
};

export const CHALLENGE_JS6_7 = {
  ENTRY_FILE: "./src/js6-p7/src/index.js",
  ASSET_PATH: "/apollo-client",
  OUTPUT_PATH: path.join(__dirname, "/src/js6-p7/dist"),
  TEMPLATE_FILE: "./src/js6-p7/src/index.html",
};
