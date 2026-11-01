// Satış Masası hesapları sitenin src/lib/satis/ortak.ts dosyasından okunur (kopya yok): Metro'nun proje dışını izlemesi gerekir.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// Ayrıca web panelinin saf (sunucusuz) yardımcıları: influencer DM şablonları, SSS metin biçimi, AI görünürlük ölçüm hesapları
config.watchFolders = [path.resolve(__dirname, "../src/lib/satis"), path.resolve(__dirname, "../src/app/(admin)/admin/influencer-adaylari"), path.resolve(__dirname, "../src/lib/page-texts"), path.resolve(__dirname, "../src/lib/ai-vis")];
module.exports = config;
