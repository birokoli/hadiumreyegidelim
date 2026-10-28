// Android NDK sürümü (28 Ekim): Expo'nun varsayılanı (27.1) bu bilgisayarda indirilirken takıldı; kurulu 28.2 kullanılır.
// expo-root-project eklentisi ndkVersion'ı yalnızca tanımlı değilse yazar, bu yüzden ondan önce tanımlanır.
const { withProjectBuildGradle } = require("expo/config-plugins");
const SURUM = "28.2.13676358";

module.exports = function ndk(config) {
  return withProjectBuildGradle(config, (c) => {
    if (!c.modResults.contents.includes("ext.ndkVersion")) {
      c.modResults.contents = c.modResults.contents.replace('apply plugin: "expo-root-project"', `ext.ndkVersion = "${SURUM}"\napply plugin: "expo-root-project"`);
    }
    return c;
  });
};
