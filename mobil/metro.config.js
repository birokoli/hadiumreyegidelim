// Satış Masası hesapları sitenin src/lib/satis/ortak.ts dosyasından okunur (kopya yok): Metro'nun proje dışını izlemesi gerekir.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../src/lib/satis")];
module.exports = config;
