// Açılış animasyonu (28 Ekim, kullanıcı: "güzel bir giriş"): açılış ekranındaki lacivert "h" aynı yerde başlar, küçülerek
// yerini "Hadi Umreye Gidelim · yönetim" kilidine bırakır; arkada marka kitindeki kemer deseni belirir. Giriş ve kilit
// ekranları kullanır. "Hareketi azalt" açıksa doğrudan son hâl.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { R } from "@/tema";

function Desen() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="kemer" width={64} height={102} patternUnits="userSpaceOnUse">
          <Path d="M0 102V48A32 32 0 0 1 32 0A32 32 0 0 1 64 48V102" fill="none" stroke={R.lacivert} strokeOpacity={0.06} strokeWidth={1.2} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#kemer)" />
    </Svg>
  );
}

export default function Acilis({ children, ust }: { children: ReactNode; ust?: number }) {
  const { height } = useWindowDimensions();
  const h = useRef(new Animated.Value(0)).current; // 0: h simgesi ortada, 1: kilit üstte
  const kart = useRef(new Animated.Value(0)).current;
  const [bitti, setBitti] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((azalt) => {
      if (azalt) {
        h.setValue(1);
        kart.setValue(1);
        setBitti(true);
        return;
      }
      Animated.sequence([
        Animated.delay(250),
        Animated.timing(h, { toValue: 1, duration: 750, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true }),
        Animated.spring(kart, { toValue: 1, damping: 18, stiffness: 140, useNativeDriver: true }),
      ]).start(() => setBitti(true));
    });
  }, [h, kart]);

  const kilitUst = ust ?? Math.max(56, height * 0.09);
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: h }]} pointerEvents="none">
        <Desen />
      </Animated.View>
      {/* Açılış ekranıyla aynı boy ve yerde "h"; kilit gelirken söner */}
      {!bitti ? (
        <Animated.Image
          source={require("../../assets/marka/acilis.png")}
          style={{ position: "absolute", width: 110, height: 110, left: "50%", top: "50%", marginLeft: -55, marginTop: -55, opacity: h.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: "clamp" }), transform: [{ scale: h.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) }] }}
        />
      ) : null}
      <Animated.View
        style={{
          alignItems: "center",
          marginTop: kilitUst,
          opacity: h.interpolate({ inputRange: [0.3, 1], outputRange: [0, 1], extrapolate: "clamp" }),
          transform: [{ translateY: h.interpolate({ inputRange: [0, 1], outputRange: [height * 0.25, 0] }) }, { scale: h.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
        }}
      >
        <Image source={require("../../assets/marka/yonetim-kilit-lacivert.png")} style={{ width: 150, height: 150 * (593 / 464) }} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={{ flex: 1, opacity: kart, transform: [{ translateY: kart.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }}>{children}</Animated.View>
    </View>
  );
}
