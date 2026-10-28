// Yayın APK'sının imzası (28 Ekim). android/ klasörü her derlemede üretildiği için (CNG) imza ayarı burada eklenir.
// Anahtar ve şifreleri depoda değil, bu bilgisayarın ~/.gradle/gradle.properties dosyasında:
//   HADI_YONETIM_IMZA_DOSYASI=/tam/yol/hadi-yonetim.keystore
//   HADI_YONETIM_IMZA_TAKMA_AD=hadi-yonetim
//   HADI_YONETIM_IMZA_SIFRESI=...
// Tanımlı değilse yayın derlemesi hata ayıklama imzasıyla yapılır (yalnızca deneme için).
const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function imza(config) {
  return withAppBuildGradle(config, (c) => {
    let g = c.modResults.contents;
    if (g.includes("HADI_YONETIM_IMZA_DOSYASI")) return c;
    g = g.replace(
      /signingConfigs\s*\{/,
      `signingConfigs {
        release {
            if (project.hasProperty('HADI_YONETIM_IMZA_DOSYASI')) {
                storeFile file(HADI_YONETIM_IMZA_DOSYASI)
                storePassword HADI_YONETIM_IMZA_SIFRESI
                keyAlias HADI_YONETIM_IMZA_TAKMA_AD
                keyPassword HADI_YONETIM_IMZA_SIFRESI
            }
        }`,
    );
    g = g.replace(
      /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/,
      `$1signingConfig project.hasProperty('HADI_YONETIM_IMZA_DOSYASI') ? signingConfigs.release : signingConfigs.debug`,
    );
    c.modResults.contents = g;
    return c;
  });
};
