// Gradle belleği (28 Ekim): Firebase eklenince yayın derlemesi "OutOfMemoryError: Metaspace" verdi.
const { withGradleProperties } = require("expo/config-plugins");

module.exports = function gradleBellek(config) {
  return withGradleProperties(config, (c) => {
    c.modResults = c.modResults.filter((p) => !(p.type === "property" && p.key === "org.gradle.jvmargs"));
    c.modResults.push({ type: "property", key: "org.gradle.jvmargs", value: "-Xmx6g -XX:MaxMetaspaceSize=2g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8" });
    return c;
  });
};
